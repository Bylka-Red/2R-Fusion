import React, { useState, useEffect } from 'react';
import { Plus, Building2, Home, Calendar, ArrowRight, Trash2, Download, LayoutGrid, LayoutList, MapPin, User, FileText, Loader2 } from 'lucide-react';
import type { Estimation, EstimationStatus, Commercial } from '../types';
import { EstimationForm } from './EstimationForm';
import { EstimationReport } from './EstimationReport';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generateEstimationFromTemplate } from './EstimationTemplateGenerator';
import { SearchBar } from './SearchBar';
import { supabase } from '../lib/supabase';
import { ConfirmDialog } from './ConfirmDialog';
import { getEstimation } from '../services/estimationService';

interface EstimationsTabProps {
  estimations: Estimation[];
  setEstimations: React.Dispatch<React.SetStateAction<Estimation[]>>;
  onConvertToMandate: (estimation: Estimation) => void;
  commercials: Commercial[];
}

export function EstimationsTab({
  estimations,
  setEstimations,
  onConvertToMandate,
  commercials
}: EstimationsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEstimation, setEditingEstimation] = useState<Estimation | null>(null);
  const [showReport, setShowReport] = useState<string | null>(null);
  const [filteredEstimations, setFilteredEstimations] = useState<Estimation[]>(estimations);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [estimationToDelete, setEstimationToDelete] = useState<Estimation | null>(null);
  const [estimationToConvert, setEstimationToConvert] = useState<Estimation | null>(null);
  const [dialogType, setDialogType] = useState<'delete' | 'convert' | null>(null);

  useEffect(() => {
    loadEstimations();
  }, []);

  useEffect(() => {
    setFilteredEstimations(estimations);
  }, [estimations]);

  const loadEstimations = async () => {
    try {
      setIsLoading(true);

      const { data: estimationsData, error } = await supabase
        .from('estimations')
        .select('*')
        .order('estimation_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading estimations:', error);
        return;
      }

      const convertedEstimations: Estimation[] = estimationsData.map(dbEstimation => ({
        id: dbEstimation.id,
        createdAt: dbEstimation.created_at,
        status: dbEstimation.status,
        estimationDate: dbEstimation.estimation_date,
        commercial: dbEstimation.commercial || undefined,
        notes: dbEstimation.notes || '',
        owners: [{
          firstName: dbEstimation.owner_first_name || '',
          lastName: dbEstimation.owner_last_name || '',
          address: dbEstimation.owner_address || '',
          phones: [dbEstimation.owner_phone || ''],
          emails: [dbEstimation.owner_email || ''],
          title: dbEstimation.owner_title || 'Mr',
        }],
        propertyAddress: {
          fullAddress: dbEstimation.property_address
        },
        propertyType: dbEstimation.property_type,
        isInCopropriete: dbEstimation.is_in_copropriete,
        surface: dbEstimation.total_surface || 0,
        rooms: dbEstimation.total_rooms || 0,
        bedrooms: dbEstimation.bedrooms || 0,
        condition: dbEstimation.condition || 'good',
        criteria: {
          hasElevator: dbEstimation.has_elevator,
          floorNumber: dbEstimation.floor_number || 0,
          totalFloors: dbEstimation.total_floors || 0,
          heatingType: dbEstimation.heating_type || 'individual',
          heatingEnergy: dbEstimation.heating_energy || 'gas',
          hasCellar: dbEstimation.has_cellar,
          hasParking: dbEstimation.has_parking,
          hasBalcony: dbEstimation.has_balcony,
          hasTerrace: dbEstimation.has_terrace,
          hasGarden: dbEstimation.has_garden,
          exposure: dbEstimation.exposure || 'south',
          livingRoomSurface: dbEstimation.living_room_surface || 0,
          bathrooms: dbEstimation.bathrooms || 0,
          showerRooms: dbEstimation.shower_rooms || 0,
          kitchenType: dbEstimation.kitchen_type || 'open-equipped',
          heatingSystem: dbEstimation.heating_type || 'individual-gas',
          basement: dbEstimation.basement_type || 'none',
          landSurface: dbEstimation.land_surface || 0,
          constructionYear: dbEstimation.construction_year,
          propertyTax: dbEstimation.property_tax || 0,
          hasGas: dbEstimation.has_gas,
          hasGarage: dbEstimation.has_garage,
          hasFireplace: dbEstimation.has_fireplace,
          hasWoodStove: dbEstimation.has_wood_stove,
          hasElectricShutters: dbEstimation.has_electric_shutters,
          hasElectricGate: dbEstimation.has_electric_gate,
          hasConvertibleAttic: dbEstimation.has_convertible_attic,
          chargesCopro: dbEstimation.copro_fees || 0,
          floorLevel: dbEstimation.floor_level || 'Rez-de-chaussée',
        },
        diagnosticInfo: {
          propertyType: dbEstimation.diagnostic_property_type || 'copropriete',
          hasCityGas: dbEstimation.has_city_gas
        },
        features: [
          ...(dbEstimation.strengths || []).map(strength => ({
            type: 'strength' as const,
            description: strength
          })),
          ...(dbEstimation.weaknesses || []).map(weakness => ({
            type: 'weakness' as const,
            description: weakness
          }))
        ],
        comparables: [],
        marketAnalysis: {
          averagePrice: dbEstimation.market_average_price || 0,
          priceRange: {
            min: dbEstimation.market_price_range_min || 0,
            max: dbEstimation.market_price_range_max || 0
          },
          marketTrend: dbEstimation.market_trend || 'stable',
          averageSaleTime: dbEstimation.market_average_sale_time || 0
        },
        estimatedPrice: {
          low: dbEstimation.estimated_price_low || 0,
          high: dbEstimation.estimated_price_high || 0
        },
        pricePerSqm: dbEstimation.price_per_sqm || 0,
        levels: dbEstimation.levels || [{
          name: dbEstimation.floor_level || 'Rez-de-chaussée',
          rooms: [],
          type: 'regular'
        }],
        comments: dbEstimation.comments
      }));

      setEstimations(convertedEstimations);
      setFilteredEstimations(convertedEstimations);
    } catch (error) {
      console.error('Error in loadEstimations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEstimation = () => {
    setEditingEstimation(null);
    setShowForm(true);
  };

  const handleSaveEstimation = async (estimation: Estimation) => {
    try {
      const updatedEstimation = {
        ...estimation,
        status: 'completed' as const
      };

      if (editingEstimation) {
        setEstimations(prevEstimations =>
          prevEstimations.map(est =>
            est.id === editingEstimation.id ? updatedEstimation : est
          )
        );
      } else {
        setEstimations(prevEstimations => [...prevEstimations, updatedEstimation]);
      }

      setShowForm(false);
      setEditingEstimation(null);

      await loadEstimations();
    } catch (error) {
      console.error('Error saving estimation:', error);
    }
  };

  const handleDeleteEstimation = (estimation: Estimation, event: React.MouseEvent) => {
    event.stopPropagation();
    setEstimationToDelete(estimation);
    setDialogType('delete');
    setShowConfirmationDialog(true);
  };

  const confirmDeleteEstimation = async () => {
    if (estimationToDelete) {
      try {
        const { error } = await supabase
          .from('estimations')
          .delete()
          .eq('id', estimationToDelete.id);

        if (error) throw error;

        setEstimations(prevEstimations =>
          prevEstimations.filter(est => est.id !== estimationToDelete.id)
        );
        setFilteredEstimations(prevFiltered =>
          prevFiltered.filter(est => est.id !== estimationToDelete.id)
        );
      } catch (error) {
        console.error('Error deleting estimation:', error);
      } finally {
        setShowConfirmationDialog(false);
        setEstimationToDelete(null);
      }
    }
  };

  const handleConvertToMandate = (estimation: Estimation, event: React.MouseEvent) => {
    event.stopPropagation();
    setEstimationToConvert(estimation);
    setDialogType('convert');
    setShowConfirmationDialog(true);
  };

  const confirmConvertToMandate = () => {
    if (estimationToConvert) {
      onConvertToMandate(estimationToConvert);
      setShowConfirmationDialog(false);
      setEstimationToConvert(null);
    }
  };

  const handleWordExport = async (estimation: Estimation, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      const fullEstimation = await getEstimation(estimation.id);
      if (fullEstimation) {
        await generateEstimationFromTemplate(fullEstimation);
      } else {
        throw new Error('Estimation not found');
      }
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Une erreur est survenue lors de la génération du document Word. Veuillez réessayer.');
    }
  };

  const handleViewReport = (estimation: Estimation) => {
    setEditingEstimation(estimation);
    setShowForm(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedEstimations = () => {
    const { key, direction } = sortConfig;
    if (!key) return filteredEstimations;

    return [...filteredEstimations].sort((a, b) => {
      if (key === 'owners') {
        return direction === 'ascending'
          ? a.owners[0].lastName.localeCompare(b.owners[0].lastName)
          : b.owners[0].lastName.localeCompare(a.owners[0].lastName);
      }
      if (key === 'estimationDate') {
        const dateA = new Date(a.estimationDate).getTime();
        const dateB = new Date(b.estimationDate).getTime();
        const createdAtA = new Date(a.createdAt).getTime();
        const createdAtB = new Date(b.createdAt).getTime();
        
        if (dateA === dateB) {
          return direction === 'ascending'
            ? createdAtA - createdAtB
            : createdAtB - createdAtA;
        }
        return direction === 'ascending'
          ? dateA - dateB
          : dateB - dateA;
      }
      if (key === 'propertyType') {
        return direction === 'ascending'
          ? a.propertyType.localeCompare(b.propertyType)
          : b.propertyType.localeCompare(a.propertyType);
      }
      if (key === 'estimatedPrice') {
        return direction === 'ascending'
          ? a.estimatedPrice.low - b.estimatedPrice.low
          : b.estimatedPrice.low - a.estimatedPrice.low;
      }
      if (key === 'commercial') {
        return direction === 'ascending'
          ? (a.commercial || '').localeCompare(b.commercial || '')
          : (b.commercial || '').localeCompare(a.commercial || '');
      }
      return 0;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#0b8043] animate-spin" />
      </div>
    );
  }

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
              <Download className="h-5 w-5 mr-2" />
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
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Liste des estimations</h2>
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#0b8043] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vue liste"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#0b8043] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleAddEstimation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle estimation
          </button>
        </div>

        <div className="mb-6">
          <SearchBar
            estimations={estimations}
            onSearch={setFilteredEstimations}
          />
        </div>

        {filteredEstimations.length === 0 ? (
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
        ) : viewMode === 'list' ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6 cursor-pointer"
                    onClick={() => requestSort('owners')}
                  >
                    Propriétaire {sortConfig.key === 'owners' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-3.5 text-center text-sm font-bold text-gray-900">
                    Adresse du bien estimé
                  </th>
                  <th
                    className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('propertyType')}
                  >
                    Type de bien {sortConfig.key === 'propertyType' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('estimatedPrice')}
                  >
                    Prix estimé {sortConfig.key === 'estimatedPrice' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('commercial')}
                  >
                    Commercial {sortConfig.key === 'commercial' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 cursor-pointer"
                    onClick={() => requestSort('estimationDate')}
                  >
                    Date de l'estimation {sortConfig.key === 'estimationDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0 w-24">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedEstimations().map((estimation) => (
                  <tr
                    key={estimation.id}
                    onClick={() => handleViewReport(estimation)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {estimation.owners && estimation.owners[0] ? (
                        <div className="truncate max-w-[185px]">
                          <strong>{estimation.owners[0].firstName} {estimation.owners[0].lastName}</strong>
                        </div>
                      ) : (
                        'Non renseigné'
                      )}
                    </td>
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        {estimation.propertyType === 'house' ? (
                          <Home className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0" />
                        ) : (
                          <Building2 className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-gray-900 truncate max-w-[285px]">
                            {estimation.propertyAddress.fullAddress}
                          </div>
                          <div className="text-gray-500">
                            {estimation.surface} m² - {estimation.rooms} pièces
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        estimation.propertyType === 'house'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {estimation.propertyType === 'house' ? 'Maison' : 'Appartement'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center">
                          <strong>{formatPrice(estimation.estimatedPrice.low)}</strong>
                        </div>
                        <div className="flex items-center">
                          <strong>{formatPrice(estimation.estimatedPrice.high)}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {estimation.commercial}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(estimation.estimationDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordExport(estimation, e);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Générer l'estimation"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {estimation.status !== 'converted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEstimation(estimation, e);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToMandate(estimation, e);
                          }}
                          className="text-[#0b8043] hover:text-[#097339]"
                          title="Convertir en mandat"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedEstimations().map((estimation) => (
              <div
                key={estimation.id}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group cursor-pointer"
                onClick={() => handleViewReport(estimation)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className={`p-2 ${
                        estimation.propertyType === 'house'
                          ? 'bg-orange-50 group-hover:bg-orange-100'
                          : 'bg-blue-50 group-hover:bg-blue-100'
                        } rounded-lg transition-colors duration-200 flex-shrink-0`}
                      >
                        {estimation.propertyType === 'house' ? (
                          <Home className="h-6 w-6 text-orange-600" />
                        ) : (
                          <Building2 className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
                          {estimation.owners[0]?.firstName} {estimation.owners[0]?.lastName}
                        </h3>
                        <div className="flex items-center mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            estimation.propertyType === 'house'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {estimation.propertyType === 'house' ? 'Maison' : 'Appartement'}
                          </span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {estimation.rooms} pièces
                          </span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {estimation.surface} m²
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{estimation.propertyAddress.fullAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{estimation.commercial}</span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(estimation.estimationDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(estimation.estimatedPrice.low)} {formatPrice(estimation.estimatedPrice.high)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordExport(estimation, e);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Générer l'estimation"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        {estimation.status !== 'converted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEstimation(estimation, e);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToMandate(estimation, e);
                          }}
                          className="text-[#0b8043] hover:text-[#097339]"
                          title="Convertir en mandat"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showConfirmationDialog && (
        <ConfirmDialog
          isOpen={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          onConfirm={dialogType === 'delete' ? confirmDeleteEstimation : confirmConvertToMandate}
          title={
            dialogType === 'delete'
              ? `Êtes-vous sûr de vouloir supprimer définitivement l'estimation de ${estimationToDelete?.owners[0].lastName} ?`
              : `Êtes-vous sûr de vouloir convertir l'estimation de ${estimationToConvert?.owners[0].lastName} en mandat ?`
          }
          type={dialogType}
        />
      )}
    </div>
  );
}