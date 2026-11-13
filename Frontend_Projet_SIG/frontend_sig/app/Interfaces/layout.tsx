"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar/Navbar'
import Sidebar from '../components/sidebar/Sidebar';
import '../components/layout/Layout.scss'
import withAuth from '../components/withAuths/page';
import Head from 'next/head';

interface LayoutProps {
  
  children: React.ReactNode; // Accepte des enfants React
}

const Layout: React.FC<LayoutProps> = ({children}) => {
  const [role, setRole] = useState<string>("");
  const pagesWithoutLayout = ['/login', '/']; // Pas de Layout (Navbar/Sidebar) pour ces pages
  
  return (
    <>
    <Head>
        <title>Mon Application Next.js</title>
      </Head>
    <div className='layout'>
      <Navbar/>
      <Sidebar />
      <main>
        {children}
      </main> 
    </div>
    </>
  );
};

export default withAuth(Layout, ["SCRUTATEUR", "SUPERVISEUR", "ENROLEUR", "ADMINISTRATEUR"]);;
