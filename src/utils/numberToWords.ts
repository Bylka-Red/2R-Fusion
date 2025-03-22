// Fonction pour convertir un nombre en lettres
export function numberToWords(n: number): string {
  if (n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  
  const convertLessThanThousand = (num: number): string => {
    if (num === 0) return '';
    
    if (num < 20) return units[num];
    
    if (num < 100) {
      const digit = num % 10;
      const ten = Math.floor(num / 10);
      
      // Gestion des cas spéciaux pour 70-79 et 90-99
      if (ten === 7 || ten === 9) {
        return tens[ten] + (digit === 1 ? ' et ' : '-') + units[10 + digit];
      }
      
      // Gestion du cas spécial pour 80-89
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

// Les autres fonctions restent inchangées
export function formatTantiemes(numerator: string, denominator: string, type: string): string {
  const num = parseInt(numerator);
  const den = parseInt(denominator);
  if (!num || !den) return '';

  const numWords = numberToWords(num);
  const formattedNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Déterminer le mot correct pour le dénominateur
  let denominatorWord;
  switch (den) {
    case 1000:
      denominatorWord = 'millièmes';
      break;
    case 10000:
      denominatorWord = 'dix millièmes';
      break;
    case 100000:
      denominatorWord = 'cent millièmes';
      break;
    default:
      denominatorWord = 'millièmes';
  }

  let typeText = '';
  switch (type) {
    case 'general':
      typeText = 'des parties communes générales';
      break;
    case 'soil-and-general':
      typeText = 'de la propriété du sol et des parties communes générales';
      break;
    case 'custom':
      typeText = type;
      break;
  }

  return `Et les ${numWords} / ${denominatorWord} (${formattedNum}/${den} èmes) ${typeText}`;
}

// Les autres fonctions restent inchangées
export function formatLotDescription(lot: {
  number: string;
  description: string;
  tantiemes: Array<{
    numerator: string;
    denominator: string;
    type: string;
  }>;
}): string {
  if (!lot.number) return '';

  const lotNumberInWords = numberToWords(parseInt(lot.number));
  let description = lot.description.trim();

  // Détecter l'étage dans la description
  const etageMatches = description.match(/^(Au .*?étage|Au rez-de-chaussée|En sous-sol),?\s*/i);
  const etage = etageMatches ? etageMatches[1] : '';
  if (etageMatches) {
    description = description.substring(etageMatches[0].length).trim();
  }

  // Liste des mots à mettre en majuscules
  const upperCaseWords = [
    'APPARTEMENT', 'LOGEMENT', 'STUDIO', 'DUPLEX', 'CAVE', 'PARKING',
    'GARAGE', 'CHAMBRE', 'CUISINE', 'SÉJOUR', 'SALON', 'SALLE DE BAINS',
    'WC', 'TERRASSE', 'BALCON', 'JARDIN', 'EMPLACEMENT'
  ];

  // Mettre en majuscules les mots clés
  description = description.split(' ').map(word => {
    const upperWord = word.toUpperCase();
    return upperCaseWords.includes(upperWord) ? upperWord : word;
  }).join(' ');

  // Utiliser la syntaxe spéciale pour le gras avec {{#bold}}
  let formattedDescription = `• LOT NUMERO ${lotNumberInWords} (${lot.number}) :\n`;
  
  if (etage) {
    formattedDescription += `${etage}, `;
  }
  
  formattedDescription += `${description}`;

  // N'ajouter que le premier tantième
  if (lot.tantiemes && lot.tantiemes.length > 0) {
    const tantieme = lot.tantiemes[0];
    formattedDescription += `\n${formatTantiemes(tantieme.numerator, tantieme.denominator, tantieme.type)}`;
  }

  return formattedDescription;
}

// Les autres fonctions restent inchangées
export function formatLotDescriptions(lots: Array<{
  number: string;
  description: string;
  tantiemes: Array<{
    numerator: string;
    denominator: string;
    type: string;
  }>;
}>, surfaceCarrez?: string, surfaceCarrezDescription?: string): string {
  let completeDescription = '';

  lots.forEach((lot, index) => {
    completeDescription += formatLotDescription(lot);

    // Ajouter la surface Carrez uniquement après le premier lot
    if (index === 0 && surfaceCarrez) {
      completeDescription += `\n\nSuperficie – Mesurage : ${surfaceCarrez} m²\n\n`;
      if (surfaceCarrezDescription) {
        completeDescription += `${surfaceCarrezDescription}`;
      }
    }

    // Ajouter un saut de ligne entre les lots, sauf après le dernier lot
    if (index < lots.length - 1) {
      completeDescription += '\n\n';
    }
  });

  return completeDescription;
}
