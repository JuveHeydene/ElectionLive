import json
from collections import defaultdict
from asgiref.sync import sync_to_async
from datetime import timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ResultatDeVote
from .serializers import ResultatDeVoteLineChartSerializer
from channels.layers import get_channel_layer
from channels.exceptions import StopConsumer

class VoteResultsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("vote_results", self.channel_name)
        await self.accept()
        print("WebSocket connected.")

        # Récupérer les résultats existants et les accumuler
        results = await sync_to_async(self.get_accumulated_results)()

        # Envoyer les résultats formatés au client
        await self.send(text_data=json.dumps({"type": "existing", "data": results}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("vote_results", self.channel_name)
        raise StopConsumer()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # Sauvegarder le nouveau résultat
        result = await sync_to_async(ResultatDeVote.objects.create)(**text_data_json)

        # Sérialiser les données pour le graphique
        serializer = ResultatDeVoteLineChartSerializer(result)
        new_data = serializer.data

        # Envoyer les résultats mis à jour
        accumulated_results = await sync_to_async(self.get_accumulated_results)()
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "vote_results",
            {"type": "send_vote_result", "data": accumulated_results},
        )

    async def send_vote_update(self, event):
        # Extraire les données du message
        data = event["data"]
        # Envoyer les données au client WebSocket
        await self.send(text_data=json.dumps({"type": "vote_update", "data": data}))
    async def send_vote_result(self, event):
        data = event.get("data")
        await self.send(text_data=json.dumps({"type": "update", "data": data}))
    async def winner_update(self,event):
        data = event["data"]
        # Envoyer les données au client WebSocket
        await self.send(text_data=json.dumps({"type": "winner_update", "data": data}))
    async def update_election_summary(self,event):
        data = event["data"]
        # Envoyer les données au client WebSocket
        await self.send(text_data=json.dumps({"type": "election_summary_update", "data": data}))
    
    @staticmethod
    def get_accumulated_results():
        """
        Récupère les résultats existants, les regroupe par intervalle de temps et accumule les totaux.
        """
        results = ResultatDeVote.objects.all().order_by("created_at")
        grouped_results = defaultdict(lambda: defaultdict(int))
        formatted_results = []

        # Regrouper et accumuler les votes
        accumulated_totals = defaultdict(int)
        for result in results:
            candidat_name = result.candidat.name
            time_slot = result.created_at.replace(minute=0, second=0, microsecond=0)

            # Ajouter les votes actuels au total cumulé du candidat
            accumulated_totals[candidat_name] += result.total_votes

            # Mettre à jour les résultats groupés pour cet intervalle de temps
            grouped_results[time_slot][candidat_name] = accumulated_totals[candidat_name]

        # Formatage des résultats pour le graphique
        for time_slot, candidats in sorted(grouped_results.items()):
            for candidat, total_votes in candidats.items():
                formatted_results.append({
                    "candidat": candidat,
                    "total_votes": total_votes,
                    "time": time_slot.strftime("%Y-%m-%d %H:%M:%S"),
                })

        return formatted_results
