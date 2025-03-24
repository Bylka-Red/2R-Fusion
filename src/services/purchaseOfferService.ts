import { supabase } from '../lib/supabase';
import type { PurchaseOffer, Seller } from '../types';

// Fonction utilitaire pour formater les dates
const formatDate = (date: string | undefined | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return date;
};

// Fonction utilitaire pour convertir les valeurs en nombres
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;

  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsedValue = parseFloat(cleanValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  return 0;
};

export async function savePurchaseOffer(offer: PurchaseOffer, mandateNumber: string) {
  try {
    console.log("Données de l'offre reçues:", {
      date: offer.date,
      amount: offer.amount,
      buyers: offer.buyers?.length || 0,
      buyerLastName: offer.buyers?.[0]?.lastName // Log pour debug
    });

    // Récupérer l'utilisateur courant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Vérifier que nous avons au moins un acheteur
    if (!offer.buyers || offer.buyers.length === 0) {
      throw new Error('Au moins un acheteur est requis');
    }

    const primaryBuyer = offer.buyers[0];

    // Préparer les données de l'offre avec des colonnes individuelles
    const offerData = {
      // Données de l'offre dans des colonnes individuelles
      offer_date: formatDate(offer.date),
      offer_amount: toNumber(offer.amount),
      offer_personal_contribution: toNumber(offer.personalContribution),
      offer_monthly_income: toNumber(offer.monthlyIncome),
      offer_current_loans: toNumber(offer.currentLoans),
      offer_deposit: toNumber(offer.deposit),
      offer_end_date: formatDate(offer.endDate),
      offer_loan_amount: toNumber(offer.loanAmount),
      offer_compromise_date: formatDate(offer.compromiseDate),

      // Maintenir le tableau purchase_offers pour compatibilité (si nécessaire)
      purchase_offers: [{
        id: offer.id,
        date: formatDate(offer.date),
        amount: toNumber(offer.amount),
        personal_contribution: toNumber(offer.personalContribution),
        monthly_income: toNumber(offer.monthlyIncome),
        current_loans: toNumber(offer.currentLoans),
        deposit: toNumber(offer.deposit),
        buyers: offer.buyers
      }],

      // Données de l'acheteur principal
      buyer_title: primaryBuyer.title || 'Mr',
      buyer_first_name: primaryBuyer.firstName || '',
      buyer_last_name: primaryBuyer.lastName || '',
      buyer_birth_date: formatDate(primaryBuyer.birthDate),
      buyer_birth_place: primaryBuyer.birthPlace || '',
      buyer_birth_postal_code: primaryBuyer.birthPostalCode || '',
      buyer_nationality: primaryBuyer.nationality || 'Française',
      buyer_profession: primaryBuyer.profession || '',
      buyer_address: primaryBuyer.address?.fullAddress || '',
      buyer_phone: primaryBuyer.phone || '',
      buyer_email: primaryBuyer.email || '',
      buyer_marital_status: primaryBuyer.maritalStatus || 'celibataire-non-pacse',
      buyer_custom_marital_status: primaryBuyer.customMaritalStatus,
      buyer_has_french_tax_residence: primaryBuyer.hasFrenchTaxResidence ?? true,

      // Détails du mariage de l'acheteur
      buyer_marriage_date: formatDate(primaryBuyer.marriageDetails?.date),
      buyer_marriage_place: primaryBuyer.marriageDetails?.place || '',
      buyer_marriage_regime: primaryBuyer.marriageDetails?.regime || 'community',

      // Détails PACS de l'acheteur
      buyer_pacs_date: formatDate(primaryBuyer.pacsDetails?.date),
      buyer_pacs_place: primaryBuyer.pacsDetails?.place || '',
      buyer_pacs_reference: primaryBuyer.pacsDetails?.reference || '',
      buyer_pacs_partner_name: primaryBuyer.pacsDetails?.partnerName || '',

      // Détails divorce/veuvage de l'acheteur
      buyer_divorce_ex_spouse_name: primaryBuyer.divorceDetails?.exSpouseName || '',
      buyer_deceased_spouse_name: primaryBuyer.widowDetails?.deceasedSpouseName || '',

      // Acheteurs additionnels
      additional_buyers: offer.buyers.slice(1) || []
    };

    console.log("Données envoyées à Supabase:", {
      buyer_last_name: offerData.buyer_last_name,
      buyer_first_name: offerData.buyer_first_name,
      offer_amount: offerData.offer_amount, // Notez le changement ici
      offer_date: offerData.offer_date     // Notez le changement ici
    });

    // Mettre à jour le mandat avec l'offre d'achat
    const { data, error } = await supabase
      .from('mandats')
      .update(offerData)
      .eq('mandate_number', mandateNumber)
      .select()
      .single();

    console.log("Réponse de Supabase:", { data, error });

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }

    console.log('Sauvegarde réussie:', data);
    return data;
  } catch (error) {
    console.error('Erreur dans savePurchaseOffer:', error);
    throw error;
  }
}

