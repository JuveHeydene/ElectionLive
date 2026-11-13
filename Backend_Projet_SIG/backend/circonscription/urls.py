from django.urls import path
from .views import CentresDeVoteByRegionView,UploadPVView,UpdateVotingOffice,DeleteVotingOffice,CreateCentreDeVoteView,BureauxDeVoteByRegionView,UpdateVotingCenter, DeleteVotingCenter, CreateBureauDeVoteView,regions_departments,voting_centers_list,voting_office_list,get_voting_centers_list_options,create_new_voting_office,getAllArrondissment
from .views import CentresDeVoteByRegionView,export_regions_pdf,UpdateVotingOffice,export_bureaux_de_vote_csv,RegionViewSet,DepartmentUnitViewSet,AdministrativeUnitViewSet,DeleteVotingOffice,CreateCentreDeVoteView,BureauxDeVoteByRegionView,UpdateVotingCenter, DeleteVotingCenter, CreateBureauDeVoteView,regions_departments,voting_centers_list,voting_office_list,get_voting_centers_list_options,get_voting_office_list_options,voting_office_list_labelvalueform,voting_centers_listlabelvalue,create_new_voting_office,getAllArrondissment
from .scripts import create_bureaux_de_vote,create_candidates, assign_votes_to_candidates,get_total_votes

urlpatterns = [
    path('centredevotebyregion/', CentresDeVoteByRegionView.as_view(), name='centredevotebyregion'),
    path('bureaudevotebyregion/', BureauxDeVoteByRegionView.as_view(), name='bureauxdevotebyregion'),
    path('create-bureaux-vote/',create_bureaux_de_vote),
    path('create-candidats/',create_candidates),
    path('assign_votes_to_candidates/',assign_votes_to_candidates),
    path('get_total_votes/',get_total_votes),
    path('get_voting_centers_as_list_options/',get_voting_centers_list_options),
    path('get_voting_office_as_list_options/',get_voting_office_list_options),
    path('voting_centers_list/',voting_centers_list),
    path('voting_office_listvaluelable/',voting_office_list_labelvalueform),
    path('voting_center_listvaluelable/',voting_centers_listlabelvalue),
    path('voting_office_list/',voting_office_list),
    path('regions_departments/',regions_departments),
    path('voting-centers/<int:center_id>/delete/', DeleteVotingCenter.as_view(), name='delete_voting_center'),
    path('voting-centers/<int:center_id>/update/', UpdateVotingCenter.as_view(), name='update_voting_center'),
    path('voting-office/<int:center_id>/delete/', DeleteVotingOffice.as_view(), name='delete_voting_center'),
    path('voting-office/<int:center_id>/update/', UpdateVotingOffice.as_view(), name='update_voting_center'),
    path('create_new_voting_office/', CreateBureauDeVoteView.as_view(), name='create_new_voting_office'),
    path('arrondissments/', getAllArrondissment, name='arrondissments'),
    path('administrative_units/', AdministrativeUnitViewSet.as_view({'get': 'list'}), name='administrative_units'),
    path('region_units/', RegionViewSet.as_view({'get': 'list'}), name='region_units'),
    path('department_units/', DepartmentUnitViewSet.as_view({'get': 'list'}), name='department_units'),
    path('create_new_voting_center/', CreateCentreDeVoteView.as_view(), name='create_new_voting_center'),
    path('upload_pv/<int:bureau_de_vote_id>/',UploadPVView.as_view(),name='upload_pv'),
    path('export/csv/bureaux/', export_bureaux_de_vote_csv, name='export_bureaux_csv'),
    path('export/pdf/regions/', export_regions_pdf, name='export_regions_pdf'),
    
]
