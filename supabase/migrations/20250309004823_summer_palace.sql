/*
  # Update estimations table structure

  1. Changes
    - Make certain columns nullable
    - Add default values for required columns
    - Update column types for better data consistency
    - Add missing columns
*/

-- Ensure all text columns have default empty string if required
ALTER TABLE estimations 
  ALTER COLUMN owner_first_name SET DEFAULT '',
  ALTER COLUMN owner_last_name SET DEFAULT '',
  ALTER COLUMN owner_profession SET DEFAULT '',
  ALTER COLUMN owner_address SET DEFAULT '',
  ALTER COLUMN owner_phone SET DEFAULT '',
  ALTER COLUMN owner_email SET DEFAULT '',
  ALTER COLUMN property_address SET DEFAULT '',
  ALTER COLUMN comments SET DEFAULT '';

-- Set default values for required enums
ALTER TABLE estimations
  ALTER COLUMN owner_title SET DEFAULT 'Mr',
  ALTER COLUMN owner_nationality SET DEFAULT 'Française',
  ALTER COLUMN owner_marital_status SET DEFAULT 'celibataire-non-pacse',
  ALTER COLUMN property_type SET DEFAULT 'apartment',
  ALTER COLUMN property_family_type SET DEFAULT 'personal-not-family',
  ALTER COLUMN condition SET DEFAULT 'good',
  ALTER COLUMN exposure SET DEFAULT 'south',
  ALTER COLUMN heating_type SET DEFAULT 'individual',
  ALTER COLUMN heating_energy SET DEFAULT 'gas',
  ALTER COLUMN kitchen_type SET DEFAULT 'open-equipped',
  ALTER COLUMN basement_type SET DEFAULT 'none',
  ALTER COLUMN market_trend SET DEFAULT 'stable',
  ALTER COLUMN diagnostic_property_type SET DEFAULT 'copropriete';

-- Set default values for numbers
ALTER TABLE estimations
  ALTER COLUMN total_surface SET DEFAULT 0,
  ALTER COLUMN living_surface SET DEFAULT 0,
  ALTER COLUMN land_surface SET DEFAULT 0,
  ALTER COLUMN total_rooms SET DEFAULT 0,
  ALTER COLUMN bedrooms SET DEFAULT 0,
  ALTER COLUMN bathrooms SET DEFAULT 0,
  ALTER COLUMN shower_rooms SET DEFAULT 0,
  ALTER COLUMN living_room_surface SET DEFAULT 0,
  ALTER COLUMN property_tax SET DEFAULT 0,
  ALTER COLUMN copro_fees SET DEFAULT 0,
  ALTER COLUMN floor_number SET DEFAULT 0,
  ALTER COLUMN total_floors SET DEFAULT 0,
  ALTER COLUMN market_average_price SET DEFAULT 0,
  ALTER COLUMN market_price_range_min SET DEFAULT 0,
  ALTER COLUMN market_price_range_max SET DEFAULT 0,
  ALTER COLUMN market_average_sale_time SET DEFAULT 0,
  ALTER COLUMN estimated_price_low SET DEFAULT 0,
  ALTER COLUMN estimated_price_high SET DEFAULT 0,
  ALTER COLUMN price_per_sqm SET DEFAULT 0;

-- Set default values for booleans
ALTER TABLE estimations
  ALTER COLUMN owner_has_french_tax_residence SET DEFAULT true,
  ALTER COLUMN is_in_copropriete SET DEFAULT false,
  ALTER COLUMN has_elevator SET DEFAULT false,
  ALTER COLUMN has_cellar SET DEFAULT false,
  ALTER COLUMN has_parking SET DEFAULT false,
  ALTER COLUMN has_balcony SET DEFAULT false,
  ALTER COLUMN has_terrace SET DEFAULT false,
  ALTER COLUMN has_garden SET DEFAULT false,
  ALTER COLUMN has_gas SET DEFAULT false,
  ALTER COLUMN has_garage SET DEFAULT false,
  ALTER COLUMN has_fireplace SET DEFAULT false,
  ALTER COLUMN has_wood_stove SET DEFAULT false,
  ALTER COLUMN has_electric_shutters SET DEFAULT false,
  ALTER COLUMN has_electric_gate SET DEFAULT false,
  ALTER COLUMN has_convertible_attic SET DEFAULT false,
  ALTER COLUMN has_city_gas SET DEFAULT false;

-- Set default empty arrays for array columns
ALTER TABLE estimations
  ALTER COLUMN strengths SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN weaknesses SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN sold_prices SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN for_sale_prices SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN sale_dates SET DEFAULT ARRAY[]::text[];

-- Set default empty JSON array for levels
ALTER TABLE estimations
  ALTER COLUMN levels SET DEFAULT '[]'::jsonb;

-- Make certain columns nullable
ALTER TABLE estimations
  ALTER COLUMN owner_birth_date DROP NOT NULL,
  ALTER COLUMN owner_birth_place DROP NOT NULL,
  ALTER COLUMN owner_birth_postal_code DROP NOT NULL,
  ALTER COLUMN owner_custom_marital_status DROP NOT NULL,
  ALTER COLUMN marriage_date DROP NOT NULL,
  ALTER COLUMN marriage_place DROP NOT NULL,
  ALTER COLUMN marriage_regime DROP NOT NULL,
  ALTER COLUMN pacs_date DROP NOT NULL,
  ALTER COLUMN pacs_place DROP NOT NULL,
  ALTER COLUMN pacs_reference DROP NOT NULL,
  ALTER COLUMN pacs_partner_name DROP NOT NULL,
  ALTER COLUMN ex_spouse_name DROP NOT NULL,
  ALTER COLUMN deceased_spouse_name DROP NOT NULL,
  ALTER COLUMN construction_year DROP NOT NULL,
  ALTER COLUMN energy_class DROP NOT NULL;