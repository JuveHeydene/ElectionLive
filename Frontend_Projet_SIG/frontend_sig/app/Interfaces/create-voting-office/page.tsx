"use client";
import React, { useEffect, useState } from "react";
import "./NewVotingOffice.scss";
import { VotingCenter } from "@/app/Models/User";
import ApiServices, { fetchAllVotingCenters } from "@/app/components/services/ApiServices";
import VotingCenterSelect from "@/app/components/VotingCenterSelector/VotingCenterSelector";
import axios from "axios";

interface VotingOffice {
  nom: string;
  votingCenterName: string;
}
interface BureauVote {
  nom: string;
  votingCenterName: string|undefined;
}

const CreateVotingOffice = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [votingCenters, setVotingCenters] = useState<VotingCenter[]>([]);
  
  const [formBureauvote, setBureauvote] = useState<BureauVote>({
    nom: "",
    votingCenterName: "",
  });
  const [selectedVotingCenter, setSelectedVotingCenter] = useState<{
    label: string;
    value: string;
  } | null>(null);

  
  useEffect(() => {
    const loadVotingCentersAsOptions = async () => {
      try {
        const votingCenters = await fetchAllVotingCenters();
        setVotingCenters(votingCenters);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    loadVotingCentersAsOptions();
  }, []);
  
  const handleCenterChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedVotingCenter(selectedOption);
    setBureauvote({
      ...formBureauvote,
      votingCenterName: selectedOption?.value,
    });
  };

  const handleSubmitcreatebureauvote = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await ApiServices.create_new_voting_office(formBureauvote);
      setSuccess('Bureau de vote créé avec succès!');
      console.log("Réponse backend:", response);
    } catch (error) {
      setError('Une erreur s\'est produite.');
      console.error("Error creating bureau:", error);
    }
    finally{
      setLoading(false);
    }
  };
  const handleInputbureaudevote = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setBureauvote({
      ...formBureauvote,
      [name]: value,
    });
  };
  return (
    <div className="new-voting-office w-full mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Add a new voting office{" "}
      </h1>
      <form onSubmit={handleSubmitcreatebureauvote}>
        {/* Champ Nom */}
        <div className="mb-4">
          <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">
            Office Name
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formBureauvote.nom}
            onChange={handleInputbureaudevote}
            placeholder="Enter office voting name"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Liste déroulante pour Circonscription */}
        <div className="mb-4">
          <label
            htmlFor="votingCenterName"
            className="block text-gray-700 font-medium mb-2"
          >
            Voting Center
          </label>
          <VotingCenterSelect
            votingCenters={votingCenters}
            onChange={handleCenterChange}
            value={selectedVotingCenter}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Create new voting office
        </button>
      </form>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateVotingOffice;
