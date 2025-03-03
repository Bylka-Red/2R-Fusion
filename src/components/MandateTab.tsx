import React, { useState, useEffect } from 'react';
import { ChevronRight, User, Download, Key, Euro, History, Plus, Calendar, FileText } from 'lucide-react';
import type { Mandate, Seller, PriceAmendment, PropertyAddress, PropertyLot, CadastralSection, Commercial } from '../types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MandatePDF } from './MandatePDF';
import { KeyReceiptPDF } from './KeyReceiptPDF';
import { PriceAmendmentPDF } from './PriceAmendmentPDF';
import { generateMandateWord } from './MandateWord';

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
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [mandatePdfKey, setMandatePdfKey] = useState(0);
  const [keyReceiptPdfKey, setKeyReceiptPdfKey] = useState(0);

  const hasSellers = sellers.length > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderPDFDownloadLink = (
    document: React.ReactElement,
    fileName: string,
    buttonText: string,
    loadingText: string,
    className: string,
    pdfKey: number
  ) => {
    return (
      <PDFDownloadLink
        key={pdfKey}
        document={document}
        fileName={fileName}
        className={className}
        onError={(error) => {
          console.error('PDF generation error:', error);
          setPdfError('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
        }}
      >
        {({ loading }) => (
          <>
            <Download className="h-5 w-5 mr-2" />
            {loading ? loadingText : buttonText}
          </>
        )}
      </PDFDownloadLink>
    );
  };

  const handleWordDownload = async () => {
    try {
      await generateMandateWord({
        mandate,
        sellers,
        propertyAddress,
        propertyType,
        coPropertyAddress,
        lots,
        officialDesignation,
        cadastralSections,
        occupationStatus,
        dpeStatus,
      });
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Une erreur est survenue lors de la génération du document Word. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Informations du mandat</h2>
        
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
                value={mandate.mandateNumber}
                onChange={(e) => onMandateChange('mandateNumber', e.target.value)}
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
                    value={mandate.netPrice ? mandate.netPrice.toLocaleString('fr-FR') : '0'}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
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
                    value={mandate.fees.ttc ? mandate.fees.ttc.toLocaleString('fr-FR') : '0'}
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
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
                <span>Honoraires HT</span>
                <div className="relative">
                  <input
                    type="text"
                    value={mandate.fees.ht ? mandate.fees.ht.toLocaleString('fr-FR') : '0'}
                    disabled
                    className="bg-gray-100 pr-10"
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

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Gestion des clés</h3>
            <div className="flex gap-2">
              {mandate.keys.hasKeys && (
                <>
                  {renderPDFDownloadLink(
                    <KeyReceiptPDF mandate={mandate} seller={sellers[0]} type="reception" />,
                    `recu-cles-${mandate.mandateNumber}.pdf`,
                    'Reçu de remise',
                    'Génération...',
                    'inline-flex items-center px-3 py-2 text-sm font-medium text-[#0b8043] hover:text-[#097339] border border-[#0b8043] rounded-md',
                    keyReceiptPdfKey
                  )}
                  {mandate.keys.returnedDate && renderPDFDownloadLink(
                    <KeyReceiptPDF mandate={mandate} seller={sellers[0]} type="return" />,
                    `restitution-cles-${mandate.mandateNumber}.pdf`,
                    'Reçu de restitution',
                    'Génération...',
                    'inline-flex items-center px-3 py-2 text-sm font-medium text-[#0b8043] hover:text-[#097339] border border-[#0b8043] rounded-md',
                    keyReceiptPdfKey + 1
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mandate.keys.hasKeys}
                onChange={(e) => onMandateChange('keys', {
                  ...mandate.keys,
                  hasKeys: e.target.checked
                })}
                className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
              />
              <span className="text-sm font-medium text-gray-700">Clés en agence</span>
            </label>

            {mandate.keys.hasKeys && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span>Date de remise des clés</span>
                    <input
                      type="date"
                      value={mandate.keys.receivedDate || ''}
                      onChange={(e) => onMandateChange('keys', {
                        ...mandate.keys,
                        receivedDate: e.target.value
                      })}
                    />
                  </label>
                  <label className="block">
                    <span>Date de restitution</span>
                    <input
                      type="date"
                      value={mandate.keys.returnedDate || ''}
                      onChange={(e) => onMandateChange('keys', {
                        ...mandate.keys,
                        returnedDate: e.target.value
                      })}
                    />
                  </label>
                </div>
                <label className="block">
                  <span>Détail des clés</span>
                  <textarea
                    value={mandate.keys.details}
                    onChange={(e) => onMandateChange('keys', {
                      ...mandate.keys,
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
          </div>
          {hasSellers ? (
            <div className="flex gap-4">
              {renderPDFDownloadLink(
                <MandatePDF
                  mandate={mandate}
                  sellers={sellers}
                  propertyAddress={propertyAddress}
                  propertyType={propertyType}
                  coPropertyAddress={coPropertyAddress}
                  lots={lots}
                  officialDesignation={officialDesignation}
                  cadastralSections={cadastralSections}
                  occupationStatus={occupationStatus}
                  dpeStatus={dpeStatus}
                />,
                `mandat-${mandate.mandateNumber}.pdf`,
                'Télécharger en PDF',
                'Génération...',
                'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]',
                mandatePdfKey
              )}
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

      {/* Modal historique des avenants */}
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
                    {renderPDFDownloadLink(
                      <PriceAmendmentPDF mandate={mandate} amendment={amendment} seller={sellers[0]} />,
                      `avenant-${mandate.mandateNumber}-${index + 1}.pdf`,
                      'Télécharger',
                      'Génération...',
                      'text-[#0b8043] hover:text-[#097339] flex items-center',
                      index
                    )}
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

      {/* Messages d'erreur PDF */}
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