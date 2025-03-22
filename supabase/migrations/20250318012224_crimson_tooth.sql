/*
  # Ajout de la colonne etatcivilvendeurcomplet pour les mandats

  1. Changements
    - Ajout de la colonne etatcivilvendeurcomplet à la table mandats
    - Ajout d'un commentaire descriptif sur la colonne

  2. Sécurité
    - La colonne est nullable pour permettre une migration en douceur
    - Valeur par défaut à NULL pour ne pas perturber l'existant
*/

-- Ajout de la colonne etatcivilvendeurcomplet
ALTER TABLE mandats 
ADD COLUMN IF NOT EXISTS etatcivilvendeurcomplet TEXT;

-- Ajout d'un commentaire descriptif
COMMENT ON COLUMN mandats.etatcivilvendeurcomplet IS 'État civil complet du/des vendeur(s) généré automatiquement';