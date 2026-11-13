"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaEdit, FaTrash, FaEllipsisH } from "react-icons/fa";
import ApiServices , { fetchAllVotingOffices,fetchAllVotingCenters } from "@/app/components/services/ApiServices";
import Head from 'next/head';
import  noimage from "@/app/noimage.png"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBirthdayCake, faMars, faVenus, faPhone, faVoteYea, faMapMarkerAlt, faUserTag,faLandmark  } from '@fortawesome/free-solid-svg-icons';

interface User {
  id:number,
  name: string;
  surname: string;
  email: string;
  birthdate: string;
  political_party?: string;
  tel: string;
  password: string;
  gender: string;
  role: string;
  bureau_de_vote_name?: string | null;
  centre_de_vote_name?: string | null;
  userimage: string;
}

interface UserModalProps {
  user: User;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
    <div className="bg-white text-blue-950 rounded-xl shadow-2xl p-10 max-w-4xl w-full relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-3 focus:outline-none shadow-lg transition-all duration-200"
      >
        X
      </button>
      <div className="flex flex-col items-center space-y-6">
        {/* User Image */}
        <div className="mb-6">
          {user.userimage ? (
            <img
              src={`/UserImages/${user.userimage}`}
              alt={user.name}
              width={120}
              height={120}
              className="rounded-full shadow-lg"
            />
          ) : (
            <Image
              src={noimage}
              alt={user.name}
              width={120}
              height={120}
              className="rounded-full shadow-lg"
            />
          )}
        </div>

        {/* User Details */}
        <div className="grid grid-cols-2 gap-6 w-full">
          <div className="p-4 border border-gray-200 rounded-md shadow-md">
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faUserTag} className="text-blue-600" />
              <strong>Name:</strong> <span>{user.name}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
              <strong>Email:</strong> <span>{user.email}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faBirthdayCake} className="text-blue-600" />
              <strong>Birthdate:</strong> <span>{user.birthdate}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={user.gender === 'MALE' ? faMars : faVenus} className="text-blue-600" />
              <strong>Gender:</strong> <span>{user.gender}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faLandmark } className="text-blue-600" />
              <strong>Party:</strong> <span>{user.political_party}</span>
            </p>
            
          </div>

          <div className="p-4 border border-gray-200 rounded-md shadow-md">
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faVoteYea} className="text-blue-600" />
              <strong>Bureau de Vote:</strong> <span>{user.bureau_de_vote_name}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faVoteYea} className="text-blue-600" />
              <strong>Centre de Vote:</strong> <span>{user.centre_de_vote_name}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faUserTag} className="text-blue-600" />
              <strong>Role:</strong> <span>{user.role}</span>
            </p>
            <p className="mb-3 flex items-center space-x-3">
              <FontAwesomeIcon icon={faPhone} className="text-blue-600" />
              <strong>Phone:</strong> <span>{user.tel}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

interface Region {
  id: string;
  name: string;
}

interface Departement {
  id: string;
  name: string;
}

