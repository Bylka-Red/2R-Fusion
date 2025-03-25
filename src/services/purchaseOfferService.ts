import { supabase } from '../lib/supabase';
import type { PurchaseOffer, Seller } from '../types';

// Fonction pour mapper les valeurs de titre depuis la base de données
const mapTitleFromDb = (title: string | undefined): string => {
  if (!title) return 'Mr';

  switch (title) {
    case 'Mr':
      return 'Monsieur';
    case 'Mrs':
      return 'Madame';
    case 'Mr and Mrs':
      return 'Monsieur et Madame';
    default:
      return title;
  }
};

// Fonction pour mapper les valeurs de titre vers la base de données
const mapTitleToDb = (title: string | undefined): string => {
  if (!title) return 'Mr';

  switch (title) {
    case 'Monsieur':
      return 'Mr';
    case 'Madame':
      return 'Mrs';
    case 'Monsieur et Madame':
      return 'Mr and Mrs';
    default:
      return title;
  }
};

// Fonction pour convertir les valeurs numériques
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

// Fonction pour formater les dates
const formatDate = (date: string | undefined | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return date;
};

export async function savePurchaseOffer(mandate_number: string, offer: PurchaseOffer) {
  try {
    console.log("Saving purchase offer for mandate:", mandate_number);
    console.log("Offer data:", offer);

    if (!mandate_number) {
      throw new Error('Numéro de mandat requis');
    }

    // Préparation des données de l'acheteur principal
    const primaryBuyer = offer.buyers[0];
    if (!primaryBuyer) {
      throw new Error('Au moins un acheteur est requis');
    }

    // Préparation des données pour la mise à jour
    const updateData = {
      // Informations de l'offre
      offer_date: formatDate(offer.date),
      offer_amount: toNumber(offer.amount),
      offer_personal_contribution: toNumber(offer.personalContribution),
      offer_monthly_income: toNumber(offer.monthlyIncome),
      offer_current_loans: toNumber(offer.currentLoans),
      offer_deposit: toNumber(offer.deposit),
      
      // Dates calculées
      offer_end_date: formatDate(new Date(new Date(offer.date).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()),
      offer_loan_amount: toNumber(offer.amount) * 1.08,
      offer_compromise_date: formatDate(new Date(new Date(offer.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()),

      // Informations de l'acheteur principal
      buyer_title: mapTitleToDb(primaryBuyer.title),
      buyer_first_name: primaryBuyer.firstName || '',
      buyer_last_name: primaryBuyer.lastName || '',
      buyer_birth_date: formatDate(primaryBuyer.birthDate),
      buyer_birth_place: primaryBuyer.birthPlace || '',
      buyer_birth_postal_code: primaryBuyer.birthPostalCode || '',
      buyer_profession: primaryBuyer.profession || '',
      buyer_phone: primaryBuyer.phone || '',
      buyer_email: primaryBuyer.email || '',
      buyer_address: typeof primaryBuyer.address === 'string' ? primaryBuyer.address : primaryBuyer.address.fullAddress || '',
      buyer_nationality: primaryBuyer.nationality || 'Française',
      buyer_marital_status: primaryBuyer.maritalStatus || 'celibataire-non-pacse',
      buyer_custom_marital_status: primaryBuyer.customMaritalStatus,
      buyer_has_french_tax_residence: primaryBuyer.hasFrenchTaxResidence !== false,

      // Détails du mariage
      buyer_marriage_date: formatDate(primaryBuyer.marriageDetails?.date),
      buyer_marriage_place: primaryBuyer.marriageDetails?.place || '',
      buyer_marriage_regime: primaryBuyer.marriageDetails?.regime || 'community',

      // Détails PACS
      buyer_pacs_date: formatDate(primaryBuyer.pacsDetails?.date),
      buyer_pacs_place: primaryBuyer.pacsDetails?.place || '',
      buyer_pacs_reference: primaryBuyer.pacsDetails?.reference || '',
      buyer_pacs_partner_name: primaryBuyer.pacsDetails?.partnerName || '',

      // Détails divorce/veuvage
      buyer_divorce_ex_spouse_name: primaryBuyer.divorceDetails?.exSpouseName || '',
      buyer_deceased_spouse_name: primaryBuyer.widowDetails?.deceasedSpouseName || '',

      // Acheteurs additionnels
      additional_buyers: offer.buyers.slice(1),

      // Stocker l'offre complète pour référence
      purchase_offers: [offer]
    };

    console.log("Update data prepared:", updateData);

    // Mise à jour dans Supabase
    const { data, error } = await supabase
      .from('mandats')
      .update(updateData)
      .eq('mandate_number', mandate_number)
      .select()
      .single();

    if (error) {
      console.error('Error saving purchase offer:', error);
      throw error;
    }

    console.log('Purchase offer saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in savePurchaseOffer:', error);
    throw error;
  }
}

export async function getPurchaseOffer(mandate_number: string): Promise<PurchaseOffer | null> {
  try {
    console.log("Fetching purchase offer for mandate:", mandate_number);

    const { data, error } = await supabase
      .from('mandats')
      .select('*')
      .eq('mandate_number', mandate_number)
      .single();

    if (error) {
      console.error('Error fetching purchase offer:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Créer l'acheteur principal
    const primaryBuyer: Seller = {
      type: 'individual',
      title: mapTitleFromDb(data.buyer_title),
      firstName: data.buyer_first_name || '',
      lastName: data.buyer_last_name || '',
      birthDate: data.buyer_birth_date,
      birthPlace: data.buyer_birth_place || '',
      birthPostalCode: data.buyer_birth_postal_code || '',
      profession: data.buyer_profession || '',
      phone: data.buyer_phone || '',
      email: data.buyer_email || '',
      address: { fullAddress: data.buyer_address || '' },
      nationality: data.buyer_nationality || 'Française',
      maritalStatus: data.buyer_marital_status || 'celibataire-non-pacse',
      customMaritalStatus: data.buyer_custom_marital_status,
      hasFrenchTaxResidence: data.buyer_has_french_tax_residence !== false,
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
    };

    // Construire l'offre d'achat
    const purchaseOffer: PurchaseOffer = {
      id: crypto.randomUUID(),
      date: data.offer_date || new Date().toISOString().split('T')[0],
      amount: data.offer_amount || 0,
      personalContribution: data.offer_personal_contribution || 0,
      monthlyIncome: data.offer_monthly_income || 0,
      currentLoans: data.offer_current_loans || 0,
      deposit: data.offer_deposit || 0,
      buyers: [primaryBuyer, ...(data.additional_buyers || [])]
    };

    console.log('Purchase offer retrieved successfully:', purchaseOffer);
    return purchaseOffer;
  } catch (error) {
    console.error('Error in getPurchaseOffer:', error);
    throw error;
  }
}