import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Mandate, Seller, PropertyAddress, PropertyLot, CadastralSection, OccupationStatus, DPEStatus } from '../types';

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0b8043',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  text: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureTitle: {
    marginBottom: 50,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
});

interface MandatePDFProps {
  mandate: Mandate;
  sellers: Seller[];
  propertyAddress: PropertyAddress;
  propertyType: 'monopropriete' | 'copropriete';
  coPropertyAddress: PropertyAddress;
  lots: PropertyLot[];
  officialDesignation: string;
  cadastralSections: CadastralSection[];
  occupationStatus: OccupationStatus;
  dpeStatus: DPEStatus;
}

const formatSellerText = (seller: Seller): string => {
  if (!seller) return '';

  const title = seller.title === 'Mrs' ? 'Madame' : 'Monsieur';
  const name = `${seller.firstName || ''} ${(seller.lastName || '').toUpperCase()}`.trim();
  const address = typeof seller.address === 'string' ? seller.address : seller.address?.fullAddress || '';
  
  let text = `${title} ${name}`;
  if (address) {
    text += `, demeurant ${address}`;
  }
  
  return text;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

const formatTantieme = (tantieme: { numerator: string; denominator: string; type: string; customType?: string }): string => {
  if (!tantieme.numerator || !tantieme.denominator) return '';

  let typeText = '';
  switch (tantieme.type) {
    case 'general':
      typeText = 'des parties communes générales';
      break;
    case 'soil-and-general':
      typeText = 'de la propriété du sol et des parties communes générales';
      break;
    case 'custom':
      typeText = tantieme.customType || '';
      break;
  }

  return `Et les ${tantieme.numerator} / ${tantieme.denominator} èmes ${typeText}`;
};

export function MandatePDF({
  mandate,
  sellers,
  propertyAddress,
  propertyType,
  coPropertyAddress,
  lots,
  officialDesignation,
  cadastralSections,
  occupationStatus,
  dpeStatus,
}: MandatePDFProps) {
  const getOccupationStatusText = (status: OccupationStatus) => {
    switch (status) {
      case 'occupied-by-seller':
        return 'Le bien est actuellement occupé par le(s) vendeur(s)';
      case 'vacant':
        return "Le bien est actuellement libre d'occupants";
      case 'rented':
        return "Le bien fait actuellement l'objet d'un bail en cours";
      default:
        return '';
    }
  };

  const getDPEStatusText = (status: DPEStatus) => {
    switch (status) {
      case 'completed':
        return 'DPE déjà établi';
      case 'in-progress':
        return 'DPE en cours de réalisation';
      case 'not-required':
        return "Le bien n'est pas soumis au DPE";
      default:
        return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="https://i.ibb.co/MfLxym5/Logo-en-jpeg.jpg"
            style={styles.logo}
          />
          <Text style={styles.title}>
            MANDAT DE VENTE {mandate.type === 'exclusive' ? 'EXCLUSIF' : mandate.type === 'semi-exclusive' ? 'SEMI-EXCLUSIF' : 'SIMPLE'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Mandat n° {mandate.mandate_number} en date du {formatDate(mandate.date)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            ENTRE LES SOUSSIGNÉS
          </Text>
          {sellers.map((seller, index) => (
            <Text key={index} style={styles.text}>
              {formatSellerText(seller)}
              {index < sellers.length - 1 ? '\nET' : ''}
            </Text>
          ))}
          <Text style={styles.text}>
            Ci-après dénommé(s) "LE MANDANT"
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            ET
          </Text>
          <Text style={styles.text}>
            2R IMMOBILIER, SAS au capital de 5 000 euros, dont le siège social est situé 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE,
            représentée par {mandate.commercial} KABACHE, ci-après dénommé "LE MANDATAIRE"
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            DÉSIGNATION DU BIEN
          </Text>
          <Text style={styles.text}>
            {propertyType === 'monopropriete' ? (
              officialDesignation
            ) : (
              <>
                Dans un immeuble en copropriété situé {coPropertyAddress.fullAddress},
                {lots.map((lot, index) => (
                  `\nLe lot n°${lot.number} : ${lot.description}\n${lot.tantiemes.map(t => formatTantieme(t)).join('\n')}`
                ))}
              </>
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            CADASTRE
          </Text>
          <View style={styles.table}>
            {cadastralSections.map((section, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>Section {section.section}</Text>
                <Text style={styles.tableCell}>N° {section.number}</Text>
                <Text style={styles.tableCell}>{section.lieuDit}</Text>
                <Text style={styles.tableCell}>{section.surface}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            OCCUPATION ET DIAGNOSTICS
          </Text>
          <Text style={styles.text}>
            {getOccupationStatusText(occupationStatus)}
          </Text>
          <Text style={styles.text}>
            Diagnostic de Performance Énergétique : {getDPEStatusText(dpeStatus)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            CONDITIONS FINANCIÈRES
          </Text>
          <Text style={styles.text}>
            Prix net vendeur : {formatPrice(mandate.netPrice)}
          </Text>
          <Text style={styles.text}>
            Honoraires à la charge du {mandate.feesPayer === 'seller' ? 'vendeur' : "de l'acquéreur"} : {formatPrice(mandate.fees.ttc)} TTC
            (soit {formatPrice(mandate.fees.ht)} HT)
          </Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Le Mandant</Text>
            <Text>Fait à LAGNY-SUR-MARNE</Text>
            <Text>Le {formatDate(mandate.date)}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Le Mandataire</Text>
            <Text>Fait à LAGNY-SUR-MARNE</Text>
            <Text>Le {formatDate(mandate.date)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          2R IMMOBILIER - 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE - Tél : 01.64.30.66.88 - Email : contact@2r-immobilier.fr{'\n'}
          SAS au capital de 5000€ - RCS MEAUX 823 147 285 - Carte professionnelle CPI 3601 2016 000 013 324
        </Text>
      </Page>
    </Document>
  );
}