/*
  # Ajout des colonnes manquantes pour les estimations

  1. Nouvelles Colonnes
    - `floor_level` (text) : Niveau (RDC, 1er étage, etc.)
    - `floor_number` (integer) : Étage actuel
    - `total_floors` (integer) : Nombre total d'étages
    - `copro_fees` (integer) : Charges de copropriété mensuelles

  2. Modifications
    - Ajout des nouvelles colonnes avec leurs valeurs par défaut
*/

-- Ajout des colonnes manquantes
ALTER TABLE estimations
ADD COLUMN IF NOT EXISTS floor_level text,
ADD COLUMN IF NOT EXISTS floor_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_floors integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS copro_fees integer DEFAULT 0;

-- Ajout d'un commentaire sur les colonnes
COMMENT ON COLUMN estimations.floor_level IS 'Niveau (RDC, 1er étage, etc.)';
COMMENT ON COLUMN estimations.floor_number IS 'Étage actuel';
COMMENT ON COLUMN estimations.total_floors IS 'Nombre total d''étages';
COMMENT ON COLUMN estimations.copro_fees IS 'Charges de copropriété mensuelles';