export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      estimations: {
        Row: {
          // Basic Information
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: 'draft' | 'completed' | 'converted'
          estimation_date: string
          commercial: string | null

          // Owner Information - Primary Owner
          owner_title: 'Mr' | 'Mrs' | null
          owner_first_name: string | null
          owner_last_name: string | null
          owner_birth_date: string | null
          owner_birth_place: string | null
          owner_birth_postal_code: string | null
          owner_nationality: string | null
          owner_profession: string | null
          owner_address: string | null
          owner_phone: string | null
          owner_email: string | null
          owner_has_french_tax_residence: boolean | null

          // Marital Status
          owner_marital_status: 'celibataire-non-pacse' | 'celibataire-pacse' | 'marie-sans-contrat' | 'communaute-acquets' | 'separation-biens' | 'communaute-universelle' | 'divorce' | 'veuf' | 'autre' | null
          owner_custom_marital_status: string | null
          
          // Marriage Details
          marriage_date: string | null
          marriage_place: string | null
          marriage_regime: 'community' | 'separation' | 'universal' | 'other' | null

          // PACS Details
          pacs_date: string | null
          pacs_place: string | null
          pacs_reference: string | null
          pacs_partner_name: string | null

          // Divorce/Widow Details
          ex_spouse_name: string | null
          deceased_spouse_name: string | null

          // Property Location
          property_address: string
          property_type: 'house' | 'apartment'
          is_in_copropriete: boolean
          property_family_type: 'personal-not-family' | 'personal-family' | null

          // Basic Property Details
          total_surface: number | null
          living_surface: number | null
          land_surface: number | null
          total_rooms: number | null
          bedrooms: number | null
          bathrooms: number | null
          shower_rooms: number | null
          living_room_surface: number | null
          construction_year: number | null
          property_tax: number | null
          copro_fees: number | null

          // Property Condition
          condition: 'new' | 'excellent' | 'good' | 'needs-work' | 'to-renovate' | null
          energy_class: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null

          // Technical Features (boolean flags)
          has_elevator: boolean
          has_cellar: boolean
          has_parking: boolean
          has_balcony: boolean
          has_terrace: boolean
          has_garden: boolean
          has_gas: boolean
          has_garage: boolean
          has_fireplace: boolean
          has_wood_stove: boolean
          has_electric_shutters: boolean
          has_electric_gate: boolean
          has_convertible_attic: boolean

          // Property Specifications
          floor_number: number | null
          total_floors: number | null
          floor_level: string | null
          exposure: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west' | null
          heating_type: 'individual' | 'collective' | 'none' | null
          heating_energy: 'gas' | 'electricity' | 'fuel' | 'wood' | 'other' | 'none' | null
          kitchen_type: 'open-equipped' | 'closed-equipped' | 'open-fitted' | 'closed-fitted' | 'to-create' | null
          basement_type: string | null

          // Market Analysis
          market_average_price: number | null
          market_price_range_min: number | null
          market_price_range_max: number | null
          market_trend: 'up' | 'down' | 'stable' | null
          market_average_sale_time: number | null

          // Estimation Results
          estimated_price_low: number | null
          estimated_price_high: number | null
          price_per_sqm: number | null

          // Features and Analysis (stored as arrays)
          strengths: string[] | null
          weaknesses: string[] | null
          sold_prices: string[] | null
          for_sale_prices: string[] | null
          sale_dates: string[] | null

          // Room Layout (kept as JSONB for flexibility)
          levels: Json | null

          // Additional Information
          comments: string | null

          // Diagnostic Information
          diagnostic_property_type: 'monopropriete' | 'copropriete' | 'asl' | null
          has_city_gas: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: 'draft' | 'completed' | 'converted'
          estimation_date: string
          commercial?: string | null
          owner_title?: 'Mr' | 'Mrs' | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_birth_date?: string | null
          owner_birth_place?: string | null
          owner_birth_postal_code?: string | null
          owner_nationality?: string | null
          owner_profession?: string | null
          owner_address?: string | null
          owner_phone?: string | null
          owner_email?: string | null
          owner_has_french_tax_residence?: boolean | null
          owner_marital_status?: 'celibataire-non-pacse' | 'celibataire-pacse' | 'marie-sans-contrat' | 'communaute-acquets' | 'separation-biens' | 'communaute-universelle' | 'divorce' | 'veuf' | 'autre' | null
          owner_custom_marital_status?: string | null
          marriage_date?: string | null
          marriage_place?: string | null
          marriage_regime?: 'community' | 'separation' | 'universal' | 'other' | null
          pacs_date?: string | null
          pacs_place?: string | null
          pacs_reference?: string | null
          pacs_partner_name?: string | null
          ex_spouse_name?: string | null
          deceased_spouse_name?: string | null
          property_address: string
          property_type: 'house' | 'apartment'
          is_in_copropriete?: boolean
          property_family_type?: 'personal-not-family' | 'personal-family' | null
          total_surface?: number | null
          living_surface?: number | null
          land_surface?: number | null
          total_rooms?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          shower_rooms?: number | null
          living_room_surface?: number | null
          construction_year?: number | null
          property_tax?: number | null
          copro_fees?: number | null
          condition?: 'new' | 'excellent' | 'good' | 'needs-work' | 'to-renovate' | null
          energy_class?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null
          has_elevator?: boolean
          has_cellar?: boolean
          has_parking?: boolean
          has_balcony?: boolean
          has_terrace?: boolean
          has_garden?: boolean
          has_gas?: boolean
          has_garage?: boolean
          has_fireplace?: boolean
          has_wood_stove?: boolean
          has_electric_shutters?: boolean
          has_electric_gate?: boolean
          has_convertible_attic?: boolean
          floor_number?: number | null
          total_floors?: number | null
          floor_level?: string | null
          exposure?: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west' | null
          heating_type?: 'individual' | 'collective' | 'none' | null
          heating_energy?: 'gas' | 'electricity' | 'fuel' | 'wood' | 'other' | 'none' | null
          kitchen_type?: 'open-equipped' | 'closed-equipped' | 'open-fitted' | 'closed-fitted' | 'to-create' | null
          basement_type?: string | null
          market_average_price?: number | null
          market_price_range_min?: number | null
          market_price_range_max?: number | null
          market_trend?: 'up' | 'down' | 'stable' | null
          market_average_sale_time?: number | null
          estimated_price_low?: number | null
          estimated_price_high?: number | null
          price_per_sqm?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          sold_prices?: string[] | null
          for_sale_prices?: string[] | null
          sale_dates?: string[] | null
          levels?: Json | null
          comments?: string | null
          diagnostic_property_type?: 'monopropriete' | 'copropriete' | 'asl' | null
          has_city_gas?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: 'draft' | 'completed' | 'converted'
          estimation_date?: string
          commercial?: string | null
          owner_title?: 'Mr' | 'Mrs' | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          owner_birth_date?: string | null
          owner_birth_place?: string | null
          owner_birth_postal_code?: string | null
          owner_nationality?: string | null
          owner_profession?: string | null
          owner_address?: string | null
          owner_phone?: string | null
          owner_email?: string | null
          owner_has_french_tax_residence?: boolean | null
          owner_marital_status?: 'celibataire-non-pacse' | 'celibataire-pacse' | 'marie-sans-contrat' | 'communaute-acquets' | 'separation-biens' | 'communaute-universelle' | 'divorce' | 'veuf' | 'autre' | null
          owner_custom_marital_status?: string | null
          marriage_date?: string | null
          marriage_place?: string | null
          marriage_regime?: 'community' | 'separation' | 'universal' | 'other' | null
          pacs_date?: string | null
          pacs_place?: string | null
          pacs_reference?: string | null
          pacs_partner_name?: string | null
          ex_spouse_name?: string | null
          deceased_spouse_name?: string | null
          property_address?: string
          property_type?: 'house' | 'apartment'
          is_in_copropriete?: boolean
          property_family_type?: 'personal-not-family' | 'personal-family' | null
          total_surface?: number | null
          living_surface?: number | null
          land_surface?: number | null
          total_rooms?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          shower_rooms?: number | null
          living_room_surface?: number | null
          construction_year?: number | null
          property_tax?: number | null
          copro_fees?: number | null
          condition?: 'new' | 'excellent' | 'good' | 'needs-work' | 'to-renovate' | null
          energy_class?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null
          has_elevator?: boolean
          has_cellar?: boolean
          has_parking?: boolean
          has_balcony?: boolean
          has_terrace?: boolean
          has_garden?: boolean
          has_gas?: boolean
          has_garage?: boolean
          has_fireplace?: boolean
          has_wood_stove?: boolean
          has_electric_shutters?: boolean
          has_electric_gate?: boolean
          has_convertible_attic?: boolean
          floor_number?: number | null
          total_floors?: number | null
          floor_level?: string | null
          exposure?: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west' | null
          heating_type?: 'individual' | 'collective' | 'none' | null
          heating_energy?: 'gas' | 'electricity' | 'fuel' | 'wood' | 'other' | 'none' | null
          kitchen_type?: 'open-equipped' | 'closed-equipped' | 'open-fitted' | 'closed-fitted' | 'to-create' | null
          basement_type?: string | null
          market_average_price?: number | null
          market_price_range_min?: number | null
          market_price_range_max?: number | null
          market_trend?: 'up' | 'down' | 'stable' | null
          market_average_sale_time?: number | null
          estimated_price_low?: number | null
          estimated_price_high?: number | null
          price_per_sqm?: number | null
          strengths?: string[] | null
          weaknesses?: string[] | null
          sold_prices?: string[] | null
          for_sale_prices?: string[] | null
          sale_dates?: string[] | null
          levels?: Json | null
          comments?: string | null
          diagnostic_property_type?: 'monopropriete' | 'copropriete' | 'asl' | null
          has_city_gas?: boolean | null
        }
      }
    }
  }
}