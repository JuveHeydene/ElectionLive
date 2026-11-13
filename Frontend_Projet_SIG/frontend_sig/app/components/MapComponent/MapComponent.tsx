"use client"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.scss"
import { use, useEffect, useState } from "react";
import { GeoJsonObject } from "geojson";
import ApiServices, { fetchCandidats } from "../services/ApiServices";
import L from "leaflet";

// Mappage des gid_1 vers des couleurs spécifiques
const regionColors: Record<string, string> = {
    "CMR.1_1": "#FF5733", // Exemple de couleur pour la région 1
    "CMR.2_1": "#1a3750",
    "CMR.3_1": "#11F937",
    "CMR.4_1": "#727914",
    "CMR.5_1": "#09850f",
    "CMR.6_1": "#35BF57",
    "CMR.7_1": "#a30f9c",
    "CMR.8_1": "#811405",
    "CMR.9_1": "#13FF56",
    "CMR.10_1": "#1a068f",
    // Ajouter plus de régions et leurs couleurs ici...
  };
  const colorList = [
    "#4AB48F",
    "#EDA145",
    "#EA191D",
    "#1A9EE1",
    "#51c992"
  ];
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase() // Ignorer la casse
      .normalize("NFD") // Décomposer les caractères accentués en leur forme de base
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les marques diacritiques (accents)
      .replace(/-/g, "") // Supprimer les traits d'union
      .replace(/'/g, ""); // Supprimer les apostrophes
  };
  const normalizeDepartmentName = (departmentName: string): string => {
    return departmentName
      .normalize("NFD") // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les marques diacritiques (accents)
      .replace(/'/g, "") // Supprimer les apostrophes
      .replace(/et/g, "-ET-") // Ajouter un trait d'union autour de 'et'
      .replace(/([a-z])([A-Z])/g, "$1-$2") // Ajouter un trait d'union entre mots basés sur les majuscules
      .toUpperCase(); // Convertir tout en majuscules
  };
  
  
  
  const normalizeKeysInDictionary = (dict: { [key: string]: any }): { [key: string]: any } => {
    return Object.entries(dict).reduce((normalizedDict, [key, value]) => {
      const normalizedKey = normalizeString(key); // Normaliser la clé
      normalizedDict[normalizedKey] = value; // Conserver la valeur associée
      return normalizedDict;
    }, {} as { [key: string]: any });
  };
  const convertToRoman = (num: number): string => {
    const romanNumerals: { [key: number]: string } = {
      1: ' I',2: ' II',3:' III', 4: ' IV', 5: ' V',6:' VI',7:' VII',8:' VIII', 9: 'IX',
      10: 'X', 40: 'XL', 50: 'L', 90: 'XC',
      100: 'C', 400: 'CD', 500: 'D', 900: 'CM',
      1000: 'M'
    };
  
    let result = '';
    let keys = Object.keys(romanNumerals).map(Number).reverse();
  
    for (let i = 0; i < keys.length; i++) {
      while (num >= keys[i]) {
        result += romanNumerals[keys[i]];
        num -= keys[i];
      }
    }
  
    return result;
  };
  
  const normalizeArrondissementName = (arrondissementName: string): string => {
    return arrondissementName
    .normalize("NFD") // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les marques diacritiques (accents)
    .replace(/'/g, "") // Supprimer les apostrophes
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Ajouter un trait d'union entre mots basés sur les majuscules
    .replace(/\d+/g, (match) => `${convertToRoman(parseInt(match))} `) // Remplacer les chiffres par leur équivalent romain et ajouter un espace
    .toUpperCase(); // Convertir tout en majuscules
      
  };
//   const Legend: React.FC<{ candidates: any[] }> = ({ candidates }) => {
//     const map = useMap();
  
//     useEffect(() => {
//         const legend = new L.Control({ position: "bottomright" });
//         legend.onAdd = () => {
//             const div = L.DomUtil.create("div", "info legend");
//             div.style.background = "white";
//             div.style.padding = "10px";
//             div.style.borderRadius = "5px";
//             div.style.boxShadow = "0 0 5px rgba(0,0,0,0.4)";
//             div.innerHTML = "<h4> Légende </h4>";
//             console.log("Candidats :", candidates)
//             if (candidates) {
//                 candidates.forEach((candidate) => {
//                     div.innerHTML += `
//                         <div style="display: flex; align-items: center; margin-bottom: 5px;">
//                         <span style="width: 20px; height: 20px; background: ${candidate.color}; margin-right: 8px;"></span>
//                         ${candidate.name}
//                         </div>
//                     `;
//                     });
//             }
            
    
//             return div;
//         };
    
//         legend.addTo(map);
    
//         return () => {
//             legend.remove();
//         };
//         }, [candidates, map]);
  
//     return null;
//   };
const MapComponent: React.FC = () => {
    const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
    const [geoRegionData, setGeoRegionData] = useState<GeoJsonObject | null>(null);
    const [geoDepartmentData, setGeoDepartmentData] = useState<GeoJsonObject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<any | null>(null); // Contient la feature sélectionnée
    const [currentZoom, setCurrentZoom] = useState(6);
    const [candidates,setCanditates] = useState<any>();
    const [regionWinners, setRegionWinners] = useState<Record<string, any>>({});
    const [departmentWinners, setDepartmentWinners] = useState<any>({});
    const [arrondissmentWinners, setArrondissmentWinners] = useState<any>({});
    const [centreDeVoteWinners, setCentreDeVoteWinners] = useState<any>({});
    const [regionStatistics, setRegionStatistics] = useState<any>();
    const [departmentStatistics, setDepartmentStatistics] = useState<any>();
    const [arrondissmentStatistics, setArrondissmentStatistics] = useState<any>();
  

  // Récupérer les données GeoJSON depuis l'API Django
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const arrondissment_response = await fetch("http://127.0.0.1:8000/circonscription/administrative_units/");
        const department_response = await fetch("http://127.0.0.1:8000/circonscription/department_units/");
        const region_response = await fetch("http://127.0.0.1:8000/circonscription/region_units/");
        const arrondissment_data = await arrondissment_response.json();
        const region_data = await region_response.json();
        const department_data = await department_response.json();
        
        setGeoData(arrondissment_data);
        setGeoDepartmentData(department_data);
        setGeoRegionData(region_data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchGeoJSON();
  }, []);
  useEffect(() => {
    const getCandidats = async ()=>{
        try{
            const candidats = await fetchCandidats()
            if (candidats) {
                // Ajouter la propriété `color` à chaque candidat
                const candidatsWithColors = candidats.map((candidate: any, index:any) => ({
                    ...candidate,
                    color: colorList[index], // Sélectionne une couleur aléatoire
                }));
                setCanditates(candidatsWithColors);
                
            }
        }
        catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
        }
    }
    getCandidats()
  }, []);
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const regionresponse = await fetch("http://127.0.0.1:8000/users/get_winner_by_region/");
        const regiondata = await regionresponse.json();
        const departmentResponse = await fetch("http://127.0.0.1:8000/users/get_winner_by_departement/");
        const departementData = await departmentResponse.json();
        const arrondissmentResponse = await fetch("http://127.0.0.1:8000/users/get_winner_by_arrondissement/");
        const arrondissmentData = await arrondissmentResponse.json();
        console.log("Region winners :", regiondata)
        setRegionWinners(regiondata);
        setDepartmentWinners(departementData);
        
        setArrondissmentWinners(arrondissmentData);
      } catch (error) {
        console.error("Erreur lors de la récupération des vainqueurs :", error);
      }
    };
  
    fetchWinners();
  }, []);
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/vote-results/");
  
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
    if(data.type === 'winner_update' ){
      console.log("Data received from WebSocket:", data);
      console.log(data.data)
      setRegionWinners(data.data[0].winners)
      setDepartmentWinners(data.data[1].winners)
      setArrondissmentWinners(data.data[2].winners)
    };}
  
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    return () => {
      socket.close()
    }
    
  }, []);
  const ZoomHandler = () => {
    const map = useMap();
    useEffect(() => {
      const onZoom = () => {
        setCurrentZoom(map.getZoom());
      };
      map.on("zoomend", onZoom);
      return () => {
        map.off("zoomend", onZoom);
      };
    }, [map]);

    return null;
  };
  const Legend = ()=>{
    const map = useMap();
  
    useEffect(() => {
        const legend = new L.Control({ position: "topright" });
        legend.onAdd = () => {
            const div = L.DomUtil.create("div", "info legend");
            div.style.background = "white";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.style.boxShadow = "0 0 5px rgba(0,0,0,0.4)";
            div.innerHTML = "<h4> Légende </h4>";
            div.style.fontFamily = "Podkova";
            console.log("Candidats :", candidates)
            if (candidates) {
                candidates.forEach((candidate:any) => {
                    div.innerHTML += `
                        <div style="display: flex; align-items: center; color:${candidate.color}; margin-bottom: 5px;">
                        <span style="width: 20px; height: 20px; background: ${candidate.color};  margin-right: 8px;"></span>
                        ${candidate.name}
                        </div>
                    `;
                    });
            }
            
    
            return div;
        };
    
        legend.addTo(map);
    
        return () => {
            legend.remove();
        };
        }, [candidates, map]);
    return null
  }
  
  

  const getRegionColor = (regionName: string): string => {
    // Convertir regionName en majuscules
    const normalizedRegionName = regionName.toUpperCase();
  
    if (regionWinners) {
      // Récupérer le gagnant pour la région
      const winner = regionWinners[normalizedRegionName];
  
      if (winner) {
        // Trouver le candidat correspondant à l'id dans l'array candidates
        const candidate = candidates.find((c:any) => c.id === winner.candidat_id);
    
        // Retourner la couleur du candidat ou une couleur par défaut si non trouvé
        return candidate ? candidate.color : "#CCCCCC";
      }
    }
    
  
    // Couleur par défaut si aucune donnée
    return "#CCCCCC";
  };
  // Fonction pour récupérer la couleur d'un département
  const getDepartmentColor = (departmentName: string): string => {
    const normalizedDepartmentName = normalizeString(departmentName);
    const normalizedDepartment = normalizeKeysInDictionary(departmentWinners)
    const winner = normalizedDepartment[normalizedDepartmentName];

    if (winner) {
      const candidate = candidates.find((c: any) => c.id === winner.candidat_id);
      return candidate ? candidate.color : "#CCCCCC";
    }

    return "#CCCCCC";
  };

  // Fonction pour récupérer la couleur d'un arrondissement
  const getArrondissementColor = (arrondissementName: string): string => {
    const normalizedArrondissementName = normalizeString(arrondissementName);
    const normalizedArrondissement = normalizeKeysInDictionary(arrondissmentWinners)
    const winner = normalizedArrondissement[normalizedArrondissementName];

    if (winner) {
      const candidate = candidates.find((c: any) => c.id === winner.candidat_id);
      return candidate ? candidate.color : "#CCCCCC";
    }

    return "#CCCCCC";
  };
  const styleFeature = (feature: any) => {
    const regionName = feature.properties.name_1; // Assurez-vous que 'gid_1' existe dans les propriétés
    const color = getRegionColor(regionName);
    return {
        
      fillColor: color,
      width:"100px",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };
  const styleArrondissmentFeature = (feature: any) => {
    const arrondissmentName = feature.properties.name_3; // Assurez-vous que 'gid_1' existe dans les propriétés
    const color = getArrondissementColor(arrondissmentName);
    return {
        
      fillColor: color,
      width:"100px",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };
  const styleDepartmentFeature = (feature: any) => {
    const departmentName = feature.properties.name_2; // Assurez-vous que 'gid_1' existe dans les propriétés
    const color = getDepartmentColor(departmentName);
    return {
        
      fillColor: color,
      width:"100px",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  const onEachRegionFeature = async (feature: any, layer: any, areaType: string) => {
    console.log("Features.properties :", feature.properties);
    console.log("Layer :", layer);
  
    const key = feature.properties.name_1.toUpperCase();
    if (regionWinners) {
      if (regionWinners[key]) {
        const regionStatistics = await ApiServices.getRegionStatistics(key);
        console.log("Region stats: ", regionStatistics);
    
        const winner = regionWinners[key]?.candidat_name || "N/A";
        const totalVotesWinner = regionWinners[key]?.total_votes || 0;
        const totalEnrollees = regionStatistics.total_enrollees || 0;
        const totalVotes = regionStatistics.total_votes || 0;
        const participationRate = regionStatistics.participation_rate || 0;
    
        const results = regionStatistics.results
          .map(
            (candidate: any) =>
              `<li><strong>${candidate.candidat__name}</strong>: ${candidate.total_votes} votes</li>`
          )
          .join("");
    
        const content = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 300px;">
            <h3 style="margin: 0; font-size: 16px; color: #2c3e50;">
              ${feature.properties.name_1.toUpperCase()}
            </h3>
            <p style="margin: 5px 0; font-size: 14px; color: #34495e;">
              <strong>Nombre total d'enregistrés:</strong> ${totalEnrollees}<br />
              <strong>Nombre total de votes:</strong> ${totalVotes}<br />
              <strong>Taux de participation:</strong> ${participationRate.toFixed(2)}%
            </p>
            <h4 style="margin: 10px 0 5px; font-size: 14px; color: #2980b9; text-decoration: underline;">Résultats des candidats:</h4>
            <ul style="list-style: none; padding: 0; font-size: 14px; color: #34495e;">
              ${results}
            </ul>
            <p style="margin: 10px 0; font-size: 14px; color: #27ae60;">
              <strong>Gagnant:</strong> ${winner} avec ${totalVotesWinner} votes
            </p>
          </div>
        `;
    
        layer.bindPopup(content);
      }
    }
    
  };
  const onEachDepartmentFeature = async (feature: any, layer: any, areaType: string) => {
    console.log("Features.properties :", feature.properties);
    console.log("Layer :", layer);
  
    const key = normalizeDepartmentName(feature.properties.name_2)
    console.log("Normalized Department Name : ",key)
    if (departmentWinners[key]) {
      const departmentStatistics = await ApiServices.getDepartementStatistics(key);
      console.log("Department stats: ", departmentStatistics);
  
      const winner = departmentWinners[key]?.candidat_name || "N/A";
      const totalVotesWinner = departmentWinners[key]?.total_votes || 0;
      const totalEnrollees = departmentStatistics.total_enrollees || 0;
      const totalVotes = departmentStatistics.total_votes || 0;
      const participationRate = departmentStatistics.participation_rate || 0;
  
      const results = departmentStatistics.results
        .map(
          (candidate: any) =>
            `<li><strong>${candidate.candidat__name}</strong>: ${candidate.total_votes} votes</li>`
        )
        .join("");
  
      const content = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 300px;">
          <h3 style="margin: 0; font-size: 16px; color: #2c3e50;">
            ${feature.properties.name_2.toUpperCase()}
          </h3>
          <p style="margin: 5px 0; font-size: 14px; color: #34495e;">
            <strong>Nombre total d'enregistrés:</strong> ${totalEnrollees}<br />
            <strong>Nombre total de votes:</strong> ${totalVotes}<br />
            <strong>Taux de participation:</strong> ${participationRate.toFixed(2)}%
          </p>
          <h4 style="margin: 10px 0 5px; font-size: 14px; color: #2980b9; text-decoration: underline;">Résultats des candidats:</h4>
          <ul style="list-style: none; padding: 0; font-size: 14px; color: #34495e;">
            ${results}
          </ul>
          <p style="margin: 10px 0; font-size: 14px; color: #27ae60;">
            <strong>Gagnant:</strong> ${winner} avec ${totalVotesWinner} votes
          </p>
        </div>
      `;
  
      layer.bindPopup(content);
    }
  };
  const onEachArrondissmentFeature = async (feature: any, layer: any, areaType: string) => {
    console.log("Features.properties :", feature.properties);
    console.log("Layer :", layer);
  
    const key = normalizeArrondissementName(feature.properties.name_3)
    console.log("Normalized Aarrondissment Name : ",key)
    if (arrondissmentWinners[key]) {
      const arrondissmentStatistics = await ApiServices.getArrondissementStatistics(key);
      console.log("Arrondissment stats: ", arrondissmentStatistics);
  
      const winner = arrondissmentWinners[key]?.candidat_name || "N/A";
      const totalVotesWinner = arrondissmentWinners[key]?.total_votes || 0;
      const totalEnrollees = arrondissmentStatistics.total_enrollees || 0;
      const totalVotes = arrondissmentStatistics.total_votes || 0;
      const participationRate = arrondissmentStatistics.participation_rate || 0;
  
      const results = arrondissmentStatistics.results
        .map(
          (candidate: any) =>
            `<li><strong>${candidate.candidat__name}</strong>: ${candidate.total_votes} votes</li>`
        )
        .join("");
  
      const content = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 300px;">
          <h3 style="margin: 0; font-size: 16px; color: #2c3e50;">
            ${feature.properties.name_3.toUpperCase()}
          </h3>
          <p style="margin: 5px 0; font-size: 14px; color: #34495e;">
            <strong>Nombre total d'enregistrés:</strong> ${totalEnrollees}<br />
            <strong>Nombre total de votes:</strong> ${totalVotes}<br />
            <strong>Taux de participation:</strong> ${participationRate.toFixed(2)}%
          </p>
          <h4 style="margin: 10px 0 5px; font-size: 14px; color: #2980b9; text-decoration: underline;">Résultats des candidats:</h4>
          <ul style="list-style: none; padding: 0; font-size: 14px; color: #34495e;">
            ${results}
          </ul>
          <p style="margin: 10px 0; font-size: 14px; color: #27ae60;">
            <strong>Gagnant:</strong> ${winner} avec ${totalVotesWinner} votes
          </p>
        </div>
      `;
  
      layer.bindPopup(content);
    }
  };
  

  return (
    <>
    <MapContainer center={[7.3697, 12.3547]}  zoom={6} style={{ height: "800px", width: "100%" }}>
        <ZoomHandler />
        {/* Afficher les couches en fonction du zoom */}
        {currentZoom <= 6 && geoRegionData && <GeoJSON data={geoRegionData} onEachFeature={(feature, layer) => onEachRegionFeature(feature, layer, "region")} style={styleFeature} />}
        {currentZoom > 6.5 && currentZoom <= 7.5 && geoDepartmentData && (
        <GeoJSON data={geoDepartmentData} style={styleDepartmentFeature} onEachFeature={(feature, layer) => onEachDepartmentFeature(feature, layer, "department")}/>
        )}
        {currentZoom > 7.5 && geoData && <GeoJSON data={geoData} style={styleArrondissmentFeature} onEachFeature={(feature, layer) => onEachArrondissmentFeature(feature, layer, "department")}/>}
        {/* Ajouter la légende */}
        <Legend />

      
    </MapContainer>
    
  </>
  );
};

export default MapComponent;
