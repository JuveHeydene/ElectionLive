from circonscription.models import Region, Departement, Arrondissement, CentreDeVote, BureauDeVote
from users.enums import Gender, UserRole
from users.models import User, ResultatDeVote
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum 
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta
from django.db import transaction
from django.contrib.auth.hashers import make_password
import random
def create_region():
    regions = ['CENTRE','LITTORAL']
    for region in regions:
        Region.objects.get_or_create(name=region)


# Création des départements associés à la région du CENTRE
def create_departments_for_centre():
    try:
        # Récupérer ou créer la région du CENTRE
        centre_region, created = Region.objects.get_or_create(name='CENTRE')
        if created:
            print(f" La région '{centre_region.name}' a été créée.")
        else:
            print(f"La région '{centre_region.name}' existe déjà dans la base de données.")

        # Liste des départements de la région CENTRE
        departments_data = [
            {'name': 'HAUTE-SANAGA'},
            {'name': 'MBAM-ET-KIM'},
            {'name': 'LEKIE'},
            {'name': 'MEFOU-ET-AFAMBA'},
            {'name': 'MEFOU-ET-AKONO'},
            {'name': 'MFOUNDI'},
            {'name': 'MBAM-ET-INOUBOU'},
            {'name': 'NYONG-ET-MFOUMOU'},
            {'name': 'NYONG-ET-KELLE'},
            {'name': 'NYONG-ET-SOO'}
        ]

        # Création des départements et association avec la région CENTRE
        for department_data in departments_data:
            department, created = Departement.objects.get_or_create(
                name=department_data['name'], 
                region=centre_region  # Association au centre
            )
            if created:
                print(f"✅ Le département '{department.name}' a été créé et associé à la région '{centre_region.name}'.")
            else:
                print(f"⚠️ Le département '{department.name}' existe déjà dans la région '{centre_region.name}'.")

    except Exception as e:
        print(f"❌ Une erreur s'est produite : {e}")

def create_departments_for_littoral():
    try:
        # Récupérer ou créer la région du CENTRE
        littoral, created = Region.objects.get_or_create(name='LITTORAL')
        if created:
            print(f" La région '{littoral.name}' a été créée.")
        else:
            print(f"La région '{littoral.name}' existe déjà dans la base de données.")

        # Liste des départements de la région CENTRE
        departments_data = [
            {'name': 'MOUNGO'},
            {'name': 'SANAGA-MARITIME'},
            {'name': 'WOURI'},
            {'name': 'NKAM'},
        ]

        # Création des départements et association avec la région CENTRE
        for department_data in departments_data:
            department, created = Departement.objects.get_or_create(
                name=department_data['name'], 
                region=littoral  # Association au centre
            )
            if created:
                print(f"✅ Le département '{department.name}' a été créé et associé à la région '{littoral.name}'.")
            else:
                print(f"⚠️ Le département '{department.name}' existe déjà dans la région '{littoral.name}'.")

    except Exception as e:
        print(f"❌ Une erreur s'est produite : {e}")

