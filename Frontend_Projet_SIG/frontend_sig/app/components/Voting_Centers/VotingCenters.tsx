"use client";
import React, { useEffect, useState } from "react";
import ApiServices from "../services/ApiServices";
import './VotingCenters.scss'

type Region = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

type VotingCenter = {
  id: number;
  center_name: string;
  arrondissement_name: string;
};

const VotingCenters: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [votingCenters, setVotingCenters] = useState<VotingCenter[]>([]);
  const [filters, setFilters] = useState({
    center_name: "",
    arrondissement_name: "",
    region_id: "",
    departement_id: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d'éléments par page

  const [editCenter, setEditCenter] = useState<VotingCenter | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Charger les options des régions et départements
  useEffect(() => {
    const fetchRegionsAndDepartments = async () => {
      try {
        const response = await ApiServices.fetchRegionsAndDepartments();
        setRegions(response.regions);
        setDepartments(response.departments);
      } catch (error) {
        console.error("Erreur lors du chargement des régions et départements:", error);
      }
    };

    fetchRegionsAndDepartments();
  }, []);

  // Charger les centres de vote
  const fetchVotingCenters = async (filters: any) => {
    try {
      const response = await ApiServices.fetchVotingCenters(filters);
      console.log("Centres de votes :" , response)
      setVotingCenters(response);
    } catch (error) {
      console.error("Erreur lors du chargement des centres de vote:", error);
    }
  };

  // Charger les centres de vote lors des changements de filtres
  useEffect(() => {
    fetchVotingCenters(filters);
    setCurrentPage(1); // Réinitialiser à la première page lorsque les filtres changent
  }, [filters]); 

  // Mettre à jour les filtres
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Pagination : obtenir les centres pour la page actuelle
  const getPaginatedVotingCenters = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return votingCenters.slice(startIndex, endIndex);
  };

  // Gestion des boutons de pagination
  const handleNextPage = () => {
    if (currentPage < Math.ceil(votingCenters.length / itemsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Gérer l'ouverture et la fermeture de la modale
  const handleEditClick = (center: VotingCenter) => {
    setEditCenter(center);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setEditCenter(null);
    setShowEditModal(false);
  };

  // Mettre à jour le centre de vote
  const handleSaveEdit = async () => {
    if (editCenter) {
      try {
        await ApiServices.updateVotingCenter(editCenter.id, editCenter);
        fetchVotingCenters(filters); // Recharger les centres de vote
        handleCloseModal();
      } catch (error) {
        console.error("Erreur lors de la mise à jour du centre de vote:", error);
      }
    }
  };

  // Supprimer un centre de vote
  const handleDeleteClick = async (centerId: number) => {
    try {
      await ApiServices.deleteVotingCenter(centerId);
      fetchVotingCenters(filters); // Recharger les centres de vote
    } catch (error) {
      console.error("Erreur lors de la suppression du centre de vote:", error);
    }
  };

  return (
    <div className="voting-centers">
      <h1>Centres de Vote</h1>

      {/* Filtres */}
      <div className="Input-filters">
        <div className="input-label">
            <label htmlFor="centerNameInput">Rechercher par nom du centre:</label>
            <input
            type="text"
            id="centerNameInput"
            name="center_name"
            placeholder="Nom du centre"
            value={filters.center_name}
            onChange={handleFilterChange}
            />
        </div>
        
        <div className="input-label">
            <label htmlFor="arrondissementNameInput">Rechercher par nom d'arrondissement:</label>
            <input
            type="text"
            id="arrondissementNameInput"
            name="arrondissement_name"
            placeholder="Nom de l'arrondissement"
            value={filters.arrondissement_name}
            onChange={handleFilterChange}
            />
        </div>
        
        <div className="input-label">
            <label htmlFor="regionSelect">Région:</label>
            <select
            id="regionSelect"
            name="region_id"
            value={filters.region_id}
            onChange={handleFilterChange}
            >
            <option value="">Tous</option>
            {regions.map((region) => (
                <option key={region.id} value={region.id}>
                {region.name}
                </option>
            ))}
            </select>
        </div>
        
        <div className="input-label">
            <label htmlFor="departementSelect">Département:</label>
            <select
            id="departementSelect"
            name="departement_id"
            value={filters.departement_id}
            onChange={handleFilterChange}
            >
            <option value="">Tous</option>
            {departments.map((department) => (
                <option key={department.id} value={department.id}>
                {department.name}
                </option>
            ))}
            </select>
        </div>
        
      </div>

      {/* Tableau */}
      <table>
        <thead>
          <tr>
            <th>Nom du Centre</th>
            <th>Nom de l'Arrondissement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedVotingCenters().map((center) => (
            <tr key={center.id}>
              <td>{center.center_name}</td>
              <td>{center.arrondissement_name}</td>
              <td>
                <button onClick={() => handleEditClick(center)}><i style={{color:"blue"}} className="material-icons">edit</i></button>
                <button onClick={() => handleDeleteClick(center.id)}><i style={{color:"red"}} className="material-icons">delete</i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          <i className="material-icons">arrow_back_ios</i>
        </button>
        <span>
          Page {currentPage} sur {Math.ceil(votingCenters.length / itemsPerPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(votingCenters.length / itemsPerPage)}
        >
          <i className="material-icons">arrow_forward_ios</i>
        </button>
      </div>

      {/* Modal d'édition */}
      {showEditModal && editCenter && (
        <div className="modal">
            <h2>Modifier le Centre de Vote</h2>
            <div className="label-input">
                <label>
                    Nom du Centre:
                </label>
                <input
                    type="text"
                    value={editCenter.center_name}
                    onChange={(e) =>
                        setEditCenter({ ...editCenter, center_name: e.target.value })
                    }
                    />
            </div>
            <div className="label-input">
                <label>
                    Nom de l'Arrondissement:
                </label>
                <input
                    type="text"
                    value={editCenter.arrondissement_name}
                    onChange={(e) =>
                        setEditCenter({ ...editCenter, arrondissement_name: e.target.value })
                    }
                    />
            </div>
          <div className="actions">
            <button className="save" onClick={handleSaveEdit}>Sauvegarder</button>
            <button className= "abort" onClick={handleCloseModal}>Annuler</button>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default VotingCenters;
 