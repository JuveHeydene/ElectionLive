// components/VotingCentersTable.tsx
"use client"
import React, { useState } from 'react';

interface VotingCenter {
  center_name: string;
  departement_name: string;
  actif: 'ACTIVE' | 'NON ACTIVE';
}

interface VotingCentersTableProps {
  votingCenters: VotingCenter[];
}

const VotingCentersTable: React.FC<VotingCentersTableProps> = ({ votingCenters }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Calculer les données à afficher sur la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = votingCenters.slice(indexOfFirstItem, indexOfLastItem);

  // Nombre total de pages
  const totalPages = Math.ceil(votingCenters.length / itemsPerPage);

  // Fonction pour changer de page
  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ padding: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Center Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Department Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actif</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((center, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{center.center_name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{center.departement_name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{center.actif}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => changePage(index + 1)}
            style={{
              padding: '10px',
              margin: '5px',
              backgroundColor: currentPage === index + 1 ? '#007bff' : '#f1f1f1',
              color: currentPage === index + 1 ? 'white' : 'black',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingCentersTable;
