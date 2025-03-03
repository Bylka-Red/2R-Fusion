import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Country {
  name: {
    common: string;
    nativeName: {
      [key: string]: {
        common: string;
      };
    };
  };
  translations: {
    fra: {
      common: string;
    };
  };
  demonyms: {
    fra: {
      f: string;
    };
  };
}

interface NationalitySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function NationalitySelect({ value, onChange }: NationalitySelectProps) {
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,demonyms');
        const countries: Country[] = await response.json();
        
        // Create a Set to ensure uniqueness
        const nationalitySet = new Set<string>();
        
        countries.forEach(country => {
          // Try to get the French demonym (nationality) first
          if (country.demonyms?.fra?.f) {
            nationalitySet.add(country.demonyms.fra.f);
          } else {
            // If no demonym, use the French country name
            nationalitySet.add(country.translations.fra.common);
          }
        });

        // Convert Set to array and sort
        let nationalityList = Array.from(nationalitySet)
          .sort((a, b) => a.localeCompare(b, 'fr'));

        // Ensure "Française" is always first
        const index = nationalityList.findIndex(n => n.toLowerCase() === 'française');
        if (index !== -1) {
          nationalityList.splice(index, 1);
        }
        nationalityList.unshift('Française');

        setNationalities(nationalityList);
        setIsLoading(false);

        // Set default value to "Française" if no value is provided
        if (!value) {
          onChange('Française');
        }
      } catch (error) {
        console.error('Error fetching nationalities:', error);
        setIsLoading(false);
      }
    };

    fetchNationalities();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Chargement des nationalités...</span>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 block w-full rounded-md border-0 px-2.5 py-1.5 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0b8043] text-sm"
    >
      {nationalities.map((nationality) => (
        <option key={nationality} value={nationality}>
          {nationality}
        </option>
      ))}
    </select>
  );
}