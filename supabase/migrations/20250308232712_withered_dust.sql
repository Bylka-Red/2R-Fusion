/*
  # Simplification du schéma de base de données

  1. Suppression des tables existantes
  2. Création d'une nouvelle table estimations avec tous les champs nécessaires
  3. Ajout des politiques RLS

  Cette migration :
  - Supprime toutes les tables existantes
  - Crée une nouvelle table estimations avec tous les champs
  - Configure la sécurité RLS
*/

-- Suppression des tables existantes en toute sécurité
DO $$ 
BEGIN
  DROP TABLE IF EXISTS estimation_owners CASCADE;
  DROP TABLE IF EXISTS estimation_features CASCADE;
  DROP TABLE IF EXISTS estimation_rooms CASCADE;
  DROP TABLE IF EXISTS estimation_levels CASCADE;
  DROP TABLE IF EXISTS estimations CASCADE;
END $$;

-- Création de la nouvelle table estimations
CREATE TABLE estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'converted')),
  estimation_date DATE NOT NULL,
  commercial TEXT,
  
  -- Propriétaires
  owners JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array d'objets propriétaires
  
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
  
  -- Critères et caractéristiques
  criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
  diagnostic_info JSONB NOT NULL DEFAULT '{}'::JSONB,
  features JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array d'objets caractéristiques
  comparables JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array d'objets biens comparables
  market_analysis JSONB NOT NULL DEFAULT '{}'::JSONB,
  levels JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array d'objets niveaux avec pièces
  
  -- Prix estimés
  estimated_price_low INTEGER,
  estimated_price_high INTEGER,
  estimated_price_recommended INTEGER,
  price_per_sqm INTEGER,
  
  -- Commentaires
  comments TEXT
);

-- Création d'un index sur user_id pour de meilleures performances
CREATE INDEX estimations_user_id_idx ON estimations(user_id);

-- Création d'un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estimations_updated_at
  BEFORE UPDATE ON estimations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE estimations ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture
CREATE POLICY "Users can read their own estimations"
  ON estimations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour l'insertion
CREATE POLICY "Users can insert their own estimations"
  ON estimations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique pour la mise à jour
CREATE POLICY "Users can update their own estimations"
  ON estimations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour la suppression
CREATE POLICY "Users can delete their own estimations"
  ON estimations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);