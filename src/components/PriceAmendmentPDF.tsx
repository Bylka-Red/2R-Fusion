import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Mandate, Seller, PriceAmendment } from '../types';

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

interface PriceAmendmentPDFProps {
  mandate: Mandate;
  amendment: PriceAmendment;
  seller: Seller;
}

export function PriceAmendmentPDF({ mandate, amendment, seller }: PriceAmendmentPDFProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getSellerName = () => {
    if (seller.type === 'individual') {
      return `${seller.title === 'Mrs' ? 'Madame' : 'Monsieur'} ${seller.firstName} ${seller.lastName}`;
    }
    return seller.companyName;
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
            AVENANT MODIFICATIF DE PRIX
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles. text}>
            Mandat de vente n° {mandate.mandate_number} en date du {formatDate(mandate.date)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Entre les soussignés,{'\n'}
            {getSellerName()}, demeurant au {seller.address.number} {seller.address.street}, {seller.address.zipCode} {seller.address.city},
            ci-après dénommé "le Mandant",{'\n\n'}
            Et{'\n\n'}
            2R IMMOBILIER, SAS au capital de 5 000 euros, dont le siège social est situé 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE,
            représentée par {mandate.commercial} KABACHE, ci-après dénommé "le Mandataire",
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.text, styles.bold]}>
            Il a été convenu ce qui suit :
          </Text>
          <Text style={styles.text}>
            Le prix de vente initialement fixé dans le mandat est modifié comme suit à compter du {formatDate(amendment.date)} :
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCell}>
              <Text>Désignation</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>Prix initial</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>Nouveau prix</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Prix net vendeur</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{mandate.netPrice.toLocaleString('fr-FR')} €</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{amendment.netPrice.toLocaleString('fr-FR')} €</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Honoraires TTC</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{mandate.fees.ttc.toLocaleString('fr-FR')} €</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{amendment.fees.ttc.toLocaleString('fr-FR')} €</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Prix de vente HAI</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{(mandate.netPrice + mandate.fees.ttc).toLocaleString('fr-FR')} €</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{(amendment.netPrice + amendment.fees.ttc).toLocaleString('fr-FR')} €</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Les autres conditions du mandat restent inchangées.
          </Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Le Mandant</Text>
            <Text>Fait à LAGNY-SUR-MARNE</Text>
            <Text>Le {formatDate(amendment.date)}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Le Mandataire</Text>
            <Text>Fait à LAGNY-SUR-MARNE</Text>
            <Text>Le {formatDate(amendment.date)}</Text>
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