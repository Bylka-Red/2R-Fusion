import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Mandate, PurchaseOffer } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';
import { numberToWords } from '../utils/numberToWords';

// Fonction pour formater la surface en format cadastral (XXha XXa XXca)
const formatSurface = (surface: string): string => {
  const num = parseInt(surface) || 0;
  const ha = Math.floor(num / 10000);
  const a = Math.floor((num % 10000) / 100);
  const ca = num % 100;
  return `${ha.toString().padStart(2, '0')}ha ${a.toString().padStart(2, '0')}a ${ca.toString().padStart(2, '0')}ca`;
};

// Fonction pour formater les sections cadastrales
const formatCadastralSections = (sections: any[]): string => {
  if (!sections || sections.length === 0) return '';

  let result = '';
  sections.forEach((section) => {
    result += `•\tSection ${section.section || ''} / Numéro ${section.number || ''} / Lieudit : ${section.lieuDit || ''} / Surface : ${formatSurface(section.surface || '0')}\n`;
  });

  // Retirez le dernier saut de ligne
  return result.trim();
};

// Fonction pour formater la description de la propriété
const formatPropertyDescription = (mandate: Mandate): string => {
  if (mandate.propertyType === 'apartment' || (mandate.propertyType === 'house' && mandate.isInCopropriete)) {
    let description = `Dans un immeuble en copropriété situé ${mandate.coPropertyAddress?.fullAddress || ''},\n`;
    
    if (mandate.lots && mandate.lots.length > 0) {
      mandate.lots.forEach((lot, index) => {
        description += `\nLe lot n°${lot.number} : ${lot.description}\n`;
        lot.tantiemes.forEach(tantieme => {
          const type = tantieme.type === 'general' ? 'des parties communes générales' :
                      tantieme.type === 'soil-and-general' ? 'de la propriété du sol et des parties communes générales' :
                      tantieme.customType || '';
          description += `Et les ${tantieme.numerator}/${tantieme.denominator} èmes ${type}\n`;
        });
      });
    }
    return description;
  } else {
    return mandate.officialDesignation || '';
  }
};

// Fonction pour calculer la surface totale
const calculateTotalSurface = (sections: any[]): string => {
  const totalSurface = sections.reduce((total, section) => {
    return total + (parseInt(section.surface) || 0);
  }, 0);
  return formatSurface(totalSurface.toString());
};

// Fonction pour obtenir le texte des honoraires
const getHonorairesText = (feesPayer: 'seller' | 'buyer'): string => {
  return feesPayer === 'seller' 
    ? "Les Honoraires de l'Agence sont à la charge du VENDEUR."
    : "Les Honoraires de l'Agence sont à la charge de l'ACQUEREUR.";
};

export async function generatePurchaseOfferFromTemplate(mandate: Mandate, offer: PurchaseOffer): Promise<boolean> {
  try {
    // Déterminer quel modèle utiliser en fonction du type de propriété
    const isHouseInCopro = mandate.propertyType === 'house' && mandate.isInCopropriete;
    const templatePath = mandate.propertyType === 'apartment' || isHouseInCopro
      ? '/templates/modele_proposition_achat_copro.docx'
      : '/templates/modele_proposition_achat_mono.docx';

    console.log(`Utilisation du modèle : ${templatePath}`);

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

    // Créer un objet Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });

    // Calculer les dates importantes
    const offerDate = new Date(offer.date);
    const offerEndDate = new Date(offerDate);
    offerEndDate.setDate(offerEndDate.getDate() + 10);
    
    const compromiseDate = new Date(offerDate);
    compromiseDate.setDate(compromiseDate.getDate() + 15);

    // Calculer le montant du prêt (montant de l'offre + 8%)
    const loanAmount = Math.round(offer.amount * 1.08);

    // Générer l'état civil des acheteurs
    const etatcivilacheteurcomplet = generateCivilStatus(offer.buyers);

    // Préparer les données pour le template
    const data = {
      // Informations de l'offre
      dateOffre: offerDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      dateFinOffre: offerEndDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      dateCompromis: compromiseDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      montantOffre: new Intl.NumberFormat('fr-FR').format(offer.amount),
      montantOffreLettres: numberToWords(offer.amount),
      montantCredit: new Intl.NumberFormat('fr-FR').format(loanAmount),
      montantCreditLettres: numberToWords(loanAmount),
      apportPersonnel: new Intl.NumberFormat('fr-FR').format(offer.personalContribution),
      apportPersonnelLettres: numberToWords(offer.personalContribution),
      salairesNets: new Intl.NumberFormat('fr-FR').format(offer.monthlyIncome),
      salairesNetsLettres: numberToWords(offer.monthlyIncome),
      pretsEnCours: new Intl.NumberFormat('fr-FR').format(offer.currentLoans),
      pretsEnCoursLettres: numberToWords(offer.currentLoans),
      montantSequestre: new Intl.NumberFormat('fr-FR').format(offer.deposit),
      montantSequestreLettres: numberToWords(offer.deposit),

      // État civil des acheteurs
      etatcivilacheteurcomplet,

      // Informations du bien
      propertyAddress: mandate.propertyAddress?.fullAddress || '',
      coPropertyAddressFormatted: mandate.coPropertyAddress?.fullAddress
        ? `Dans un ensemble immobilier soumis au régime de la copropriété tel que défini par la loi du 10 juillet 1965 situé : ${mandate.coPropertyAddress.fullAddress}`
        : '',
      propertyDescription: formatPropertyDescription(mandate),
      officialDesignation: mandate.officialDesignation || '',
      cadastralSectionsFormatted: formatCadastralSections(mandate.cadastralSections),
      surfaceTotale: calculateTotalSurface(mandate.cadastralSections),

      // Autres informations du bien
      typeBien: mandate.propertyType === 'house' ? 'Maison' : 'Appartement',
      surface: mandate.surface,
      pieces: mandate.rooms,
      chambres: mandate.bedrooms,

      // Informations des vendeurs
      etatCivilVendeurs: mandate.etatcivilvendeurcomplet || generateCivilStatus(mandate.sellers),

      // Informations de l'agence
      commercial: mandate.commercial,
      numeroMandat: mandate.mandate_number,
      dateMandat: new Date(mandate.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),

      // Texte des honoraires
      honorairesText: getHonorairesText(mandate.feesPayer)
    };

    // Rendre le document avec les données
    doc.render(data);

    // Générer le document final
    const generatedDoc = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Construire le nom du fichier
    const fileName = `Offre_Achat_${mandate.mandate_number}_${data.dateOffre.replace(/ /g, '_')}.docx`;

    // Sauvegarder le fichier
    saveAs(generatedDoc, fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du document Word :', error);
    throw error;
  }
}