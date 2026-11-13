// components/CountrySelect.tsx
"use client"
import { ArrondissmentOptions } from '@/app/Models/User';
import React from 'react';
import Select from 'react-select';



interface ArrondissementProps {
  arrondissments: ArrondissmentOptions[];
  onChange: (selectedOption: ArrondissmentOptions | null) => void;
  value: ArrondissmentOptions | null;
}

const ArrondissmentSelect: React.FC<ArrondissementProps> = ({ arrondissments, onChange, value }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={arrondissments}
      getOptionLabel={(e: ArrondissmentOptions) => e.label} // Affiche le nom du pays
      getOptionValue={(e: ArrondissmentOptions) => e.value} // Utilise la valeur du pays pour la gestion interne
      isClearable // Permet de réinitialiser la sélection
      placeholder="Select arrondissment..." // Texte affiché quand rien n'est sélectionné
    />
  );
};

export default ArrondissmentSelect;
