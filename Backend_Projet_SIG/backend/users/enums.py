from django.db import models


class UserRole(models.TextChoices):
    ELECTEUR = 'ELECTEUR'
    CANDIDAT = 'CANDIDAT'
    SCRUTATEUR = 'SCRUTATEUR'
    SUPERVISEUR = 'SUPERVISEUR'
    ENROLEUR = 'ENROLEUR'
    ADMINISTRATEUR = 'ADMINISTRATEUR'

class Gender(models.TextChoices):
    MALE = 'MALE'
    FEMALE = 'FEMALE'