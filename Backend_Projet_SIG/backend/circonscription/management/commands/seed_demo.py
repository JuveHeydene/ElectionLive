"""Load the demo data set: Cameroon boundaries, electoral hierarchy, candidates and demo accounts.

Usage (from Backend_Projet_SIG/backend/):
    python manage.py seed_demo

The command is idempotent: running it twice does not duplicate data.
All people and results are fictitious.
"""
from datetime import date
from pathlib import Path

from django.conf import settings
from django.contrib.gis.utils import LayerMapping
from django.core.management.base import BaseCommand
from django.db import transaction

from circonscription import scripts
from circonscription.models import AdministrativeUnit, BureauDeVote, DepartmentUnit, Region, RegionUnit
from users.enums import Gender, UserRole
from users.models import User

BASE_DIR = Path(settings.BASE_DIR)

# GeoJSON file -> model. Field names in the files are the upper-case model field names (GADM 4.1).
BOUNDARY_FILES = [
    ("cameroun.geojson", RegionUnit),
    ("cameroun-department.geojson", DepartmentUnit),
    ("data_Cameroon.json", AdministrativeUnit),
]

DEMO_PASSWORD = "demo1234"
DEMO_ACCOUNTS = [
    # email, name, role, phone
    ("admin@electionlive.local", "Admin", UserRole.ADMINISTRATEUR, "237600000001"),
    ("scrutateur@electionlive.local", "Scrutateur", UserRole.SCRUTATEUR, "237600000002"),
    ("enroleur@electionlive.local", "Enroleur", UserRole.ENROLEUR, "237600000003"),
]


class Command(BaseCommand):
    help = "Load Cameroon boundaries, the electoral hierarchy, candidates and demo accounts."

    def handle(self, *args, **options):
        self.load_boundaries()
        self.load_hierarchy()
        self.create_accounts()
        self.stdout.write(self.style.SUCCESS(
            f"\nDemo data ready. Sign in with one of: "
            f"{', '.join(email for email, *_ in DEMO_ACCOUNTS)} (password: {DEMO_PASSWORD})"
        ))

    def load_boundaries(self):
        for filename, model in BOUNDARY_FILES:
            if model.objects.exists():
                self.stdout.write(f"{model.__name__}: already loaded")
                continue
            mapping = {
                field.name: field.name.upper()
                for field in model._meta.fields
                if field.name not in ("id", "geom")
            }
            mapping["geom"] = "MULTIPOLYGON"
            LayerMapping(model, str(BASE_DIR / filename), mapping, transform=False).save(strict=True)
            self.stdout.write(f"{model.__name__}: {model.objects.count()} boundaries loaded")

    def load_hierarchy(self):
        if Region.objects.exists():
            self.stdout.write("Electoral hierarchy: already loaded")
            return
        with transaction.atomic():
            scripts.create_region()
            scripts.create_departments_for_centre()
            scripts.create_departments_for_littoral()
            scripts.create_arrondissements_for_region("CENTRE", scripts.centre_departments_data)
            scripts.create_arrondissements_for_region("LITTORAL", scripts.littoral_departments_data)
            scripts.creation_de_centre_de_vote()
            scripts.create_bureaux_de_vote()
        self.stdout.write(f"Electoral hierarchy: {BureauDeVote.objects.count()} polling stations created")

    def create_accounts(self):
        first_station = BureauDeVote.objects.order_by("id").first()
        for email, name, role, tel in DEMO_ACCOUNTS:
            if User.objects.filter(email=email).exists():
                continue
            user = User(
                email=email,
                name=name,
                surname="Demo",
                gender=Gender.MALE,
                tel=tel,
                birthdate=date(1990, 1, 1),
                role=role,
                bureau_de_vote=first_station if role == UserRole.SCRUTATEUR else None,
                centre_de_vote=first_station.centre_de_vote if role == UserRole.SCRUTATEUR else None,
                is_staff=role == UserRole.ADMINISTRATEUR,
                is_superuser=role == UserRole.ADMINISTRATEUR,
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
        if not User.objects.filter(role=UserRole.CANDIDAT).exists():
            scripts.create_candidates()
        self.stdout.write(f"Accounts: {User.objects.count()} users")
