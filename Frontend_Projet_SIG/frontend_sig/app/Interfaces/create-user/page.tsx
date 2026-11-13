"use client"
import React, {ReactNode, ReactElement, useState, useEffect, useRef } from 'react'
import { NextPage } from "next";
import Layout from '../../components/layout/Layout'
import withAuth from '@/app/components/withAuths/page';
import { VotingOffice,VotingCenter } from "@/app/Models/User";
import VotingOfficeSelect from "@/app/components/VotingOfficeSelector/page";
import VotingCenterSelect from "@/app/components/VotingCenterSelector/VotingCenterSelector";
import ApiServices , { fetchAllVotingOffices,fetchAllVotingCenters } from "@/app/components/services/ApiServices";
import { useRouter,useSearchParams, usePathname } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import  noimage2 from "@/app/noimage.png"

export interface User {
  name: string;
  surname: string;
  email:string;
  birthdate: string;
  political_party: string|undefined;
  tel: string;
  password: string;
  gender: string;
  role: string;
  bureau_de_vote_name: string|undefined|null;
  centre_de_vote_name: string|undefined|null;
  userimage:string;
}
type Region = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};




const CreateUsers = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const modification_info = searchParams.get('userinfotobemodified');
  const [isEditMode, setIsEditMode] = useState(false);

  const title = "New User"
  const regionName = "CENTRE";
  const [bureauDeVoteList, setBureauDeVoteList] = useState<string[]>([]);
  const [circonscriptions, setCirconscriptions] = useState<string[]>([
    "Circonscription A",
    "Circonscription B",
    "Circonscription C",
    "Circonscription D",
    "Circonscription E",
    "Circonscription F",
  ]);

  const [selectedVotingOffice, setSelectedVotingOffice] = useState<{
    label: string;
    value: string;
  } | null>(null);


  const [regions, setRegions] = useState<Region[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [votingCenters, setVotingCenters] = useState<VotingCenter[]>([]);
  const [votingOffices, setVotingOffices] = useState<VotingOffice[]>([]);
  const [usertoedit, setusertoedit] = useState<number>(-1); 

  const [filters, setFilters] = useState({
    center_name: "",
    arrondissement_name: "",
    region_id: "",
    departement_id: "",
  });

  const [filterscenter, setFilterscenter] = useState({
    center_name: "",
    arrondissement_name: "",
    region_id: "",
    departement_id: "",
  });


  const [role, setRole] = useState<string>("")
  const [formUser, setFormUser] = useState<User>({
    name: "",
    surname: "",
    email:"",
    birthdate: "",
    political_party: "",
    tel: "",
    password: "0000",
    gender: "",
    role: "",
    bureau_de_vote_name: null,
    centre_de_vote_name:null,
    userimage:"",
  });
  
  const resetForm = () => {
    setFormUser({
      name: "",
      surname: "",
      email:"",
      birthdate: "",
      political_party: "",
      tel: "",
      password: "0000",
      gender: "",
      role: "",
      bureau_de_vote_name: null,
      centre_de_vote_name:null,
      userimage: "",
    });
  };

  const [selectedVotingCenter, setSelectedVotingCenter] = useState<{
    label: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    if (modification_info) {
      const infomodif = JSON.parse(decodeURIComponent(modification_info as string));;
      setFormUser(infomodif);
      setRole(infomodif.role)
      setusertoedit(infomodif.id)
      setSelectedVotingCenter(infomodif.centre_de_vote_name)
      setIsEditMode(true);
      
    }
  }, [modification_info]);


  //charger les centres de vote
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
    setFormUser({
      ...formUser,
      centre_de_vote_name:selectedOption?.value,
    });
  };


  const handleOfficeChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    setSelectedVotingOffice(selectedOption);
    setFormUser({
      ...formUser,
      bureau_de_vote_name:selectedOption?.value,
    }
      

    )

    
  };

