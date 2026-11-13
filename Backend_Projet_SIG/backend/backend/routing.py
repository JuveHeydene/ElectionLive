from django.urls import path
from users.Consummer import VoteResultsConsumer

websocket_urlpatterns = [
    path('ws/vote-results/', VoteResultsConsumer.as_asgi()),
]
