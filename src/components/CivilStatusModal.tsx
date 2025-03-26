import React from 'react';
import { X } from 'lucide-react';
import type { Seller } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';

interface CivilStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: Seller[];
}

export function CivilStatusModal({ isOpen, onClose, sellers }: CivilStatusModalProps) {
  if (!isOpen) return null;

  // Générer l'état civil pour chaque vendeur individuellement
  const civilStatuses = sellers.map((seller, index) => {
    return {
      title: `Vendeur ${index + 1}`,
      status: generateCivilStatus([seller])
    };
  });

  // Générer l'état civil commun si plusieurs vendeurs
  const commonCivilStatus = sellers.length > 1 ? generateCivilStatus(sellers) : null;

  // Vérifier si tous les vendeurs ont le même lieu et date de mariage
  const allSameMarriageInfo = sellers.length > 1 && sellers.every(
    (seller, index, arr) =>
      seller.marriageDetails?.place === arr[0].marriageDetails?.place &&
      seller.marriageDetails?.date === arr[0].marriageDetails?.date
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">État Civil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Afficher l'état civil individuel de chaque vendeur */}
          {civilStatuses.map((status, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{status.title}</h3>
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {status.status}
              </pre>
            </div>
          ))}

          {/* Afficher l'état civil commun si les infos sont identiques ou si plusieurs vendeurs */}
          {(allSameMarriageInfo || sellers.length > 1) && commonCivilStatus && (
            <div className="bg-green-50 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-green-900 mb-2">État Civil Commun</h3>
              <pre className="whitespace-pre-wrap font-sans text-sm text-green-700">
                {commonCivilStatus}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
