"use client";
import react, { MouseEvent } from "react";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import myLogo from "../../../public/Images/elections_237.png"
import "./admindashboard.scss";
import Link from "next/link";
import withAuth from '@/app/components/withAuths/page';

interface userinfo {
  id: number;
  name: string;
  role: string;
}

interface createuser {
  noms: string;
  prenoms: string;
  birthdate: string;
  gender: string;
  role: string;
  bureau: string;
}

interface Circonscription {
  nom: string;
  circonscriptionname: string;
}

interface BureauVote {
  nom: string;
  circonscriptionname: string;
}

const AdminPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<userinfo>({
    id: 0,
    name: "",
    role: "",
  });

  const [formUser, setFormUser] = useState<createuser>({
    noms: "",
    prenoms: "",
    birthdate: "",
    gender: "",
    role: "",
    bureau: "",
  });

  const [formcirconsription, setcirconsription] = useState<Circonscription>({
    nom: "",
    circonscriptionname: "",
  });
  const sidebarRef = useRef<HTMLElement>(null);
  const handleClickOnSideBar = (e: React.MouseEvent<HTMLElement>) => {
    console.log("Bonjour à vous");
    e.preventDefault();
    sidebarRef.current?.classList.toggle("show");
  };
  // Debut Gestion du dropdown de la navbar
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fonction pour ouvrir ou fermer le menu dropdown
  const toggleDropdown = (event:React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
    
  };
  useEffect(()=>{
    console.log(isDropdownOpen)
  },[isDropdownOpen])

  // Fonction pour fermer le dropdown lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)  ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  //Fin
  //Debut Boutton pour afficher ou cacher la sidebar
  const toggleBtnRef = useRef<HTMLAnchorElement | null>(null);
  const toggleSidebar = (event:React.MouseEvent)=>{
    if (sidebarRef.current) {
      sidebarRef.current.classList.toggle('close')
      toggleBtnRef.current?.classList.toggle('rotate')
    }
    const showElements = Array.from(sidebarRef.current?.getElementsByClassName('show') || []);
    showElements.forEach(ul=>{
      ul.classList.remove('show')
      ul.previousElementSibling?.classList.remove('rotate')
    })
  }
  //Fin

  const [formBureauvote, setBureauvote] = useState<BureauVote>({
    nom: "",
    circonscriptionname: "",
  });

  const [isopenregion, setIsopenregion] = useState(true);
  const [isopencreateuser, setIsopencreateuser] = useState(false);
  const [isopenallusers, setIsopenallusers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iscreatecenter, setIscreatecenter] = useState(false);
  const [isbureaudevote, setIsbureaudevote] = useState(false);

  const [role, setRole] = useState("");

  const [activeItem, setActiveItem] = useState("Dashboard"); // Track active menu item
  const [isCollapsed, setIsCollapsed] = useState(false); // Track sidebar state

  // const menuItems = [
  //   {
  //     id: "Menu",
  //     icon: "/Images/icons8_menu_99px 1.png",
  //     label: "",
  //     children: null,
  //   },
  //   {
  //     id: "Dashboard",
  //     icon: "/Images/icons8_dashboard_layout_99px 1.png",
  //     label: "Dashboard",
  //     children: null,
  //   },
  //   {
  //     id: "HomePage",
  //     icon: "/Images/icons8_home_99px 1.png",
  //     label: "Home Page",
  //     children: null,
  //   },
  //   {
  //     id: "AllUsers",
  //     icon: "/Images/icons8_staff_99px_1 1.png",
  //     label: "All Users",
  //     children: null,
  //   },
  //   {
  //     id: "Create",
  //     icon: "/Images/icons8_staff_99px_1 1.png",
  //     label: "Create",
  //     children: [
  //       {
  //         id: "CreateUsers",
  //         icon: "/Images/icons8_add_administrator_99px 1.png",
  //         label: "Create Users",
  //         children: null,
  //       },
  //       {
  //         id: "VotingCenter",
  //         icon: "/Images/icons8_location_99px_1 1.png",
  //         label: "Create Center",
  //         children: null,
  //       },
  //       {
  //         id: "Favorite",
  //         icon: "/Images/icons8_rating_99px 1.png",
  //         label: "Create VoteOffice",
  //         children: null,
  //       },
  //     ],
  //   },
  //   {
  //     id: "Settings",
  //     icon: "/Images/icons8_settings_99px 1.png",
  //     label: "Settings",
  //     children: null,
  //   },
  //   {
  //     id: "AdvancedParameters",
  //     icon: "/Images/icons8_menu_99px 1.png",
  //     label: "ADVANCE PARAMETERS",
  //     children: null,
  //   },
  //   {
  //     id: "AboutElection",
  //     icon: "/Images/Info Popup.png",
  //     label: "About Election",
  //     children: null,
  //   },
  //   {
  //     id: "LightDarkMode",
  //     icon: "/Images/Sun.png",
  //     label: "Light/Dark Mode",
  //     children: null,
  //   },
  //   {
  //     id: "Logout",
  //     icon: "/Images/Logout Rounded.png",
  //     label: "Log Out",
  //     children: null,
  //   },
  // ];
  const menuItems = [
    { id: "Menu", icon: "double_arrow", label: null, children: null },
    { id: "Dashboard", icon: "dashboard", label: "Dashboard", children: null },
    { id: "HomePage", icon: "home", label: "Home Page", children: null },
    { id: "AllUsers", icon: "people", label: "All Users", children: null },
    { id: "Create", icon: "add", label: "Create", children:[
      {
        id: "CreateUsers",
        icon: "person_add",
        label: "Create Users",
        children: null,
      },
      {
        id: "VotingCenter",
        icon: "apartment",
        label: "Create Center",
        children: null,
      },
      {
        id: "Favorite",
        icon: "how_to_vote",
        label: "Create VoteOffice",
        children: null,
      },
    ] },
    { id: "Settings", icon: "settings", label: "Settings", children: null },
    { id: "AdvancedParameters", icon: "tune", label: "ADVANCE PARAMETERS", children: null },
    { id: "AboutElection", icon: "info", label: "About Election", children: null },
    { id: "LightDarkMode", icon: "light_mode", label: "Light/Dark Mode", children: null },
    { id: "Logout", icon: "logout", label: "Log Out", children: null },
  ];
  

  const [circonscriptions, setCirconscriptions] = useState<string[]>([
    "Circonscription A",
    "Circonscription B",
    "Circonscription C",
    "Circonscription D",
    "Circonscription E",
    "Circonscription F",
  ]);

  // Initial state with an array of users
  const [users, setUsers] = useState<userinfo[]>([
    { id: 1, name: "Juve", role: "Admin" },
    { id: 2, name: "James", role: "Moderator" },
    { id: 3, name: "Dave", role: "User" },
  ]);

  // State to handle editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: 0, name: "", role: "" });

  const toggleModal = () => {
    setIsModalOpen(true); // Toggle the form visibility
  };
  const untoggleForm = () => {
    setIsModalOpen(false); // Toggle the form invisibility
  };

  // Delete a user
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/user/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((a) => a.id !== id));
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Start editing a user
  const handleEdit = (user: { id: number; name: string; role: string }) => {
    setIsEditing(true);
    setFormData(user);
  };

  // Handle input change during edit
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  const handleInputcirconscription = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setcirconsription({
      ...formcirconsription,
      [name]: value,
    });
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

  //create user submit
  const handleSubmitcreateuser = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
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
  };

  //redirectioon to home page
  const handlehomepageredireect = () => {
    router.push("/Interfaces/HomePage");
  };
  
  //create center
  const handleSubmitcreatecenter = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/center/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(formcirconsription),
      });
      if (response.ok) {
        alert("center created successfully!");
      } else {
        console.error("Error creating center:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating center:", error);
    }
  };

  //create Bureau de Vote
  const handleSubmitcreatebureauvote = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/bureau/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(formcirconsription),
      });
      if (response.ok) {
        alert("bureau created successfully!");
      } else {
        console.error("Error creating bureau:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating bureau:", error);
    }
  };

  // Save the edited user
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log("Values of user edition ", formData);
      const response = await fetch("http://localhost:3000/user/eedition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(formData),
      });

      console.log("Values of user edition ", formData);
      if (response.ok) {
        alert("User edited s successfully!");
        // Refetch the user data to update the list
        const fetchResponse = await fetch(
          `http://localhost:3000/user/getuser?userid=${formData.id}`,
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
          const updatedData: userinfo[] = await fetchResponse.json();
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
    setFormData({ id: 0, name: "", role: "" });
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMenuClick = (id: string) => {
    setActiveItem(id);

    switch (id) {
      case "Dashboard":
        handleIsopenregion();
        console.log("Dashboard clicked! Navigating to the dashboard...");

        break;

      case "CreateUsers":
        handleIsopencreateuser();

        console.log("Opening the create user form...");
        break;

      case "AllUsers":
        handleIsopenallusers();
        console.log("Users List");

        break;

      case "VotingCenter":
        handleIscreatecenters();

        console.log("Opening the voting center form...");
        break;

      case "Favorite":
        handleIscreatebureuvote();

        console.log("Opening the bureu de vote form...");
        break;

      case "HomePage":
        handlehomepageredireect();

        console.log("Opening the bureu de vote form...");
        break;

      default:
        console.log(`${id} clicked, but no specific action defined.`);
    }
  };

  const handleIsopenregion = () => {
    if (isopenregion === false) {
      setIsopenregion(true);
      setIsopencreateuser(false);
      setIsopenallusers(false);
      setIscreatecenter(false);
      setIsbureaudevote(false);
    }
  };

  const handleIsopencreateuser = () => {
    if (isopencreateuser === false) {
      setIsopencreateuser(true);
      setIsopenregion(false);
      setIsopenallusers(false);
      setIscreatecenter(false);
      setIsbureaudevote(false);
    }
  };
  const handleIsopenallusers = () => {
    if (isopenallusers === false) {
      setIsopenallusers(true);
      setIsopencreateuser(false);
      setIsopenregion(false);
      setIscreatecenter(false);
      setIsbureaudevote(false);
    }
  };

  const handleIscreatecenters = () => {
    if (iscreatecenter === false) {
      setIscreatecenter(true);
      setIsopenallusers(false);
      setIsopencreateuser(false);
      setIsopenregion(false);
      setIsbureaudevote(false);
    }
  };
  const handleIscreatebureuvote = () => {
    if (isbureaudevote === false) {
      setIsbureaudevote(true);
      setIscreatecenter(false);
      setIsopenallusers(false);
      setIsopencreateuser(false);
      setIsopenregion(false);
    }
  };

  function toggleSubMenu(button:any): void {
    button.nextElementSibling?.classList.toggle('show')
    button.classList.toggle('rotate')

    if (sidebarRef.current?.classList.contains('close')) {
      sidebarRef.current.classList.toggle('close')
      toggleBtnRef.current?.classList.toggle('rotate')
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Start :Navbar */}
      <nav>
      
        <span className=""> 
          <Image src={myLogo} alt={""} className="logo" ></Image>
        </span>
        <h1>Dashboard</h1>
        <div className="user-profile">
          <span><svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" ><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></svg></span>
          <span  onClick={toggleDropdown} className={`arrow-icon ${isDropdownOpen ? 'rotate' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" ><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg></span>
          {isDropdownOpen && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <ul>
              <li>Option 1</li>
              <li>Option 2</li>
              <li>Option 3</li>
            </ul>
          </div>
         )}
        </div>

      </nav>
      {/* End :Navbar */}

      {/* Start :Sidebar */}
      <aside ref={sidebarRef}>
        <ul>
          {menuItems.map((item) => (
            <li
              
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="active"
            >
              {item.children ? (
                <>
                  <button onClick={(e)=>toggleSubMenu(e.currentTarget as HTMLButtonElement)} className="dropdown-btn">
                    <i className="material-icons">{item.icon}</i>
                    <span>{item.label}</span>
                    <i className="material-icons">arrow_drop_down</i>
                  </button>
                  <ul className="sub-menu">
                    <div>
                    {item.children.map((child) => (
                      
                        <li
                        key={child.id}
                        
                        onClick={() => handleMenuClick(child.id)}
                        className="active"
                        >
                        <a href="#">
                          <i className="material-icons">{child.icon}</i>
                          <span>{child.label}</span>
                          </a>
                        </li>
                     
                      
                    ))}
                    </div>
                  </ul>
                </>
              ) : (
                item.id === "Menu"?(
                  <a href="#" id={item.id} ref={toggleBtnRef} onClick={(e)=>toggleSidebar(e)}>
                    <i className="material-icons" >{item.icon}</i>
                    
                  </a>
                ):(
                  <a href="#" id={item.id}>
                    <i className="material-icons" >{item.icon}</i>
                    <span>{item.label}</span>
                  </a>
                )
                
              )}
            </li>
          ))}
        </ul>
      </aside>
      {/* End :Sidebar */}

      {/* Start :Main content */}
      <main>
        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>

        <p>
          Le lorem ipsum est, en imprimerie, une suite de mots sans
          signification utilisée à titre provisoire pour calibrer une mise en
          page, le texte définitif venant remplacer le faux-texte dès qu'il est
          prêt ou que la mise en page est achevée. Généralement, on utilise un
          texte en faux latin, le Lorem ipsum ou Lipsum
        </p>
      </main>
      {/* End :Main content */}

      {/* Start :Footer */}
      <footer>Footer</footer>
      {/* End :Footer */}

      {/* Zone pour le contenu du backup de l'admin dashboard */}
    </div>
  );
};


export default withAuth(AdminPage, ['ADMINISTRATEUR']);
