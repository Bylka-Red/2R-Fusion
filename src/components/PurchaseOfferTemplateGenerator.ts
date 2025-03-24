import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Mandate, Seller } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';

export async function generatePurchaseOfferFromTemplate(mandate: Mandate): Promise<boolean> {
  try {
    const templatePath = mandate.propertyType === 'copropriete' || mandate.isInCopropriete
      ? '/templates/modele_proposition_achat_copro.docx'
      : '/templates/modele_proposition_achat_mono.docx';

    console.log(`Utilisation du modèle : ${templatePath} pour le type de propriété : ${mandate.propertyType}`);

    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Impossible de charger le modèle : ${response.statusText}`);
    }
    const templateContent = await response.arrayBuffer();
    if (templateContent.byteLength === 0) {
      throw new Error("Le fichier modèle est vide");
    }

    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });

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

    const offerDate = mandate.purchaseOffers?.[0]?.date
      ? new Date(mandate.purchaseOffers[0].date)
      : new Date();
    const offerEndDate = new Date(offerDate);
    offerEndDate.setDate(offerEndDate.getDate() + 10);

    const compromiseDate = new Date(offerDate);
    compromiseDate.setDate(compromiseDate.getDate() + 15);

    const offerAmount = mandate.purchaseOffers?.[0]?.amount || 0;
    const loanAmount = Math.round(offerAmount * 1.08);

    const buyersCivilStatus = mandate.purchaseOffers?.[0]?.buyers
      ? generateCivilStatus(mandate.purchaseOffers[0].buyers)
      : '';

    const data = {
      dateOffre: formatDate(mandate.purchaseOffers?.[0]?.date),
      montantOffre: formatPrice(mandate.purchaseOffers?.[0]?.amount),
      montantOffreLettres: numberToWords(mandate.purchaseOffers?.[0]?.amount || 0),
      apportPersonnel: formatPrice(mandate.purchaseOffers?.[0]?.personalContribution),
      apportPersonnelLettres: numberToWords(mandate.purchaseOffers?.[0]?.personalContribution || 0),
      salairesNets: formatPrice(mandate.purchaseOffers?.[0]?.monthlyIncome),
      salairesNetsLettres: numberToWords(mandate.purchaseOffers?.[0]?.monthlyIncome || 0),
      pretsEnCours: formatPrice(mandate.purchaseOffers?.[0]?.currentLoans),
      pretsEnCoursLettres: numberToWords(mandate.purchaseOffers?.[0]?.currentLoans || 0),
      montantSequestre: formatPrice(mandate.purchaseOffers?.[0]?.deposit),
      montantSequestreLettres: numberToWords(mandate.purchaseOffers?.[0]?.deposit || 0),
      dateFinOffre: formatDate(offerEndDate.toISOString()),
      montantCredit: formatPrice(loanAmount),
      montantCreditLettres: numberToWords(loanAmount),
      dateCompromis: formatDate(compromiseDate.toISOString()),
      etatcivilacheteurcomplet: buyersCivilStatus,
      adresseBien: mandate.propertyAddress?.fullAddress || '',
      typeBien: mandate.propertyType === 'copropriete' ? 'Appartement' : 'Maison',
      surface: mandate.surface || 0,
      pieces: mandate.rooms || 0,
      chambres: mandate.bedrooms || 0,
      etatcivilvendeurcomplet: mandate.etatcivilvendeurcomplet || '',
    };

    console.log("Données préparées pour le template:", data);

    try {
      doc.render(data);
    } catch (error: any) {
      console.error('Erreur lors du rendu du document:', error);
      if (error.properties && error.properties.errors) {
        console.log('Détails des erreurs:', error.properties.errors);
      }
      throw error;
    }

    const generatedDoc = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const buyerNames = mandate.purchaseOffers?.[0]?.buyers
      .map(buyer => `${buyer.firstName} ${buyer.lastName}`)
      .join(' & ') || 'Acheteurs';
    const sellerNames = mandate.sellers
      .map(seller => `${seller.firstName} ${seller.lastName}`)
      .join(' & ');

    const fileName = `Offre d'achat - ${buyerNames} à ${sellerNames} - ${formatDate(mandate.purchaseOffers?.[0]?.date)}.docx`;

    saveAs(generatedDoc, fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du document Word:', error);
    throw error;
  }
}

function numberToWords(n: number): string {
  if (n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  const convertLessThanThousand = (num: number): string => {
    if (num === 0) return '';

    if (num < 20) return units[num];

    if (num < 100) {
      const digit = num % 10;
      const ten = Math.floor(num / 10);

      if (ten === 7 || ten === 9) {
        return tens[ten] + (digit === 1 ? ' et ' : '-') + units[10 + digit];
      }

      if (ten === 8) {
        return tens[ten] + (digit === 0 ? 's' : '-' + units[digit]);
      }

      return tens[ten] + (digit === 1 && ten !== 8 ? ' et ' : (digit === 0 ? '' : '-')) + units[digit];
    }

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    let result = '';
    if (hundred === 1) {
      result = 'cent';
    } else if (hundred > 1) {
      result = units[hundred] + ' cent';
    }

    if (remainder > 0) {
      result += (result ? ' ' : '') + convertLessThanThousand(remainder);
    } else if (hundred > 1) {
      result += 's';
    }

    return result;
  };

  if (n < 1000) return convertLessThanThousand(n);

  const billions = Math.floor(n / 1000000000);
  n = n % 1000000000;
  const millions = Math.floor(n / 1000000);
  n = n % 1000000;
  const thousands = Math.floor(n / 1000);
  const remainder = n % 1000;

  let result = '';

  if (billions > 0) {
    result += (billions === 1 ? 'un milliard ' : convertLessThanThousand(billions) + ' milliards ');
  }

  if (millions > 0) {
    result += (millions === 1 ? 'un million ' : convertLessThanThousand(millions) + ' millions ');
  }

  if (thousands > 0) {
    result += (thousands === 1 ? 'mille ' : convertLessThanThousand(thousands) + ' mille ');
  }

  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }

  return result.trim();
}