centre_departments_data = [
    {
        'name': 'HAUTE-SANAGA',
        'arrondissements': ['NANGA-EBOKO', 'NSEM', 'BIBEY', 'MINTA', 'MBANDJOCK', 'LEMBE-YEZOUM','NKOTENG']
    },
    {
        'name': 'LEKIE',
        'arrondissements': ['MONATELE', 'EVODOULA', 'OBALA', 'BATCHENGA', 'ELIG-MFOMO', 
                            'OKOLA', 'SAA', 'EBEBDA', 'LOBO']
    },
    {
        'name': 'MBAM-ET-INOUBOU',
        'arrondissements': ['BAFIA', 'DEUK', 'NDIKINIMEKI', 'NITOUKOU', 'MAKENENE', 
                            'OMBESSA', 'KIIKI', 'KON-YAMBETTA', 'BOKITO']
    },
    {
        'name': 'MBAM-ET-KIM',
        'arrondissements': ['NTUI', 'NGORO', 'YOKO','NGAMBE-TIKAR','MBANGASSINA']
    },
    {
        'name': 'MEFOU-ET-AFAMBA',
        'arrondissements': ['MFOU', 'AWAE', 'ASSAMBA (OLANGUINA)',  
                            'NKOLAFAMBA', 'SOA','ESSE','EDZENDOUAN', 'AFANLOUM']
    },
    {
        'name': 'MEFOU-ET-AKONO',
        'arrondissements': ['NGOUMOU', 'AKONO', 'BIKOK','MBANKOMO']
    },
    {
        'name': 'MFOUNDI',
        'arrondissements': ['YAOUNDE I', 'YAOUNDE II', 'YAOUNDE III', 'YAOUNDE IV', 
                            'YAOUNDE V', 'YAOUNDE VI', 'YAOUNDE VII']
    },
    {
        'name': 'NYONG-ET-KELLE',
        'arrondissements': ['ESEKA', 'MATOMB', 'BONDJOCK', 'NGUIBASSAL', 'DIBANG', 
                            'BIYOUHA', 'BOT-MAKAK','MAKAK','MESSONDO','NGOG-MAPUBI']
    },
    {
        'name': 'NYONG-ET-MFOUMOU',
        'arrondissements': ['AKONOLINGA', 'ENDOM', 'MENGANG', 'NYAKOMBO', 'AYOS']
    },
    {
        'name': 'NYONG-ET-SOO',
        'arrondissements': ['MBALMAYO', 'NKOLMETET', 'DZENG', 'NGOMEDZAP', 'AKOEMAN','MENGUEME']
    }
]

littoral_departments_data = [
    {
        'name': 'MOUNGO',
        'arrondissements': ['NKONGSAMBA I', 'NKONGSAMBA II', 'NKONGSAMBA III', 'NLONAKO', 'DIBOMBARI', 'FIKO',
                            'LOUM', 'NJOMBE-PENJA', 'MANJO', 'MBANGA', 'MOMBO', 'MELONG', 
                            'BARE-BAKEM']
    },
    {
        'name': 'SANAGA-MARITIME',
        'arrondissements': ['EDEA I', 'EDEA II', 'DIZANGUE', 'MOUANKO', 'NDOM',
                            'NYANON', 'NGAMPE', 'MASSOCK-SONGLOULOU', 'POUMA', 
                            'DIBAMBA', 'NGWEI']
    },
    {
        'name': 'WOURI',
        'arrondissements': ['DOUALA I', 'DOUALA II', 'DOUALA III', 'DOUALA IV', 
                            'DOUALA V', 'DOUALA VI', 'MANOKA']
    },
    {
        'name': 'NKAM',
        'arrondissements': ['YABASSI', 'NKONDJOCK', 'NORD-MAKOMBE', 'YINGUI']
    }
]


# Fonction pour créer les arrondissements d'une région donnée
def create_arrondissements_for_region(region_name, department_data):
    try:
        # Récupérer ou créer la région
        region, created = Region.objects.get_or_create(name=region_name)
        if created:
            print(f"✅ Région '{region.name}' créée.")
        else:
            print(f"⚠️ Région '{region.name}' déjà existante.")
        
        # Parcourir les départements et leurs arrondissements
        for department_info in department_data:
            departement, created = Departement.objects.get_or_create(
                name=department_info['name'], 
                region=region
            )
            if created:
                print(f"✅ Département '{departement.name}' créé et associé à la région '{region.name}'.")
            else:
                print(f"⚠️ Département '{departement.name}' déjà existant dans la région '{region.name}'.")
            
            # Créer les arrondissements du département
            for arrondissement_name in department_info['arrondissements']:
                arrondissement, created = Arrondissement.objects.get_or_create(
                    name=arrondissement_name, 
                    departement=departement
                )
                if created:
                    print(f"✅ Arrondissement '{arrondissement.name}' créé et associé au département '{departement.name}'.")
                else:
                    print(f"⚠️ Arrondissement '{arrondissement.name}' déjà existant dans le département '{departement.name}'.")
    except Exception as e:
        print(f"❌ Une erreur s'est produite : {e}")

