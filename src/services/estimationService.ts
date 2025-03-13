import { supabase } from '../lib/supabase';
import type { Estimation } from '../types';

// Fonction pour mapper les valeurs de titre depuis la base de données
const mapTitleFromDb = (title: string | undefined): string => {
  if (!title) return 'Monsieur'; // Valeur par défaut

  switch (title) {
    case 'Mr':
      return 'Monsieur';
    case 'Mrs':
      return 'Madame';
    case 'Mr and Mrs':
      return 'Monsieur et Madame';
    default:
      return title; // Retourner le titre tel quel s'il ne correspond à aucun cas
  }
};

// Fonction pour mapper les valeurs de titre vers la base de données
const mapTitleToDb = (title: string | undefined): string | null => {
  if (!title) return null;

  switch (title) {
    case 'Monsieur':
      return 'Mr';
    case 'Madame':
      return 'Mrs';
    case 'Monsieur et Madame':
      return 'Mr and Mrs';
    default:
      return title; // Retourner le titre tel quel s'il ne correspond à aucun cas
  }
};

// Fonction pour mapper les valeurs de floor_level
const mapFloorLevel = (floorLevel: string | undefined): number | null => {
  switch (floorLevel) {
    case 'Rez-de-chaussée':
      return 0;
    case 'Premier étage':
      return 1;
    case 'Deuxième étage':
      return 2;
    default:
      return null;
  }
};

// Fonction pour convertir les valeurs numériques en nombres
const convertToNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  return typeof value === 'number' ? value : null;
};

// Fonction pour mapper les valeurs de heating_type
const mapHeatingType = (heatingSystem: string | undefined): string => {
  switch (heatingSystem) {
    case 'electric':
      return 'Électrique';
    case 'individual-gas':
      return 'Gaz individuel';
    case 'collective-gas':
      return 'Gaz collectif';
    case 'heat-pump':
      return 'Pompe à chaleur';
    case 'fuel':
      return 'Fuel';
    case 'collective-geothermal':
      return 'Géothermique collectif';
    default:
      return 'Gaz individuel'; // Valeur par défaut
  }
};

