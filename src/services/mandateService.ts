import { supabase } from '../lib/supabase';
import type { Mandate } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';

const formatDate = (date: string | undefined | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return date;
};

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

export async function saveMandate(mandate: Mandate) {
  try {
    console.log("Données reçues dans saveMandate:", {
      lastName: mandate.sellers?.[0]?.lastName,
      officialDesignation: mandate.officialDesignation,
      propertyType: mandate.propertyType,
      mandateNumber: mandate.mandate_number
    });

    if (!mandate.sellers || mandate.sellers.length === 0) {
      throw new Error('Le mandat doit avoir au moins un vendeur');
    }

    const mandateCopy = typeof structuredClone !== 'undefined'
      ? structuredClone(mandate)
      : JSON.parse(JSON.stringify(mandate));

    const netPrice = toNumber(mandateCopy.netPrice);
    const feesTTC = toNumber(mandateCopy.fees?.ttc);
    const feesHT = toNumber(mandateCopy.fees?.ht);
    const totalPriceHAI = netPrice + feesTTC;

    const etatcivilvendeurcomplet = generateCivilStatus(mandateCopy.sellers);

    const mandateData = {
      mandate_number: mandateCopy.mandate_number,
      date: formatDate(mandateCopy.date) || new Date().toISOString().split('T')[0],
      type: mandateCopy.type,
      net_price: netPrice,
      fees_ttc: feesTTC,
      fees_ht: feesHT,
      total_price_hai: totalPriceHAI,
      fees_payer: mandateCopy.feesPayer,
      commercial: mandateCopy.commercial,
      has_keys: mandateCopy.keys?.hasKeys || false,
      keys_received_date: formatDate(mandateCopy.keys?.receivedDate),
      keys_returned_date: formatDate(mandateCopy.keys?.returnedDate),
      keys_details: mandateCopy.keys?.details || '',
      amendments: mandateCopy.amendments || [],

      // Informations du vendeur principal
      owner_title: mandateCopy.sellers[0].title || 'Mr',
      owner_first_name: mandateCopy.sellers[0].firstName || '',
      owner_last_name: mandateCopy.sellers[0].lastName || '',
      owner_birth_date: formatDate(mandateCopy.sellers[0].birthDate),
      owner_birth_place: mandateCopy.sellers[0].birthPlace || '',
      owner_birth_postal_code: mandateCopy.sellers[0].birthPostalCode || '',
      owner_nationality: mandateCopy.sellers[0].nationality || 'Française',
      owner_profession: mandateCopy.sellers[0].profession || '',
      owner_address: mandateCopy.sellers[0].address?.fullAddress || '',
      owner_phone: mandateCopy.sellers[0].phone || '',
      owner_email: mandateCopy.sellers[0].email || '',
      owner_marital_status: mandateCopy.sellers[0].maritalStatus || 'celibataire-non-pacse',
      owner_custom_marital_status: mandateCopy.sellers[0].customMaritalStatus,
      owner_has_french_tax_residence: mandateCopy.sellers[0].hasFrenchTaxResidence !== false,
      marriage_date: formatDate(mandateCopy.sellers[0].marriageDetails?.date),
      marriage_place: mandateCopy.sellers[0].marriageDetails?.place,
      marriage_regime: mandateCopy.sellers[0].marriageDetails?.regime,
      pacs_date: formatDate(mandateCopy.sellers[0].pacsDetails?.date),
      pacs_place: mandateCopy.sellers[0].pacsDetails?.place,
      pacs_reference: mandateCopy.sellers[0].pacsDetails?.reference,
      pacs_partner_name: mandateCopy.sellers[0].pacsDetails?.partnerName,
      divorce_ex_spouse_name: mandateCopy.sellers[0].divorceDetails?.exSpouseName,
      deceased_spouse_name: mandateCopy.sellers[0].widowDetails?.deceasedSpouseName,

      // Informations du second vendeur
      second_owner_title: mandateCopy.sellers[1]?.title || null,
      second_owner_first_name: mandateCopy.sellers[1]?.firstName || null,
      second_owner_last_name: mandateCopy.sellers[1]?.lastName || null,
      second_owner_birth_date: formatDate(mandateCopy.sellers[1]?.birthDate),
      second_owner_birth_place: mandateCopy.sellers[1]?.birthPlace || null,
      second_owner_birth_postal_code: mandateCopy.sellers[1]?.birthPostalCode || null,
      second_owner_nationality: mandateCopy.sellers[1]?.nationality || null,
      second_owner_profession: mandateCopy.sellers[1]?.profession || null,
      second_owner_address: mandateCopy.sellers[1]?.address?.fullAddress || null,
      second_owner_phone: mandateCopy.sellers[1]?.phone || null,
      second_owner_email: mandateCopy.sellers[1]?.email || null,
      second_owner_marital_status: mandateCopy.sellers[1]?.maritalStatus || null,
      second_owner_custom_marital_status: mandateCopy.sellers[1]?.customMaritalStatus || null,
      second_owner_has_french_tax_residence: mandateCopy.sellers[1]?.hasFrenchTaxResidence,
      second_owner_marriage_date: formatDate(mandateCopy.sellers[1]?.marriageDetails?.date),
      second_owner_marriage_place: mandateCopy.sellers[1]?.marriageDetails?.place || null,
      second_owner_marriage_regime: mandateCopy.sellers[1]?.marriageDetails?.regime || null,
      second_owner_pacs_date: formatDate(mandateCopy.sellers[1]?.pacsDetails?.date),
      second_owner_pacs_place: mandateCopy.sellers[1]?.pacsDetails?.place || null,
      second_owner_pacs_reference: mandateCopy.sellers[1]?.pacsDetails?.reference || null,
      second_owner_pacs_partner_name: mandateCopy.sellers[1]?.pacsDetails?.partnerName || null,
      second_owner_divorce_ex_spouse_name: mandateCopy.sellers[1]?.divorceDetails?.exSpouseName || null,
      second_owner_deceased_spouse_name: mandateCopy.sellers[1]?.widowDetails?.deceasedSpouseName || null,

      // Vendeurs additionnels
      additional_owners: mandateCopy.sellers.length > 2 ?
        mandateCopy.sellers.slice(2) :
        [],

      // Informations du bien
      property_address: mandateCopy.propertyAddress?.fullAddress || '',
      property_type: mandateCopy.propertyType || 'copropriete',
      property_family_type: mandateCopy.sellers[0].propertyType || 'personal-not-family',
      is_in_copropriete: mandateCopy.isInCopropriete || false,
      total_surface: toNumber(mandateCopy.surface),
      land_surface: toNumber(mandateCopy.landSurface),
      total_rooms: toNumber(mandateCopy.rooms),
      bedrooms: toNumber(mandateCopy.bedrooms),
      construction_year: mandateCopy.constructionYear,
      condition: mandateCopy.condition || 'good',

      // Critères techniques
      has_elevator: mandateCopy.criteria?.hasElevator || false,
      floor_number: toNumber(mandateCopy.criteria?.floorNumber),
      total_floors: toNumber(mandateCopy.criteria?.totalFloors),
      heating_type: mandateCopy.criteria?.heatingType || 'individual',
      heating_energy: mandateCopy.criteria?.heatingEnergy || 'gas',
      has_cellar: mandateCopy.criteria?.hasCellar || false,
      has_parking: mandateCopy.criteria?.hasParking || false,
      has_balcony: mandateCopy.criteria?.hasBalcony || false,
      has_terrace: mandateCopy.criteria?.hasTerrace || false,
      has_garden: mandateCopy.criteria?.hasGarden || false,
      exposure: mandateCopy.criteria?.exposure || 'south',
      living_room_surface: toNumber(mandateCopy.criteria?.livingRoomSurface),
      bathrooms: toNumber(mandateCopy.criteria?.bathrooms),
      shower_rooms: toNumber(mandateCopy.criteria?.showerRooms),
      kitchen_type: mandateCopy.criteria?.kitchenType || 'open-equipped',
      basement_type: mandateCopy.criteria?.basement || 'none',
      has_gas: mandateCopy.criteria?.hasGas || false,
      has_garage: mandateCopy.criteria?.hasGarage || false,
      has_fireplace: mandateCopy.criteria?.hasFireplace || false,
      has_wood_stove: mandateCopy.criteria?.hasWoodStove || false,
      has_electric_shutters: mandateCopy.criteria?.hasElectricShutters || false,
      has_electric_gate: mandateCopy.criteria?.hasElectricGate || false,
      has_convertible_attic: mandateCopy.criteria?.hasConvertibleAttic || false,
      copro_fees: toNumber(mandateCopy.criteria?.chargesCopro),
      floor_level: mandateCopy.criteria?.floorLevel,

      // Niveaux et pièces
      levels: mandateCopy.levels || [],

      // Points forts et faibles
      strengths: mandateCopy.features?.filter(f => f.type === 'strength').map(f => f.description) || [],
      weaknesses: mandateCopy.features?.filter(f => f.type === 'weakness').map(f => f.description) || [],

      // Analyse de marché
      market_average_price: toNumber(mandateCopy.marketAnalysis?.averagePrice),
      market_price_range_min: toNumber(mandateCopy.marketAnalysis?.priceRange?.min),
      market_price_range_max: toNumber(mandateCopy.marketAnalysis?.priceRange?.max),
      market_trend: mandateCopy.marketAnalysis?.marketTrend || 'stable',
      market_average_sale_time: toNumber(mandateCopy.marketAnalysis?.averageSaleTime),

      // Prix estimés
      estimated_price_low: toNumber(mandateCopy.estimatedPrice?.low),
      estimated_price_high: toNumber(mandateCopy.estimatedPrice?.high),
      price_per_sqm: toNumber(mandateCopy.pricePerSqm),

      // Informations supplémentaires
      comments: mandateCopy.comments || '',
      etatcivilvendeurcomplet,
      official_designation: mandateCopy.officialDesignation || '',
      coproperty_address: mandateCopy.coPropertyAddress?.fullAddress || '',
      cadastral_sections: JSON.stringify(mandateCopy.cadastralSections || []),
      occupation_status: mandateCopy.occupationStatus || 'occupied-by-seller',
      dpe_status: mandateCopy.dpeStatus || 'completed',
      lots: JSON.stringify(mandateCopy.lots || []),
      kitchen_furniture: mandateCopy.kitchenFurniture || []
    };

    const { data, error } = await supabase
      .from('mandats')
      .upsert(mandateData, {
        onConflict: 'mandate_number'
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }

    console.log('Sauvegarde réussie:', data);
    return data;
  } catch (error) {
    console.error('Erreur dans saveMandate:', error);
    throw error;
  }
}

export async function getMandates() {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .select(`
        *,
        notaire_vendeur:notaire_vendeur_id (*),
        notaire_acquereur:notaire_acquereur_id (*),
        syndic:syndic_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mandates:', error);
      throw error;
    }

    return data.map(mandate => ({
      date: mandate.date,
      type: mandate.type || 'exclusive',
      mandate_number: mandate.mandate_number,
      netPrice: mandate.net_price || 0,
      fees: {
        ttc: mandate.fees_ttc !== undefined ? mandate.fees_ttc : 0,
        ht: mandate.fees_ht !== undefined ? mandate.fees_ht : 0
      },
      feesPayer: mandate.fees_payer || 'seller',
      commercial: mandate.commercial,
      keys: {
        hasKeys: mandate.has_keys || false,
        receivedDate: mandate.keys_received_date,
        returnedDate: mandate.keys_returned_date,
        details: mandate.keys_details || ''
      },
      amendments: mandate.amendments || [],
      purchaseOffers: mandate.purchase_offers || [],
      sellers: [
        {
          type: 'individual',
          title: mandate.owner_title || 'Mr',
          firstName: mandate.owner_first_name || '',
          lastName: mandate.owner_last_name || '',
          birthDate: mandate.owner_birth_date,
          birthPlace: mandate.owner_birth_place || '',
          birthPostalCode: mandate.owner_birth_postal_code || '',
          nationality: mandate.owner_nationality || 'Française',
          profession: mandate.owner_profession || '',
          maritalStatus: mandate.owner_marital_status || 'celibataire-non-pacse',
          customMaritalStatus: mandate.owner_custom_marital_status,
          marriageDetails: mandate.marriage_date ? {
            date: mandate.marriage_date,
            place: mandate.marriage_place || '',
            regime: mandate.marriage_regime || 'community'
          } : {
            date: '',
            place: '',
            regime: 'community'
          },
          pacsDetails: mandate.pacs_date ? {
            date: mandate.pacs_date,
            place: mandate.pacs_place || '',
            reference: mandate.pacs_reference || '',
            partnerName: mandate.pacs_partner_name || ''
          } : undefined,
          divorceDetails: mandate.divorce_ex_spouse_name ? {
            exSpouseName: mandate.divorce_ex_spouse_name
          } : undefined,
          widowDetails: mandate.deceased_spouse_name ? {
            deceasedSpouseName: mandate.deceased_spouse_name
          } : undefined,
          address: {
            fullAddress: mandate.owner_address || ''
          },
          phone: mandate.owner_phone || '',
          email: mandate.owner_email || '',
          hasFrenchTaxResidence: mandate.owner_has_french_tax_residence !== false,
          propertyType: mandate.property_family_type || 'personal-not-family'
        },
        ...(mandate.second_owner_first_name || mandate.second_owner_last_name ? [{
          type: 'individual',
          title: mandate.second_owner_title || 'Mr',
          firstName: mandate.second_owner_first_name || '',
          lastName: mandate.second_owner_last_name || '',
          birthDate: mandate.second_owner_birth_date,
          birthPlace: mandate.second_owner_birth_place || '',
          birthPostalCode: mandate.second_owner_birth_postal_code || '',
          nationality: mandate.second_owner_nationality || 'Française',
          profession: mandate.second_owner_profession || '',
          maritalStatus: mandate.second_owner_marital_status || 'celibataire-non-pacse',
          customMaritalStatus: mandate.second_owner_custom_marital_status,
          marriageDetails: mandate.second_owner_marriage_date ? {
            date: mandate.second_owner_marriage_date,
            place: mandate.second_owner_marriage_place || '',
            regime: mandate.second_owner_marriage_regime || 'community'
          } : {
            date: '',
            place: '',
            regime: 'community'
          },
          pacsDetails: mandate.second_owner_pacs_date ? {
            date: mandate.second_owner_pacs_date,
            place: mandate.second_owner_pacs_place || '',
            reference: mandate.second_owner_pacs_reference || '',
            partnerName: mandate.second_owner_pacs_partner_name || ''
          } : undefined,
          divorceDetails: mandate.second_owner_divorce_ex_spouse_name ? {
            exSpouseName: mandate.second_owner_divorce_ex_spouse_name
          } : undefined,
          widowDetails: mandate.second_owner_deceased_spouse_name ? {
            deceasedSpouseName: mandate.second_owner_deceased_spouse_name
          } : undefined,
          address: {
            fullAddress: mandate.second_owner_address || ''
          },
          phone: mandate.second_owner_phone || '',
          email: mandate.second_owner_email || '',
          hasFrenchTaxResidence: mandate.second_owner_has_french_tax_residence !== false,
          propertyType: mandate.property_family_type || 'personal-not-family'
        }] : []),
        ...(mandate.additional_owners || [])
      ],
      propertyAddress: {
        fullAddress: mandate.property_address || ''
      },
      propertyType: mandate.property_type || 'copropriete',
      isInCopropriete: mandate.is_in_copropriete || false,
      surface: mandate.total_surface || 0,
      landSurface: mandate.land_surface || 0,
      rooms: mandate.total_rooms || 0,
      bedrooms: mandate.bedrooms || 0,
      constructionYear: mandate.construction_year,
      condition: mandate.condition || 'good',
      criteria: {
        hasElevator: mandate.has_elevator || false,
        floorNumber: mandate.floor_number || 0,
        totalFloors: mandate.total_floors || 0,
        heatingType: mandate.heating_type || 'individual',
        heatingEnergy: mandate.heating_energy || 'gas',
        hasCellar: mandate.has_cellar || false,
        hasParking: mandate.has_parking || false,
        hasBalcony: mandate.has_balcony || false,
        hasTerrace: mandate.has_terrace || false,
        hasGarden: mandate.has_garden || false,
        exposure: mandate.exposure || 'south',
        livingRoomSurface: mandate.living_room_surface || 0,
        bathrooms: mandate.bathrooms || 0,
        showerRooms: mandate.shower_rooms || 0,
        kitchenType: mandate.kitchen_type || 'open-equipped',
        heatingSystem: mandate.heating_type || 'individual-gas',
        basement: mandate.basement_type || 'none',
        chargesCopro: mandate.copro_fees || 0,
        floorLevel: mandate.floor_level,
        hasGas: mandate.has_gas || false,
        hasGarage: mandate.has_garage || false,
        hasFireplace: mandate.has_fireplace || false,
        hasWoodStove: mandate.has_wood_stove || false,
        hasElectricShutters: mandate.has_electric_shutters || false,
        hasElectricGate: mandate.has_electric_gate || false,
        hasConvertibleAttic: mandate.has_convertible_attic || false
      },
      levels: mandate.levels || [],
      features: [
        ...(mandate.strengths || []).map(strength => ({
          type: 'strength' as const,
          description: strength
        })),
        ...(mandate.weaknesses || []).map(weakness => ({
          type: 'weakness' as const,
          description: weakness
        }))
      ],
      marketAnalysis: {
        averagePrice: mandate.market_average_price || 0,
        priceRange: {
          min: mandate.market_price_range_min || 0,
          max: mandate.market_price_range_max || 0
        },
        marketTrend: mandate.market_trend || 'stable',
        averageSaleTime: mandate.market_average_sale_time || 0
      },
      estimatedPrice: {
        low: mandate.estimated_price_low || 0,
        high: mandate.estimated_price_high || 0
      },
      pricePerSqm: mandate.price_per_sqm || 0,
      comments: mandate.comments || '',
      etatcivilvendeurcomplet: mandate.etatcivilvendeurcomplet || '',
      officialDesignation: mandate.official_designation || '',
      coPropertyAddress: {
        fullAddress: mandate.coproperty_address || ''
      },
      cadastralSections: typeof mandate.cadastral_sections === 'string' ? 
        JSON.parse(mandate.cadastral_sections) : 
        [],
      occupationStatus: mandate.occupation_status || 'occupied-by-seller',
      dpeStatus: mandate.dpe_status || 'completed',
      lots: typeof mandate.lots === 'string' ? 
        JSON.parse(mandate.lots) : 
        [],
      kitchenFurniture: mandate.kitchen_furniture || [],
      notaireVendeur: mandate.notaire_vendeur,
      notaireAcquereur: mandate.notaire_acquereur,
      syndic: mandate.syndic
    }));
  } catch (error) {
    console.error('Error in getMandates:', error);
    throw error;
  }
}

export async function getMandate(mandate_number: string) {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .select(`
        *,
        notaire_vendeur:notaire_vendeur_id (*),
        notaire_acquereur:notaire_acquereur_id (*),
        syndic:syndic_id (*)
      `)
      .eq('mandate_number', mandate_number)
      .single();

    if (error) {
      console.error('Error fetching mandate:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      date: data.date,
      type: data.type || 'exclusive',
      mandate_number: data.mandate_number,
      netPrice: data.net_price || 0,
      fees: {
        ttc: data.fees_ttc !== undefined ? data.fees_ttc : 0,
        ht: data.fees_ht !== undefined ? data.fees_ht : 0
      },
      feesPayer: data.fees_payer || 'seller',
      commercial: data.commercial,
      keys: {
        hasKeys: data.has_keys || false,
        receivedDate: data.keys_received_date,
        returnedDate: data.keys_returned_date,
        details: data.keys_details || ''
      },
      amendments: data.amendments || [],
      purchaseOffers: data.purchase_offers || [],
      sellers: [
        {
          type: 'individual',
          title: data.owner_title || 'Mr',
          firstName: data.owner_first_name || '',
          lastName: data.owner_last_name || '',
          birthDate: data.owner_birth_date,
          birthPlace: data.owner_birth_place || '',
          birthPostalCode: data.owner_birth_postal_code || '',
          nationality: data.owner_nationality || 'Française',
          profession: data.owner_profession || '',
          maritalStatus: data.owner_marital_status || 'celibataire-non-pacse',
          customMaritalStatus: data.owner_custom_marital_status,
          marriageDetails: data.marriage_date ? {
            date: data.marriage_date,
            place: data.marriage_place || '',
            regime: data.marriage_regime || 'community'
          } : {
            date: '',
            place: '',
            regime: 'community'
          },
          pacsDetails: data.pacs_date ? {
            date: data.pacs_date,
            place: data.pacs_place || '',
            reference: data.pacs_reference || '',
            partnerName: data.pacs_partner_name || ''
          } : undefined,
          divorceDetails: data.divorce_ex_spouse_name ? {
            exSpouseName: data.divorce_ex_spouse_name
          } : undefined,
          widowDetails: data.deceased_spouse_name ? {
            deceasedSpouseName: data.deceased_spouse_name
          } : undefined,
          address: {
            fullAddress: data.owner_address || ''
          },
          phone: data.owner_phone || '',
          email: data.owner_email || '',
          hasFrenchTaxResidence: data.owner_has_french_tax_residence !== false,
          propertyType: data.property_family_type || 'personal-not-family'
        },
        ...(data.second_owner_first_name || data.second_owner_last_name ? [{
          type: 'individual',
          title: data.second_owner_title || 'Mr',
          firstName: data.second_owner_first_name || '',
          lastName: data.second_owner_last_name || '',
          birthDate: data.second_owner_birth_date,
          birthPlace: data.second_owner_birth_place || '',
          birthPostalCode: data.second_owner_birth_postal_code || '',
          nationality: data.second_owner_nationality || 'Française',
          profession: data.second_owner_profession || '',
          maritalStatus: data.second_owner_marital_status || 'celibataire-non-pacse',
          customMaritalStatus: data.second_owner_custom_marital_status,
          marriageDetails: data.second_owner_marriage_date ? {
            date: data.second_owner_marriage_date,
            place: data.second_owner_marriage_place || '',
            regime: data.second_owner_marriage_regime || 'community'
          } : {
            date: '',
            place: '',
            regime: 'community'
          },
          pacsDetails: data.second_owner_pacs_date ? {
            date: data.second_owner_pacs_date,
            place: data.second_owner_pacs_place || '',
            reference: data.second_owner_pacs_reference || '',
            partnerName: data.second_owner_pacs_partner_name || ''
          } : undefined,
          divorceDetails: data.second_owner_divorce_ex_spouse_name ? {
            exSpouseName: data.second_owner_divorce_ex_spouse_name
          } : undefined,
          widowDetails: data.second_owner_deceased_spouse_name ? {
            deceasedSpouseName: data.second_owner_deceased_spouse_name
          } : undefined,
          address: {
            fullAddress: data.second_owner_address || ''
          },
          phone: data.second_owner_phone || '',
          email: data.second_owner_email || '',
          hasFrenchTaxResidence: data.second_owner_has_french_tax_residence !== false,
          propertyType: data.property_family_type || 'personal-not-family'
        }] : []),
        ...(data.additional_owners || [])
      ],
      propertyAddress: {
        fullAddress: data.property_address || ''
      },
      propertyType: data.property_type || 'copropriete',
      isInCopropriete: data.is_in_copropriete || false,
      surface: data.total_surface || 0,
      landSurface: data.land_surface || 0,
      rooms: data.total_rooms || 0,
      bedrooms: data.bedrooms || 0,
      constructionYear: data.construction_year,
      condition: data.condition || 'good',
      criteria: {
        hasElevator: data.has_elevator || false,
        floorNumber: data.floor_number || 0,
        totalFloors: data.total_floors || 0,
        heatingType: data.heating_type || 'individual',
        heatingEnergy: data.heating_energy || 'gas',
        hasCellar: data.has_cellar || false,
        hasParking: data.has_parking || false,
        hasBalcony: data.has_balcony || false,
        hasTerrace: data.has_terrace || false,
        hasGarden: data.has_garden || false,
        exposure: data.exposure || 'south',
        livingRoomSurface: data.living_room_surface || 0,
        bathrooms: data.bathrooms || 0,
        showerRooms: data.shower_rooms || 0,
        kitchenType: data.kitchen_type || 'open-equipped',
        heatingSystem: data.heating_type || 'individual-gas',
        basement: data.basement_type || 'none',
        chargesCopro: data.copro_fees || 0,
        floorLevel: data.floor_level,
        hasGas: data.has_gas || false,
        hasGarage: data.has_garage || false,
        hasFireplace: data.has_fireplace || false,
        hasWoodStove: data.has_wood_stove || false,
        hasElectricShutters: data.has_electric_shutters || false,
        hasElectricGate: data.has_electric_gate || false,
        hasConvertibleAttic: data.has_convertible_attic || false
      },
      levels: data.levels || [],
      features: [
        ...(data.strengths || []).map(strength => ({
          type: 'strength' as const,
          description: strength
        })),
        ...(data.weaknesses || []).map(weakness => ({
          type: 'weakness' as const,
          description: weakness
        }))
      ],
      marketAnalysis: {
        averagePrice: data.market_average_price || 0,
        priceRange: {
          min: data.market_price_range_min || 0,
          max: data.market_price_range_max || 0
        },
        marketTrend: data.market_trend || 'stable',
        averageSaleTime: data.market_average_sale_time || 0
      },
      estimatedPrice: {
        low: data.estimated_price_low || 0,
        high: data.estimated_price_high || 0
      },
      pricePerSqm: data.price_per_sqm || 0,
      comments: data.comments || '',
      etatcivilvendeurcomplet: data.etatcivilvendeurcomplet || '',
      officialDesignation: data.official_designation || '',
      coPropertyAddress: {
        fullAddress: data.coproperty_address || ''
      },
      cadastralSections: typeof data.cadastral_sections === 'string' ? 
        JSON.parse(data.cadastral_sections) : 
        [],
      occupationStatus: data.occupation_status || 'occupied-by-seller',
      dpeStatus: data.dpe_status || 'completed',
      lots: typeof data.lots === 'string' ? 
        JSON.parse(data.lots) : 
        [],
      kitchenFurniture: data.kitchen_furniture || [],
      notaireVendeur: data.notaire_vendeur,
      notaireAcquereur: data.notaire_acquereur,
      syndic: data.syndic
    };
  } catch (error) {
    console.error('Error getting mandate:', error);
    throw error;
  }
}

export async function deleteMandate(mandate_number: string) {
  try {
    const { error } = await supabase
      .from('mandats')
      .delete()
      .eq('mandate_number', mandate_number);

    if (error) {
      console.error('Error deleting mandate:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteMandate:', error);
    throw error;
  }
}