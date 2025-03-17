import React, { useEffect, useState } from 'react';
import { Building2, Calendar, Euro, Edit, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Mandate } from '../types';
import { getMandates, deleteMandate } from '../services/mandateService';

interface MandatesListProps {
  mandates: Mandate[];
  onMandateSelect: (mandate: Mandate) => void;
  onCreateMandate: () => void;
  onDeleteMandate: (mandate_number: string) => void;
}

export function MandatesList({ 
  mandates: propMandates, 
  onMandateSelect, 
  onCreateMandate,
  onDeleteMandate 
}: MandatesListProps) {
  const [mandates, setMandates] = useState<Mandate[]>(propMandates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMandates();
  }, []);

  const loadMandates = async () => {
    try {
      setIsLoading(true);
      const data = await getMandates();
      setMandates(data);
      setError(null);
    } catch (err) {
      console.error('Error loading mandates:', err);
      setError('Une erreur est survenue lors du chargement des mandats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMandate = async (mandate_number: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mandat ?')) {
      try {
        await deleteMandate(mandate_number);
        onDeleteMandate(mandate_number);
        await loadMandates(); // Recharger la liste après suppression
      } catch (err) {
        console.error('Error deleting mandate:', err);
        setError('Une erreur est survenue lors de la suppression du mandat');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#0b8043] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Liste des mandats</h2>
          <button
            onClick={onCreateMandate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau mandat
          </button>
        </div>

        {mandates.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun mandat</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau mandat.
            </p>
            <div className="mt-6">
              <button
                onClick={onCreateMandate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouveau mandat
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Vendeur
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Adresse du bien
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Prix Net Vendeur
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Commercial
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mandates.map((mandate) => (
                  <tr key={mandate.mandate_number}>
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">
                        {mandate.sellers[0]?.firstName} {mandate.sellers[0]?.lastName}
                      </div>
                      {mandate.sellers[0]?.phone && (
                        <div className="text-gray-500">{mandate.sellers[0].phone}</div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-gray-900">
                            {mandate.propertyAddress.fullAddress}
                          </div>
                          <div className="text-gray-500">
                            {mandate.surface} m² - {mandate.rooms} pièces
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {mandate.type === 'exclusive' && 'Exclusif'}
                      {mandate.type === 'simple' && 'Simple'}
                      {mandate.type === 'semi-exclusive' && 'Semi-exclusif'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 text-gray-400 mr-2" />
                        {formatPrice(mandate.netPrice)}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {mandate.commercial}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(mandate.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onMandateSelect(mandate)}
                          className="text-[#0b8043] hover:text-[#097339]"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMandate(mandate.mandate_number)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
