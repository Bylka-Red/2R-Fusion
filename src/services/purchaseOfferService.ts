import { supabase } from '../lib/supabase';
import type { PurchaseOffer } from '../types';

const formatDate = (date: string | undefined | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return date;
};

export async function savePurchaseOffer(mandateNumber: string, offer: PurchaseOffer) {
  try {
    console.log("Saving purchase offer for mandate:", mandateNumber);
    console.log("Offer data:", offer);

    if (!mandateNumber) {
      throw new Error('Numéro de mandat requis');
    }

    // Ensure we have a valid date
    const offerDate = formatDate(offer.date) || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mandats')
      .update({
        offer_date: offerDate,
        offer_amount: offer.amount || 0,
        offer_personal_contribution: offer.personalContribution || 0,
        offer_monthly_income: offer.monthlyIncome || 0,
        offer_current_loans: offer.currentLoans || 0,
        offer_deposit: offer.deposit || 0,
        
        // Sync with compromise
        compromise_price_with_furniture: offer.amount || 0,
        compromise_total_price: offer.amount || 0,
        
        // Buyer information
        buyer_title: offer.buyers?.[0]?.title || 'Mr',
        buyer_first_name: offer.buyers?.[0]?.firstName || '',
        buyer_last_name: offer.buyers?.[0]?.lastName || '',
        buyer_birth_date: formatDate(offer.buyers?.[0]?.birthDate),
        buyer_birth_place: offer.buyers?.[0]?.birthPlace || '',
        buyer_birth_postal_code: offer.buyers?.[0]?.birthPostalCode || '',
        buyer_nationality: offer.buyers?.[0]?.nationality || 'Française',
        buyer_profession: offer.buyers?.[0]?.profession || '',
        buyer_address: typeof offer.buyers?.[0]?.address === 'string' ? 
          offer.buyers[0].address : 
          offer.buyers?.[0]?.address?.fullAddress || '',
        buyer_phone: offer.buyers?.[0]?.phone || '',
        buyer_email: offer.buyers?.[0]?.email || '',
        buyer_marital_status: offer.buyers?.[0]?.maritalStatus || 'celibataire-non-pacse',
        buyer_custom_marital_status: offer.buyers?.[0]?.customMaritalStatus,
        buyer_has_french_tax_residence: offer.buyers?.[0]?.hasFrenchTaxResidence !== false,
        buyer_marriage_date: formatDate(offer.buyers?.[0]?.marriageDetails?.date),
        buyer_marriage_place: offer.buyers?.[0]?.marriageDetails?.place || '',
        buyer_marriage_regime: offer.buyers?.[0]?.marriageDetails?.regime || 'community',
        buyer_pacs_date: formatDate(offer.buyers?.[0]?.pacsDetails?.date),
        buyer_pacs_place: offer.buyers?.[0]?.pacsDetails?.place || '',
        buyer_pacs_reference: offer.buyers?.[0]?.pacsDetails?.reference || '',
        buyer_pacs_partner_name: offer.buyers?.[0]?.pacsDetails?.partnerName || '',
        buyer_divorce_ex_spouse_name: offer.buyers?.[0]?.divorceDetails?.exSpouseName || '',
        buyer_deceased_spouse_name: offer.buyers?.[0]?.widowDetails?.deceasedSpouseName || '',

        // Calculate end date and compromise date
        offer_end_date: new Date(new Date(offerDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        offer_compromise_date: new Date(new Date(offerDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        
        // Calculate loan amount with 8.30% fees
        offer_loan_amount: Math.round((offer.amount * 1.083) - (offer.personalContribution || 0))
      })
      .eq('mandate_number', mandateNumber)
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

export async function getPurchaseOffer(mandateNumber: string) {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .select('*')
      .eq('mandate_number', mandateNumber)
      .single();

    if (error) {
      console.error('Error fetching purchase offer:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: crypto.randomUUID(),
      date: data.offer_date || new Date().toISOString().split('T')[0],
      amount: data.offer_amount || 0,
      personalContribution: data.offer_personal_contribution || 0,
      monthlyIncome: data.offer_monthly_income || 0,
      currentLoans: data.offer_current_loans || 0,
      deposit: data.offer_deposit || 0,
      buyers: [{
        type: 'individual',
        title: data.buyer_title || 'Mr',
        firstName: data.buyer_first_name || '',
        lastName: data.buyer_last_name || '',
        birthDate: data.buyer_birth_date,
        birthPlace: data.buyer_birth_place || '',
        birthPostalCode: data.buyer_birth_postal_code || '',
        nationality: data.buyer_nationality || 'Française',
        profession: data.buyer_profession || '',
        address: { fullAddress: data.buyer_address || '' },
        phone: data.buyer_phone || '',
        email: data.buyer_email || '',
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
      }]
    };
  } catch (error) {
    console.error('Error getting purchase offer:', error);
    throw error;
  }
}

export async function deletePurchaseOffer(mandateNumber: string) {
  try {
    const { error } = await supabase
      .from('mandats')
      .update({
        offer_date: null,
        offer_amount: null,
        offer_personal_contribution: null,
        offer_monthly_income: null,
        offer_current_loans: null,
        offer_deposit: null,
        offer_end_date: null,
        offer_loan_amount: null,
        offer_compromise_date: null,
        compromise_price_with_furniture: null,
        compromise_total_price: null,
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
        buyer_deceased_spouse_name: null
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

export async function updatePurchaseOfferAmount(mandateNumber: string, amount: number) {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .update({
        offer_amount: amount,
        offer_loan_amount: Math.round(amount * 1.083),
        compromise_price_with_furniture: amount,
        compromise_total_price: amount
      })
      .eq('mandate_number', mandateNumber)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase offer amount:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePurchaseOfferAmount:', error);
    throw error;
  }
}