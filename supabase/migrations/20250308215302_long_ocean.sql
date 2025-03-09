/*
  # Création du schéma des estimations

  1. Tables
    - estimations : Table principale des estimations
    - estimation_owners : Table des propriétaires
    - estimation_features : Points forts/faibles
    - estimation_photos : Photos des biens
    - estimation_levels : Niveaux des biens
    - estimation_rooms : Pièces par niveau

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour l'accès authentifié
*/

-- Création de la table estimations
CREATE TABLE IF NOT EXISTS estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'converted')),
  estimation_date DATE NOT NULL,
  commercial TEXT,
  
  -- Informations du bien
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment')),
  is_in_copropriete BOOLEAN DEFAULT false,
  surface NUMERIC(10,2),
  land_surface NUMERIC(10,2),
  rooms INTEGER,
  bedrooms INTEGER,
  construction_year INTEGER,
  energy_class TEXT CHECK (energy_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'needs-work', 'to-renovate')),
  
  -- Critères du bien
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagnostic_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  market_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Prix estimés
  estimated_price_low INTEGER,
  estimated_price_high INTEGER,
  estimated_price_recommended INTEGER,
  price_per_sqm INTEGER,
  
  comments TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des propriétaires
CREATE TABLE IF NOT EXISTS estimation_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimation_id UUID REFERENCES estimations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phones TEXT[] NOT NULL DEFAULT '{}',
  emails TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des caractéristiques (points forts/faibles)
CREATE TABLE IF NOT EXISTS estimation_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimation_id UUID REFERENCES estimations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('strength', 'weakness')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des photos
CREATE TABLE IF NOT EXISTS estimation_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimation_id UUID REFERENCES estimations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('property', 'sold', 'forSale', 'plan', 'cadastre')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des niveaux
CREATE TABLE IF NOT EXISTS estimation_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimation_id UUID REFERENCES estimations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('regular', 'basement', 'outbuilding')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des pièces
CREATE TABLE IF NOT EXISTS estimation_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES estimation_levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_rooms ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users can view their own estimations"
  ON estimations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estimations"
  ON estimations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimations"
  ON estimations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimations"
  ON estimations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour les tables liées
CREATE POLICY "Users can manage their estimation owners"
  ON estimation_owners FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE id = estimation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their estimation features"
  ON estimation_features FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE id = estimation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their estimation photos"
  ON estimation_photos FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE id = estimation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their estimation levels"
  ON estimation_levels FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations
    WHERE id = estimation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their estimation rooms"
  ON estimation_rooms FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM estimations e
    JOIN estimation_levels l ON l.estimation_id = e.id
    WHERE l.id = level_id
    AND e.user_id = auth.uid()
  ));

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour le timestamp
CREATE TRIGGER update_estimations_updated_at
    BEFORE UPDATE ON estimations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();