"""if __name__ == "__main__":
    # Créer les arrondissements pour la région du CENTRE
    create_arrondissements_for_region('CENTRE', centre_departments_data)

    # Créer les arrondissements pour la région du LITTORAL
    create_arrondissements_for_region('LITTORAL', littoral_departments_data)"""


def creation_de_centre_de_vote():
    """
    Crée deux centres de vote pour chaque arrondissement existant.
    La nomenclature utilisée est 'CENTRE-VOTE-{nom_arrondissement}-A' et 'CENTRE-VOTE-{nom_arrondissement}-B'.
    """
    arrondissements = Arrondissement.objects.all()
    
    for arrondissement in arrondissements:
        centre_a_name = f"CENTRE-VOTE-{arrondissement.name}-A"
        centre_b_name = f"CENTRE-VOTE-{arrondissement.name}-B"
        
        CentreDeVote.objects.get_or_create(name=centre_a_name, arrondissement=arrondissement)
        CentreDeVote.objects.get_or_create(name=centre_b_name, arrondissement=arrondissement)
    
    print("Centres de vote créés avec succès !")


def create_bureaux_de_vote():
    # Récupère tous les centres de vote de la base de données
    centres_de_vote = CentreDeVote.objects.all()

    # Parcourt chaque centre de vote
    for centre in centres_de_vote:
        # Crée trois bureaux de vote avec la nomenclature demandée
        bureaux_noms = [
            f"BUREAU-VOTE-{centre.name}-A",
            f"BUREAU-VOTE-{centre.name}-B",
            f"BUREAU-VOTE-{centre.name}-C"
        ]

        # Utilise une transaction pour garantir que toutes les créations sont atomiques
        with transaction.atomic():
            for nom in bureaux_noms:
                BureauDeVote.objects.create(
                    name=nom,
                    centre_de_vote=centre,
                    number_of_enrollees=random.randint(35, 45),
                    number_of_votes=0,
                    number_of_blank_votes=random.randint(1, 5)
                )

def create_user():    
# ⚙️ Données de l'utilisateur
    bureau  = BureauDeVote.objects.get(id=633)
    user_data = {
        'name': 'admin',
        'surname': '',
        'gender': Gender.MALE,  # En supposant que 'MALE' est défini dans Gender.choices
        'political_party': None,  # Pas de parti politique
        'tel': '237600000000',
        'email': 'admin@gmail.com',
        'password': make_password('00000'),  # Hachage du mot de passe "admin"
        'birthdate': '2024-12-20',
        'role': UserRole.ADMINISTRATEUR,
        'bureau_de_vote': None  # Aucun bureau de vote associé
    }

    # 🔥 Création de l'utilisateur
    try:
        user = User.objects.create(**user_data)
        print(f"✅ Utilisateur créé avec succès : {user}")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur : {e}")



def create_candidates():      
    # Calcul des dates de naissance en fonction des âges donnés
    today = date.today()
    ages = [
        (91, 10, 11),  # 92 ans, 3 mois, 5 jours
        (70, 10, 9),  # 64 ans, 6 mois
        (44, 9, 5),  # 49 ans, 30 jours
        (33, 11, 6)  # 33 ans, 11 mois, 6 jours
    ]
    birthdates = [
        (today - timedelta(days=(age[0] * 365 + age[1] * 30 + age[2]))).strftime('%Y-%m-%d')
        for age in ages
    ]

    # Partis politiques correspondants
    political_parties = ["RAPC", "MDC", "PCBN", "HPC"]

    # Noms des candidats
    candidate_names = ["CANDIDAT-A", "CANDIDAT-B", "CANDIDAT-C", "CANDIDAT-D"]

    # Récupérer l'administrateur existant
    admin_user = User.objects.filter(role=UserRole.ADMINISTRATEUR).first()
    if not admin_user:
        print("Aucun administrateur trouvé. Veuillez en créer un avant d'exécuter ce script.")
        return

    # Créer les candidats
    for i in range(4):
        user_data = {
            'name': candidate_names[i],
            'surname': "CANDIDAT",
            'gender': Gender.MALE,  # Supposant que MALE est défini dans Gender.choices
            'political_party': political_parties[i],
            'tel': f"23762000000{i+1}",  # Exemple de numéro de téléphone unique
            'email': f"{candidate_names[i].lower()}@elecam.cm",
            'password': None,  # Aucun mot de passe
            'birthdate': birthdates[i],
            'role': UserRole.CANDIDAT,  # Supposant que CANDIDAT est défini dans UserRole.choices
            'bureau_de_vote': None,
            'centre_de_vote': None,
            'created_by': admin_user,  # Administrateur ayant créé l'utilisateur
        }
        candidate = User.objects.create(**user_data)
        print(f"{candidate.name} créé avec succès. Date de naissance : {birthdates[i]}")

        


