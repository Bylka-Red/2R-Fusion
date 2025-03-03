import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Mandate, Seller } from '../types';

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

interface KeyReceiptPDFProps {
  mandate: Mandate;
  seller: Seller;
  type: 'reception' | 'return';
}

export function KeyReceiptPDF({ mandate, seller, type }: KeyReceiptPDFProps) {
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
            {type === 'reception' ? 'REÇU DE REMISE DE CLÉS' : 'REÇU DE RESTITUTION DE CLÉS'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Je soussigné(e), {getSellerName()},
            {'\n'}
            Demeurant au {seller.address.number} {seller.address.street}, {seller.address.zipCode} {seller.address.city},
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            {type === 'reception' ? (
              `Déclare avoir remis ce jour, ${formatDate(mandate.keys.receivedDate || '')}, à l'agence 2R IMMOBILIER, représentée par ${mandate.commercial} KABACHE, le trousseau de clés suivant :`
            ) : (
              `Déclare avoir récupéré ce jour, ${formatDate(mandate.keys.returnedDate || '')}, auprès de l'agence 2R IMMOBILIER, représentée par ${mandate.commercial} KABACHE, le trousseau de clés suivant :`
            )}
          </Text>
          <Text style={[styles.text, styles.bold]}>
            {mandate.keys.details}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            {type === 'reception' ? (
              "Ces clés sont confiées à l'agence dans le cadre du mandat de vente n°" + mandate.mandateNumber + " signé le " + formatDate(mandate.date) + "."
            ) : (
              "Cette restitution met fin à la garde des clés confiées à l'agence dans le cadre du mandat de vente n°" + mandate.mandateNumber + "."
            )}
          </Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Le Mandant</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>L'Agence</Text>
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