//office filtered changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
//center filtered changes
  const handlecenterFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterscenter((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleInputuserChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      e.preventDefault();
      const { name, value } = e.target;
      setFormUser({
        ...formUser,
        [name]: value,
      });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          setFormUser((prevData) => ({
            ...prevData,
            userimage: imageUrl,
          }));
        }
      }
    };
  
    const uploadImage = async (file: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://localhost:8000/users/upload/', {
          method: 'POST',
          body: formData,
          headers: {
          },
        });
  
        if (response.ok) {
          
          const textResponse = await response.json();
          console.log('Raw response:', textResponse.file_name);
  
          // Use the raw response as the filename
          alert('File uploaded successfully');
          return textResponse.file_name; // Use the raw response as the filename or URL
        } else {
          alert('File upload failed');
          return null;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('File upload failed');
        return null;
      }
    };
  

 
    
  

     // Charger les Bureau de vote
  const fetchVotingOffices = async (filters: any) => {
    try {
      const response = await ApiServices.fetchVotingOfficelabelvalue(filters);
      console.log("Bureau de votes :" , response)
      setVotingOffices(response);
    } catch (error) {
      console.error("Erreur lors du chargement des centres de vote:", error);
    }
  };




      // Charger les Bureau de vote lors des changements de filtres
  useEffect(() => {
    fetchVotingOffices(filters);
  }, [filters]); 

     // Charger les centre de vote
     const fetchVotingCenters = async (filterscenter: any) => {
      try {
        const response = await ApiServices.fetchVotingCenterslabelvalue(filterscenter);
        console.log("Centre de votes :" , response)
        setVotingCenters(response);
      } catch (error) {
        console.error("Erreur lors du chargement des centres de vote:", error);
      }
    };
  
  
  
  
        // Charger les centre de vote lors des changements de filtres
    useEffect(() => {
      fetchVotingCenters(filterscenter);
    }, [filterscenter]); 


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

  //charger la liste des bureau de vote 
  useEffect(() => {
    const loadVotingOfficesAsOptions = async () => {
      try {
        const votingOffices = await fetchAllVotingOffices();
        setVotingOffices(votingOffices);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    loadVotingOfficesAsOptions();
  }, []);
   
  

  const handleSubmitcreateuser = async (
      e: React.FormEvent<HTMLFormElement>
    ) => {
      e.preventDefault();
      formUser.role=role
      console.log(formUser)

      if (isEditMode) {
        try {
          await ApiServices.updateuser(usertoedit, formUser);
          alert("user edited succesfully")
          router.push("/Interfaces/user-list")
        } catch (error) {
          console.error("Erreur lors de la mise à jour du centre de vote:", error);
        }
      } else {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch('http://localhost:8000/users/createuser/', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              
            },
            body: JSON.stringify(formUser),
          });
          if (response.ok) {
            alert("user created successfully!");
          } else {
            console.error("Error creating user:", response.statusText);
          }
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }

     

      resetForm();
    };

    useEffect(() => {
      async function fetchData() {
        try {
          const token = localStorage.getItem("token");
          // Convert JSON parameter to query string
          const queryParams = new URLSearchParams({ "region_name": regionName });
  
          const response = await fetch(`http://localhost:8000/circonscription/bureaudevotebyregion?${queryParams.toString()}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
          }
  
          const data = await response.json();
          const bureauDeVote = data.bureau_de_vote_;
          setBureauDeVoteList(bureauDeVote);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
  
      fetchData();
    }, [regionName]);

    document.title = "Bonjour"
    
  return (
    <>
    
    <div className="w-full">
  <form
    onSubmit={handleSubmitcreateuser}
    className="p-6 bg-gray-100 w-full rounded"
  >
    <h1 className="text-xl font-bold mb-4">Formulaire</h1>

    {/* Two-column layout */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Column */}
      <div>
        {/* Noms */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="name">
            Noms
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formUser.name}
            onChange={handleInputuserChange}
            placeholder="Entrer le nom"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Prénoms */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="surname">
            Prénoms
          </label>
          <input
            id="surname"
            type="text"
            name="surname"
            value={formUser.surname}
            onChange={handleInputuserChange}
            placeholder="Entrer le prénom"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

         {/* Email */}
         <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="text"
            name="email"
            value={formUser.email}
            onChange={handleInputuserChange}
            placeholder="Entrer le prénom"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Date de naissance */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="birthdate">
            Date de naissance
          </label>
          <input
            id="birthdate"
            type="date"
            name="birthdate"
            value={formUser.birthdate}
            onChange={handleInputuserChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* TEL */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="tel">
            Tel
          </label>
          <input
            id="tel"
            type="number"
            name="tel"
            value={formUser.tel}
            onChange={handleInputuserChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Genre */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Genre</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                value="MALE"
                checked={formUser.gender === "MALE"}
                onChange={handleInputuserChange}
                name="gender"
                className="mr-2"
              />
              Homme
            </label>
            <label>
              <input
                type="radio"
                value="FEMALE"
                checked={formUser.gender === "FEMALE"}
                onChange={handleInputuserChange}
                name="gender"
                className="mr-2"
              />
              Femme
            </label>
          </div>
        </div>

         

      {/* Rôle */} 
          <div className="mb-4"> 
          <label className="block text-gray-700 mb-1" htmlFor="role"> 
          Rôle 
          </label> 
          <select 
          id="role" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded" > 

          <option value="" disabled>-- Sélectionnez un rôle --</option> 
          <option value="CANDIDAT">Candidat</option> 
          <option value="ELECTEUR">Electeur</option> 
          <option value="ENROLEUR">Enrôleur</option> 
          <option value="SCRUTATEUR">Scrutateur</option> 
          <option value="SUPERVISEUR">Superviseur</option>
          <option value="ADMINISTRATEUR">Administrateur</option> 
          
          </select> 
          </div> 
      </div>

      {/* Right Column */}
      <div>
        {/* User Image */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">User Image</label>
          <div className="border border-gray-300 rounded-md w-full h-56">
            <input
              type="file"
              accept="image/*"
              name="userimage"
              onChange={handleFileChange}
              className="border-custom-darkblue mb-2"
              
            />
            {!formUser.userimage && (
              <Image
                className="w-full h-48 object-cover"
                src={noimage2}
                alt="Default"
              />
            )}
            {formUser.userimage && (
              <img
                className="w-full h-48 object-cover"
                src={`/UserImages/${formUser.userimage}`}
                alt="Uploaded"
              />
            )}
          </div>
        </div>

        {/* Bureau de vote (only visible if role is "scrutateur") 
        {role === "SCRUTATEUR" && (
          <div className="mb-4">
            <label
              className="block text-gray-700 mb-1"
              htmlFor="bureau"
            >
              Bureau de vote
            </label>
            <select
        id="bureau"
        value={formUser.bureau}
        name='bureau'
        onChange={handleInputuserChange}
        className="w-full p-2 border border-gray-300 rounded" >  
      
        <option value="" disabled>
          -- Select an option --
        </option>
        {bureauDeVoteList.map((circonscription, index) => (
          <option key={index} value={circonscription}>
            {circonscription}
          </option>
        ))}
      </select>
          </div>
        )}  */}


        {/* Partie Politiques (only visible if role is "candidat") */} 

            {role === "CANDIDAT" && ( 
            <div className="mb-4"> 
            <label className="block text-gray-700 mb-1" htmlFor="political_party"> 
            Partie Politiques 
            </label> 
            <select 
            id="political_party" 
            name='political_party' 
            value={formUser.political_party} 
            onChange={handleInputuserChange} 
            className="w-full p-2 border border-gray-300 rounded" > 
            <option value="">-- Sélectionnez un partie --</option> 
            <option value="RDPC">RDPC</option> 
            <option value="PMUC">PMUC</option> 
            <option value="XLLT">XLLT</option> 
            <option value="KKLO">KKLO</option> 
            </select> 
            </div> 
            )} 
                  </div>
                </div>

                {(role === "SCRUTATEUR" || role === "ELECTEUR") && (
  <div>
    <p className="text-lg font-semibold mb-4">Filtrer les bureau par :</p>
    <div className="grid grid-cols-4 mdn:grid-cols-1 gap-4">
      
      {/* Region */}
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="bureau">
            Region
          </label>
          <select
            id="region_id"
            name="region_id"
            value={filters.region_id}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded shadow-sm"
          >
            <option value="">Tous</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Departement */}
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="bureau">
            Departement
          </label>
          <select
            id="departement_id"
            name="departement_id"
            value={filters.departement_id}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded shadow-sm"
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

      {/* Arrondissement */}
      <div>
        <label className="block text-gray-700 mb-1">Arrondissement:</label>
        <input
          type="text"
          id="arrondissementNameinput"
          name="arrondissement_name"
          placeholder="Nom de l'arrondissement"
          value={filters.arrondissement_name}
          onChange={handleFilterChange}
          className="w-full p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>

      {/* Centre-de-vote */}
      <div>
        <label className="block text-gray-700 mb-1">Centre:</label>
        <input
          type="text"
          id="centerNameinput"
          name="center_name"
          placeholder="Nom du centre"
          value={filters.center_name}
          onChange={handleFilterChange}
          className="w-full p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>
    </div>

    {/* Entrer des valeurs du bureau */}
    <div className="mt-4">
      <VotingOfficeSelect
        votingOffices={votingOffices}
        onChange={handleOfficeChange}
        value={selectedVotingOffice}
      />
    </div>
  </div>
)}


{(role === "ENROLEUR") && (
  <div>
    <p className="text-lg font-semibold mb-4">Filtrer les centres de vote par :</p>
    <div className="grid grid-cols-4 mdn:grid-cols-1 gap-4">
      
      {/* Region */}
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="region_id">
            Région
          </label>
          <select
            id="region_id"
            name="region_id"
            value={filterscenter.region_id}
            onChange={handlecenterFilterChange}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="">Tous</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Departement */}
      <div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="departement_id">
            Département
          </label>
          <select
            id="departement_id"
            name="departement_id"
            value={filterscenter.departement_id}
            onChange={handlecenterFilterChange}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-200"
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

      {/* Arrondissement */}
      <div>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="arrondissementNameinput">
          Arrondissement
        </label>
        <input
          type="text"
          id="arrondissementNameinput"
          name="arrondissement_name"
          placeholder="Nom de l'arrondissement"
          value={filterscenter.arrondissement_name}
          onChange={handlecenterFilterChange}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-200"
        />
      </div>
    </div>

    {/* Entrer des valeurs du bureau */}
    <div className="mt-4">
      <VotingCenterSelect
        votingCenters={votingCenters}
        onChange={handleCenterChange}
        value={selectedVotingCenter}
      />
    </div>
  </div>
)}

    {/* Submit Button */}


    <button
      type="submit"
      className="w-full bg-blue-500 text-white py-2 my-4 px-4 rounded hover:bg-blue-600"
    >
      Soumettre
    </button>
  </form>
</div>

          </>
  )
}



export default withAuth(CreateUsers, ['ADMINISTRATEUR','SUPERVISEUR','ENROLEUR']);