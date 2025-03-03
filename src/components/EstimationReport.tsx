import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Estimation } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
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
    display: 'table',
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  photo: {
    width: '100%',
    height: 200,
    marginBottom: 5,
    objectFit: 'cover',
  },
  photoCaption: {
    fontSize: 10,
    color: '#666',
  },
  priceBox: {
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 15,
    textAlign: 'center',
  },
});

interface EstimationReportProps {
  estimation: Estimation;
}

export function EstimationReport({ estimation }: EstimationReportProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      'new': 'Neuf',
      'excellent': 'Excellent état',
      'good': 'Bon état',
      'needs-work': 'Travaux à prévoir',
      'to-renovate': 'À rénover'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const getMarketTrendText = (trend: string) => {
    const trends = {
      'up': 'À la hausse',
      'down': 'À la baisse',
      'stable': 'Stable'
    };
    return trends[trend as keyof typeof trends] || trend;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="https://i.ibb.co/MfLxym5/Logo-en-jpeg.jpg"
            style={styles.logo}
          />
          <Text style={styles.title}>RAPPORT D'ESTIMATION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Type de bien : </Text>
            {estimation.propertyType === 'house' ? 'Maison' : 'Appartement'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Adresse : </Text>
            {estimation.propertyAddress.fullAddress}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Surface : </Text>
            {estimation.surface} m²
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Pièces : </Text>
            {estimation.rooms} pièces - {estimation.bedrooms} chambres
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>État général : </Text>
            {getConditionText(estimation.condition)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>POINTS FORTS</Text>
          {estimation.features
            .filter(f => f.type === 'strength')
            .map((feature, index) => (
              <View key={index} style={styles.feature}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.text}>{feature.description}</Text>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>POINTS FAIBLES</Text>
          {estimation.features
            .filter(f => f.type === 'weakness')
            .map((feature, index) => (
              <View key={index} style={styles.feature}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.text}>{feature.description}</Text>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>ANALYSE DU MARCHÉ</Text>
          <View style={styles.text}>
            <Text>
              <Text style={styles.bold}>Prix moyen du marché : </Text>
              {formatPrice(estimation.marketAnalysis.averagePrice)}
            </Text>
            <Text>
              <Text style={styles.bold}>Fourchette de prix : </Text>
              {formatPrice(estimation.marketAnalysis.priceRange.min)} - {formatPrice(estimation.marketAnalysis.priceRange.max)}
            </Text>
            <Text>
              <Text style={styles.bold}>Tendance du marché : </Text>
              {getMarketTrendText(estimation.marketAnalysis.marketTrend)}
            </Text>
            <Text>
              <Text style={styles.bold}>Délai de vente moyen : </Text>
              {estimation.marketAnalysis.averageSaleTime} jours
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>ESTIMATION</Text>
          <View style={styles.priceBox}>
            <Text style={[styles.text, styles.bold]}>
              Prix recommandé : {formatPrice(estimation.estimatedPrice.recommended || 0)}
            </Text>
            <Text style={styles.text}>
              Fourchette de prix : {formatPrice(estimation.estimatedPrice.low)} - {formatPrice(estimation.estimatedPrice.high)}
            </Text>
            <Text style={styles.text}>
              Prix au m² : {formatPrice(estimation.pricePerSqm)}/m²
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          2R IMMOBILIER - 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE - Tél : 01.64.30.66.88{'\n'}
          SAS au capital de 5000€ - RCS MEAUX 823 147 285{'\n'}
          Estimation réalisée le {formatDate(estimation.createdAt)}
        </Text>
      </Page>
    </Document>
  );
}