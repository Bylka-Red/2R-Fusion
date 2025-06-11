import React, { useState, useEffect } from 'react';
import { ChevronRight, User, Download, Key, Euro, History, Plus, Calendar, FileText, Save, Loader2 } from 'lucide-react';
import type { Mandate, Seller, PriceAmendment, PropertyAddress, PropertyLot, CadastralSection, Commercial } from '../types';
import { generateMandateFromTemplate } from './MandateTemplateGenerator';
import { saveMandate } from '../services/mandateService';
import { CivilStatusModal } from './CivilStatusModal';
import { AddressAutocomplete } from './AddressAutocomplete';

interface MandateTabProps {
  mandate: Mandate;
  onMandateChange: (field: keyof Mandate | 'feesTTC' | 'keys', value: any) => void;
  sellers: Seller[];
  showAmendmentModal: boolean;
  setShowAmendmentModal: (show: boolean) => void;
  propertyAddress: PropertyAddress;
  propertyType: 'monopropriete' | 'copropriete';
  coPropertyAddress: PropertyAddress;
  lots: PropertyLot[];
  officialDesignation: string;
  cadastralSections: CadastralSection[];
  occupationStatus: 'occupied-by-seller' | 'vacant' | 'rented';
  dpeStatus: 'completed' | 'in-progress' | 'not-required';
  commercials: Commercial[];
}

