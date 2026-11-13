"use client"
import ApiServices from '@/app/components/services/ApiServices';
import React,{useState, useEffect} from 'react'
type Region = {
    id: string;
    name: string;
  };
const page = () => {
    const [regions, setRegions]= useState<Region[]>([])
    useEffect(() => {
        const fetchAllRegion = async ()=>{
            const response = await ApiServices.fetchRegionsAndDepartments()
            if (response.regions) {
                setRegions(response.regions)
            }
           
        }
        fetchAllRegion()
        
    }, []);
    
  return (
    <div className='dashboard'>
        {
            regions.map((region)=>(
                <div className="folder" key={region.id}>
                    <i className="material-icons" style={{fontSize:'50px' , color:'#1a4dfa'}}>folder_open</i>
                </div>
            ))
        }
        

    </div>
  )
}

export default page