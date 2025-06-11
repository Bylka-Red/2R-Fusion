import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Mandate } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';
import { numberToWords } from '../utils/numberToWords';

export async function generateCompromiseFromTemplate(mandate: Mandate): Promise<boolean> {
  try {
    // Déterminer quel modèle utiliser en fonction du type de propriété
    const isHouseInCopro = mandate.propertyType === 'house' && mandate.isInCopropriete;
    const templatePath = mandate.propertyType === 'apartment' || isHouseInCopro
      ? '/templates/modele_compromis_copro.docx'
      : '/templates/modele_compromis_mono.docx';

    console.log(`Utilisation du modèle : ${templatePath}`);
    console.log('Nom du dossier:', mandate.compromise_folder_name); // Debug

    // Charger le modèle Word
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Impossible de charger le modèle : ${response.statusText}`);
    }
    const templateContent = await response.arrayBuffer();
    if (templateContent.byteLength === 0) {
      throw new Error("Le fichier modèle est vide");
    }

    // Créer un objet PizZip
    const zip = new PizZip(templateContent);

    // Créer un objet Docxtemplater avec des options spécifiques
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
      nullGetter: () => '' // Retourne une chaîne vide au lieu de 'undefined'
    });

    // Formater les données pour l'affichage
    const formatPrice = (price: number | undefined | null): string => {
      if (!price) return '0';
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price).replace('€', '').trim();
    };

    const formatDate = (dateString: string | undefined | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Générer l'état civil des vendeurs et acheteurs
    const etatcivilvendeurcomplet = generateCivilStatus(mandate.sellers);
    const etatcivilacheteurcomplet = mandate.purchaseOffers?.[0]?.buyers 
      ? generateCivilStatus(mandate.purchaseOffers[0].buyers)
      : '';

    // Préparer les données pour le template
    const data = {
      // Informations de base
      dateCompromis: formatDate(mandate.date),
      numeroMandat: mandate.mandate_number,
      commercial: mandate.commercial,
      folderName: mandate.compromise_folder_name || '',
      dossierName: mandate.compromise_folder_name || '', 
      nomDossier: mandate.compromise_folder_name || '', 

      // Ajouter le numéro de compromis ici
      number: mandate.compromise_number,

      // État civil
      etatcivilvendeurcomplet,
      etatcivilacheteurcomplet,

      // Informations du bien
      propertyAddress: mandate.propertyAddress?.fullAddress || '',
      propertyType: mandate.propertyType === 'house' ? 'Maison' : 'Appartement',
      surface: mandate.surface || '',
      rooms: mandate.rooms || '',
      bedrooms: mandate.bedrooms || '',
      officialDesignation: mandate.officialDesignation || '',

      // Prix et conditions
      prixNetVendeur: formatPrice(mandate.netPrice),
      prixNetVendeurLettres: numberToWords(mandate.netPrice || 0),
      honorairesTTC: formatPrice(mandate.fees?.ttc),
      honorairesHT: formatPrice(mandate.fees?.ht),
      chargeHonoraires: mandate.feesPayer === 'seller' ? 'VENDEUR' : 'ACQUÉREUR',

      // Notaires
      notaireVendeurNom: mandate.notaireVendeur?.nom || '',
      notaireVendeurAdresse: mandate.notaireVendeur?.adresse || '',
      notaireAcheteurNom: mandate.notaireAcquereur?.nom || '',
      notaireAcheteurAdresse: mandate.notaireAcquereur?.adresse || '',

      // Syndic
      syndicNom: mandate.syndic?.nom || '',
      syndicAdresse: mandate.syndic?.adresse || '',
      syndicTelephone: mandate.syndic?.telephone || '',
      syndicEmail: mandate.syndic?.email || '',

      // Dates importantes
      dateJouissance: formatDate(mandate.date),
      dateConditions: formatDate(mandate.date),

      // Informations supplémentaires
      isInCopropriete: mandate.isInCopropriete,
      coPropertyAddress: mandate.coPropertyAddress?.fullAddress || '',
      lots: mandate.lots || [],
      cadastralSections: mandate.cadastralSections || [],
    };

    console.log('Données envoyées au template:', data); // Debug

    // Rendre le document avec les données
    doc.render(data);

    // Générer le document final
    const generatedDoc = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Construire le nom du fichier
    const fileName = `Compromis_${mandate.mandate_number}_${formatDate(mandate.date).replace(/ /g, '_')}.docx`;

    // Sauvegarder le fichier
    saveAs(generatedDoc, fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du document Word :', error);
    throw error;
  }
}
