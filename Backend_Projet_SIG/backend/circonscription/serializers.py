from rest_framework import serializers
from .models import BureauDeVote, CentreDeVote
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from circonscription.models import AdministrativeUnit, RegionUnit, DepartmentUnit

class BureauDeVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BureauDeVote
        fields = ['id', 'name', 'centre_de_vote', 'number_of_enrollees', 'number_of_votes', 'number_of_blank_votes']

class CentreDeVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentreDeVote
        fields = ['id', 'name', 'arrondissement']
        


class AdministrativeUnitSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = AdministrativeUnit
        fields = '__all__'
        geo_field = 'geom'  # Champ géospatial
        
class RegionUnitSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RegionUnit
        fields = '__all__'
        geo_field = 'geom'  # Champ géospatial
class DepartmentUnitSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = DepartmentUnit
        fields = '__all__'
        geo_field = 'geom'  # Champ géospatial