export async function getPurchaseOffer(mandateNumber: string) {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .select('offer_date, offer_amount, offer_personal_contribution, offer_monthly_income, offer_current_loans, offer_deposit, offer_end_date, offer_loan_amount, offer_compromise_date, purchase_offers, buyer_title, buyer_first_name, buyer_last_name, buyer_birth_date, buyer_birth_place, buyer_birth_postal_code, buyer_nationality, buyer_profession, buyer_address, buyer_phone, buyer_email, buyer_marital_status, buyer_custom_marital_status, buyer_has_french_tax_residence, buyer_marriage_date, buyer_marriage_place, buyer_marriage_regime, buyer_pacs_date, buyer_pacs_place, buyer_pacs_reference, buyer_pacs_partner_name, buyer_divorce_ex_spouse_name, buyer_deceased_spouse_name, additional_buyers')
      .eq('mandate_number', mandateNumber)
      .single();

    if (error) {
      console.error('Error fetching purchase offer:', error);
      throw error;
    }

    console.log("Données récupérées de Supabase:", data);

    // Générer un nouvel ID si nécessaire
    const offerId = data.purchase_offers?.[0]?.id || crypto.randomUUID();

    // Convertir les données de la base en modèle d'application
    const offer: PurchaseOffer = {
      id: offerId,
      date: data.offer_date || null,
      amount: data.offer_amount || 0,
      personalContribution: data.offer_personal_contribution || 0,
      monthlyIncome: data.offer_monthly_income || 0,
      currentLoans: data.offer_current_loans || 0,
      deposit: data.offer_deposit || 0,
      endDate: data.offer_end_date || null,
      loanAmount: data.offer_loan_amount || 0,
      compromiseDate: data.offer_compromise_date || null,
      buyers: [
        {
          type: 'individual',
          title: data.buyer_title || 'Mr',
          firstName: data.buyer_first_name || '',
          lastName: data.buyer_last_name || '',
          birthDate: data.buyer_birth_date || '',
          birthPlace: data.buyer_birth_place || '',
          birthPostalCode: data.buyer_birth_postal_code || '',
          nationality: data.buyer_nationality || 'Française',
          profession: data.buyer_profession || '',
          address: { fullAddress: data.buyer_address || '' },
          phone: data.buyer_phone || '',
          email: data.buyer_email || '',
          maritalStatus: data.buyer_marital_status || 'celibataire-non-pacse',
          customMaritalStatus: data.buyer_custom_marital_status,
          hasFrenchTaxResidence: data.buyer_has_french_tax_residence ?? true,
          marriageDetails: {
            date: data.buyer_marriage_date || '',
            place: data.buyer_marriage_place || '',
            regime: data.buyer_marriage_regime || 'community'
          },
          pacsDetails: data.buyer_pacs_date ? {
            date: data.buyer_pacs_date,
            place: data.buyer_pacs_place || '',
            reference: data.buyer_pacs_reference || '',
            partnerName: data.buyer_pacs_partner_name || ''
          } : undefined,
          divorceDetails: data.buyer_divorce_ex_spouse_name ? {
            exSpouseName: data.buyer_divorce_ex_spouse_name
          } : undefined,
          widowDetails: data.buyer_deceased_spouse_name ? {
            deceasedSpouseName: data.buyer_deceased_spouse_name
          } : undefined
        },
        ...(data.additional_buyers || []).map((buyer: any) => ({
          type: 'individual',
          ...buyer
        }))
      ]
    };

    console.log("Offre convertie:", offer);

    return offer;
  } catch (error) {
    console.error('Error in getPurchaseOffer:', error);
    throw error;
  }
}

export async function deletePurchaseOffer(mandateNumber: string) {
  try {
    const { error } = await supabase
      .from('mandats')
      .update({
        // Réinitialiser les colonnes individuelles de l'offre
        offer_date: null,
        offer_amount: null,
        offer_personal_contribution: null,
        offer_monthly_income: null,
        offer_current_loans: null,
        offer_deposit: null,
        offer_end_date: null,
        offer_loan_amount: null,
        offer_compromise_date: null,
        
        // Réinitialiser aussi le tableau purchase_offers pour compatibilité
        purchase_offers: [],
        
        // Réinitialiser les colonnes de l'acheteur
        buyer_title: null,
        buyer_first_name: null,
        buyer_last_name: null,
        buyer_birth_date: null,
        buyer_birth_place: null,
        buyer_birth_postal_code: null,
        buyer_nationality: null,
        buyer_profession: null,
        buyer_address: null,
        buyer_phone: null,
        buyer_email: null,
        buyer_marital_status: null,
        buyer_custom_marital_status: null,
        buyer_has_french_tax_residence: null,
        buyer_marriage_date: null,
        buyer_marriage_place: null,
        buyer_marriage_regime: null,
        buyer_pacs_date: null,
        buyer_pacs_place: null,
        buyer_pacs_reference: null,
        buyer_pacs_partner_name: null,
        buyer_divorce_ex_spouse_name: null,
        buyer_deceased_spouse_name: null,
        additional_buyers: []
      })
      .eq('mandate_number', mandateNumber);

    if (error) {
      console.error('Error deleting purchase offer:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deletePurchaseOffer:', error);
    throw error;
  }
}