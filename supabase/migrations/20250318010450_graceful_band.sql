/*
  # Ajout de la colonne état civil complet

  1. Changements
    - Ajout d'une colonne pour stocker l'état civil complet des vendeurs
    - Ajout d'un commentaire descriptif sur la colonne
*/

-- Ajout de la colonne état civil
ALTER TABLE mandats 
ADD COLUMN IF NOT EXISTS etatcivilvendeurcomplet TEXT;

-- Ajout d'un commentaire sur la colonne
COMMENT ON COLUMN mandats.etatcivilvendeurcomplet IS 'État civil complet des vendeurs généré automatiquement';