export async function saveEstimation(estimation: Estimation) {
  try {
    // Récupérer l'utilisateur courant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Préparer les données pour l'insertion
    const estimationData = {
      // Basic Information
      id: estimation.id,
      created_at: estimation.createdAt,
      updated_at: new Date().toISOString(),
      user_id: user.id,
      status: estimation.status,
      estimation_date: estimation.estimationDate,
      commercial: estimation.commercial,
      notes: estimation.notes || '',

      // Owner Information - Primary Owner
      owner_title: mapTitleToDb(estimation.owners[0]?.title),
      owner_first_name: estimation.owners[0]?.firstName || '',
      owner_last_name: estimation.owners[0]?.lastName || '',
      owner_birth_date: estimation.owners[0]?.birthDate || null,
      owner_birth_place: estimation.owners[0]?.birthPlace || null,
      owner_birth_postal_code: estimation.owners[0]?.birthPostalCode || null,
      owner_nationality: estimation.owners[0]?.nationality || 'Française',
      owner_profession: estimation.owners[0]?.profession || '',
      owner_address: estimation.owners[0]?.address?.fullAddress || estimation.propertyAddress.fullAddress,
      owner_phone: estimation.owners[0]?.phones?.[0] || '',
      owner_email: estimation.owners[0]?.emails?.[0] || '',
      owner_has_french_tax_residence: estimation.owners[0]?.hasFrenchTaxResidence ?? true,

      // Marital Status
      owner_marital_status: estimation.owners[0]?.maritalStatus || 'celibataire-non-pacse',
      owner_custom_marital_status: estimation.owners[0]?.customMaritalStatus || null,

      // Marriage Details
      marriage_date: estimation.owners[0]?.marriageDetails?.date || null,
      marriage_place: estimation.owners[0]?.marriageDetails?.place || null,
      marriage_regime: estimation.owners[0]?.marriageDetails?.regime || null,

      // PACS Details
      pacs_date: estimation.owners[0]?.pacsDetails?.date || null,
      pacs_place: estimation.owners[0]?.pacsDetails?.place || null,
      pacs_reference: estimation.owners[0]?.pacsDetails?.reference || null,
      pacs_partner_name: estimation.owners[0]?.pacsDetails?.partnerName || null,

      // Divorce/Widow Details
      ex_spouse_name: estimation.owners[0]?.divorceDetails?.exSpouseName || null,
      deceased_spouse_name: estimation.owners[0]?.widowDetails?.deceasedSpouseName || null,

      // Property Location
      property_address: estimation.propertyAddress.fullAddress || '',
      property_type: estimation.propertyType || 'apartment',
      is_in_copropriete: estimation.isInCopropriete ?? false,
      property_family_type: estimation.owners[0]?.propertyType || 'personal-not-family',

      // Basic Property Details
      total_surface: convertToNumber(estimation.surface),
      living_surface: convertToNumber(estimation.surface),
      land_surface: convertToNumber(estimation.landSurface),
      total_rooms: convertToNumber(estimation.rooms),
      bedrooms: convertToNumber(estimation.bedrooms),
      bathrooms: convertToNumber(estimation.criteria?.bathrooms),
      shower_rooms: convertToNumber(estimation.criteria?.showerRooms),
      living_room_surface: convertToNumber(estimation.criteria?.livingRoomSurface),
      construction_year: convertToNumber(estimation.criteria?.constructionYear),
      property_tax: convertToNumber(estimation.criteria?.propertyTax),

      // Nouveaux champs
      floor_number: convertToNumber(estimation.criteria?.floorNumber),
      total_floors: convertToNumber(estimation.criteria?.totalFloors),
      floor_level: mapFloorLevel(estimation.criteria?.floorLevel),
      copro_fees: convertToNumber(estimation.criteria?.chargesCopro),

      // Property Condition
      condition: estimation.condition || 'good',

      // Technical Features (boolean flags)
      has_elevator: estimation.criteria?.hasElevator ?? false,
      has_cellar: estimation.criteria?.hasCellar ?? false,
      has_parking: estimation.criteria?.hasParking ?? false,
      has_balcony: estimation.criteria?.hasBalcony ?? false,
      has_terrace: estimation.criteria?.hasTerrace ?? false,
      has_garden: estimation.criteria?.hasGarden ?? false,
      has_gas: estimation.criteria?.hasGas ?? false,
      has_garage: estimation.criteria?.hasGarage ?? false,
      has_fireplace: estimation.criteria?.hasFireplace ?? false,
      has_wood_stove: estimation.criteria?.hasWoodStove ?? false,
      has_electric_shutters: estimation.criteria?.hasElectricShutters ?? false,
      has_electric_gate: estimation.criteria?.hasElectricGate ?? false,
      has_convertible_attic: estimation.criteria?.hasConvertibleAttic ?? false,

      // Property Specifications
      exposure: estimation.criteria?.exposure || 'south',
      heating_type: mapHeatingType(estimation.criteria?.heatingSystem),
      heating_energy: estimation.criteria?.heatingEnergy || 'gas',
      kitchen_type: estimation.criteria?.kitchenType || 'open-equipped',
      basement_type: estimation.criteria?.basement || 'none',

      // Market Analysis
      market_average_price: convertToNumber(estimation.marketAnalysis?.averagePrice),
      market_price_range_min: convertToNumber(estimation.marketAnalysis?.priceRange?.min),
      market_price_range_max: convertToNumber(estimation.marketAnalysis?.priceRange?.max),
      market_trend: estimation.marketAnalysis?.marketTrend || 'stable',
      market_average_sale_time: convertToNumber(estimation.marketAnalysis?.averageSaleTime),

      // Estimation Results
      estimated_price_low: convertToNumber(estimation.estimatedPrice?.low),
      estimated_price_high: convertToNumber(estimation.estimatedPrice?.high),
      price_per_sqm: convertToNumber(estimation.pricePerSqm),

      // Features and Analysis (stored as arrays)
      strengths: estimation.features?.filter(f => f.type === 'strength').map(f => f.description) || [],
      weaknesses: estimation.features?.filter(f => f.type === 'weakness').map(f => f.description) || [],
      sold_prices: estimation.features?.filter(f => f.type === 'soldPrice').map(f => f.description) || [],
      for_sale_prices: estimation.features?.filter(f => f.type === 'forSalePrice').map(f => f.description) || [],
      sale_dates: estimation.features?.filter(f => f.type === 'saleDate').map(f => f.description) || [],

      // Room Layout (kept as JSONB for flexibility)
      levels: estimation.levels || [],

      // Additional Information
      comments: estimation.comments || '',

      // Diagnostic Information
      diagnostic_property_type: estimation.diagnosticInfo?.propertyType || 'copropriete',
      has_city_gas: estimation.diagnosticInfo?.hasCityGas ?? false,
    };

    // Insérer ou mettre à jour l'estimation
    const { data, error } = await supabase
      .from('estimations')
      .upsert(estimationData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving estimation:', error);
    throw error;
  }
}

export async function getEstimation(id: string) {
  try {
    const { data, error } = await supabase
      .from('estimations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching estimation:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Transformer les données de la base de données en modèle d'application
    return {
      ...data,
      owners: [
        {
          title: mapTitleFromDb(data.owner_title),
          firstName: data.owner_first_name || '',
          lastName: data.owner_last_name || '',
          address: {
            fullAddress: data.owner_address || ''
          },
          phones: [data.owner_phone || ''],
          emails: [data.owner_email || ''],
          birthDate: data.owner_birth_date,
          birthPlace: data.owner_birth_place,
          birthPostalCode: data.owner_birth_postal_code,
          nationality: data.owner_nationality,
          profession: data.owner_profession,
          hasFrenchTaxResidence: data.owner_has_french_tax_residence,
          maritalStatus: data.owner_marital_status,
          customMaritalStatus: data.owner_custom_marital_status,
          marriageDetails: data.marriage_date ? {
            date: data.marriage_date,
            place: data.marriage_place,
            regime: data.marriage_regime
          } : undefined,
          pacsDetails: data.pacs_date ? {
            date: data.pacs_date,
            place: data.pacs_place,
            reference: data.pacs_reference,
            partnerName: data.pacs_partner_name
          } : undefined,
          divorceDetails: data.ex_spouse_name ? {
            exSpouseName: data.ex_spouse_name
          } : undefined,
          widowDetails: data.deceased_spouse_name ? {
            deceasedSpouseName: data.deceased_spouse_name
          } : undefined,
          propertyType: data.property_family_type
        }
      ],
      propertyAddress: {
        fullAddress: data.property_address || ''
      },
      propertyType: data.property_type || 'apartment',
      isInCopropriete: data.is_in_copropriete ?? false,
      commercial: data.commercial || '',
      estimationDate: data.estimation_date || '',
      surface: data.total_surface || 0,
      rooms: data.total_rooms || 0,
      bedrooms: data.bedrooms || 0,
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
        heatingSystem: data.heating_system || 'individual-gas',
        basement: data.basement_type || 'none',
        landSurface: data.land_surface || 0,
        constructionYear: data.construction_year,
        propertyTax: data.property_tax || 0,
        hasGas: data.has_gas || false,
        hasGarage: data.has_garage || false,
        hasFireplace: data.has_fireplace || false,
        hasWoodStove: data.has_wood_stove || false,
        hasElectricShutters: data.has_electric_shutters || false,
        hasElectricGate: data.has_electric_gate || false,
        hasConvertibleAttic: data.has_convertible_attic || false,
        chargesCopro: data.copro_fees || 0,
        floorLevel: data.floor_level
      },
      diagnosticInfo: {
        propertyType: data.diagnostic_property_type || 'copropriete',
        hasCityGas: data.has_city_gas || false
      },
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
      levels: data.levels || [],
      comments: data.comments || ''
    };
  } catch (error) {
    console.error('Error getting estimation:', error);
    throw error;
  }
}