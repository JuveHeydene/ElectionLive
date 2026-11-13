from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from .models import User
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
from circonscription.scripts import get_bureau_de_vote_id
from circonscription.scripts import get_centre_de_vote_id
from django.contrib.auth.hashers import make_password
from django.db.models import Q,F
from datetime import datetime, timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Sum
from django.utils.timezone import now, timedelta
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt



import json
import uuid
import os

from .models import User, ResultatDeVote
from circonscription.models import BureauDeVote,Region, Departement, Arrondissement, CentreDeVote
from .serializers import ResultatDeVoteSerializer,UserSerializer



class LoginView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        print(f"Les identifiants : {email},{password}")

        # Authentification de l'utilisateur
        user = authenticate(email=email, password=password)
        print("User is :",user)

        if user is not None:
            # Génération des tokens JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),  # Token d'accès
                'refresh': str(refresh),             # Token de rafraîchissement
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'surname': user.surname,
                    'email': user.email,
                    'role': user.role,
                    'userImage':user.userimage,
                    'bureau_de_vote':user.bureau_de_vote.id if user.bureau_de_vote else None,
                    'centre_de_vote': user.centre_de_vote.id if user.centre_de_vote else None,
                    'created_by':user.created_by.id if user.created_by else None,
                    
                }
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

def broadcast_vote_update():
    print("La fonction est appelée")
    channel_layer = get_channel_layer()

    # Récupérer les résultats de vote ordonnés par candidat et par date de création
    resultats = ResultatDeVote.objects.values('candidat').annotate(total_votes=Sum('total_votes')).order_by('-total_votes')
    # Créer une liste pour stocker les résultats formatés
    candidates_votes = []

    # Remplir la liste avec les informations des candidats et leurs votes totaux
    for resultat in resultats:
        candidat = User.objects.get(id=resultat['candidat'])  # Récupérer l'utilisateur/candidat correspondant
        candidates_votes.append({
            'candidateId': candidat.id,
            'candidateName': candidat.name,
            'totalVotes': resultat['total_votes']
        })

    # Envoyer les résultats via WebSocket
    try:
        async_to_sync(channel_layer.group_send)(
            "vote_results",
            {
                "type": "send_vote_update",
                "data": {"type": "existing", "data": candidates_votes},
            }
        )
    except Exception as e:
        print(f"Erreur lors de l'envoi WebSocket : {e}")

def broadcast_winners_update():
    print("Mise à jour temps réel des vainqueurs par region")
    channel_layer = get_channel_layer()
    regions = Region.objects.all()
    region_winners = {}
    for region in regions:
        # Totaliser les votes par candidat pour chaque région
        results = (
            ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement__departement__region=region)
            .values('candidat__id', 'candidat__name', 'candidat__surname')
            .annotate(total_votes=Sum('total_votes'))
            .order_by('-total_votes')
        )
        if results:
            top_candidate = results[0]
            region_winners[region.name] = {
                "candidat_id": top_candidate["candidat__id"],
                "candidat_name": top_candidate["candidat__name"],
                "candidat_surname": top_candidate["candidat__surname"],
                "total_votes": top_candidate["total_votes"],
            }
    departements = Departement.objects.all()
    department_winners = {}
    for departement in departements:
        # Totaliser les votes par candidat pour chaque département
        results = (
            ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement__departement=departement)
            .values('candidat__id', 'candidat__name', 'candidat__surname')
            .annotate(total_votes=Sum('total_votes'))
            .order_by('-total_votes')
        )
        if results:
            top_candidate = results[0]
            department_winners[departement.name] = {
                "candidat_id": top_candidate["candidat__id"],
                "candidat_name": top_candidate["candidat__name"],
                "candidat_surname": top_candidate["candidat__surname"],
                "total_votes": top_candidate["total_votes"],
            }
    arrondissements = Arrondissement.objects.all()
    arrondissement_winners = {}
    for arrondissement in arrondissements:
        # Totaliser les votes par candidat pour chaque arrondissement
        results = (
            ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement=arrondissement)
            .values('candidat__id', 'candidat__name', 'candidat__surname')
            .annotate(total_votes=Sum('total_votes'))
            .order_by('-total_votes')
        )
        if results:
            top_candidate = results[0]
            arrondissement_winners[arrondissement.name] = {
                "candidat_id": top_candidate["candidat__id"],
                "candidat_name": top_candidate["candidat__name"],
                "candidat_surname": top_candidate["candidat__surname"],
                "total_votes": top_candidate["total_votes"],
            }
    try:
        async_to_sync(channel_layer.group_send)(
            "vote_results",
            {
                "type": "winner_update",
                "data": [{"type": "region", "winners": region_winners},
                         {"type": "department", "winners": department_winners},
                         {"type": "arrondissement", "winners": arrondissement_winners}],
            }
        )
    except Exception as e:
        print(f"Erreur lors de l'envoi WebSocket : {e}")

