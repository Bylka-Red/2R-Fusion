import React, { useState } from 'react';
import { Euro, Calendar, Wallet, CreditCard, PiggyBank, Plus, Download, Save, Loader2 } from 'lucide-react';
import type { PurchaseOffer, Seller, Mandate } from '../types';
import { SellerForm } from './SellerForm';
import { generatePurchaseOfferFromTemplate } from './PurchaseOfferTemplateGenerator';
import { savePurchaseOffer } from '../services/purchaseOfferService';

interface PurchaseOfferTabProps {
  offer: PurchaseOffer;
  mandate: Mandate;
  onOfferChange: (field: keyof PurchaseOffer, value: any) => void;
  onBuyerChange: (index: number, buyer: Seller) => void;
  onAddBuyer: () => void;
  onRemoveBuyer: (index: number) => void;
}

export function PurchaseOfferTab({
  offer,
  mandate,
  onOfferChange,
  onBuyerChange,
  onAddBuyer,
  onRemoveBuyer,
}: PurchaseOfferTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Ensure offer has required properties and a valid date
  const safeOffer: PurchaseOffer = {
    id: offer.id || crypto.randomUUID(),
    date: offer.date || new Date().toISOString().split('T')[0],
    amount: offer.amount || 0,
    personalContribution: offer.personalContribution || 0,
    monthlyIncome: offer.monthlyIncome || 0,
    currentLoans: offer.currentLoans || 0,
    deposit: offer.deposit || 0,
    buyers: offer.buyers || [{
      type: 'individual',
      title: 'Mr',
      firstName: '',
      lastName: '',
      address: { fullAddress: '' },
      phone: '',
      email: '',
      hasFrenchTaxResidence: true,
      marriageDetails: {
        date: '',
        place: '',
        regime: 'community',
      }
    }]
  };

  // Calcul des dates et montants automatiques
  const offerDate = new Date(safeOffer.date);
  const offerEndDate = new Date(offerDate);
  offerEndDate.setDate(offerEndDate.getDate() + 10);

  const compromiseDate = new Date(offerDate);
  compromiseDate.setDate(compromiseDate.getDate() + 15);

  // Nouveau calcul du montant du crédit avec 8.30% de frais
  const loanAmount = Math.round((safeOffer.amount * 1.083) - (safeOffer.personalContribution || 0));

  const formatDate = (date: Date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleGenerateOffer = async () => {
    try {
      console.log("Generating offer with mandate:", mandate);
      await generatePurchaseOfferFromTemplate(mandate, safeOffer);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'offre:', error);
      alert('Une erreur est survenue lors de la génération du document. Veuillez réessayer.');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      if (!mandate.mandate_number) {
        throw new Error('Numéro de mandat requis');
      }

      // Ensure we have a valid date
      if (!safeOffer.date) {
        safeOffer.date = new Date().toISOString().split('T')[0];
      }

      await savePurchaseOffer(mandate.mandate_number, safeOffer);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving purchase offer:', error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyerChange = (index: number, updatedBuyer: Seller) => {
    const updatedBuyers = [...safeOffer.buyers];
    updatedBuyers[index] = updatedBuyer;
    onOfferChange('buyers', updatedBuyers);
    onBuyerChange(index, updatedBuyer);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Détails de l'offre</h2>
        <div className="flex gap-4">
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
            {isSaving ? 'Enregistrement...' : 'Enregistrer l\'offre'}
          </button>
          <button
            onClick={handleGenerateOffer}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Générer l'offre
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          L'offre a été enregistrée avec succès.
        </div>
      )}

      <div className="space-y-8">
        <div>
          <div className="grid grid-cols-2 gap-6">
            <label>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Date de l'offre</span>
              </div>
              <input
                type="date"
                value={safeOffer.date}
                onChange={(e) => onOfferChange('date', e.target.value || new Date().toISOString().split('T')[0])}
              />
            </label>
            <label>
              <div className="flex items-center gap-2 mb-2">
                <Euro className="h-4 w-4 text-gray-400" />
                <span>Montant de l'offre</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={safeOffer.amount ? safeOffer.amount.toLocaleString('fr-FR') : '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                    console.log('Setting offer amount to:', value);
                    onOfferChange('amount', value);
                  }}
                  className="w-full pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <label>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span>Apport personnel</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={safeOffer.personalContribution ? safeOffer.personalContribution.toLocaleString('fr-FR') : '0'}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onOfferChange('personalContribution', value);
                }}
                className="w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </label>
          <label>
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-4 w-4 text-gray-400" />
              <span>Salaires nets mensuels</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={safeOffer.monthlyIncome ? safeOffer.monthlyIncome.toLocaleString('fr-FR') : '0'}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onOfferChange('monthlyIncome', value);
                }}
                className="w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <label>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>Montant des prêts en cours</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={safeOffer.currentLoans ? safeOffer.currentLoans.toLocaleString('fr-FR') : '0'}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onOfferChange('currentLoans', value);
                }}
                className="w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </label>
          <label>
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-4 w-4 text-gray-400" />
              <span>Montant du séquestre</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={safeOffer.deposit ? safeOffer.deposit.toLocaleString('fr-FR') : '0'}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                  onOfferChange('deposit', value);
                }}
                className="w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <label>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Date de fin de l'offre</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={formatDate(offerEndDate)}
                disabled
                className="bg-gray-50 cursor-not-allowed font-bold"
              />
            </div>
          </label>
          <label>
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-4 w-4 text-gray-400" />
              <span>Montant du crédit</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={loanAmount.toLocaleString('fr-FR')}
                disabled
                className="bg-gray-50 cursor-not-allowed pr-10 font-bold"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </label>
          <label>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Date éventuelle de compromis</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={formatDate(compromiseDate)}
                disabled
                className="bg-gray-50 cursor-not-allowed font-bold"
              />
            </div>
          </label>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Informations des acheteurs</h2>
            <button
              onClick={onAddBuyer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un acheteur
            </button>
          </div>

          <div className={`grid gap-8 ${safeOffer.buyers.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {safeOffer.buyers.map((buyer, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <SellerForm
                  seller={buyer}
                  onChange={(updatedBuyer) => handleBuyerChange(index, updatedBuyer)}
                  onRemove={() => onRemoveBuyer(index)}
                  canRemove={safeOffer.buyers.length > 1}
                  index={index}
                  previousSeller={index > 0 ? safeOffer.buyers[index - 1] : undefined}
                  onPropertyTypeChange={() => {}}
                  propertyFamilyType="personal-not-family"
                  totalSellers={safeOffer.buyers.length}
                  onCoupleChange={index === 1 ? (isCouple) => {
                    if (safeOffer.buyers.length >= 2) {
                      const updatedBuyers = [...safeOffer.buyers];
                      if (isCouple) {
                        updatedBuyers[1] = {
                          ...updatedBuyers[1],
                          maritalStatus: updatedBuyers[0].maritalStatus,
                          marriageDetails: { ...updatedBuyers[0].marriageDetails },
                          pacsDetails: updatedBuyers[0].pacsDetails ? { ...updatedBuyers[0].pacsDetails } : undefined,
                          divorceDetails: updatedBuyers[0].divorceDetails ? { ...updatedBuyers[0].divorceDetails } : undefined,
                          widowDetails: updatedBuyers[0].widowDetails ? { ...updatedBuyers[0].widowDetails } : undefined,
                          couple: { isCouple: true, partnerId: 0 }
                        };
                        updatedBuyers[0] = {
                          ...updatedBuyers[0],
                          couple: { isCouple: true, partnerId: 1 }
                        };
                      } else {
                        updatedBuyers[1] = {
                          ...updatedBuyers[1],
                          couple: undefined
                        };
                        updatedBuyers[0] = {
                          ...updatedBuyers[0],
                          couple: undefined
                        };
                      }
                      onOfferChange('buyers', updatedBuyers);
                    }
                  } : undefined}
                  showPropertyTypeSection={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}