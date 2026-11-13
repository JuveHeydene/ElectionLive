from django.contrib.gis.db import models
from .enums import RegionName, DepartementName, ArrondissementName, CentreDeVoteName, BureauDeVoteName
from .validators import validate_pdf

class Region(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=RegionName.choices)

    def __str__(self):
        return self.name

from django.contrib.gis.db import models

class AdministrativeUnit(models.Model):
    gid_3 = models.CharField(max_length=255)
    gid_0 = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    gid_1 = models.CharField(max_length=255)
    name_1 = models.CharField(max_length=255)
    nl_name_1 = models.CharField(max_length=255)
    gid_2 = models.CharField(max_length=255)
    name_2 = models.CharField(max_length=255)
    nl_name_2 = models.CharField(max_length=255)
    name_3 = models.CharField(max_length=255)
    varname_3 = models.CharField(max_length=255)
    nl_name_3 = models.CharField(max_length=255)
    type_3 = models.CharField(max_length=255)
    engtype_3 = models.CharField(max_length=255)
    cc_3 = models.CharField(max_length=255)
    hasc_3 = models.CharField(max_length=255)
    geom = models.MultiPolygonField(srid=4326)  # Champ géospatial pour stocker les données GeoJSON

class RegionUnit(models.Model):
    gid_1 = models.CharField(max_length=255)
    gid_0 = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    name_1 = models.CharField(max_length=255)
    varname_1 = models.CharField(max_length=255)
    nl_name_1 = models.CharField(max_length=255)
    type_1 = models.CharField(max_length=255)
    engtype_1 = models.CharField(max_length=255)
    cc_1 = models.CharField(max_length=255)
    hasc_1 = models.CharField(max_length=255)
    iso_1 = models.CharField(max_length=255)
    geom = models.MultiPolygonField(srid=4326)

class DepartmentUnit(models.Model):
    gid_2 = models.CharField(max_length=255)
    gid_0 = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    gid_1 = models.CharField(max_length=255)
    name_1 = models.CharField(max_length=255)
    nl_name_1 = models.CharField(max_length=255)
    name_2 = models.CharField(max_length=255)
    varname_2 = models.CharField(max_length=255)
    nl_name_2 = models.CharField(max_length=255)
    type_2 = models.CharField(max_length=255)
    engtype_2 = models.CharField(max_length=255)
    cc_2 = models.CharField(max_length=255)
    hasc_2 = models.CharField(max_length=255)
    geom = models.MultiPolygonField(srid=4326)

class Departement(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=DepartementName.choices)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='departements')

    def __str__(self):
        return self.name


class Arrondissement(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=ArrondissementName.choices)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='arrondissements')

    def __str__(self):
        return self.name


class CentreDeVote(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=CentreDeVoteName.choices)
    arrondissement = models.ForeignKey(Arrondissement, on_delete=models.CASCADE, related_name='centres_de_vote')

    def __str__(self):
        return self.name


from django.db import models

class BureauDeVote(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=BureauDeVoteName.choices)
    centre_de_vote = models.ForeignKey(CentreDeVote, on_delete=models.CASCADE, related_name='bureaux_de_vote')
    number_of_enrollees = models.IntegerField(default=0)  # Nombre d'inscrits
    number_of_votes = models.IntegerField(default=0)  # Nombre de votes
    number_of_blank_votes = models.IntegerField(default=0)  # Nombre de votes blancs
    pv = models.FileField(upload_to='pv_files/', null=True, blank=True, validators=[validate_pdf])  # Champ pour le fichier PDF

    def __str__(self):
        return self.name