def broadcast_election_summary():
    channel_layer = get_channel_layer()
    total_votes = BureauDeVote.objects.aggregate(total=Sum('number_of_votes'))['total'] or 0
    total_enrollees = BureauDeVote.objects.aggregate(total=Sum('number_of_enrollees'))['total'] or 0

    # Calcul du taux de participation
    participation_rate = (total_votes / total_enrollees * 100) if total_enrollees > 0 else 0

    # Trouver le candidat en tête
    candidate_results = ResultatDeVote.objects.values(
        candidate_id=F('candidat__id'),
        candidate_name=F('candidat__name'),
        political_party=F('candidat__political_party')
    ).annotate(
        total_candidate_votes=Sum('total_votes')
    ).order_by('-total_candidate_votes')

    leading_candidate = candidate_results.first() if candidate_results else None

    # Préparer la réponse
    response_data = {
        "total_votes": total_votes,
        "total_enrollees": total_enrollees,
        "participation_rate": participation_rate,
        "leading_candidate": {
            "name": leading_candidate['candidate_name'],
            "political_party": leading_candidate['political_party'],
            "total_votes": leading_candidate['total_candidate_votes']
        } if leading_candidate else None
    }
    try:
        async_to_sync(channel_layer.group_send)(
            "vote_results",
            {
                "type": "update_election_summary",
                "data": {"type": "existing", "data": response_data},
            }
        )
    except Exception as e:
        print(f"Erreur lors de l'envoi WebSocket : {e}")

