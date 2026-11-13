from rest_framework import serializers
from .models import ResultatDeVote,User

class ResultatDeVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultatDeVote
        fields = ['total_votes', 'candidat', 'bureau_de_vote']

    def validate_total_votes(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le nombre de votes doit être positif.")
        return value

class UserSerializer(serializers.ModelSerializer):
    bureau_de_vote_name = serializers.CharField(source='bureau_de_vote.name', read_only=True)
    centre_de_vote_name = serializers.CharField(source='centre_de_vote.name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'gender', 'political_party', 'userimage',
            'tel', 'email', 'birthdate', 'role',
            'bureau_de_vote_name', 'centre_de_vote_name'
        ]

from rest_framework import serializers

class ResultatDeVoteLineChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultatDeVote
        fields = ('candidat__name', 'total_votes', 'created_at')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['time'] = instance.created_at.strftime('%H:%M:%S')  # Format for x-axis
        return representation