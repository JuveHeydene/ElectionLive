from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Region, Departement, Arrondissement, CentreDeVote, BureauDeVote,AdministrativeUnit,RegionUnit,DepartmentUnit
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from .serializers import CentreDeVoteSerializer, BureauDeVoteSerializer,AdministrativeUnitSerializer,RegionUnitSerializer,DepartmentUnitSerializer
from rest_framework import viewsets
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt


class CentresDeVoteByRegionView(APIView):
    
    def get(self, request, *args, **kwargs):
        try:
            # Récupérer la région par son nom
            region_name = request.data.get('region_name')
            region = Region.objects.get(name=region_name)

            # Filtrer les centres de vote en suivant la chaîne de relations : Region -> Departement -> Arrondissement -> CentreDeVote
            centres_de_vote = CentreDeVote.objects.filter(
                arrondissement__departement__region=region
            )

            # Extraire les IDs des centres de vote
            centres_ids = [centre.name for centre in centres_de_vote]

            if not centres_ids:
                return Response({'detail': 'No centres found for this region'}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'region': region.name,
                'centres_de_vote_': centres_ids
            }, status=status.HTTP_200_OK)

        except Region.DoesNotExist:
            return Response({'detail': 'Region not found'}, status=status.HTTP_404_NOT_FOUND)


