"use client"
import react from "react"
import { useState,useEffect } from "react"
import Image from "next/image"

interface userinfo {
  selectedCandidate: string;
  voteCount: number;
}





const Scrutatorpage = () => {

  const [candidates] = useState([
    "Candidat A",
    "Candidat B",
    "Candidat C",
    "Candidat D",
  ]);

  // État du formulaire
  const [formData, setFormData] = useState<userinfo>({
    selectedCandidate: "",
    voteCount: 0,
  });


  const [activeItem, setActiveItem] = useState("Dashboard"); // Track active menu item
  const [isCollapsed, setIsCollapsed] = useState(false); // Track sidebar state





  const [isopendashboard,setIsopendashboard]=useState(true);




  const handleIsopendashboard=()=>{
    if (isopendashboard===false){
      setIsopendashboard(true);
            
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
  };


  const menuItems = [
    { id: "Menu", icon: "/Images/icons8_menu_99px 1.png", label: "Menu" },
    { id: "Dashboard", icon: "/Images/icons8_dashboard_layout_99px 1.png", label: "Dashboard" },
    { id: "HomePage", icon: "/Images/icons8_home_99px 1.png", label: "Home Page" },
    { id: "AllUsers", icon: "/Images/icons8_staff_99px_1 1.png", label: "View Candidate info" },
    { id: "AdvancedParameters", icon: "/Images/icons8_menu_99px 1.png", label: "ADVANCE PARAMETERS" },
    { id: "AboutElection", icon: "/Images/Info Popup.png", label: "About Election" },
    { id: "LightDarkMode", icon: "/Images/Sun.png", label: "Light/Dark Mode" },
    { id: "Logout", icon: "/Images/Logout Rounded.png", label: "Log Out" },
  ];

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

 const handleMenuClick = (id: string) => {
          setActiveItem(id);

          switch (id) {
                case "Dashboard":
                  handleIsopendashboard();
                  console.log("Dashboard clicked! Navigating to the dashboard...");
                 
                  break;
          
                case "CreateUsers":
                        
                  
                  console.log("Opening the create user form...");
                  break;
          
                case "AllUsers":
                        
                  console.log("Users List");
                  
                 
                  break;

                case "VotingCenter":
                    
              
              console.log("Opening the voting center form...");
              break;

              case "Favorite":
                    
              
              console.log("Opening the bureu de vote form...");
              break;
          
                default:
                  console.log(`${id} clicked, but no specific action defined.`);
              }
        };


 //create vote instance
 const handleSubmitvote = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
          const response = await fetch('http://localhost:3000/vote/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(formData),
          });
          if (response.ok) {
            alert('vote created successfully!');
          } else {
            console.error('Error vote user:', response.statusText);
          }
        } catch (error) {
          console.error('Error creating vote:', error);
        }


        }




  return  (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <div className="flex items-center justify-between bg-slate-800 text-white p-4">
        <div className="flex items-center gap-x-4">
          <Image
            src="/Images/Back To.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold">Scrutator Dashboard</h1>
        </div>
        <div className="flex items-center gap-x-4">
        <Image
            src="/Images/icons8_male_user_99px 1.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <Image
            src="/Images/icons8_menu_vertical_99px 1.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row flex-grow">
        {/* Sidebar */}
        <div
          className={`flex flex-col gap-y-4 bg-black ${
            isCollapsed ? "w-20" : "w-72"
          } transition-all duration-300`}
        >
          {/* Toggle Button */}
          <div
            className="ml-auto mr-4 mt-3 cursor-pointer"
            onClick={handleToggleSidebar}
          >
            <Image
              src="/Images/Back To.png"
              alt="Toggle Sidebar"
              width={20}
              height={20}
            />
          </div>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`flex items-center ml-4 gap-x-5 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                activeItem === item.id
                  ? "bg-slate-600 text-black"
                  : "text-white hover:bg-slate-500"
              }`}
            >
              <Image
                src={item.icon}
                alt={`${item.label} Icon`}
                width={20}
                height={20}
              />
              {!isCollapsed && <h1 className="text-bold">{item.label}</h1>}
            </div>
          ))}
        </div>

        {/* Main Content */}
        {isopendashboard && 
        
        <div className="p-6 w-full mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Formulaire des Votes</h2>

      <form onClick={handleSubmitvote} className="space-y-4">
        {/* Liste déroulante pour les candidats */}
        <div>
          <label htmlFor="selectedCandidate" className="block text-sm font-medium text-gray-700">
            Sélectionnez un candidat
          </label>
          <select
            id="selectedCandidate"
            name="selectedCandidate"
            value={formData.selectedCandidate}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Choisissez un candidat --</option>
            {candidates.map((candidate, index) => (
              <option key={index} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </div>

        {/* Champ pour le nombre de votes */}
        <div>
          <label htmlFor="voteCount" className="block text-sm font-medium text-gray-700">
            Nombre de votes
          </label>
          <input
            type="number"
            id="voteCount"
            name="voteCount"
            value={formData.voteCount}
            onChange={handleInputChange}
            placeholder="Entrez le nombre de votes"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Soumettre
        </button>
      </form>
    </div>
  
        
        }
      </div>
    </div>
  );
};

export default Scrutatorpage;
