import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SellerForm } from './SellerForm';
import type { Seller } from '../types';

interface SellersTabProps {
  sellers: Seller[];
  onSellerChange: (index: number, seller: Seller) => void;
  onAddSeller: () => void;
  onRemoveSeller: (index: number) => void;
  onPropertyTypeChange: (type: 'personal-not-family' | 'personal-family') => void;
  propertyFamilyType: 'personal-not-family' | 'personal-family';
}

export function SellersTab({
  sellers,
  onSellerChange,
  onAddSeller,
  onRemoveSeller,
  onPropertyTypeChange,
  propertyFamilyType
}: SellersTabProps) {
  useEffect(() => {
    console.log("SellersTab received sellers:", sellers);
  }, [sellers]);

  const handleCoupleChange = (isCouple: boolean) => {
    console.log(`Couple status changed to: ${isCouple}`);
    if (sellers.length >= 2) {
      const updatedSeller2 = { ...sellers[1] };

      if (isCouple) {
        updatedSeller2.maritalStatus = sellers[0].maritalStatus;
        updatedSeller2.marriageDetails = { ...sellers[0].marriageDetails };
        updatedSeller2.pacsDetails = sellers[0].pacsDetails ? { ...sellers[0].pacsDetails } : undefined;
        updatedSeller2.divorceDetails = sellers[0].divorceDetails ? { ...sellers[0].divorceDetails } : undefined;
        updatedSeller2.widowDetails = sellers[0].widowDetails ? { ...sellers[0].widowDetails } : undefined;
        updatedSeller2.couple = { isCouple: true, partnerId: 0 };

        const updatedSeller1 = {
          ...sellers[0],
          couple: { isCouple: true, partnerId: 1 }
        };
        onSellerChange(0, updatedSeller1);
      } else {
        updatedSeller2.couple = undefined;
        const updatedSeller1 = {
          ...sellers[0],
          couple: undefined
        };
        onSellerChange(0, updatedSeller1);
      }

      onSellerChange(1, updatedSeller2);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Informations des vendeurs</h2>
        <button
          onClick={onAddSeller}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un vendeur
        </button>
      </div>

      <div className={`grid gap-8 ${sellers.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {sellers.map((seller, index) => (
         <SellerForm
  key={index}
  seller={seller}
  onChange={(updatedSeller) => {
    console.log(`Updating seller ${index}:`, updatedSeller);
    onSellerChange(index, updatedSeller);

    if (index === 0 && seller.couple?.isCouple && sellers.length >= 2) {
      const updatedSeller2 = { ...sellers[1] };
      updatedSeller2.maritalStatus = updatedSeller.maritalStatus;
      updatedSeller2.marriageDetails = { ...updatedSeller.marriageDetails };
      updatedSeller2.pacsDetails = updatedSeller.pacsDetails ? { ...updatedSeller.pacsDetails } : undefined;
      updatedSeller2.divorceDetails = updatedSeller.divorceDetails ? { ...updatedSeller.divorceDetails } : undefined;
      updatedSeller2.widowDetails = updatedSeller.widowDetails ? { ...updatedSeller.widowDetails } : undefined;
      onSellerChange(1, updatedSeller2);
    }
  }}
  onRemove={() => onRemoveSeller(index)}
  canRemove={sellers.length > 1}
  index={index}
  previousSeller={index > 0 ? sellers[index - 1] : undefined}
  onPropertyTypeChange={onPropertyTypeChange}
  propertyFamilyType={propertyFamilyType}
  totalSellers={sellers.length}
  onCoupleChange={index === 1 ? handleCoupleChange : undefined}
/>

        ))}
      </div>
    </div>
  );
}
