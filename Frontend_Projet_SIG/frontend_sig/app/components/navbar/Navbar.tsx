"use client"
import React, { useState, useEffect, useRef } from 'react';
import "./Navbar.scss"
import Image from "next/image";
import { usePathname } from 'next/navigation';

import { useRouter } from "next/navigation";
import myLogo from "../../../public/Images/elections_237.png"
import { User } from '@/app/Models/User';

const BASE_IMG_URL="http://127.0.0.1:8000/media/042246ac-2bf1-421e-bae0-f59fc0bdc3af-Zen'itsu%20PP.jpg"

const Navbar = () => {
  const pathname = usePathname();
  const [navTitle, setNavTitle] = useState<string>("")
  const [user, setUser]= useState<User|null>(null)
  
  useEffect(() => {
    const updateNavTitle = ()=>{
      if (pathname.includes("create-user")) {
        return "Create new user"
      }
      else if (pathname.includes("user-list")) {
        return "Registered  users"
      }
      else if (pathname.includes("center-list")) {
        return "Voting center list"
      }
      else if (pathname.includes("voting-office-list")) {
        return "Voting office list"
      }
      else if (pathname.includes("create-voting-office")) {
        return "Create new votting office"
      }
      else if (pathname.includes("voting-results")) {
        return "Voting results"
      }
      else if (pathname.includes("new-result")) {
        return "New voting result"
      }
      else if (pathname.includes("add-center")) {
        return "New voting center"
      }
      else if (pathname.includes("dashboard")) {
        return "Dashboard"
      }
      else{
        return ""
      }
    }
    setNavTitle(updateNavTitle())
  }, []);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      console.log(JSON.parse(storedUser))
      setUser(JSON.parse(storedUser))
      
    }
    
  }, []);
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
  return (
    <nav >
      <span className=""> 
          <Image src={myLogo} alt={""} className="logo" ></Image>
        </span>
        <h1>{navTitle}</h1>
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
  );
};

export default Navbar;
