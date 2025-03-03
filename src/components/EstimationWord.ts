import { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType, Packer, ImageRun, Header, Footer } from 'docx';
import { saveAs } from 'file-saver';
import type { Estimation } from '../types';

export async function generateEstimationWord(estimation: Estimation): Promise<void> {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
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

  try {
    // Get the main property photo
    let mainPhotoData;
    if (estimation.photos && estimation.photos.length > 0) {
      try {
        const response = await fetch(estimation.photos[0].url);
        const blob = await response.blob();
        mainPhotoData = await blob.arrayBuffer();
      } catch (error) {
        console.error('Error fetching property photo:', error);
      }
    }

    // Create a new document
    const doc = new Document({
      sections: [
        // Cover Page
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              },
            },
          },
          children: [
            // Title - 2R IMMOBILIER
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "2R IMMOBILIER",
                  bold: true,
                  size: 52, // 26pt
                  font: "Questrial",
                }),
              ],
            }),
            
            // Subtitle - LAGNY SUR MARNE ET ALENTOURS
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "LAGNY SUR MARNE ET ALENTOURS",
                  color: "#0b8043",
                  size: 24, // 12pt
                  font: "Questrial",
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
            
            // Main Property Photo
            ...(mainPhotoData ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: mainPhotoData,
                    transformation: {
                      width: 400, // ~14cm
                      height: 280, // ~10cm
                    },
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
            ] : [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "[Photo du bien non disponible]",
                    color: "#666666",
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
            ]),
            
            // Dossier d'Estimation
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "DOSSIER D'ESTIMATION",
                  bold: true,
                  color: "#0b8043",
                  size: 56, // 28pt
                  font: "Calibri",
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
            
            // Date
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Le ${formatDate(estimation.createdAt)}`,
                  bold: true,
                  size: 40, // 20pt
                  font: "Calibri",
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
            
            // Owner Name
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: estimation.owners && estimation.owners.length > 0 
                    ? `${estimation.owners[0].firstName} ${estimation.owners[0].lastName}` 
                    : "Propriétaire",
                  bold: true,
                  size: 48, // 24pt
                  font: "Calibri",
                }),
              ],
            }),
          ],
        },
        
        // Content Pages
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "RAPPORT D'ESTIMATION",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),

            // Property Information
            new Paragraph({
              text: "INFORMATIONS DU BIEN",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Type de bien : ",
                  bold: true,
                }),
                new TextRun({
                  text: estimation.propertyType === 'house' ? 'Maison' : 'Appartement',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Adresse : ",
                  bold: true,
                }),
                new TextRun({
                  text: estimation.propertyAddress.fullAddress,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Surface : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${estimation.surface} m²`,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Pièces : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${estimation.rooms} pièces - ${estimation.bedrooms} chambres`,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "État général : ",
                  bold: true,
                }),
                new TextRun({
                  text: getConditionText(estimation.condition),
                }),
              ],
              spacing: {
                after: 400,
              },
            }),

            // Strengths
            new Paragraph({
              text: "POINTS FORTS",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            ...estimation.features
              .filter(f => f.type === 'strength')
              .map(feature => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                    }),
                    new TextRun({
                      text: feature.description,
                    }),
                  ],
                  spacing: {
                    after: 120,
                  },
                })
              ),

            // Weaknesses
            new Paragraph({
              text: "POINTS FAIBLES",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            ...estimation.features
              .filter(f => f.type === 'weakness')
              .map(feature => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                    }),
                    new TextRun({
                      text: feature.description,
                    }),
                  ],
                  spacing: {
                    after: 120,
                  },
                })
              ),

            // Market Analysis
            new Paragraph({
              text: "ANALYSE DU MARCHÉ",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Prix moyen du marché : ",
                  bold: true,
                }),
                new TextRun({
                  text: formatPrice(estimation.marketAnalysis.averagePrice),
                }),
              ],
              spacing: {
                after: 120,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Fourchette de prix : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${formatPrice(estimation.marketAnalysis.priceRange.min)} - ${formatPrice(estimation.marketAnalysis.priceRange.max)}`,
                }),
              ],
              spacing: {
                after: 120,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Tendance du marché : ",
                  bold: true,
                }),
                new TextRun({
                  text: getMarketTrendText(estimation.marketAnalysis.marketTrend),
                }),
              ],
              spacing: {
                after: 120,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Délai de vente moyen : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${estimation.marketAnalysis.averageSaleTime} jours`,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),

            // Comparable Properties
            new Paragraph({
              text: "BIENS COMPARABLES",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Adresse", bold: true })],
                      width: {
                        size: 40,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Prix", bold: true })],
                      width: {
                        size: 20,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Surface", bold: true })],
                      width: {
                        size: 15,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Pièces", bold: true })],
                      width: {
                        size: 10,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Date de vente", bold: true })],
                      width: {
                        size: 15,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                  ],
                }),
                ...estimation.comparables.map(comparable => 
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(comparable.address)],
                      }),
                      new TableCell({
                        children: [new Paragraph(formatPrice(comparable.price))],
                      }),
                      new TableCell({
                        children: [new Paragraph(`${comparable.surface} m²`)],
                      }),
                      new TableCell({
                        children: [new Paragraph(`${comparable.rooms}`)],
                      }),
                      new TableCell({
                        children: [new Paragraph(formatDate(comparable.saleDate))],
                      }),
                    ],
                  })
                ),
              ],
            }),

            // Estimation
            new Paragraph({
              text: "ESTIMATION",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 600,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Prix recommandé : ",
                  bold: true,
                  size: 28,
                }),
                new TextRun({
                  text: formatPrice(estimation.estimatedPrice.recommended || 0),
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Fourchette de prix : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${formatPrice(estimation.estimatedPrice.low)} - ${formatPrice(estimation.estimatedPrice.high)}`,
                }),
              ],
              spacing: {
                after: 120,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Prix au m² : ",
                  bold: true,
                }),
                new TextRun({
                  text: `${formatPrice(estimation.pricePerSqm)}/m²`,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),

            // Comments
            new Paragraph({
              text: "COMMENTAIRES",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              text: estimation.comments || "Aucun commentaire",
              spacing: {
                after: 400,
              },
            }),

            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "2R IMMOBILIER - 92 Rue Saint-Denis, 77400 LAGNY-SUR-MARNE - Tél : 01.64.30.66.88",
                  size: 16,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 800,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Estimation réalisée le ${formatDate(estimation.createdAt)}`,
                  size: 16,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }
      ],
    });

    // Generate the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `estimation-${estimation.id}.docx`);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}