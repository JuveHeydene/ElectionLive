"use client"
// import React, { useState } from 'react'
// interface Officeinfo {
//     id: number;
//     name: string;
//     center: string;
//   }

// const OfficeList = () => {
//     const [office, setoffice] = useState<Officeinfo[]>([
//         { id: 1, name: "Bureau-A", center: "center-A" },
//         { id: 2, name: "Bureau-B", center: "center-B" },
//         { id: 3, name: "Bureau-C", center: "center-C" },
//       ]);
//       const [isEditing, setIsEditing] = useState(false);
//       const [formData, setFormData] = useState<Officeinfo>({
//           id: 0,
//           name: "",
//           center: "",
//         });
//       const handleEdit = (office: { id: number; name: string; center: string }) => {
//         setIsEditing(true);
//         setFormData(office);
//       };
//       const [isModalOpen, setIsModalOpen] = useState(false);
//       const handleInputChange = (
//           e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//         ) => {
//           e.preventDefault();
//           const { name, value } = e.target;
//           setFormData({
//             ...formData,
//             [name]: value,
//           });
//         };
//         const untoggleForm = () => {
//             setIsModalOpen(false); // Toggle the form invisibility
//           };
        
//       const toggleModal = () => {
//         setIsModalOpen(true); // Toggle the form visibility
//       };
//       const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
//           e.preventDefault();
      
//           try {
//             console.log("Values of office edition ", formData);
//             const response = await fetch("http://localhost:3000/office/eedition", {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 "Access-Control-Allow-Origin": "*",
//               },
//               body: JSON.stringify(formData),
//             });
      
//             console.log("Values of office edition ", formData);
//             if (response.ok) {
//               alert("office edited s successfully!");
//               // Refetch the office data to update the list
//               const fetchResponse = await fetch(
//                 `http://localhost:3000/office/getoffice?officeid=${formData.id}`,
//                 {
//                   method: "GET",
//                   headers: {
//                     "Content-Type": "application/json",
//                     Accept: "application/json",
//                     "Access-Control-Allow-Origin": "*",
//                   },
//                 }
//               );
      
//               if (fetchResponse.ok) {
//                 const updatedData: Officeinfo[] = await fetchResponse.json();
//                 setoffice(updatedData);
//               } else {
//                 console.error(
//                   "Error fetching updated floors:",
//                   fetchResponse.statusText
//                 );
//               }
//             } else {
//               console.error("Error creating Floor:", response.statusText);
//             }
//           } catch (error) {
//             console.error("Error creating Floor:", error);
//           }
      
//           setIsEditing(false);
//           setFormData({ id: 0, name: "", center: "" });
//         };
//         const handleDelete = async (id: number) => {
//             try {
//               const response = await fetch(`http://localhost:3000/office/delete/${id}`, {
//                 method: "DELETE",
//               });
        
//               if (response.ok) {
//                 setoffice(office.filter((a) => a.id !== id));
//               } else {
//                 console.error("Failed to delete office");
//               }
//             } catch (error) {
//               console.error("Error deleting office:", error);
//             }
//           };
//   return (
//     <div className=" bg-gray-100 flex  p-6 w-full">
//         <div className="bg-white shadow-md rounded-md p-6 w-full max-w-2xl">
//             <h1 className="text-2xl font-bold mb-4">List of office</h1>

//             <table className="w-full text-left border-collapse">
//             <thead>
//                 <tr>
//                 <th className="border-b p-3">Name</th>
//                 <th className="border-b p-3">center</th>
//                 <th className="border-b p-3">Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {office.map((office) => (
//                 <tr key={office.id}>
//                     <td className="p-3">{office.name}</td>
//                     <td className="p-3">{office.center}</td>
//                     <td className="p-3">
//                     <button
//                         className="text-blue-500 hover:underline mr-4"
//                         onClick={() => handleEdit(office)}
//                     >
//                         Edit
//                     </button>
//                     <button
//                         className="text-red-500 hover:underline"
//                         onClick={() => toggleModal()}
//                     >
//                         Delete
//                     </button>
//                     </td>
//                 </tr>
//                 ))}
//             </tbody>
//             </table>

//             {isEditing && (
//             <div className="mt-6">
//                 <h2 className="text-lg font-bold mb-2">Edit office</h2>

//                 <form onSubmit={handleSave}>
//                 <div className="flex flex-col gap-4">
//                     <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     placeholder="Name"
//                     className="border p-2 rounded-md"
//                     />
//                     <select
//                     name="center"
//                     value={formData.center}
//                     onChange={handleInputChange}
//                     className="border p-2 rounded-md"
//                     >
//                     <option value="Admin">Admin</option>
//                     <option value="Moderator">Moderator</option>
//                     <option value="office">office</option>
//                     </select>
//                     <button
//                     type="submit"
//                     className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
//                     >
//                     Save
//                     </button>
//                 </div>
//                 </form>
//             </div>
//             )}

//             {/* Modal */}
//             {isModalOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-office justify-office">
//                 <div className="bg-custom-bluewhite text-blue-950 rounded-lg shadow-md p-6 max-w-2xl w-full relative">
//                 <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
//                 <p className="mb-4">
//                     Are you sure you want to delete this office? This action
//                     cannot be undone.
//                 </p>
//                 <div className="flex justify-end gap-4">
//                     <button
//                     onClick={untoggleForm}
//                     className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
//                     >
//                     No
//                     </button>
//                     <button
//                     onClick={() => handleDelete(formData.id)}
//                     className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
//                     >
//                     Yes
//                     </button>
//                 </div>
//                 </div>
//             </div>
//             )}
//         </div>
//     </div>
//         )}


// export default OfficeList

import VotingOffices from "@/app/components/Voting_Offices/VotingOffice";

const HomePage: React.FC = () => {
  return (
    <div>
      <VotingOffices />
    </div>
  );
};

export default HomePage;