export default function UserListPage() {
  const router = useRouter();
  const [formUser, setFormUser] = useState<User>({
    id:0,
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


  // State for filters
  const [filters, setFilters] = useState({
    name: "",
    role: "",
    gender: "",
    age: "",
    ageFilter: "=",
    region_id: "",
    departement_id: "",
    arrondissement: "",
    bureau: "",
    centre:"",
    Alphabetical:"",
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [departments, setDepartments] = useState<Departement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [usertodelete, setusertodelete] = useState<number>(-1); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const untoggleForm = () => { 
    setIsModalOpen(false); // Toggle the form invisibility  
    }; 
    
    const toggleModal = (id:number) => { 
    setusertodelete(id);
    setIsModalOpen(true); // Toggle the form visibility 
    }; 

    const handleEdit = (user: { id: number; name: string; role: string }) => {
      setIsEditing(true); 
      
      
      }; 

      const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
      };
    
      const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedUser(null);
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

  // Fetch ALL USERS
  
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/users/getallusers/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        console.log("juvedat",data) 
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);


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

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

      // Charger les utilisateur filtrer
      const fetchFilteredUsers = async (filters: any) => {
        try {
          const response = await ApiServices.fetchUsersfiltered(filters);
          console.log("Users filtered :" , response)
          setUsers(response);
        } catch (error) {
          console.error("Erreur lors du chargement des utilisateur:", error);
        }
      };
    
    
    
    
          // Charger les Bureau de vote lors des changements de filtres
      useEffect(() => {
        fetchFilteredUsers(filters);
      }, [filters]); 


      const handleDelete = async (id: number) => {
        try { 
          const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/users/delete/${id}/`, { 
        method: "DELETE", 
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        }); 
        if (response.ok) {
         
        alert("user deleted succesfully")
        untoggleForm();
        window.location.reload();

        } else { 
        console.error("Failed to delete user"); 
        } 
        } catch (error) { 
        console.error("Error deleting user:", error); 
        } 
        untoggleForm();
        }; 



        const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault(); 
          try { 
          console.log("Values of user edition ", formUser); 
          const response = await fetch("http://localhost:3000/user/eedition", { 
          method: "POST", 
          headers: { 
          "Content-Type": "application/json",  
          Accept: "application/json",  
          "Access-Control-Allow-Origin": "*",  
          }, 
          body: JSON.stringify(formUser),    
          }); 
          console.log("Values of user edition ", formUser); 
          if (response.ok) {   
          alert("User edited s successfully!");   
          // Refetch the user data to update the list  
          const fetchResponse = await fetch(   
          `http://localhost:3000/user/getuser?userid=${formUser.id}`,      
          {     
          method: "GET",        
          headers: {      
          "Content-Type": "application/json",    
          Accept: "application/json",     
          "Access-Control-Allow-Origin": "*",    
          },    
          }     
          );          
          if (fetchResponse.ok) {          
          const updatedData: User[] = await fetchResponse.json();          
          setUsers(updatedData);      
          } else {          
          console.error(          
          "Error fetching updated floors:",         
          fetchResponse.statusText          
          );           
          }          
          } else {         
          console.error("Error creating Floor:", response.statusText);           
          }          
          } catch (error) {          
         console.error("Error creating Floor:", error);         
          }           
          setIsEditing(false); 
         // se({ id: 0, name: "", role: "" }); 
          
          }; 

  return (
    <div className=" min-h-screen bg-gray-100">
      {/* Page Heading */}
     
      <p className="mb-4 text-gray-600">Filtrer les utilisateurs par:</p>

      {/* Filter Section */}
      <div className=" flex gap-4 items-center p-4 bg-white rounded-lg shadow-md mb-6">
        {/* Filter by Name starting later 
        <div>
          <label className="block text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            name="Alphabetical"
            value={filters.Alphabetical}
            onChange={handleFilterChange}
            placeholder="Nom commencant par..."
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          />
        </div>*/}
        {/* Filter by Name containing letter */}
        <div>
          <label className="block text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Nom contenant..."
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Filter by Role */}
        <div>
          <label className="block text-gray-700 mb-1">Rôle</label>
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="w-full min-w-40 p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          >
            <option value="">Tous</option>
            <option value="CANDIDAT">Candidat</option>
            <option value="ELECTEUR">Electeur</option>
            <option value="ENROLEUR">Enrôleur</option>
            <option value="SCRUTATEUR">Scrutateur</option>
            <option value="SUPERVISEUR">Superviseur</option>
            <option value="ADMINISTRATEUR">Administrateur</option>
          </select>
        </div>

        {/* Filter by Gender */}
        <div>
          <label className="block text-gray-700 mb-1 min-w-36">Sexe</label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          >
            <option value="">Tous</option>
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
          </select>
        </div>

        {/* Filter by Age */}
        <div>
          <label className="block text-gray-700 mb-1 ">Âge</label>
          <div className="flex items-center gap-2 ">
            <input
              type="number"
              name="age"
              value={filters.age}
              onChange={handleFilterChange}
              className="w-full  p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
            />
            <select
              name="ageFilter"
              value={filters.ageFilter}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
            >
              <option value="=">=</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
            </select>
          </div>
        </div>

      
      </div>
      <div className="flex gap-4 items-center p-4 bg-white rounded-lg shadow-md mb-6">
          {/* Filter by Region */}
          <div>
          <label className="block text-gray-700 mb-1">Région</label>
          <select
            name="region_id"
            value={filters.region_id}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          >
            <option value="">Tous</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Department */}
        <div>
          <label className="block text-gray-700 mb-1">Département</label>
          <select
            name="departement_id"
            value={filters.departement_id}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          >
            <option value="">Tous</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Arrondissement */}
        <div>
          <label className="block text-gray-700 mb-1">Arrondissement</label>
          <input
            type="text"
            name="arrondissement"
            value={filters.arrondissement}
            onChange={handleFilterChange}
            placeholder="Arrondissement"
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          />
        </div>

         {/* Filter by Center */}
         <div>
          <label className="block text-gray-700 mb-1">Centre de Vote</label>
          <input
            type="text"
            name="centre"
            value={filters.centre}
            onChange={handleFilterChange}
            placeholder="Bureau de Vote"
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          />
        </div>
        {/* Filter by Bureau */}
        <div>
          <label className="block text-gray-700 mb-1">Bureau de Vote</label>
          <input
            type="text"
            name="bureau"
            value={filters.bureau}
            onChange={handleFilterChange}
            placeholder="Bureau de Vote"
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Profile</th>
              <th className="border-b p-2 text-left">Nom</th>
              <th className="border-b p-2 text-left">Prénom</th>
              <th className="border-b p-2 text-left">Role</th>
              <th className="border-b p-2 text-left">Sexe</th>
              <th className="border-b p-2 text-left">Âge</th>
              <th className="border-b p-2 text-left">Action</th>
              <th className="border-b p-2 text-left">Plus</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              
              
              <tr key={index}>
                <td className="p-2 border-b">
                  {user.userimage && <img
                    src={`/UserImages/${user.userimage}`}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />}

                  {(user.userimage===null || user.userimage==="") && <Image
                    src={noimage}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />}
                  
                  
                </td>
                <td className="p-2 border-b">{user.name}</td>
                <td className="p-2 border-b">{user.surname}</td>
                <td className="p-2 border-b">{user.role}</td>
                <td className="p-2 border-b">{user.gender}</td>
                <td className="p-2 border-b">
                  {new Date().getFullYear() - new Date(user.birthdate).getFullYear()}
                </td>
                <td className="p-2 border-b">
                  <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: '/Interfaces/create-user',
                      query: { userinfotobemodified: encodeURIComponent(JSON.stringify(user)) },
                    }}
                  >
                    <button   className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    </Link>
                    <button onClick={() => toggleModal(user.id)}  className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </td>
                <td onClick={() => handleViewDetails(user)} className="p-2 border-b text-gray-500 hover:cursor-pointer">
                  <FaEllipsisH />
                </td>
              </tr>
              
            ))}
          </tbody>
        </table>
      </div>







{/* Modal */} 

{isModalOpen && ( 
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"> 
<div className="bg-custom-bluewhite text-blue-950 rounded-lg shadow-md p-6 max-w-2xl w-full relative"> 
<h2 className="text-lg font-bold mb-4">Confirm Deletion</h2> 
<p className="mb-4"> Are you sure you want to delete this user? This action cannot be undone. </p> 
<div className="flex justify-end gap-4"> 
<button 
onClick={untoggleForm} 
className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400" > No </button> 
<button 
onClick={() => handleDelete(usertodelete)} 
className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600" > Yes </button> 
</div> 
</div> 
</div> 
)} 

{isViewModalOpen && selectedUser && (
        <UserModal user={selectedUser} onClose={handleCloseModal} />
      )}



    </div>
  );
}
