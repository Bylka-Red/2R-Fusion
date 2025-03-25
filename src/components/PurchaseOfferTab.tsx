import React from 'react';
import { Euro, Calendar, Wallet, CreditCard, PiggyBank, Plus, Download } from 'lucide-react';
import type { PurchaseOffer, Seller, Mandate } from '../types';
import { SellerForm } from './SellerForm';
import { generatePurchaseOfferFromTemplate } from './PurchaseOfferTemplateGenerator';

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
  // Calcul des dates et montants automatiques
  const offerDate = new Date(offer.date);
  const offerEndDate = new Date(offerDate);
  offerEndDate.setDate(offerEndDate.getDate() + 10);

  const compromiseDate = new Date(offerDate);
  compromiseDate.setDate(compromiseDate.getDate() + 15);

  const loanAmount = offer.amount * 1.08; // Montant de l'offre + 8%

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleGenerateOffer = async () => {
    try {
      console.log("Generating offer with mandate:", mandate);
      await generatePurchaseOfferFromTemplate(mandate, offer);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'offre:', error);
      alert('Une erreur est survenue lors de la génération du document. Veuillez réessayer.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Détails de l'offre</h2>
        <button
          onClick={handleGenerateOffer}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-5 w-5 mr-2" />
          Générer l'offre
        </button>
      </div>

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
                value={offer.date}
                onChange={(e) => onOfferChange('date', e.target.value)}
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
                  value={offer.amount ? offer.amount.toLocaleString('fr-FR') : '0'}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
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
                value={offer.personalContribution ? offer.personalContribution.toLocaleString('fr-FR') : '0'}
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
                value={offer.monthlyIncome ? offer.monthlyIncome.toLocaleString('fr-FR') : '0'}
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
                value={offer.currentLoans ? offer.currentLoans.toLocaleString('fr-FR') : '0'}
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
                value={offer.deposit ? offer.deposit.toLocaleString('fr-FR') : '0'}
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

          <div className={`grid gap-8 ${offer.buyers.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {offer.buyers.map((buyer, index) => (
              <SellerForm
                key={index}
                seller={buyer}
                onChange={(updatedBuyer) => {
                  onBuyerChange(index, updatedBuyer);

                  if (index === 0 && buyer.couple?.isCouple && offer.buyers.length >= 2) {
                    const updatedBuyer2 = { ...offer.buyers[1] };
                    updatedBuyer2.maritalStatus = updatedBuyer.maritalStatus;
                    updatedBuyer2.marriageDetails = { ...updatedBuyer.marriageDetails };
                    updatedBuyer2.pacsDetails = updatedBuyer.pacsDetails ? { ...updatedBuyer.pacsDetails } : undefined;
                    updatedBuyer2.divorceDetails = updatedBuyer.divorceDetails ? { ...updatedBuyer.divorceDetails } : undefined;
                    updatedBuyer2.widowDetails = updatedBuyer.widowDetails ? { ...updatedBuyer.widowDetails } : undefined;
                    onBuyerChange(1, updatedBuyer2);
                  }
                }}
                onRemove={() => onRemoveBuyer(index)}
                canRemove={offer.buyers.length > 1}
                index={index}
                previousSeller={index > 0 ? offer.buyers[index - 1] : undefined}
                onPropertyTypeChange={() => {}}
                propertyFamilyType="personal-not-family"
                totalSellers={offer.buyers.length}
                onCoupleChange={index === 1 ? (isCouple) => {
                  if (offer.buyers.length >= 2) {
                    const updatedBuyer2 = { ...offer.buyers[1] };

                    if (isCouple) {
                      updatedBuyer2.maritalStatus = offer.buyers[0].maritalStatus;
                      updatedBuyer2.marriageDetails = { ...offer.buyers[0].marriageDetails };
                      updatedBuyer2.pacsDetails = offer.buyers[0].pacsDetails ? { ...offer.buyers[0].pacsDetails } : undefined;
                      updatedBuyer2.divorceDetails = offer.buyers[0].divorceDetails ? { ...offer.buyers[0].divorceDetails } : undefined;
                      updatedBuyer2.widowDetails = offer.buyers[0].widowDetails ? { ...offer.buyers[0].widowDetails } : undefined;
                      updatedBuyer2.couple = { isCouple: true, partnerId: 0 };

                      const updatedBuyer1 = {
                        ...offer.buyers[0],
                        couple: { isCouple: true, partnerId: 1 }
                      };
                      onBuyerChange(0, updatedBuyer1);
                    } else {
                      updatedBuyer2.couple = undefined;
                      const updatedBuyer1 = {
                        ...offer.buyers[0],
                        couple: undefined
                      };
                      onBuyerChange(0, updatedBuyer1);
                    }

                    onBuyerChange(1, updatedBuyer2);
                  }
                } : undefined}
                showPropertyTypeSection={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}