export function MandateTab({
  mandate,
  onMandateChange,
  sellers,
  showAmendmentModal,
  setShowAmendmentModal,
  propertyAddress,
  propertyType,
  coPropertyAddress,
  lots,
  officialDesignation,
  cadastralSections,
  occupationStatus,
  dpeStatus,
  commercials
}: MandateTabProps) {
  const [showAmendmentHistory, setShowAmendmentHistory] = useState(false);
  const [showCivilStatus, setShowCivilStatus] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasSellers = sellers.length > 0;
  const fees = mandate.fees || { ttc: 0, ht: 0 };
  const keys = mandate.keys || { hasKeys: false, receivedDate: '', returnedDate: '', details: '' };
  const netPrice = typeof mandate.netPrice === 'number' ? mandate.netPrice : 0;
  const feesTTC = typeof fees.ttc === 'number' ? fees.ttc : 0;
  const totalPriceHAI = netPrice + feesTTC;

  useEffect(() => {
    if (cadastralSections.length === 0) {
      onMandateChange('cadastralSections', [{
        section: '',
        number: '',
        lieuDit: '',
        surface: ''
      }]);
    }
  }, []);

  useEffect(() => {
    console.log("MandateTab received updated props:", {
      netPrice: mandate.netPrice,
      fees: mandate.fees,
      totalPriceHAI
    });
  }, [mandate.netPrice, mandate.fees, totalPriceHAI]);

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString('fr-FR');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleWordDownload = async () => {
    try {
      await generateMandateFromTemplate(mandate);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Une erreur est survenue lors de la génération du document Word. Veuillez réessayer.');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      if (!sellers || sellers.length === 0) {
        throw new Error('Au moins un vendeur est requis');
      }

      const mandateToSave: Mandate = {
        ...mandate,
        sellers,
        propertyAddress,
        propertyType,
        isInCopropriete: propertyType === 'copropriete',
        coPropertyAddress,
        lots,
        officialDesignation,
        cadastralSections,
        occupationStatus: mandate.occupationStatus,
        dpeStatus: mandate.dpeStatus,
      };

      console.log('Saving mandate with data:', mandateToSave);

      const savedMandate = await saveMandate(mandateToSave);

      if (savedMandate) {
        console.log('Mandate saved successfully:', savedMandate);
        setSaveSuccess(true);

        onMandateChange('netPrice', savedMandate.net_price);
        onMandateChange('fees', {
          ttc: savedMandate.fees_ttc,
          ht: savedMandate.fees_ht
        });

        const totalPriceHAI = savedMandate.net_price + savedMandate.fees_ttc;
        console.log('Updated total price HAI:', totalPriceHAI);
      }
    } catch (error) {
      console.error('Error saving mandate:', error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Informations du mandat</h2>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043] ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {isSaving ? 'Enregistrement...' : 'Enregistrer le mandat'}
          </button>
        </div>

        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Le mandat a été enregistré avec succès.
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block">
              <span>Date du mandat</span>
              <input
                type="date"
                value={mandate.date}
                onChange={(e) => onMandateChange('date', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label className="block">
              <span>Numéro du mandat</span>
              <input
                type="text"
                value={mandate.mandate_number}
                onChange={(e) => onMandateChange('mandate_number', e.target.value)}
                placeholder="Ex: 2024-001"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block">
              <span>Type de mandat</span>
              <select
                value={mandate.type}
                onChange={(e) => onMandateChange('type', e.target.value)}
              >
                <option value="exclusive">Exclusif</option>
                <option value="simple">Simple</option>
                <option value="semi-exclusive">Semi-exclusif</option>
              </select>
            </label>
          </div>
          <div>
            <label className="block">
              <span>Commercial</span>
              <select
                value={mandate.commercial}
                onChange={(e) => onMandateChange('commercial', e.target.value)}
              >
                {commercials.map((commercial) => (
                  <option key={commercial.id} value={commercial.firstName}>
                    {commercial.firstName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Prix et honoraires</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block">
                <span>Prix net vendeur</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPrice(mandate.netPrice)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                      console.log('Setting net price to:', value);
                      onMandateChange('netPrice', value);
                    }}
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label className="block">
                <span>Honoraires TTC</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPrice(fees.ttc)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                      console.log('Setting fees TTC to:', value);
                      onMandateChange('feesTTC', value);
                    }}
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label className="block">
                <span>Prix Frais d'Agence Inclus</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPrice(totalPriceHAI)}
                    disabled
                    className="bg-gray-100 cursor-not-allowed pr-10"
                    title="Ce champ est calculé automatiquement"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Euro className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block">
              <span>Honoraires à la charge</span>
              <select
                value={mandate.feesPayer}
                onChange={(e) => onMandateChange('feesPayer', e.target.value)}
              >
                <option value="seller">Vendeur</option>
                <option value="buyer">Acquéreur</option>
              </select>
            </label>
          </div>
        </div>

        {(propertyType === 'copropriete' || (propertyType === 'monopropriete' && mandate.isInCopropriete)) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adresse officielle de la copropriété
            </h3>
            <div className="space-y-4">
              <label>
                <span>Adresse complète</span>
                <AddressAutocomplete
                  value={coPropertyAddress.fullAddress}
                  onChange={({ label }) => onMandateChange('coPropertyAddress', { fullAddress: label })}
                  placeholder="Saisissez l'adresse de la copropriété"
                />
              </label>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lots de copropriété</h3>
                {lots.length < 10 && (
                  <button
                    onClick={() => {
                      const newLots = [...lots, {
                        number: '',
                        description: '',
                        tantiemes: [{
                          numerator: '',
                          denominator: '10000',
                          type: 'general'
                        }]
                      }];
                      onMandateChange('lots', newLots);
                    }}
                    className="text-[#0b8043] hover:text-[#097339] flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un lot
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {propertyType === 'monopropriete' && !mandate.isInCopropriete && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Désignation du bien
            </h3>
            <div className="space-y-4">
              <label>
                <span>Description officielle</span>
                <textarea
                  value={officialDesignation}
                  onChange={(e) => onMandateChange('officialDesignation', e.target.value)}
                  rows={4}
                  className="w-full"
                  placeholder="Saisissez la désignation officielle du bien..."
                />
              </label>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Gestion des clés</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keys.hasKeys}
                onChange={(e) => onMandateChange('keys', {
                  ...keys,
                  hasKeys: e.target.checked
                })}
                className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
              />
              <span className="text-sm font-medium text-gray-700">Clés en agence</span>
            </label>

            {keys.hasKeys && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span>Date de remise des clés</span>
                    <input
                      type="date"
                      value={keys.receivedDate || ''}
                      onChange={(e) => onMandateChange('keys', {
                        ...keys,
                        receivedDate: e.target.value
                      })}
                    />
                  </label>
                  <label className="block">
                    <span>Date de restitution</span>
                    <input
                      type="date"
                      value={keys.returnedDate || ''}
                      onChange={(e) => onMandateChange('keys', {
                        ...keys,
                        returnedDate: e.target.value
                      })}
                    />
                  </label>
                </div>
                <label className="block">
                  <span>Détail des clés</span>
                  <textarea
                    value={keys.details}
                    onChange={(e) => onMandateChange('keys', {
                      ...keys,
                      details: e.target.value
                    })}
                    placeholder="Ex: 2 clés porte d'entrée, 1 clé boîte aux lettres..."
                    rows={3}
                    className="mt-1.5 block w-full rounded-md border-0 px-2.5 py-1.5 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0b8043] text-sm"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setShowAmendmentHistory(true)}
              className="inline-flex items-center px-4 py-2 border border-[#0b8043] text-sm font-medium rounded-md text-[#0b8043] hover:bg-green-50"
            >
              <History className="h-4 w-4 mr-2" />
              Historique des avenants
            </button>
            <button
              onClick={() => setShowAmendmentModal(true)}
              className="inline-flex items-center px-4 py-2 border border-[#0b8043] text-sm font-medium rounded-md text-[#0b8043] hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un avenant
            </button>
            <button
              onClick={() => setShowCivilStatus(true)}
              className="inline-flex items-center px-4 py-2 border border-[#0b8043] text-sm font-medium rounded-md text-[#0b8043] hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              État Civil
            </button>
          </div>
          {hasSellers ? (
            <div className="flex gap-4">
              <button
                onClick={handleWordDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Télécharger en Word
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
              disabled
              title="Veuillez ajouter au moins un vendeur"
            >
              <Download className="h-5 w-5 mr-2" />
              Télécharger le mandat
            </button>
          )}
        </div>
      </div>

      {showAmendmentHistory && mandate.amendments && mandate.amendments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historique des avenants</h3>
              <button
                onClick={() => setShowAmendmentHistory(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {mandate.amendments.map((amendment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{formatDate(amendment.date)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <span className="text-sm text-gray-500">Prix net vendeur</span>
                      <p className="font-medium">{formatPrice(amendment.netPrice)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Honoraires TTC</span>
                      <p className="font-medium">{formatPrice(amendment.fees.ttc)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Honoraires HT</span>
                      <p className="font-medium">{formatPrice(amendment.fees.ht)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAmendmentHistory(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <CivilStatusModal
        isOpen={showCivilStatus}
        onClose={() => setShowCivilStatus(false)}
        sellers={sellers}
      />

      {pdfError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {pdfError}
          <button
            onClick={() => setPdfError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}