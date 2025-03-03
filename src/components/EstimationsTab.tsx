import React, { useState } from 'react';
import { Plus, Building2, Home, Calendar, Euro, ArrowRight, FileText, Trash2, Edit, Download } from 'lucide-react';
import type { Estimation, EstimationStatus, Commercial } from '../types';
import { EstimationForm } from './EstimationForm';
import { EstimationReport } from './EstimationReport';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generateEstimationWord } from './EstimationWord';
import { generateEstimationFromTemplate } from './EstimationTemplateGenerator';

interface EstimationsTabProps {
  estimations: Estimation[];
  setEstimations: React.Dispatch<React.SetStateAction<Estimation[]>>;
  onConvertToMandate: (estimation: Estimation) => void;
  commercials: Commercial[];
}

export function EstimationsTab({ estimations, setEstimations, onConvertToMandate, commercials }: EstimationsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState<Estimation | null>(null);
  const [showReport, setShowReport] = useState<string | null>(null);

  const handleAddEstimation = () => {
    setEditingEstimation(null);
    setShowForm(true);
  };

  const handleEditEstimation = (estimation: Estimation) => {
    setEditingEstimation(estimation);
    setShowForm(true);
  };

  const handleSaveEstimation = (estimation: Estimation) => {
    if (editingEstimation) {
      setEstimations(prevEstimations =>
        prevEstimations.map(est =>
          est.id === editingEstimation.id ? estimation : est
        )
      );
    } else {
      setEstimations(prevEstimations => [...prevEstimations, estimation]);
    }
    setShowForm(false);
    setEditingEstimation(null);
  };

  const handleDeleteEstimation = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette estimation ?')) {
      setEstimations(prevEstimations =>
        prevEstimations.filter(est => est.id !== id)
      );
    }
  };

  const handleWordExport = async (estimation: Estimation) => {
    try {
      // Utiliser la nouvelle fonction basée sur le modèle Word
      await generateEstimationFromTemplate(estimation);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Une erreur est survenue lors de la génération du document Word. Veuillez réessayer.');
    }
  };

  const getStatusBadgeClass = (status: EstimationStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EstimationStatus) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'completed':
        return 'Terminée';
      case 'converted':
        return 'Convertie en mandat';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (showForm) {
    return (
      <EstimationForm
        estimation={editingEstimation}
        onSave={handleSaveEstimation}
        onCancel={() => {
          setShowForm(false);
          setEditingEstimation(null);
        }}
        commercials={commercials}
      />
    );
  }

  if (showReport) {
    const estimation = estimations.find(est => est.id === showReport);
    if (!estimation) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Rapport d'estimation</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowReport(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Retour
            </button>
            <PDFDownloadLink
              document={<EstimationReport estimation={estimation} />}
              fileName={`estimation-${estimation.id}.pdf`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
            >
              {({ loading }) => (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {loading ? 'Génération...' : 'Télécharger le PDF'}
                </>
              )}
            </PDFDownloadLink>
            <button
              onClick={() => handleWordExport(estimation)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Générer l'estimation
            </button>
          </div>
        </div>
        <EstimationReport estimation={estimation} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Liste des estimations</h2>
          <button
            onClick={handleAddEstimation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle estimation
          </button>
        </div>

        {estimations.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune estimation</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer une nouvelle estimation.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddEstimation}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvelle estimation
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Bien
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Propriétaire
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date de visite
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Prix estimé
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {estimations.map((estimation) => (
                  <tr key={estimation.id}>
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        {estimation.propertyType === 'house' ? (
                          <Home className="h-5 w-5 text-gray-400 mr-2" />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {estimation.propertyAddress.fullAddress}
                          </div>
                          <div className="text-gray-500">
                            {estimation.surface} m² - {estimation.rooms} pièces
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {estimation.owners && estimation.owners[0] ? (
                        `${estimation.owners[0].firstName} ${estimation.owners[0].lastName}`
                      ) : (
                        'Non renseigné'
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(estimation.visitDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 text-gray-400 mr-2" />
                        {estimation.estimatedPrice.recommended ? 
                          formatPrice(estimation.estimatedPrice.recommended) :
                          `${formatPrice(estimation.estimatedPrice.low)} - ${formatPrice(estimation.estimatedPrice.high)}`
                        }
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(estimation.status)}`}>
                        {getStatusText(estimation.status)}
                      </span>
                    </td>
                    <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        {estimation.status !== 'converted' && (
                          <>
                            <button
                              onClick={() => handleEditEstimation(estimation)}
                              className="text-[#0b8043] hover:text-[#097339]"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEstimation(estimation.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setShowReport(estimation.id)}
                          className="text-[#0b8043] hover:text-[#097339]"
                          title="Voir le rapport"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleWordExport(estimation)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Générer l'estimation"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {estimation.status === 'completed' && (
                          <button
                            onClick={() => onConvertToMandate(estimation)}
                            className="text-[#0b8043] hover:text-[#097339] flex items-center"
                            title="Convertir en mandat"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
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