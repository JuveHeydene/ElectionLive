"use client";
import React, { useEffect, useState } from "react";
import ApiServices from "../services/ApiServices";
import '../Voting_Centers/VotingCenters.scss'

type Region = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};
type Arrondissement ={
    id : number;
    name : string;
}
type VotingOffice = {
    id: number;
    center_name: string;
    office_name: string;
}

const VotingOffices: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [arrondissments, setArrondissments] = useState<Arrondissement[]>([]);
  const [votingOffice, setVotingOffice] = useState<VotingOffice[]>([]);
  const [filters, setFilters] = useState({
    office_name: "",
    center_name: "",
    arrondissement_name: "",
    region_id: "",
    departement_id: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Nombre d'éléments par page

  const [editOffice, setEditOffice] = useState<VotingOffice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Charger les options des régions, départements et arrondissements
  useEffect(() => {
    const fetchRegionsAndDepartments = async () => {
      try {
        const response = await ApiServices.fetchRegionsAndDepartments();
        setRegions(response.regions);
        setDepartments(response.departments);
        setArrondissments(response.arrondismments);
      } catch (error) {
        console.error("Erreur lors du chargement des régions et départements:", error);
      }
    };

    fetchRegionsAndDepartments();
  }, []);

  // Charger les bureaux de votes
  const fetchVotingOffice = async (filters: any) => {
    try {
      const response = await ApiServices.fetchVotingOffice(filters);
      console.log("Centres de votes :" , response)
      setVotingOffice(response);
    } catch (error) {
      console.error("Erreur lors du chargement des centres de vote:", error);
    }
  };

  // Charger les bureaux de vote lors des changements de filtres
  useEffect(() => {
    fetchVotingOffice(filters);
    setCurrentPage(1); // Réinitialiser à la première page lorsque les filtres changent
  }, [filters]);

  // Mettre à jour les filtres
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    console.log(filters)
  };

  // Pagination : obtenir les centres pour la page actuelle
  const getPaginatedVotingOffices = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return votingOffice.slice(startIndex, endIndex);
  };

  // Gestion des boutons de pagination
  const handleNextPage = () => {
    if (currentPage < Math.ceil(votingOffice.length / itemsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Gérer l'ouverture et la fermeture de la modale
  const handleEditClick = (office: VotingOffice) => {
    setEditOffice(office);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setEditOffice(null);
    setShowEditModal(false);
  };

  // Mettre à jour le bureau de vote
  const handleSaveEdit = async () => {
    if (editOffice) {
      try {
        await ApiServices.updateVotingOffice(editOffice.id, editOffice);
        fetchVotingOffice(filters); // Recharger les centres de vote
        handleCloseModal();
      } catch (error) {
        console.error("Erreur lors de la mise à jour du centre de vote:", error);
      }
    }
  };

  // Supprimer un centre de vote
  const handleDeleteClick = async (officeId: number) => {
    try {
      await ApiServices.deleteVotingOffice(officeId);
      fetchVotingOffice(filters); // Recharger les centres de vote
    } catch (error) {
      console.error("Erreur lors de la suppression du centre de vote:", error);
    }
  };
  
    const downloadCSV = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/circonscription/export/csv/bureaux/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/csv',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // Récupérer le blob des données
        const blob = await response.blob();
  
        // Créer une URL temporaire pour le téléchargement
        const url = window.URL.createObjectURL(blob);
  
        // Créer un élément <a> pour le téléchargement
        const link = document.createElement('a');
        link.href = url;
  
        // Nom du fichier téléchargé
        link.download = 'bureaux_de_vote.csv';
  
        // Ajouter et cliquer sur le lien
        document.body.appendChild(link);
        link.click();
  
        // Nettoyer
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier CSV:', error);
      }
    };
  
  return (
    <div className="voting-centers">
      <h1>Bureaux de Vote</h1>
      {/* Filtres */}
        <div className="Input-filters">
            <div className="input-label">
                <label htmlFor="officeNameInput">Rechercher par nom du bureau</label>
                <input
                type="text"
                id="officeNameInput"
                name="office_name"
                placeholder="Nom du bureau"
                value={filters.office_name}
                onChange={handleFilterChange}
                />
            </div>
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
            <div className="input-label">
                <label htmlFor="regionSelect">Arrondissement:</label>
                <select
                id="regionSelect"
                name="region_id"
                value={filters.region_id}
                onChange={handleFilterChange}
                >
                <option value="">Tous</option>
                {arrondissments.map((arrondissement) => (
                    <option key={arrondissement.id} value={arrondissement.id}>
                    {arrondissement.name}
                    </option>
                ))}
                </select>
            </div>
      </div>

      {/* Tableau */}
      <table>
        <thead>
          <tr>
            <th>Nom du Bureau</th>
            <th>Nom du Centre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedVotingOffices().map((office) => (
            <tr key={office.id}>
              <td>{office.office_name}</td>
              <td>{office.center_name}</td>
              <td>
                <button onClick={() => handleEditClick(office)}><i style={{color:"blue"}} className="material-icons">edit</i></button>
                <button onClick={() => handleDeleteClick(office.id)}><i style={{color:"red"}} className="material-icons">delete</i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
      <button
      onClick={downloadCSV}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
    >
      Télécharger le fichier CSV
    </button>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          <i className="material-icons">arrow_back_ios</i>
        </button>
        <span>
          Page {currentPage} sur {Math.ceil(votingOffice.length / itemsPerPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(votingOffice.length / itemsPerPage)}
        >
          <i className="material-icons">arrow_forward_ios</i>
        </button>
      </div>

      {/* Modal d'édition */}
      {showEditModal && editOffice && (
        <div className="modal">
            <h2>Modifier le Centre de Vote</h2>
            <div className="label-input">
                <label>
                    Nom du Bureau:
                </label>
                <input
                    type="text"
                    value={editOffice.office_name}
                    onChange={(e) =>
                        setEditOffice({ ...editOffice, office_name: e.target.value })
                    }
                    />
            </div>
            <div className="label-input">
                <label>
                    Nom du Centre:
                </label>
                <input
                    type="text"
                    value={editOffice.center_name}
                    onChange={(e) =>
                        setEditOffice({ ...editOffice, center_name: e.target.value })
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

export default VotingOffices;
 