// components/CountrySelect.tsx
"use client"
import { VotingOffice } from '@/app/Models/User';
import React from 'react';
import Select from 'react-select';



interface VotingOfficeProps {
  votingOffices: VotingOffice[];
  onChange: (selectedOption: VotingOffice | null) => void;
  value: VotingOffice | null;
}

const VotingOfficeSelect: React.FC<VotingOfficeProps> = ({ votingOffices, onChange, value }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={votingOffices}
      getOptionLabel={(e: VotingOffice) => e.label} // Affiche le nom du pays
      getOptionValue={(e: VotingOffice) => e.value} // Utilise la valeur du pays pour la gestion interne
      isClearable // Permet de réinitialiser la sélection
      placeholder="Select voting office..." // Texte affiché quand rien n'est sélectionné
    />
  );
};

export default VotingOfficeSelect;
