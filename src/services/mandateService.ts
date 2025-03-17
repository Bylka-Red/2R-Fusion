import { supabase } from '../lib/supabase';
import type { Mandate, Seller } from '../types';

export async function getMandates() {
  try {
    const { data, error } = await supabase
      .from('mandats')
      .select('*, property_address')
      .select('*, property_type')
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
      sellers: [{
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
        } : undefined,
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
      }],
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
        floorLevel: mandate.floor_level
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
      comments: mandate.comments || ''
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
      .select('*')
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
      sellers: [{
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
        } : undefined,
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
      }],
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
        floorLevel: data.floor_level
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
      comments: data.comments || ''
    };
  } catch (error) {
    console.error('Error getting mandate:', error);
    throw error;
  }
}

export async function saveMandate(mandate: Mandate) {
  try {
    const formatDate = (date: string | undefined | null): string | null => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return date;
    };

    if (!mandate.sellers || mandate.sellers.length === 0) {
      throw new Error('Le mandat doit avoir au moins un vendeur');
    }

    const mandateData = {
      mandate_number: mandate.mandate_number,
      date: formatDate(mandate.date) || new Date().toISOString().split('T')[0],
      type: mandate.type,
      net_price: mandate.netPrice,
      fees_ttc: mandate.fees?.ttc !== undefined ? mandate.fees.ttc : 0,
      fees_ht: mandate.fees?.ht !== undefined ? mandate.fees.ht : 0,
      fees_payer: mandate.feesPayer,
      commercial: mandate.commercial,
      has_keys: mandate.keys?.hasKeys || false,
      keys_received_date: formatDate(mandate.keys?.receivedDate),
      keys_returned_date: formatDate(mandate.keys?.returnedDate),
      keys_details: mandate.keys?.details || '',
      amendments: mandate.amendments || [],
      purchase_offers: mandate.purchaseOffers || [],
      owner_title: mandate.sellers[0].title || 'Mr',
      owner_first_name: mandate.sellers[0].firstName || '',
      owner_last_name: mandate.sellers[0].lastName || '',
      owner_birth_date: formatDate(mandate.sellers[0].birthDate),
      owner_birth_place: mandate.sellers[0].birthPlace || '',
      owner_birth_postal_code: mandate.sellers[0].birthPostalCode || '',
      owner_nationality: mandate.sellers[0].nationality || 'Française',
      owner_profession: mandate.sellers[0].profession || '',
      owner_address: mandate.sellers[0].address?.fullAddress || '',
      owner_phone: mandate.sellers[0].phone || '',
      owner_email: mandate.sellers[0].email || '',
      owner_marital_status: mandate.sellers[0].maritalStatus || 'celibataire-non-pacse',
      owner_custom_marital_status: mandate.sellers[0].customMaritalStatus,
      owner_has_french_tax_residence: mandate.sellers[0].hasFrenchTaxResidence !== false,
      marriage_date: formatDate(mandate.sellers[0].marriageDetails?.date),
      marriage_place: mandate.sellers[0].marriageDetails?.place,
      marriage_regime: mandate.sellers[0].marriageDetails?.regime,
      pacs_date: formatDate(mandate.sellers[0].pacsDetails?.date),
      pacs_place: mandate.sellers[0].pacsDetails?.place,
      pacs_reference: mandate.sellers[0].pacsDetails?.reference,
      pacs_partner_name: mandate.sellers[0].pacsDetails?.partnerName,
      divorce_ex_spouse_name: mandate.sellers[0].divorceDetails?.exSpouseName,
      deceased_spouse_name: mandate.sellers[0].widowDetails?.deceasedSpouseName,
      property_address: mandate.propertyAddress?.fullAddress || '',
      property_type: mandate.propertyType || 'copropriete',
      property_family_type: mandate.sellers[0].propertyType || 'personal-not-family',
      is_in_copropriete: mandate.isInCopropriete || false,
      total_surface: mandate.surface || 0,
      land_surface: mandate.landSurface || 0,
      total_rooms: mandate.rooms || 0,
      bedrooms: mandate.bedrooms || 0,
      construction_year: mandate.constructionYear,
      condition: mandate.condition || 'good',
      has_elevator: mandate.criteria?.hasElevator || false,
      floor_number: mandate.criteria?.floorNumber || 0,
      total_floors: mandate.criteria?.totalFloors || 0,
      heating_type: mandate.criteria?.heatingType || 'individual',
      heating_energy: mandate.criteria?.heatingEnergy || 'gas',
      has_cellar: mandate.criteria?.hasCellar || false,
      has_parking: mandate.criteria?.hasParking || false,
      has_balcony: mandate.criteria?.hasBalcony || false,
      has_terrace: mandate.criteria?.hasTerrace || false,
      has_garden: mandate.criteria?.hasGarden || false,
      exposure: mandate.criteria?.exposure || 'south',
      living_room_surface: mandate.criteria?.livingRoomSurface || 0,
      bathrooms: mandate.criteria?.bathrooms || 0,
      shower_rooms: mandate.criteria?.showerRooms || 0,
      kitchen_type: mandate.criteria?.kitchenType || 'open-equipped',
      basement_type: mandate.criteria?.basement || 'none',
      has_gas: mandate.criteria?.hasGas || false,
      has_garage: mandate.criteria?.hasGarage || false,
      has_fireplace: mandate.criteria?.hasFireplace || false,
      has_wood_stove: mandate.criteria?.hasWoodStove || false,
      has_electric_shutters: mandate.criteria?.hasElectricShutters || false,
      has_electric_gate: mandate.criteria?.hasElectricGate || false,
      has_convertible_attic: mandate.criteria?.hasConvertibleAttic || false,
      copro_fees: mandate.criteria?.chargesCopro || 0,
      floor_level: mandate.criteria?.floorLevel,
      levels: mandate.levels || [],
      strengths: mandate.features?.filter(f => f.type === 'strength').map(f => f.description) || [],
      weaknesses: mandate.features?.filter(f => f.type === 'weakness').map(f => f.description) || [],
      market_average_price: mandate.marketAnalysis?.averagePrice || 0,
      market_price_range_min: mandate.marketAnalysis?.priceRange?.min || 0,
      market_price_range_max: mandate.marketAnalysis?.priceRange?.max || 0,
      market_trend: mandate.marketAnalysis?.marketTrend || 'stable',
      market_average_sale_time: mandate.marketAnalysis?.averageSaleTime || 0,
      estimated_price_low: mandate.estimatedPrice?.low || 0,
      estimated_price_high: mandate.estimatedPrice?.high || 0,
      price_per_sqm: mandate.pricePerSqm || 0,
      comments: mandate.comments || ''
    };

    console.log('Saving mandate data:', mandateData);

    const { data, error } = await supabase
      .from('mandats')
      .upsert(mandateData, {
        onConflict: 'mandate_number',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving mandate:', error);
      throw error;
    }

    console.log('Mandate saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in saveMandate:', error);
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