@transaction.atomic
@csrf_exempt

def assign_votes_to_candidates(request):
    if request.method == 'POST':
        try:
            # Récupération des candidats
            candidats = User.objects.filter(role='CANDIDAT')  # Ajustez selon votre champ `role`
            if not candidats.exists():
                return JsonResponse({'error': 'Aucun candidat trouvé dans la base de données.'}, status=404)

            # Récupération des bureaux de vote
            bureaux = BureauDeVote.objects.all()
            if not bureaux.exists():
                return JsonResponse({'error': 'Aucun bureau de vote trouvé dans la base de données.'}, status=404)

            # Attribution des votes
            for bureau in bureaux:
                # Calcul du total des votes disponibles pour les candidats
                total_votes_disponibles = bureau.number_of_votes - bureau.number_of_blank_votes
                if total_votes_disponibles <= 0:
                    continue  # Passer au bureau suivant si aucun vote disponible

                # Liste des votes attribués
                votes_repartis = []
                total_votes_attribues = 0

                # Répartition des votes de manière aléatoire
                for _ in range(len(candidats) - 1):
                    votes = random.randint(0, total_votes_disponibles - total_votes_attribues)
                    votes_repartis.append(votes)
                    total_votes_attribues += votes

                # Assigner le reste des votes au dernier candidat
                votes_repartis.append(total_votes_disponibles - total_votes_attribues)

                # Sauvegarde des résultats
                for candidat, votes in zip(candidats, votes_repartis):
                    resultat = ResultatDeVote(
                        total_votes=votes,
                        candidat=candidat,
                        bureau_de_vote=bureau
                    )
                    resultat.save()

            return JsonResponse({'message': 'Attribution des votes terminée avec succès'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return HttpResponse('Méthode non autorisée', status=405)


@csrf_exempt
def get_total_votes(request):
    try:
        # Récupération du total des voix
        total_votes = ResultatDeVote.objects.aggregate(total_votes=Sum('total_votes'))['total_votes']
        if total_votes is None:
            total_votes = 0
        print(f"Nombre total de voix enregistrées : {total_votes}")
        return JsonResponse({'Nombre de voix total': total_votes}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_bureau_de_vote_id(bureau_name):
    bureau = BureauDeVote.objects.filter(name=bureau_name).first()  # Use filter and return the first match
    return bureau.id if bureau else None  # Return the ID if found, else None


@csrf_exempt
def get_centre_de_vote_id(centre_name):
    centre = CentreDeVote.objects.filter(name=centre_name).first()  # Use filter and return the first match
    return centre.id if centre else None  # Return the ID if found, else None

@csrf_exempt
def get_bureau_de_vote_name(bureau_id):
    bureau = BureauDeVote.objects.filter(id=bureau_id).first()  # Use filter to search by ID
    return bureau.name if bureau else None  # Return the name if found, else None

@csrf_exempt
def get_centre_de_vote_name(centre_id):
    centre = CentreDeVote.objects.filter(id=centre_id).first()  # Use filter to search by ID
    return centre.name if centre else None  # Return the name if found, else None


def reset_votes():
    excluded_ids = [631, 633]
    # Réinitialisation des champs
    updated_count = BureauDeVote.objects.exclude(id__in=excluded_ids).update(
        number_of_enrollees=0,
        number_of_votes=0,
        number_of_blank_votes=0
    )

    print(f"{updated_count} bureaux de vote mis à jour.")