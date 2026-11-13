"use client"
import dynamic from "next/dynamic";

// Charger le composant dynamiquement pour éviter les problèmes avec SSR
const MapComponent = dynamic(() => import("../components/MapComponent/MapComponent"), { ssr: false });

const MapPage: React.FC = () => {
  return (
    <div>
      <h1>Carte Interactive</h1>
      <MapComponent />
    </div>
  );
};

export default MapPage;