class ResultatDeVoteCreateView(APIView):
    def post(self, request):
        # Assurez-vous que l'utilisateur est authentifié
        if not request.user.is_authenticated:
            return Response({"error": "Non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)

        # Les données envoyées doivent inclure un tableau de candidats et de voix
        candidats_voix = request.data.get('candidats_voix', [])
        bureau_de_vote_id = request.data.get('bureau_de_vote', None)

        if not candidats_voix or not bureau_de_vote_id:
            return Response({"error": "Les données sont incomplètes."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bureau_de_vote = BureauDeVote.objects.get(id=bureau_de_vote_id)
        except BureauDeVote.DoesNotExist:
            return Response({"error": f"Bureau de vote avec l'ID {bureau_de_vote_id} non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        # Calculer la somme totale des voix
        total_voix_soumises = sum(candidat_voix.get('total_voix', 0) for candidat_voix in candidats_voix)

        # Vérifier si la somme des voix dépasse le nombre d'inscrits
        if total_voix_soumises > bureau_de_vote.number_of_enrollees:
            return Response(
                {
                    "error": "La somme des voix soumises dépasse le nombre d'inscrits dans le bureau de vote.",
                    "total_voix_soumises": total_voix_soumises,
                    "number_of_enrollees": bureau_de_vote.number_of_enrollees
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer ou mettre à jour les résultats de vote pour chaque candidat
        for candidat_voix in candidats_voix:
            candidat_id = candidat_voix.get('candidat_id')
            total_voix = candidat_voix.get('total_voix')

            if total_voix is None or not candidat_id:
                return Response({"error": "Candidat ou nombre de voix manquant."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                candidat = User.objects.get(id=candidat_id)
            except User.DoesNotExist:
                return Response({"error": f"Candidat avec l'ID {candidat_id} non trouvé."}, status=status.HTTP_404_NOT_FOUND)

            # Vérifier si un résultat existe déjà
            ResultatDeVote.objects.update_or_create(
                candidat=candidat,
                bureau_de_vote=bureau_de_vote,
                defaults={"total_votes": total_voix}
            )

        # Mettre à jour le nombre total de votes dans le bureau de vote
        bureau_de_vote.number_of_votes = total_voix_soumises
        bureau_de_vote.save()

        # Notifications ou mises à jour supplémentaires
        broadcast_vote_update()
        broadcast_winners_update()
        broadcast_election_summary()

        return Response({"message": "Résultats de vote traités et nombre de votes mis à jour avec succès!"}, status=status.HTTP_200_OK)

class TotalVotesPerCandidateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Récupérer le total des votes par candidat en utilisant l'agrégation
        resultats = ResultatDeVote.objects.values('candidat').annotate(total_votes=Sum('total_votes')).order_by('-total_votes')

        # Créer une liste pour stocker les résultats formatés
        candidates_votes = []

        # Remplir la liste avec les informations des candidats et leurs votes totaux
        for resultat in resultats:
            candidat = User.objects.get(id=resultat['candidat'])  # Récupérer l'utilisateur/candidat correspondant
            candidates_votes.append({
                'candidateId': candidat.id,
                'candidateName': candidat.name,
                'totalVotes': resultat['total_votes']
            })

        # Retourner la réponse au frontend
        return Response(candidates_votes)


class CandidatListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Récupérer les utilisateurs ayant le rôle "CANDIDAT"
        candidats = User.objects.filter(role="CANDIDAT")
        data = [
            {
                "id": candidat.id,
                "name": candidat.name,
                "political_party": candidat.political_party,
                "userImage": candidat.userimage
            }
            for candidat in candidats
        ]
        return Response(data, status=status.HTTP_200_OK)
    
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import ResultatDeVote, BureauDeVote

def get_resultats_par_bureau(request, bureauDeVoteId):
    """
    Récupère les résultats des votes pour un bureau de vote donné.
    """
    bureau_de_vote = get_object_or_404(BureauDeVote, id=bureauDeVoteId)
    resultats = ResultatDeVote.objects.filter(bureau_de_vote=bureau_de_vote).select_related('candidat')

    # Formater les données
    data = [
        {
            'candidat_id': resultat.candidat.id,
            'name': resultat.candidat.name,
            'total_votes': resultat.total_votes
        }
        for resultat in resultats
    ]

    return JsonResponse(data, safe=False)



class FileUploadView(APIView):
    permission_classes = [AllowAny]
    MediaPath = r"C:\Users\james\Documents\Projet_SIG\Frontend_Projet_SIG\frontend_sig\public\UserImages"  # Custom path

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')

        if not file:
            return JsonResponse({'message': 'File is empty'}, status=400)

        try:
            # Generate a unique file name
            unique_filename = f"{uuid.uuid4()}-{file.name}"

            # Ensure the directory exists
            if not os.path.exists(self.MediaPath):
                os.makedirs(self.MediaPath)

            # Save the file directly to the specified frontend directory
            file_storage = FileSystemStorage(location=self.MediaPath)
            file_storage.save(unique_filename, file)

            # Return the file name as the response
            return JsonResponse({
                'file_name': unique_filename,
                'message': 'File uploaded successfully'
            }, status=200)

        except Exception as e:
            print(e)
            return JsonResponse({'message': 'File upload failed'}, status=500)
        
class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("Request Data:", data)

            # Extract fields from the request
            noms = data.get('name')
            prenoms = data.get('surname')
            email = data.get('email')
            birthdate = data.get('birthdate')
            political_party = data.get('political_party')
            tel = data.get('tel')
            password = data.get('password')
            gender = data.get('gender')
            role = data.get('role')
            bureau = data.get('bureau_de_vote_name')
            centre=data.get('centre_de_vote_name')
            userImage = data.get('userimage')


              # Set political_party to null if it's an empty string
            if political_party == "":
                political_party = None

             # Get the ID of the bureau_de_vote from its name
            bureau_id = get_bureau_de_vote_id(bureau)
            if bureau and not bureau_id:
                return Response({'message': f"Bureau de vote '{bureau}' not found"}, status=status.HTTP_404_NOT_FOUND)

            centre_id=get_centre_de_vote_id(centre)
            if centre and not centre_id:
                return Response({'message': f"Centre de vote '{centre}' not found"}, status=status.HTTP_404_NOT_FOUND)
            

             # Ensure required fields are present
            if not all([noms, prenoms, email,birthdate,tel, gender, role,]):
                return Response({'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            # Create and save the user
            user = User.objects.create(
                name=noms,
                surname=prenoms,
                email=email,
                birthdate=birthdate,
                political_party=political_party,
                tel=tel,
                password=make_password(password),
                gender=gender,
                role=role,
                bureau_de_vote_id=bureau_id,
                centre_de_vote_id=centre_id,
                userimage=userImage
            )

           
            user.save()

            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error: {e}")
            return Response({'message': 'Failed to create user', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserRecuperation(APIView):
    def get(self, request):
        # Récupérer les utilisateurs 
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)  # Serialize the queryset
        return Response(serializer.data, status=status.HTTP_200_OK)

def calculate_age(birthdate):
    today = datetime.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))

def filter_users_by_age(users, age, age_filter):
    if age_filter == "=":
        users = users.filter(
            Q(birthdate__lte=datetime.today() - timedelta(days=age * 365)) & 
            Q(birthdate__gt=datetime.today() - timedelta(days=(age + 1) * 365))
        )
    elif age_filter == ">":
        users = users.filter(birthdate__lte=datetime.today() - timedelta(days=age * 365))
    elif age_filter == "<":
        users = users.filter(birthdate__gt=datetime.today() - timedelta(days=(age + 1) * 365))
    
    return users

def user_filter_list(request):
    """
    View to filter and retrieve users based on specified criteria.
    """
    # Extract filter parameters from the request
    name = request.GET.get('name', '').strip().lower()
    role = request.GET.get('role', '').strip().lower()
    gender = request.GET.get('gender', '').strip().lower()
    age = request.GET.get('age', '').strip()
    age_filter = request.GET.get('ageFilter', '=').strip()  # Expect '=', '<', or '>'
    region_id = request.GET.get('region_id')
    departement_id = request.GET.get('departement_id')
    arrondissement = request.GET.get('arrondissement', '').strip().lower()
    bureau = request.GET.get('bureau', '').strip().lower()
    centre = request.GET.get('centre', '').strip().lower()
    alphabetical = request.GET.get('Alphabetical', '').strip()

    # Initialize the queryset
    users = User.objects.select_related(
        'bureau_de_vote__centre_de_vote__arrondissement__departement__region',
        'centre_de_vote__arrondissement__departement__region'
    )

    # Apply filters
    if alphabetical:
        users = users.filter(name__istartswith=alphabetical)

    if name:
        users = users.filter(name__icontains=name)

    if role:
        users = users.filter(role__icontains=role)

    if gender:
        users = users.filter(gender__iexact=gender)
    
    if age:
      users = filter_users_by_age(users, int(age), age_filter)
    

    if region_id:
        users = users.filter(
            Q(bureau_de_vote__centre_de_vote__arrondissement__departement__region__id=region_id) |
            Q(centre_de_vote__arrondissement__departement__region__id=region_id)
        )

    if departement_id:
        users = users.filter(
            Q(bureau_de_vote__centre_de_vote__arrondissement__departement__id=departement_id) |
            Q(centre_de_vote__arrondissement__departement__id=departement_id)
        )

    if arrondissement:
        users = users.filter(
            Q(bureau_de_vote__centre_de_vote__arrondissement__name__icontains=arrondissement) |
            Q(centre_de_vote__arrondissement__name__icontains=arrondissement)
        )

    if bureau:
        users = users.filter(bureau_de_vote__name__icontains=bureau)

    if centre:
        users = users.filter(
            Q(bureau_de_vote__centre_de_vote__name__icontains=centre) |
            Q(centre_de_vote__name__icontains=centre)
        )

   

    # Prepare the data for the frontend
    data = [
        {
            'id': user.id,
            'name': user.name,
            'surname': user.surname,
            'email': user.email,
            'birthdate':user.birthdate,
            'political_party':user.political_party,
            'tel':user.tel,
            'role': user.role,
            'gender': user.gender,
            'bureau_de_vote_name': user.bureau_de_vote.name if user.bureau_de_vote else "",
            'centre_de_vote_name': user.centre_de_vote.name if user.centre_de_vote else "",
            'region': (
                user.bureau_de_vote.centre_de_vote.arrondissement.departement.region.name
                if user.bureau_de_vote and user.bureau_de_vote.centre_de_vote
                else user.centre_de_vote.arrondissement.departement.region.name
                if user.centre_de_vote
                else ""
            ),
            'userimage':user.userimage,
        }
        for user in users
    ]

    return JsonResponse(data, safe=False)


class DeleteUser(APIView):
    """
    Supprimer un utilisateur par son ID
    """
    def delete(self, request, user_id, format=None):
        try:
            # Récupérer le user à partir de son ID
            user = User.objects.get(id=user_id)
            user.delete()  # Supprimer le centre de vote
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {"detail": "user non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
class UpdateUser(APIView):
    """
    Mettre à jour un user par son ID
    """
    def patch(self, request, user_id):
        try:
            # Parse incoming JSON data
            data = json.loads(request.body)

            # Fetch the user object
            user = get_object_or_404(User, id=user_id)

            # Update fields selectively
            if 'name' in data:
                user.name = data['name']
            if 'surname' in data:
                user.surname = data['surname']
            if 'email' in data:
                user.email = data['email']
            if 'birthdate' in data:
                user.birthdate = datetime.strptime(data['birthdate'], '%Y-%m-%d').date()
            if 'political_party' in data:
                user.political_party = data.get('political_party')  
            if 'tel' in data:
                user.tel = data['tel']
            if 'password' in data:
                user.set_password(data['password'])  
            if 'gender' in data:
                user.gender = data['gender']
            if 'role' in data:
                user.role = data['role']
            if 'bureau_de_vote_name' in data:
                bureau_id = get_bureau_de_vote_id(data.get('bureau_de_vote_name'))
                user.bureau_de_vote_id = bureau_id  # Set the bureau_de_vote_id directly since it's stored as an ID
    
            if 'centre_de_vote_name' in data:
                centre_id = get_centre_de_vote_id(data.get('centre_de_vote_name'))
                user.centre_de_vote_id = centre_id  # Set the centre_de_vote_id directly since it's stored as an ID
    
            if 'userimage' in data:
                user.userimage = data['userimage']

            # Save updated user
            user.save()

            return JsonResponse({'message': 'User updated successfully', 'user_id': user.id})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
class GetExistingResultsApiView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        
        results = ResultatDeVote.objects.all().order_by('created_at')
        data = [
            {
                "candidat": result.candidat.name,
                "total_votes": result.total_votes,
                "time": result.created_at.strftime('%H:%M:%S'),
            }
            for result in results
        ]
        return JsonResponse(data, safe=False)


class GetWinnerByRegion(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        regions = Region.objects.all()
        region_winners = {}

        for region in regions:
            # Totaliser les votes par candidat pour chaque région
            results = (
                ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement__departement__region=region)
                .values('candidat__id', 'candidat__name', 'candidat__surname')
                .annotate(total_votes=Sum('total_votes'))
                .order_by('-total_votes')
            )
            if results:
                top_candidate = results[0]
                region_winners[region.name] = {
                    "candidat_id": top_candidate["candidat__id"],
                    "candidat_name": top_candidate["candidat__name"],
                    "candidat_surname": top_candidate["candidat__surname"],
                    "total_votes": top_candidate["total_votes"],
                }
        print(region_winners)
        return JsonResponse(region_winners)

class GetWinnerByDepartement(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        departements = Departement.objects.all()
        department_winners = {}

        for departement in departements:
            # Totaliser les votes par candidat pour chaque département
            results = (
                ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement__departement=departement)
                .values('candidat__id', 'candidat__name', 'candidat__surname')
                .annotate(total_votes=Sum('total_votes'))
                .order_by('-total_votes')
            )
            if results:
                top_candidate = results[0]
                department_winners[departement.name] = {
                    "candidat_id": top_candidate["candidat__id"],
                    "candidat_name": top_candidate["candidat__name"],
                    "candidat_surname": top_candidate["candidat__surname"],
                    "total_votes": top_candidate["total_votes"],
                }
        print(department_winners)
        return JsonResponse(department_winners)

class GetWinnerByArrondissement(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        arrondissements = Arrondissement.objects.all()
        arrondissement_winners = {}

        for arrondissement in arrondissements:
            # Totaliser les votes par candidat pour chaque arrondissement
            results = (
                ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote__arrondissement=arrondissement)
                .values('candidat__id', 'candidat__name', 'candidat__surname')
                .annotate(total_votes=Sum('total_votes'))
                .order_by('-total_votes')
            )
            if results:
                top_candidate = results[0]
                arrondissement_winners[arrondissement.name] = {
                    "candidat_id": top_candidate["candidat__id"],
                    "candidat_name": top_candidate["candidat__name"],
                    "candidat_surname": top_candidate["candidat__surname"],
                    "total_votes": top_candidate["total_votes"],
                }
        print(arrondissement_winners)
        return JsonResponse(arrondissement_winners)

class GetWinnerByCentreDeVote(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        centres_de_vote = CentreDeVote.objects.all()
        centre_winners = {}

        for centre in centres_de_vote:
            # Totaliser les votes par candidat pour chaque centre de vote
            results = (
                ResultatDeVote.objects.filter(bureau_de_vote__centre_de_vote=centre)
                .values('candidat__id', 'candidat__name', 'candidat__surname')
                .annotate(total_votes=Sum('total_votes'))
                .order_by('-total_votes')
            )
            if results:
                top_candidate = results[0]
                centre_winners[centre.name] = {
                    "candidat_id": top_candidate["candidat__id"],
                    "candidat_name": top_candidate["candidat__name"],
                    "candidat_surname": top_candidate["candidat__surname"],
                    "total_votes": top_candidate["total_votes"],
                }
        print(centre_winners)
        return JsonResponse(centre_winners)
  
def get_vote_results(request):
    results = ResultatDeVote.objects.order_by('created_at')
    data = {}

    for result in results:
        candidat = result.candidat.name
        if candidat not in data:
            data[candidat] = []

        data[candidat].append({
            "time": result.created_at.strftime('%H:%M:%S'),
            "total_votes": result.total_votes
        })

    return JsonResponse(data)  

@transaction.atomic
@csrf_exempt
def get_initial_results(request):
    results = ResultatDeVote.objects.all().order_by('created_at')
    data = {}
    for result in results:
        candidat = result.candidat.name
        if candidat not in data:
            data[candidat] = []
        data[candidat].append({
            "total_votes": result.total_votes,
            "time": result.created_at.strftime('%H:%M:%S')
        })
    return JsonResponse(data) 
  
@transaction.atomic
@csrf_exempt
def get_vote_evolution(request):
    """
    Vue pour retourner l'évolution des votes au format adapté à un LineChart.
    Les résultats sont agrégés par intervalle de temps (par exemple, 30 minutes).
    """

    # Obtenez les paramètres facultatifs pour définir la période
    start_time_str = request.GET.get("start_time")  # Format attendu: 'YYYY-MM-DD HH:MM'
    end_time_str = request.GET.get("end_time")  # Format attendu: 'YYYY-MM-DD HH:MM'
    interval_minutes = int(request.GET.get("interval", 30))  # Intervalle en minutes (par défaut 30)

    # Définir les plages de temps par défaut si elles ne sont pas fournies
    if not start_time_str:
        start_time = now() - timedelta(hours=12)  # 12 heures avant l'heure actuelle
    else:
        start_time = datetime.datetime.strptime(start_time_str, "%Y-%m-%d %H:%M")

    if not end_time_str:
        end_time = now()
    else:
        end_time = datetime.datetime.strptime(end_time_str, "%Y-%m-%d %H:%M")

    # Initialiser le tableau pour les résultats agrégés
    time_intervals = []
    current_time = start_time
    while current_time < end_time:
        next_time = current_time + timedelta(minutes=interval_minutes)
        time_intervals.append((current_time, next_time))
        current_time = next_time

    # Agréger les données pour chaque intervalle
    aggregated_results = []
    for start, end in time_intervals:
        votes_by_candidate = (
            ResultatDeVote.objects.filter(created_at__gte=start, created_at__lt=end)
            .values("candidat__name")  # Grouper par candidat
            .annotate(total_votes=Sum("total_votes"))  # Somme des votes par candidat
            .order_by("candidat__name")
        )

        # Structure des données pour le LineChart
        aggregated_results.append({
            "time": start.strftime("%H:%M"),  # Heure de début de l'intervalle
            **{vote["candidat__name"]: vote["total_votes"] for vote in votes_by_candidate},
        })

    return JsonResponse(aggregated_results, safe=False)

@transaction.atomic
@csrf_exempt
def region_statistics(request, region_name):
    try:
        region = Region.objects.get(name=region_name)
        departements = region.departements.all()
        arrondissements = Arrondissement.objects.filter(departement__in=departements)
        centres_de_vote = CentreDeVote.objects.filter(arrondissement__in=arrondissements)
        bureaux_de_vote = BureauDeVote.objects.filter(centre_de_vote__in=centres_de_vote)

        # Calculs
        total_enrollees = bureaux_de_vote.aggregate(Sum('number_of_enrollees'))['number_of_enrollees__sum'] or 0
        total_votes = bureaux_de_vote.aggregate(Sum('number_of_votes'))['number_of_votes__sum'] or 0
        participation_rate = (total_votes / total_enrollees * 100) if total_enrollees > 0 else 0

        # Votes par candidat
        results = ResultatDeVote.objects.filter(bureau_de_vote__in=bureaux_de_vote).values('candidat__name').annotate(total_votes=Sum('total_votes'))

        return JsonResponse({
            "region": region_name,
            "total_enrollees": total_enrollees,
            "total_votes": total_votes,
            "participation_rate": round(participation_rate, 2),
            "results": list(results)
        })
    except Region.DoesNotExist:
        return JsonResponse({"error": "Region not found"}, status=404)

@transaction.atomic
@csrf_exempt
def departement_statistics(request, departement_name):
    try:
        departement = Departement.objects.get(name=departement_name)
        arrondissements = departement.arrondissements.all()
        centres_de_vote = CentreDeVote.objects.filter(arrondissement__in=arrondissements)
        bureaux_de_vote = BureauDeVote.objects.filter(centre_de_vote__in=centres_de_vote)

        # Calculs
        total_enrollees = bureaux_de_vote.aggregate(Sum('number_of_enrollees'))['number_of_enrollees__sum'] or 0
        total_votes = bureaux_de_vote.aggregate(Sum('number_of_votes'))['number_of_votes__sum'] or 0
        participation_rate = (total_votes / total_enrollees * 100) if total_enrollees > 0 else 0

        # Votes par candidat
        results = ResultatDeVote.objects.filter(bureau_de_vote__in=bureaux_de_vote).values('candidat__name').annotate(total_votes=Sum('total_votes'))

        return JsonResponse({
            "departement": departement_name,
            "total_enrollees": total_enrollees,
            "total_votes": total_votes,
            "participation_rate": round(participation_rate, 2),
            "results": list(results)
        })
    except Departement.DoesNotExist:
        return JsonResponse({"error": "Departement not found"}, status=404)

@transaction.atomic
@csrf_exempt
def arrondissement_statistics(request, arrondissement_name):
    try:
        arrondissement = Arrondissement.objects.get(name=arrondissement_name)
        centres_de_vote = arrondissement.centres_de_vote.all()
        bureaux_de_vote = BureauDeVote.objects.filter(centre_de_vote__in=centres_de_vote)

        # Calculs
        total_enrollees = bureaux_de_vote.aggregate(Sum('number_of_enrollees'))['number_of_enrollees__sum'] or 0
        total_votes = bureaux_de_vote.aggregate(Sum('number_of_votes'))['number_of_votes__sum'] or 0
        participation_rate = (total_votes / total_enrollees * 100) if total_enrollees > 0 else 0

        # Votes par candidat
        results = ResultatDeVote.objects.filter(bureau_de_vote__in=bureaux_de_vote).values('candidat__name').annotate(total_votes=Sum('total_votes'))

        return JsonResponse({
            "arrondissement": arrondissement_name,
            "total_enrollees": total_enrollees,
            "total_votes": total_votes,
            "participation_rate": round(participation_rate, 2),
            "results": list(results)
        })
    except Arrondissement.DoesNotExist:
        return JsonResponse({"error": "Arrondissement not found"}, status=404)





@transaction.atomic
@csrf_exempt
def election_summary(request):
    # Total des voix et des inscrits
    total_votes = BureauDeVote.objects.aggregate(total=Sum('number_of_votes'))['total'] or 0
    total_enrollees = BureauDeVote.objects.aggregate(total=Sum('number_of_enrollees'))['total'] or 0

    # Calcul du taux de participation
    participation_rate = (total_votes / total_enrollees * 100) if total_enrollees > 0 else 0

    # Trouver le candidat en tête
    candidate_results = ResultatDeVote.objects.values(
        candidate_id=F('candidat__id'),
        candidate_name=F('candidat__name'),
        political_party=F('candidat__political_party')
    ).annotate(
        total_candidate_votes=Sum('total_votes')
    ).order_by('-total_candidate_votes')

    leading_candidate = candidate_results.first() if candidate_results else None

    # Préparer la réponse
    response_data = {
        "total_votes": total_votes,
        "total_enrollees": total_enrollees,
        "participation_rate": participation_rate,
        "leading_candidate": {
            "name": leading_candidate['candidate_name'],
            "political_party": leading_candidate['political_party'],
            "total_votes": leading_candidate['total_candidate_votes']
        } if leading_candidate else None
    }

    return JsonResponse(response_data)
