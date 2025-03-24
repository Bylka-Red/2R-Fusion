/*
  # Ajout des colonnes pour les acheteurs

  1. Changements
    - Ajout des colonnes pour stocker les informations des acheteurs
    - Ajout de commentaires descriptifs
*/

-- Ajout des colonnes pour les acheteurs
ALTER TABLE mandats 
ADD COLUMN IF NOT EXISTS buyer_title TEXT,
ADD COLUMN IF NOT EXISTS buyer_first_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_last_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_birth_date DATE,
ADD COLUMN IF NOT EXISTS buyer_birth_place TEXT,
ADD COLUMN IF NOT EXISTS buyer_birth_postal_code TEXT,
ADD COLUMN IF NOT EXISTS buyer_nationality TEXT DEFAULT 'Française',
ADD COLUMN IF NOT EXISTS buyer_profession TEXT,
ADD COLUMN IF NOT EXISTS buyer_address TEXT,
ADD COLUMN IF NOT EXISTS buyer_phone TEXT,
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS buyer_marital_status TEXT,
ADD COLUMN IF NOT EXISTS buyer_custom_marital_status TEXT,
ADD COLUMN IF NOT EXISTS buyer_has_french_tax_residence BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS buyer_marriage_date DATE,
ADD COLUMN IF NOT EXISTS buyer_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS buyer_marriage_regime TEXT,
ADD COLUMN IF NOT EXISTS buyer_pacs_date DATE,
ADD COLUMN IF NOT EXISTS buyer_pacs_place TEXT,
ADD COLUMN IF NOT EXISTS buyer_pacs_reference TEXT,
ADD COLUMN IF NOT EXISTS buyer_pacs_partner_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_divorce_ex_spouse_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_deceased_spouse_name TEXT;

-- Ajout de commentaires
COMMENT ON COLUMN mandats.buyer_title IS 'Titre de l''acheteur (Mr, Mrs)';
COMMENT ON COLUMN mandats.buyer_last_name IS 'Nom de famille de l''acheteur';
COMMENT ON COLUMN mandats.buyer_first_name IS 'Prénom de l''acheteur';