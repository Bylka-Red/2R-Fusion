/*
  # Création du schéma pour les estimations immobilières

  1. Tables principales
    - estimations: Table principale des estimations
    - owners: Propriétaires liés aux estimations
    - property_features: Points forts/faibles des biens
    - property_comparables: Biens comparables
    - property_photos: Photos des biens
    - property_levels: Niveaux des biens
    - property_rooms: Pièces par niveau

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de lecture/écriture pour les utilisateurs authentifiés
*/

-- Activation de l'extension uuid-ossp pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des estimations
CREATE TABLE IF NOT EXISTS estimations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('draft', 'completed', 'converted')),
  estimation_date date NOT NULL,
  commercial text,
  notes text,
  
  -- Informations du bien
  property_address text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('house', 'apartment')),
  is_in_copropriete boolean DEFAULT false,
  surface numeric NOT NULL,
  land_surface numeric,
  rooms integer NOT NULL,
  bedrooms integer NOT NULL,
  construction_year integer,
  energy_class text CHECK (energy_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  condition text NOT NULL CHECK (condition IN ('new', 'excellent', 'good', 'needs-work', 'to-renovate')),
  
  -- Critères du bien
  has_elevator boolean DEFAULT false,
  floor_number integer,
  total_floors integer,
  heating_type text CHECK (heating_type IN ('individual', 'collective', 'none')),
  heating_energy text CHECK (heating_energy IN ('gas', 'electricity', 'fuel', 'wood', 'other', 'none')),
  has_air_conditioning boolean DEFAULT false,
  has_cellar boolean DEFAULT false,
  has_parking boolean DEFAULT false,
  has_balcony boolean DEFAULT false,
  has_terrace boolean DEFAULT false,
  has_garden boolean DEFAULT false,
  exposure text CHECK (exposure IN ('north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west')),
  windows_type text CHECK (windows_type IN ('single', 'double', 'triple')),
  construction_material text CHECK (construction_material IN ('brick', 'stone', 'concrete', 'wood', 'other')),
  living_room_surface numeric,
  bathrooms integer DEFAULT 0,
  shower_rooms integer DEFAULT 0,
  kitchen_type text,
  heating_system text,
  adjacency text,
  basement text,
  property_tax numeric DEFAULT 0,
  has_gas boolean DEFAULT false,
  has_garage boolean DEFAULT false,
  has_fireplace boolean DEFAULT false,
  has_wood_stove boolean DEFAULT false,
  has_electric_shutters boolean DEFAULT false,
  has_electric_gate boolean DEFAULT false,
  has_convertible_attic boolean DEFAULT false,
  charges_copro numeric,
  
  -- Diagnostic info
  diagnostic_property_type text CHECK (diagnostic_property_type IN ('monopropriete', 'copropriete', 'asl')),
  has_city_gas boolean DEFAULT false,
  
  -- Analyse de marché
  market_average_price numeric,
  market_price_range_min numeric,
  market_price_range_max numeric,
  market_trend text CHECK (market_trend IN ('up', 'down', 'stable')),
  market_average_sale_time integer,
  
  -- Prix estimé
  estimated_price_low numeric NOT NULL,
  estimated_price_high numeric NOT NULL,
  estimated_price_recommended numeric,
  price_per_sqm numeric,
  
  comments text,
  
  -- Clé étrangère vers l'utilisateur Supabase
  user_id uuid REFERENCES auth.users(id),
  
  -- Contraintes
  CONSTRAINT positive_surface CHECK (surface > 0),
  CONSTRAINT positive_rooms CHECK (rooms > 0),
  CONSTRAINT positive_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_construction_year CHECK (construction_year > 1800 AND construction_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Table des propriétaires
CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimation_id uuid REFERENCES estimations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  address text NOT NULL,
  phones text[] NOT NULL,
  emails text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des caractéristiques (points forts/faibles)
CREATE TABLE IF NOT EXISTS property_features (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimation_id uuid REFERENCES estimations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('strength', 'weakness')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des biens comparables
CREATE TABLE IF NOT EXISTS property_comparables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimation_id uuid REFERENCES estimations(id) ON DELETE CASCADE,
  address text NOT NULL,
  price numeric NOT NULL,
  surface numeric NOT NULL,
  rooms integer NOT NULL,
  sale_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des photos
CREATE TABLE IF NOT EXISTS property_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimation_id uuid REFERENCES estimations(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('main', 'sold', 'forSale', 'plan', 'cadastre')),
  created_at timestamptz DEFAULT now()
);

-- Table des niveaux
CREATE TABLE IF NOT EXISTS property_levels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimation_id uuid REFERENCES estimations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('regular', 'basement', 'outbuilding')),
  created_at timestamptz DEFAULT now()
);

-- Table des pièces
CREATE TABLE IF NOT EXISTS property_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id uuid REFERENCES property_levels(id) ON DELETE CASCADE,
  name text NOT NULL,
  area numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparables ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour les estimations
CREATE POLICY "Users can read their own estimations"
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

-- Politiques de sécurité pour les propriétaires
CREATE POLICY "Users can read owners of their estimations"
  ON owners
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = owners.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert owners for their estimations"
  ON owners
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = owners.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can update owners of their estimations"
  ON owners
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = owners.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete owners of their estimations"
  ON owners
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = owners.estimation_id
    AND estimations.user_id = auth.uid()
  ));

-- Politiques similaires pour les autres tables
CREATE POLICY "Users can read features of their estimations"
  ON property_features FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_features.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage features of their estimations"
  ON property_features FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_features.estimation_id
    AND estimations.user_id = auth.uid()
  ));

-- Politiques pour les comparables
CREATE POLICY "Users can read comparables of their estimations"
  ON property_comparables FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_comparables.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage comparables of their estimations"
  ON property_comparables FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_comparables.estimation_id
    AND estimations.user_id = auth.uid()
  ));

-- Politiques pour les photos
CREATE POLICY "Users can read photos of their estimations"
  ON property_photos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_photos.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage photos of their estimations"
  ON property_photos FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_photos.estimation_id
    AND estimations.user_id = auth.uid()
  ));

-- Politiques pour les niveaux
CREATE POLICY "Users can read levels of their estimations"
  ON property_levels FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_levels.estimation_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage levels of their estimations"
  ON property_levels FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE estimations.id = property_levels.estimation_id
    AND estimations.user_id = auth.uid()
  ));

-- Politiques pour les pièces
CREATE POLICY "Users can read rooms of their levels"
  ON property_rooms FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM property_levels
    JOIN estimations ON property_levels.estimation_id = estimations.id
    WHERE property_levels.id = property_rooms.level_id
    AND estimations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage rooms of their levels"
  ON property_rooms FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM property_levels
    JOIN estimations ON property_levels.estimation_id = estimations.id
    WHERE property_levels.id = property_rooms.level_id
    AND estimations.user_id = auth.uid()
  ));