class CreateBureauDeVoteView(APIView):
    def post(self, request):
        """
        Endpoint pour créer un nouveau bureau de vote.
        """
        # Vérification et récupération des données envoyées dans la requête
        nom = request.data.get('nom')
        centre_de_vote_id = request.data.get('votingCenterName')

        if not nom or not centre_de_vote_id:
            return Response(
                {"error": "Le champ 'nom' et 'centre_de_vote' sont requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si le centre de vote existe
        try:
            centre_de_vote = CentreDeVote.objects.get(name=centre_de_vote_id)
        except CentreDeVote.DoesNotExist:
            return Response(
                {"error": "Le centre de vote spécifié n'existe pas."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Créer un nouveau bureau de vote
        bureau_de_vote = BureauDeVote.objects.create(
            name=nom,
            centre_de_vote=centre_de_vote,
            number_of_enrollees=0,  # Valeur par défaut
            number_of_votes=0,      # Valeur par défaut
            number_of_blank_votes=0 # Valeur par défaut
        )

        # Sérialisation et retour des données du bureau créé
        serializer = BureauDeVoteSerializer(bureau_de_vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CreateCentreDeVoteView(APIView):
    def post(self, request):
        """
        Endpoint pour créer un nouveau bureau de vote.
        """
        # Vérification et récupération des données envoyées dans la requête
        nom = request.data.get('name')
        arrondissment_name = request.data.get('arrondissmentName')

        if not nom or not arrondissment_name:
            return Response(
                {"error": "Le champ 'name' et 'arrondissmentName' sont requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si le centre de vote existe
        try:
            arrondissment = Arrondissement.objects.get(name=arrondissment_name)
        except Arrondissement.DoesNotExist:
            return Response(
                {"error": "L'arrondissment spécifié n'existe pas."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Créer un nouveau bureau de vote
        centre_de_vote = CentreDeVote.objects.create(
            name=nom,
            arrondissement=arrondissment,
        )

        # Sérialisation et retour des données du bureau créé
        serializer = CentreDeVoteSerializer(centre_de_vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BureauxDeVoteByRegionView(APIView):
    
    def get(self, request, *args, **kwargs):
        try:
            # Récupérer la région par son nom
            region_name = request.query_params.get('region_name')
            if not region_name:
                return Response({'detail': 'region_name query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            
            region = Region.objects.get(name=region_name)

            # Filtrer les bureau_de_votes de vote en suivant la chaîne de relations : Region -> Departement -> Arrondissement -> bureau_de_voteDeVote
            bureaux_de_vote = BureauDeVote.objects.filter(
                centre_de_vote__arrondissement__departement__region=region
            )

            # Extraire les IDs des bureau_de_votes de vote
            bureau_de_vote_names = [bureau_de_vote.name for bureau_de_vote in bureaux_de_vote]

            if not bureau_de_vote_names:
                return Response({'detail': 'No bureau_de_votes found for this region'}, status=status.HTTP_404_NOT_FOUND)

            return Response({
                'region': region.name,
                'bureau_de_vote_': bureau_de_vote_names
            }, status=status.HTTP_200_OK)

        except Region.DoesNotExist:
            return Response({'detail': 'Region not found'}, status=status.HTTP_404_NOT_FOUND)


def get_voting_centers_list_options(request):
    voting_centers= CentreDeVote.objects.all()
    data = [
        {
            'label':voting_center.name,
            'value':voting_center.name
        }
        for voting_center in voting_centers
    ]
    return JsonResponse(data=data, safe=False)


def get_voting_office_list_options(request):
    voting_office= BureauDeVote.objects.all()
    data = [
        {
            'label':voting_office.name,
            'value':voting_office.name
        }
        for voting_office in voting_office
    ]
    return JsonResponse(data=data, safe=False)


def regions_departments(request):
    regions = Region.objects.all()
    departments = Departement.objects.all()
    arrondismments = Arrondissement.objects.all()

    data = {
        'regions': [{'id': region.id, 'name': region.name} for region in regions],
        'departments': [{'id': dept.id, 'name': dept.name} for dept in departments],
        'arrondismments': [{'id': arr.id, 'name': arr.name} for arr in arrondismments],
    }
    return JsonResponse(data)




def voting_centers_list(request):
    """
    Vue pour récupérer les centres de vote en fonction des critères de recherche/tri.
    """
    center_name = request.GET.get('center_name', '').strip().lower()
    arrondissement_name = request.GET.get('arrondissement_name', '').strip().lower()
    departement_id = request.GET.get('departement_id')
    region_id = request.GET.get('region_id')

    # Récupération des centres de vote avec filtrage
    voting_centers = CentreDeVote.objects.select_related(
        'arrondissement__departement__region'
    )

    if center_name:
        voting_centers = voting_centers.filter(name__icontains=center_name)
    
    if arrondissement_name:
        voting_centers = voting_centers.filter(arrondissement__name__icontains=arrondissement_name)
    
    if departement_id:
        voting_centers = voting_centers.filter(arrondissement__departement__id=departement_id)
    
    if region_id:
        voting_centers = voting_centers.filter(arrondissement__departement__region__id=region_id)

    # Préparer les données pour le frontend
    data = [
        {
            'id': center.id,
            'center_name': center.name,
            'arrondissement_name': center.arrondissement.name,
        }
        for center in voting_centers
    ]
    return JsonResponse(data, safe=False)

def voting_office_list(request):
    """
    Vue pour récupérer les centres de vote en fonction des critères de recherche/tri.
    """
    office_name = request.GET.get('office_name', '').strip().lower()
    center_name = request.GET.get('center_name', '').strip().lower()
    arrondissement_name = request.GET.get('arrondissement_name', '').strip().lower()
    departement_id = request.GET.get('departement_id')
    region_id = request.GET.get('region_id')

    # Récupération des bureaux de vote avec filtrage
    voting_offices = BureauDeVote.objects.select_related(
        'centre_de_vote__arrondissement__departement__region'
    )
    if office_name:
        voting_offices = voting_offices.filter(name__icontains=office_name)
    if center_name:
        voting_offices = voting_offices.filter(centre_de_vote__name__icontains=center_name)
    
    if arrondissement_name:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__name__icontains=arrondissement_name)
    
    if departement_id:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__departement__id=departement_id)
    
    if region_id:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__departement__region__id=region_id)

    # Préparer les données pour le frontend
    data = [
        {
            'id': office.id,
            'office_name': office.name,
            'center_name': office.centre_de_vote.name,
        }
        for office in voting_offices
    ]
    return JsonResponse(data, safe=False)
    

def voting_office_list_labelvalueform(request):
    """
    Vue pour récupérer les bureau de vote en fonction des critères de recherche/tri.
    """
    office_name = request.GET.get('office_name', '').strip().lower()
    center_name = request.GET.get('center_name', '').strip().lower()
    arrondissement_name = request.GET.get('arrondissement_name', '').strip().lower()
    departement_id = request.GET.get('departement_id')
    region_id = request.GET.get('region_id')

    # Récupération des bureaux de vote avec filtrage
    voting_offices = BureauDeVote.objects.select_related(
        'centre_de_vote__arrondissement__departement__region'
    )
    if office_name:
        voting_offices = voting_offices.filter(name__icontains=office_name)
    if center_name:
        voting_offices = voting_offices.filter(centre_de_vote__name__icontains=center_name)
    
    if arrondissement_name:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__name__icontains=arrondissement_name)
    
    if departement_id:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__departement__id=departement_id)
    
    if region_id:
        voting_offices = voting_offices.filter(centre_de_vote__arrondissement__departement__region__id=region_id)

    # Préparer les données pour le frontend
    data = [
        {
            
            'label': office.name,
            'value': office.name,
        }
        for office in voting_offices
    ]
    return JsonResponse(data, safe=False)


def voting_centers_listlabelvalue(request):
    """
    Vue pour récupérer les centres de vote en fonction des critères de recherche/tri.
    """
    center_name = request.GET.get('center_name', '').strip().lower()
    arrondissement_name = request.GET.get('arrondissement_name', '').strip().lower()
    departement_id = request.GET.get('departement_id')
    region_id = request.GET.get('region_id')

    # Récupération des centres de vote avec filtrage
    voting_centers = CentreDeVote.objects.select_related(
        'arrondissement__departement__region'
    )

    if center_name:
        voting_centers = voting_centers.filter(name__icontains=center_name)
    
    if arrondissement_name:
        voting_centers = voting_centers.filter(arrondissement__name__icontains=arrondissement_name)
    
    if departement_id:
        voting_centers = voting_centers.filter(arrondissement__departement__id=departement_id)
    
    if region_id:
        voting_centers = voting_centers.filter(arrondissement__departement__region__id=region_id)

    # Préparer les données pour le frontend
    data = [
        {
           'label': center.name,
            'value': center.name,
        }
        for center in voting_centers
    ]
    return JsonResponse(data, safe=False)
    

def create_new_voting_office(request):
    name = request.data.get("nom")
    voting_center_name = request.data.get("votingCenterName")
    try:
        voting_center = CentreDeVote.objects.get(name = voting_center_name)
    except CentreDeVote.DoesNotExist:
        return Response({"error": f"Le centre de vote {voting_center_name} non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    bureau_de_vote = BureauDeVote.objects.update_or_create(
            name = name,
            centre_de_vote=voting_center
            )
    return Response({"message": "Bureau de vote créé avec succès!"}, status=status.HTTP_200_OK)   
    

class DeleteVotingCenter(APIView):
    """
    Supprimer un centre de vote par son ID
    """
    def delete(self, request, center_id, format=None):
        try:
            # Récupérer le centre de vote à partir de son ID
            centre = CentreDeVote.objects.get(id=center_id)
            centre.delete()  # Supprimer le centre de vote
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CentreDeVote.DoesNotExist:
            return Response(
                {"detail": "Centre de vote non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )


class UpdateVotingCenter(APIView):
    """
    Mettre à jour un centre de vote par son ID
    """
    def put(self, request, center_id, format=None):
        try:
            # Récupérer le centre de vote à partir de son ID
            centre = CentreDeVote.objects.get(id=center_id)

            # Mise à jour des informations du centre de vote avec les données de la requête
            serializer = CentreDeVoteSerializer(centre, data=request.data)

            # Valider et sauvegarder si les données sont valides
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CentreDeVote.DoesNotExist:
            return Response(
                {"detail": "Centre de vote non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )
  
class DeleteVotingOffice(APIView):
    """
    Supprimer un bureau de vote par son ID
    """
    def delete(self, request, office_id, format=None):
        try:
            # Récupérer le centre de vote à partir de son ID
            office = BureauDeVote.objects.get(id=office_id)
            office.delete()  # Supprimer le centre de vote
            return Response(status=status.HTTP_204_NO_CONTENT)
        except BureauDeVote.DoesNotExist:
            return Response(
                {"detail": "Centre de vote non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )


class UpdateVotingOffice(APIView):
    """
    Mettre à jour un bureau de vote par son ID
    """
    def put(self, request, office_id, format=None):
        try:
            # Récupérer le bureau de vote à partir de son ID
            office = BureauDeVote.objects.get(id=office_id)

            # Mise à jour des informations du bureau de vote avec les données de la requête
            serializer = BureauDeVoteSerializer(office, data=request.data)

            # Valider et sauvegarder si les données sont valides
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except BureauDeVote.DoesNotExist:
            return Response(
                {"detail": "Centre de vote non trouvé"},
                status=status.HTTP_404_NOT_FOUND,
            )
           
def getAllArrondissment(request):
    arrondissments= Arrondissement.objects.all()
    data = [
        {
            'label':arrondissment.name,
            'value':arrondissment.name
        }
        for arrondissment in arrondissments
    ]
    return JsonResponse(data=data, safe=False)




class UploadPVView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, bureau_de_vote_id):
        
        try:
            bureau_de_vote = BureauDeVote.objects.get(id=bureau_de_vote_id)
        except BureauDeVote.DoesNotExist:
            return Response({"error": "Bureau de vote non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        # Vérifiez si un fichier a été envoyé
        if 'file' not in request.FILES:
            print("Files :",request.FILES)
            return Response({"error": "Aucun fichier envoyé."}, status=status.HTTP_400_BAD_REQUEST)

        # Ajoutez le fichier au champ pv
        bureau_de_vote.pv = request.FILES['file']
        bureau_de_vote.save()

        return Response({"message": "Procès-verbal téléchargé avec succès!"}, status=status.HTTP_200_OK)

import csv
from django.http import HttpResponse
from .models import BureauDeVote

@transaction.atomic
@csrf_exempt
def export_bureaux_de_vote_csv(request):
    # Création de la réponse HTTP avec type de contenu CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="bureaux_de_vote.csv"'

    # Définir l'écrivain CSV
    writer = csv.writer(response)
    writer.writerow(['ID', 'Nom', 'Centre de Vote', 'Nombre d\'inscrits', 'Votes exprimés', 'Votes blancs'])

    # Extraire les données et les écrire
    for bureau in BureauDeVote.objects.all():
        writer.writerow([
            bureau.id,
            bureau.name,
            bureau.centre_de_vote.name,
            bureau.number_of_enrollees,
            bureau.number_of_votes,
            bureau.number_of_blank_votes,
        ])

    return response

from django.template.loader import get_template
from django.http import HttpResponse
from xhtml2pdf import pisa
from .models import Region

def render_to_pdf(template_src, context_dict):
    template = get_template(template_src)
    html = template.render(context_dict)
    response = HttpResponse(content_type='application/pdf')
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Erreur lors de la génération du PDF', status=500)
    return response

def export_regions_pdf(request):
    regions = Region.objects.prefetch_related('departements__arrondissements__centres_de_vote').all()
    context = {
        'regions': regions,
    }
    return render_to_pdf('export_regions.html', context)


class AdministrativeUnitViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = AdministrativeUnit.objects.all()
    serializer_class = AdministrativeUnitSerializer
class RegionViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = RegionUnit.objects.all()
    serializer_class = RegionUnitSerializer
class DepartmentUnitViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = DepartmentUnit.objects.all()
    serializer_class = DepartmentUnitSerializer
