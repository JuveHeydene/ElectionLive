"use client";
import React, { useEffect, useState } from "react";
import "../create-voting-office/NewVotingOffice.scss";
import { ArrondissmentOptions } from "@/app/Models/User";
import ApiServices, { fetchAllArrondissments, fetchAllVotingCenters } from "@/app/components/services/ApiServices";
import VotingCenterSelect from "@/app/components/VotingCenterSelector/VotingCenterSelector";
import axios from "axios";
import ArrondissmentSelect from "@/app/components/ArrondissmentSelector/ArrondissmentSelector";


interface VotingCenter {
  name: string;
  arrondissmentName: string|undefined;
}

const CreateVotingCenter = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [arrondissments, setArrondissments] = useState<ArrondissmentOptions[]>([]);
  
  const [formVotingCenter, setVotingCenter] = useState<VotingCenter>({
    name: "",
    arrondissmentName: "",
  });
  const [selectedArrondissment, setSelectedArrondissment] = useState<{
    label: string;
    value: string;
  } | null>(null);

  
  useEffect(() => {
    const loadArrondissmentAsOptions = async () => {
      try {
        const arrondissments = await fetchAllArrondissments();
        setArrondissments(arrondissments);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    loadArrondissmentAsOptions();
  }, []);
  const handleArrondissmentChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedArrondissment(selectedOption);
    setVotingCenter({
      ...formVotingCenter,
      arrondissmentName: selectedOption?.value,
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
      const response = await ApiServices.create_new_voting_center(formVotingCenter);
      setSuccess('Centre de vote créé avec succès!');
      console.log("Réponse backend:", response);
    } catch (error) {
      setError('Une erreur s\'est produite.');
      console.error("Error creating bureau:", error);
    }
    finally{
      setLoading(false);
    }
  };
  const handleInputCentreDeVote = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setVotingCenter({
      ...formVotingCenter,
      [name]: value,
    });
  };
  return (
    <div className="new-voting-office w-full mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Add a new voting center{" "}
      </h1>
      <form onSubmit={handleSubmitcreatebureauvote}>
        {/* Champ Nom */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Voting Center Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formVotingCenter.name}
            onChange={handleInputCentreDeVote}
            placeholder="Enter voting center name"
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Liste déroulante pour Circonscription */}
        <div className="mb-4">
          <label
            htmlFor="votingCenterName"
            className="block text-gray-700 font-medium mb-2"
          >
            Arrondissment
          </label>
          <ArrondissmentSelect
            arrondissments={arrondissments}
            onChange={handleArrondissmentChange}
            value={selectedArrondissment}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Create new voting center
        </button>
      </form>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateVotingCenter;
