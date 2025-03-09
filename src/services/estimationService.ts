import { supabase } from '../lib/supabase';
import type { Estimation } from '../types';

export async function saveEstimation(estimation: Estimation) {
  try {
    // Récupérer l'utilisateur courant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convertir les valeurs numériques en nombres
    const convertToNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'string') {
        // Si la valeur est une chaîne non numérique, retourner null
        const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? null : num;
      }
      return typeof value === 'number' ? value : null;
    };

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

      // Owner Information - Primary Owner
      owner_title: mapOwnerTitle(estimation.owners[0]?.title),
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
      floor_level: estimation.criteria?.floorLevel || null,
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

    // Log des valeurs critiques pour le débogage
    console.log('Données envoyées à Supabase:', {
      floor_number: estimationData.floor_number,
      total_floors: estimationData.total_floors,
      floor_level: estimationData.floor_level,
      copro_fees: estimationData.copro_fees,
      heating_type: estimationData.heating_type,
      owner_title: estimationData.owner_title // Ajout du log pour owner_title
    });

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

// Fonction pour mapper les valeurs de heating_type
function mapHeatingType(heatingSystem: string | undefined): string {
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
}

// Fonction pour mapper les valeurs de owner_title
function mapOwnerTitle(title: string | undefined): string {
  switch (title) {
    case 'Monsieur':
      return 'Mr';
    case 'Madame':
      return 'Mrs';
    case 'Monsieur et Madame':
      return 'Mr and Mrs';
    default:
      return 'Mr'; // Valeur par défaut
  }
}
