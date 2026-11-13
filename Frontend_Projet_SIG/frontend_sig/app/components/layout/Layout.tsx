"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import './Layout.scss'

interface LayoutProps {
  
  children: React.ReactNode; // Accepte des enfants React
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  const [role, setRole] = useState<string>("");
  const pagesWithoutLayout = ['/login', '/']; // Pas de Layout (Navbar/Sidebar) pour ces pages
  
  if (pagesWithoutLayout.includes(typeof window !== 'undefined' ? window.location.pathname : '')) {
    return <>{children}</>;
  }
  useEffect(()=>{
    const role = localStorage.getItem("roles")
    if (role) {
      setRole(role)
    }
    else{
      setRole("ADMINISTRATEUR")
    }
    
  },[])
  if (!role) {
    
  }

  return (
    <div className='layout'>
      <Navbar />
      <Sidebar />
      <main>
        {children}
      </main> 
    </div>
  );
};

export default Layout;
