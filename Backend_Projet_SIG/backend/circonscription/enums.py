from django.db import models

class RegionName(models.TextChoices):
    CENTRE = "CENTRE"
    LITTORAL = "LITTORAL"
    EST = "EST"
    ADAMAOUA = "ADAMAOUA"
    EXTREME_NORD = "EXTREME_NORD"
    NORD = "NORD"
    SUD = "SUD"
    SUD_OUEST = "SUD_OUEST"
    NORD_OUEST = "NORD_OUEST"
    OUEST = "OUEST"

class DepartementName(models.TextChoices):
    MFOUNDI = "Mfoundi", "Mfoundi"
    WOURI = "Wouri", "Wouri"
    MENOUA = "Menoua", "Menoua"
    LOGONE_ET_CHARI = "Logone-et-Chari", "Logone-et-Chari"

class ArrondissementName(models.TextChoices):
    YAOUNDE = "Yaoundé", "Yaoundé"
    DOUALA = "Douala", "Douala"
    DSCHANG = "Dschang", "Dschang"
    KUSERI = "Kuseri", "Kuseri"

class CentreDeVoteName(models.TextChoices):
    CENTRE1 = "Centre1", "Centre 1"
    CENTRE2 = "Centre2", "Centre 2"

class BureauDeVoteName(models.TextChoices):
    BUREAU_A = "Bureau A", "Bureau A"
    BUREAU_B = "Bureau B", "Bureau B"

