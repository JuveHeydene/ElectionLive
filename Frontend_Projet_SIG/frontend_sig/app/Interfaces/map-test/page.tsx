"use client"

import React from 'react'
import {
    MapContainer, TileLayer, Polygon
} from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import {statesData} from './data'

const center: [number, number] = [3.9122468020129295, 11.458802557201189];
// Fonction utilitaire pour transformer les coordonnées
const formatCoordinates = (coordinates: any) => {
  // Si c'est un tableau imbriqué, on les mappe récursivement
  if (Array.isArray(coordinates[0][0])) {
    return coordinates.map((ring: any[]) => ring.map((coord: any[]) => [coord[1], coord[0]])); // Inverse latitude/longitude
  } 
  // Sinon, on mappe directement
  return coordinates.map((coord: any[]) => [coord[1], coord[0]]);
};
const MapTest = () => {
  return (
    <MapContainer center={center} zoom={10} style={{width:'100vw', height:'100vh'}}>
      <TileLayer url='https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=jhuM9pfPElMEuThXI9mw'
      attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      />
      {
        statesData.features.map((state,index)=>{
          const coordinates = formatCoordinates(state.geometry.coordinates);
          return (<Polygon
            key={state.id || index}
          pathOptions={{
            fillColor: "#FD8D3C",
            fillOpacity : 0.7,
            weight: 2,
            opacity : 1,
            dashArray: [3],
            color: 'white'

          }}
          positions={coordinates}
          eventHandlers={
            {
              mouseover: (e)=>{
                const layer = e.target;
                layer.setStyle({
                  
                  fillOpacity : 0.7,
                  weight: 5,
                  opacity : 1,
                  dashArray: "",
                  color: '#666'
                })
              },
              mouseout:(e)=>{
                const layer = e.target;
                layer.setStyle({
                  
                  fillOpacity : 5,
                  weight: 2,
                  opacity : 1,
                  dashArray: [3],
                  color: 'white'
                })
              },
              click: (e)=>{

              }
            }
          }
          />)
        })
      }
    </MapContainer>
  )
}

export default MapTest