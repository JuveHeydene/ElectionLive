// components/CountrySelect.tsx
"use client"
import { VotingCenter } from '@/app/Models/User';
import React from 'react';
import Select from 'react-select';



interface VotingCenterProps {
  votingCenters: VotingCenter[];
  onChange: (selectedOption: VotingCenter | null) => void;
  value: VotingCenter | null;
}

const VotingCenterSelect: React.FC<VotingCenterProps> = ({ votingCenters, onChange, value }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={votingCenters}
      getOptionLabel={(e: VotingCenter) => e.label} // Affiche le nom du pays
      getOptionValue={(e: VotingCenter) => e.value} // Utilise la valeur du pays pour la gestion interne
      isClearable // Permet de réinitialiser la sélection
      placeholder="Select voting center..." // Texte affiché quand rien n'est sélectionné
    />
  );
};

export default VotingCenterSelect;
