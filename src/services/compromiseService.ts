import { supabase } from '../lib/supabase';
import type { Notaire } from './notaireService';
import type { Syndic } from './syndicService';

export interface DiagnosticDetail {
  type: string;
  date?: string;
  company?: string;
  hasAsbestos?: boolean;
  hasLead?: boolean;
  leadConcentration?: string;
  guaranteedBy: 'owner' | 'company';
  surface?: number;
}

export interface CompromiseDetails {
  folderName?: string;
  number?: string;
  commercial?: string;
  date?: string;
  enjoymentDate?: string;
  conditionsEndDate?: string;
  notaireVendeur: Notaire | null;
  notaireAcquereur: Notaire | null;
  syndic: Syndic | null;
  previousOwner?: string;
  registrationDate?: string;
  agDates?: {
    n1?: string;
    n2?: string;
    n3?: string;
  };
  preStatusDate?: string;
  condoRulesDate?: string;
  condoRulesModifications?: string[];
  hasMaintenanceLog?: boolean;
  hasRegistrationForm?: boolean;
  hasSyntheticSheet?: boolean;
  priceWithFurniture?: number;
  kitchenPrice?: number;
  priceWithoutKitchen?: number;
  totalPrice?: number;
  penaltyClause?: string;
  notaryFees?: number;
  maxMonthlyPayment?: number;
  vatAmount?: number;
  diagnostics?: DiagnosticDetail[];
  compromiseDate?: string;
  compromiseSignatureDate?: string;
  energyAuditDate?: string; // Ajout de la date d'audit énergétique
}

export async function saveCompromiseDetails(mandateNumber: string, details: CompromiseDetails) {
  try {
    console.log("Saving compromise details for mandate:", mandateNumber);
    console.log("Details received:", details);

    if (!mandateNumber) {
      throw new Error('Numéro de mandat requis');
    }

    // Log des valeurs extraites
    console.log("Extracted values:", {
      folderName: details.folderName,
      number: details.number,
      commercial: details.commercial,
      date: details.date,
      enjoymentDate: details.enjoymentDate,
    });

    const updateData = {
      notaire_vendeur_id: details.notaireVendeur?.id || null,
      notaire_acquereur_id: details.notaireAcquereur?.id || null,
      syndic_id: details.syndic?.id || null,
      compromise_folder_name: details.folderName || null,
      compromise_number: details.number || null,
      compromise_commercial: details.commercial || null,
      compromise_date: details.date || null,
      compromise_enjoyment_date: details.enjoymentDate || null,
      compromise_conditions_end_date: details.conditionsEndDate || null,
      compromise_previous_owner: details.previousOwner || null,
      compromise_registration_date: details.registrationDate || null,
      compromise_ag_dates: details.agDates || null,
      compromise_pre_status_date: details.preStatusDate || null,
      compromise_condo_rules_date: details.condoRulesDate || null,
      compromise_condo_rules_modifications: details.condoRulesModifications || [],
      compromise_maintenance_log: details.hasMaintenanceLog || false,
      compromise_registration_form: details.hasRegistrationForm || false,
      compromise_synthetic_sheet: details.hasSyntheticSheet || false,
      compromise_price_with_furniture: details.priceWithFurniture || null,
      compromise_kitchen_price: details.kitchenPrice || null,
      compromise_price_without_kitchen: details.priceWithoutKitchen || null,
      compromise_total_price: details.totalPrice || null,
      compromise_penalty_clause: details.penaltyClause || null,
      compromise_notary_fees: details.notaryFees || null,
      compromise_max_monthly_payment: details.maxMonthlyPayment || null,
      compromise_vat_amount: details.vatAmount || null,
      compromise_diagnostics: details.diagnostics || [],
      compromise_signature_date: details.compromiseSignatureDate || null,
      energy_audit_date: details.energyAuditDate || null,
      updated_at: new Date().toISOString()
    };

    // Log des valeurs assignées
    console.log("Update data values:", {
      compromise_folder_name: updateData.compromise_folder_name,
      compromise_number: updateData.compromise_number,
      compromise_commercial: updateData.compromise_commercial,
      compromise_date: updateData.compromise_date,
      compromise_enjoyment_date: updateData.compromise_enjoyment_date,
    });

    const { data, error } = await supabase
      .from('mandats')
      .update(updateData)
      .eq('mandate_number', mandateNumber)
      .select(`
        mandate_number,
        compromise_folder_name,
        compromise_number,
        compromise_commercial,
        compromise_date,
        compromise_enjoyment_date,
        compromise_conditions_end_date,
        compromise_previous_owner,
        compromise_registration_date,
        compromise_ag_dates,
        compromise_pre_status_date,
        compromise_condo_rules_date,
        compromise_condo_rules_modifications,
        compromise_maintenance_log,
        compromise_registration_form,
        compromise_synthetic_sheet,
        compromise_price_with_furniture,
        compromise_kitchen_price,
        compromise_price_without_kitchen,
        compromise_total_price,
        compromise_penalty_clause,
        compromise_notary_fees,
        compromise_max_monthly_payment,
        compromise_vat_amount,
        compromise_diagnostics,
        compromise_signature_date,
        energy_audit_date,
        notaire_vendeur:notaire_vendeur_id (
          id,
          nom,
          adresse,
          telephone,
          favori
        ),
        notaire_acquereur:notaire_acquereur_id (
          id,
          nom,
          adresse,
          telephone,
          favori
        ),
        syndic:syndic_id (
          id,
          nom,
          adresse,
          telephone,
          email,
          favori
        )
      `)
      .single();

    if (error) {
      console.error('Error saving compromise details:', error);
      throw error;
    }

    console.log('Compromise details saved successfully:', data);
    return {
      folderName: data.compromise_folder_name,
      number: data.compromise_number,
      commercial: data.compromise_commercial,
      date: data.compromise_date,
      enjoymentDate: data.compromise_enjoyment_date,
      conditionsEndDate: data.compromise_conditions_end_date,
      previousOwner: data.compromise_previous_owner,
      registrationDate: data.compromise_registration_date,
      agDates: data.compromise_ag_dates,
      preStatusDate: data.compromise_pre_status_date,
      condoRulesDate: data.compromise_condo_rules_date,
      condoRulesModifications: data.compromise_condo_rules_modifications,
      hasMaintenanceLog: data.compromise_maintenance_log,
      hasRegistrationForm: data.compromise_registration_form,
      hasSyntheticSheet: data.compromise_synthetic_sheet,
      priceWithFurniture: data.compromise_price_with_furniture,
      kitchenPrice: data.compromise_kitchen_price,
      priceWithoutKitchen: data.compromise_price_without_kitchen,
      totalPrice: data.compromise_total_price,
      penaltyClause: data.compromise_penalty_clause,
      notaryFees: data.compromise_notary_fees,
      maxMonthlyPayment: data.compromise_max_monthly_payment,
      vatAmount: data.compromise_vat_amount,
      diagnostics: data.compromise_diagnostics,
      notaireVendeur: data.notaire_vendeur,
      notaireAcquereur: data.notaire_acquereur,
      syndic: data.syndic,
      compromiseSignatureDate: data.compromise_signature_date,
      energyAuditDate: data.energy_audit_date // Ajout de la date d'audit énergétique
    };
  } catch (error) {
    console.error('Error in saveCompromiseDetails:', error);
    throw error;
  }
}

