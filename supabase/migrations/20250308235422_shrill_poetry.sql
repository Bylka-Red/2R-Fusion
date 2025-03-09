/*
  # Update estimations table structure

  1. Changes
    - Drop existing table and recreate with explicit columns for all fields
    - Remove JSONB fields in favor of dedicated columns
    - Add all missing fields from the application
    - Maintain existing security policies and triggers

  2. New Columns
    - Owner details (title, name, contact info)
    - Property specifications
    - Technical details
    - All fields from the estimation form
*/

-- Drop existing table
DROP TABLE IF EXISTS estimations;

-- Recreate the table with all fields
CREATE TABLE estimations (
  -- Basic Information
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('draft', 'completed', 'converted')) DEFAULT 'draft',
  estimation_date date NOT NULL,
  commercial text,

  -- Owner Information
  owner_title text CHECK (owner_title IN ('Mr', 'Mrs')),
  owner_first_name text NOT NULL,
  owner_last_name text NOT NULL,
  owner_address text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text NOT NULL,
  owner_nationality text,
  owner_birth_date date,
  owner_birth_place text,
  owner_birth_postal_code text,
  owner_profession text,
  owner_marital_status text CHECK (
    owner_marital_status IN (
      'celibataire-non-pacse',
      'celibataire-pacse',
      'marie-sans-contrat',
      'communaute-acquets',
      'separation-biens',
      'communaute-universelle',
      'divorce',
      'veuf',
      'autre'
    )
  ),
  owner_custom_marital_status text,
  owner_has_french_tax_residence boolean DEFAULT true,

  -- Marriage Details
  marriage_date date,
  marriage_place text,
  marriage_regime text CHECK (marriage_regime IN ('community', 'separation', 'universal', 'other')),

  -- PACS Details
  pacs_date date,
  pacs_place text,
  pacs_reference text,
  pacs_partner_name text,

  -- Divorce Details
  divorce_ex_spouse_name text,

  -- Widow Details
  deceased_spouse_name text,

  -- Property Location and Type
  property_address text NOT NULL,
  property_type text CHECK (property_type IN ('house', 'apartment')) NOT NULL,
  is_in_copropriete boolean DEFAULT false,

  -- Property Specifications
  total_surface numeric NOT NULL,
  living_surface numeric,
  land_surface numeric,
  total_rooms integer NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms integer,
  shower_rooms integer,
  living_room_surface numeric,
  construction_year integer,
  floor_number integer,
  total_floors integer,

  -- Technical Details
  has_elevator boolean DEFAULT false,
  heating_type text CHECK (heating_type IN ('individual', 'collective', 'none')),
  heating_energy text CHECK (heating_energy IN ('gas', 'electricity', 'fuel', 'wood', 'other', 'none')),
  kitchen_type text CHECK (kitchen_type IN (
    'open-equipped',
    'closed-equipped',
    'open-fitted',
    'closed-fitted',
    'to-create'
  )),
  has_cellar boolean DEFAULT false,
  has_parking boolean DEFAULT false,
  has_balcony boolean DEFAULT false,
  has_terrace boolean DEFAULT false,
  has_garden boolean DEFAULT false,
  has_garage boolean DEFAULT false,
  has_fireplace boolean DEFAULT false,
  has_wood_stove boolean DEFAULT false,
  has_electric_shutters boolean DEFAULT false,
  has_electric_gate boolean DEFAULT false,
  has_convertible_attic boolean DEFAULT false,
  has_city_gas boolean DEFAULT false,

  -- Property Condition and Exposure
  condition text CHECK (condition IN ('new', 'excellent', 'good', 'needs-work', 'to-renovate')),
  exposure text CHECK (exposure IN (
    'north',
    'south',
    'east',
    'west',
    'north-east',
    'north-west',
    'south-east',
    'south-west'
  )),
  energy_class text CHECK (energy_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),

  -- Financial Information
  property_tax numeric,
  copro_charges numeric,
  estimated_price_low numeric NOT NULL,
  estimated_price_high numeric NOT NULL,
  price_per_sqm numeric,

  -- Room Layout (keeping as JSONB for flexibility)
  levels jsonb DEFAULT '[]'::jsonb,

  -- Features and Analysis
  strengths text[],
  weaknesses text[],
  sold_prices text[],
  for_sale_prices text[],
  sale_dates text[],

  -- Market Analysis
  market_average_price numeric,
  market_price_range_min numeric,
  market_price_range_max numeric,
  market_trend text CHECK (market_trend IN ('up', 'down', 'stable')),
  market_average_sale_time integer,

  -- Additional Information
  comments text
);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER update_estimations_updated_at
    BEFORE UPDATE ON estimations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own estimations"
  ON estimations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estimations"
  ON estimations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimations"
  ON estimations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimations"
  ON estimations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_estimations_user_id ON estimations(user_id);
CREATE INDEX idx_estimations_status ON estimations(status);
CREATE INDEX idx_estimations_property_type ON estimations(property_type);
CREATE INDEX idx_estimations_estimation_date ON estimations(estimation_date);
CREATE INDEX idx_estimations_owner_last_name ON estimations(owner_last_name);
CREATE INDEX idx_estimations_property_address ON estimations(property_address);