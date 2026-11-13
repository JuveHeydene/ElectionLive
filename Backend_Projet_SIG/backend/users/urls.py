from django.urls import path
from .views import LoginView,FileUploadView,get_vote_evolution,arrondissement_statistics,departement_statistics,region_statistics,get_initial_results,CreateUserView,DeleteUser,UpdateUser,TotalVotesPerCandidateView
from .views import LoginView,GetExistingResultsApiView,election_summary,GetWinnerByArrondissement,GetWinnerByDepartement,GetWinnerByCentreDeVote,GetWinnerByRegion, ResultatDeVoteCreateView, CandidatListView,UserRecuperation, get_resultats_par_bureau,user_filter_list

urlpatterns =[
    path('login/', LoginView.as_view(), name='login'),
    path('upload/',FileUploadView.as_view(), name='file-upload'),
    path('createuser/',CreateUserView.as_view(), name='create-user'),
    path('resultats-de-vote/', ResultatDeVoteCreateView.as_view(), name='resultat-de-vote-create'),
    path("candidats/", CandidatListView.as_view(), name="candidat-list"),
    path("get_winner_by_region/", GetWinnerByRegion.as_view(), name="get_winner_by_region"),
    path("get_winner_by_departement/", GetWinnerByDepartement.as_view(), name="get_winner_by_departement"),
    path("get_winner_by_arrondissement/", GetWinnerByArrondissement.as_view(), name="get_winner_by_arrondissement"),
    path("get_winner_by_centreDeVote/", GetWinnerByCentreDeVote.as_view(), name="get_winner_by_centreDeVote"),
    path('resultats/<int:bureauDeVoteId>/', get_resultats_par_bureau, name='get_resultats_par_bureau'),
    path('region_statistics/<str:region_name>/', region_statistics, name='region_statistics'),
    path('departement_statistics/<str:departement_name>/', departement_statistics, name='departement_statistics'),
    path('arrondissement_statistics/<str:arrondissement_name>/', arrondissement_statistics, name='arrondissement_statistics'),
    path("getallusers/", UserRecuperation.as_view(), name="users-list"),
    path("get_existing_results/", GetExistingResultsApiView.as_view(), name="get_existing_results"),
    path("get_initial_results/", get_initial_results, name="get_initial_results"),
    path("getfilteredusers/", user_filter_list),
    path("get_vote_evolution/", get_vote_evolution),
    path('delete/<int:user_id>/', DeleteUser.as_view(), name='delete_user'),
    path('<int:user_id>/update/', UpdateUser.as_view(), name='update_user'),
    path('election-summary/', election_summary, name='election_summary'),
    path('total_votes_per_candidate/', TotalVotesPerCandidateView.as_view(), name='total_votes_per_candidate'),
]