export async function getCompromiseDetails(mandateNumber: string) {
  try {
    console.log("Fetching compromise details for mandate:", mandateNumber);

    const { data, error } = await supabase
      .from('mandats')
      .select(`
        mandate_number,
        compromise_folder_name,
        compromise_number,
        compromise_commercial,
        compromise_date,
        compromise_enjoyment_date,
        compromise_conditions_end_date,
        compromise_previous_owner,
        compromise_registration_date,
        compromise_ag_dates,
        compromise_pre_status_date,
        compromise_condo_rules_date,
        compromise_condo_rules_modifications,
        compromise_maintenance_log,
        compromise_registration_form,
        compromise_synthetic_sheet,
        compromise_price_with_furniture,
        compromise_kitchen_price,
        compromise_price_without_kitchen,
        compromise_total_price,
        compromise_penalty_clause,
        compromise_notary_fees,
        compromise_max_monthly_payment,
        compromise_vat_amount,
        compromise_diagnostics,
        compromise_signature_date,
        energy_audit_date,
        notaire_vendeur:notaire_vendeur_id(
          id,
          nom,
          adresse,
          telephone,
          favori
        ),
        notaire_acquereur:notaire_acquereur_id(
          id,
          nom,
          adresse,
          telephone,
          favori
        ),
        syndic:syndic_id(
          id,
          nom,
          adresse,
          telephone,
          email,
          favori
        )
      `)
      .eq('mandate_number', mandateNumber)
      .single();

    if (error) {
      console.error('Error fetching compromise details:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    console.log('Compromise details fetched successfully:', data);
    return {
      folderName: data.compromise_folder_name,
      number: data.compromise_number,
      commercial: data.compromise_commercial,
      date: data.compromise_date,
      enjoymentDate: data.compromise_enjoyment_date,
      conditionsEndDate: data.compromise_conditions_end_date,
      previousOwner: data.compromise_previous_owner,
      registrationDate: data.compromise_registration_date,
      agDates: data.compromise_ag_dates,
      preStatusDate: data.compromise_pre_status_date,
      condoRulesDate: data.compromise_condo_rules_date,
      condoRulesModifications: data.compromise_condo_rules_modifications,
      hasMaintenanceLog: data.compromise_maintenance_log,
      hasRegistrationForm: data.compromise_registration_form,
      hasSyntheticSheet: data.compromise_synthetic_sheet,
      priceWithFurniture: data.compromise_price_with_furniture,
      kitchenPrice: data.compromise_kitchen_price,
      priceWithoutKitchen: data.compromise_price_without_kitchen,
      totalPrice: data.compromise_total_price,
      penaltyClause: data.compromise_penalty_clause,
      notaryFees: data.compromise_notary_fees,
      maxMonthlyPayment: data.compromise_max_monthly_payment,
      vatAmount: data.compromise_vat_amount,
      diagnostics: data.compromise_diagnostics,
      notaireVendeur: data.notaire_vendeur,
      notaireAcquereur: data.notaire_acquereur,
      syndic: data.syndic,
      compromiseSignatureDate: data.compromise_signature_date,
      energyAuditDate: data.energy_audit_date
    };
  } catch (error) {
    console.error('Error in getCompromiseDetails:', error);
    throw error;
  }
}