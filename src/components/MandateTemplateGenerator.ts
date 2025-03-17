import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Mandate } from '../types';

export async function generateMandateFromTemplate(mandate: Mandate): Promise<boolean> {
    try {
        // Vérification des propriétés requises
        if (!mandate) {
            throw new Error('Mandat non défini');
        }

        // Déterminer quel modèle utiliser en fonction du type de propriété
        const isHouseInCopro = mandate.propertyType === 'house' && mandate.isInCopropriete;
        const templatePath = mandate.propertyType === 'apartment' || isHouseInCopro
            ? '/templates/modele_mandat_simple_copro.docx'
            : '/templates/modele_mandat_simple_mono.docx';

        console.log(`Utilisation du modèle : ${templatePath} pour le type de propriété : ${mandate.propertyType}, isInCopropriete : ${mandate.isInCopropriete}`);
        console.log("Date du mandat:", mandate.date);
        console.log("Numéro du mandat:", mandate.mandate_number);

        // Charger le modèle Word
        console.log("Tentative de chargement du modèle Word...");
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Impossible de charger le modèle : ${response.statusText}`);
        }
        console.log("Modèle Word chargé avec succès, conversion en ArrayBuffer...");
        const templateContent = await response.arrayBuffer();
        console.log("Taille du fichier chargé :", templateContent.byteLength, "octets");
        if (templateContent.byteLength === 0) {
            throw new Error("Le fichier modèle est vide");
        }

        // Créer un objet PizZip à partir du contenu du modèle
        console.log("Création de l'objet PizZip...");
        const zip = new PizZip(templateContent);

        // Créer un objet Docxtemplater avec des options spécifiques pour gérer les erreurs de balises
        console.log("Création de l'objet Docxtemplater...");
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{{', end: '}}' },
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

            // Vérifiez si la date est au format DD/MM/YYYY
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                dateString = `${year}-${month}-${day}`;
            }

            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }

            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        };

        // Avant d'appeler formatDate
        console.log('Date avant formatage :', mandate.date);

        // Appel de la fonction
        const formattedDate = formatDate(mandate.date);

        // Vérifiez la date formatée
        console.log('Date après formatage :', formattedDate);

        const getConditionText = (condition: string | undefined): string => {
            if (!condition) return 'Bon état';
            const conditions = {
                'new': 'Neuf',
                'excellent': 'Excellent état',
                'good': 'Bon état',
                'needs-work': 'Travaux à prévoir',
                'to-renovate': 'À rénover'
            };
            return conditions[condition as keyof typeof conditions] || condition;
        };

        const getMarketTrendText = (trend: string | undefined): string => {
            if (!trend) return 'Stable';
            const trends = {
                'up': 'À la hausse',
                'down': 'À la baisse',
                'stable': 'Stable'
            };
            return trends[trend as keyof typeof trends] || trend;
        };

        const getBooleanText = (value: boolean | undefined): string => {
            return value ? 'Oui' : 'Non';
        };

        // Extraire la ville de l'adresse complète
        const extractCity = (fullAddress: string | undefined): string => {
            if (!fullAddress) return '';
            const codePostalIndex = fullAddress.search(/\d{5}/);
            if (codePostalIndex === -1) return '';
            return fullAddress.substring(codePostalIndex + 5).trim().toUpperCase();
        };

        // Vérification des données criteria
        console.log("Données criteria complètes :", mandate.criteria);

        // Vérification de la valeur de condition
        console.log("Valeur de condition :", mandate.condition);
        const conditionText = getConditionText(mandate.condition);
        console.log("Texte traduit pour condition :", conditionText);

        // S'assurer que les critères existent
        const criteria = mandate.criteria || {};

        // Traduire les valeurs directement avant de les placer dans l'objet data
        let kitchenTypeFrench = '';
        switch (criteria.kitchenType) {
            case 'open-equipped': kitchenTypeFrench = 'ouverte équipée'; break;
            case 'closed-equipped': kitchenTypeFrench = 'fermée équipée'; break;
            case 'open-fitted': kitchenTypeFrench = 'ouverte aménagée'; break;
            case 'closed-fitted': kitchenTypeFrench = 'fermée aménagée'; break;
            case 'to-create': kitchenTypeFrench = 'à créer'; break;
            default: kitchenTypeFrench = criteria.kitchenType || '';
        }

        let heatingSystemFrench = '';
        switch (criteria.heatingSystem) {
            case 'electric': heatingSystemFrench = 'électrique'; break;
            case 'individual-gas': heatingSystemFrench = 'individuel au gaz'; break;
            case 'collective-gas': heatingSystemFrench = 'collectif au gaz'; break;
            case 'heat-pump': heatingSystemFrench = 'pompe à chaleur'; break;
            case 'fuel': heatingSystemFrench = 'fuel'; break;
            case 'collective-geothermal': heatingSystemFrench = 'géothermique collectif'; break;
            default: heatingSystemFrench = criteria.heatingSystem || '';
        }

        let exposureFrench = '';
        switch (criteria.exposure) {
            case 'north': exposureFrench = 'Nord'; break;
            case 'south': exposureFrench = 'Sud'; break;
            case 'east': exposureFrench = 'Est'; break;
            case 'west': exposureFrench = 'Ouest'; break;
            case 'north-east': exposureFrench = 'Nord-Est'; break;
            case 'north-west': exposureFrench = 'Nord-Ouest'; break;
            case 'south-east': exposureFrench = 'Sud-Est'; break;
            case 'south-west': exposureFrench = 'Sud-Ouest'; break;
            default: exposureFrench = criteria.exposure || '';
        }

        let windowsTypeFrench = '';
        switch (criteria.windowsType) {
            case 'single': windowsTypeFrench = 'Simple vitrage'; break;
            case 'double': windowsTypeFrench = 'Double vitrage'; break;
            default: windowsTypeFrench = criteria.windowsType || '';
        }

        let constructionMaterialFrench = '';
        switch (criteria.constructionMaterial) {
            case 'brick': constructionMaterialFrench = 'Briques'; break;
            case 'stone': constructionMaterialFrench = 'Pierre'; break;
            case 'concrete': constructionMaterialFrench = 'Béton'; break;
            case 'wood': constructionMaterialFrench = 'Bois'; break;
            case 'other': constructionMaterialFrench = 'Autre'; break;
            default: constructionMaterialFrench = criteria.constructionMaterial || '';
        }

        let adjacencyFrench = '';
        switch (criteria.adjacency) {
            case 'detached': adjacencyFrench = 'Indépendant'; break;
            case 'semi-detached': adjacencyFrench = 'Mitoyen d\'un côté'; break;
            case 'both-sides': adjacencyFrench = 'Mitoyen des deux côtés'; break;
            default: adjacencyFrench = criteria.adjacency || '';
        }

        // Calcul du prix des diagnostics obligatoires
        const calculateMandatoryPrice = () => {
            const propertyType = mandate.propertyType;
            const constructionYear = criteria.constructionYear;
            const hasGas = criteria.hasGas;
            const currentYear = new Date().getFullYear();
            const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
            const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
            const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
            const isInCoproperty = propertyType === 'apartment' || mandate.isInCopropriete;
            let requiredCount = 0;

            // DPE - toujours obligatoire
            requiredCount++;

            if (isInCoproperty) requiredCount++; // Loi Carrez
            if (isOlderThan15Years) requiredCount++; // Électricité
            if (isOlderThan15Years && hasGas) requiredCount++; // Gaz
            if (isBeforeAsbestos) requiredCount++; // Amiante
            if (isBeforeLead) requiredCount++; // Plomb

            if (requiredCount === 0) return 0;

            const prices = propertyType === 'apartment' || mandate.isInCopropriete
                ? { 1: 90, 2: 160, 3: 220, 4: 270, 5: 320, 6: 370 }
                : { 1: 120, 2: 200, 3: 270, 4: 320, 5: 370, 6: 420 };

            return prices[requiredCount as keyof typeof prices] || 0;
        };

        // Préparer les informations du commercial
        let prenomCommercial = '';
        let nomCommercial = '';
        let telephoneCommercial = '';
        let emailCommercial = '';

        if (mandate.commercial) {
            prenomCommercial = mandate.commercial;
            if (prenomCommercial === 'Redhouane') {
                nomCommercial = 'KABACHE';
                telephoneCommercial = '06 18 24 46 40';
                emailCommercial = 'contact@2r-immobilier.fr';
            } else if (prenomCommercial === 'Audrey') {
                nomCommercial = 'GABRIEL';
                telephoneCommercial = '07 68 88 16 60';
                emailCommercial = 'a.gabriel@2r-immobilier.fr';
            } else if (prenomCommercial === 'Christelle') {
                nomCommercial = 'MULLINGHAUSEN';
                telephoneCommercial = '06 38 22 60 70';
                emailCommercial = 'm.christelle@2r-immobilier.fr';
            } else {
                nomCommercial = '';
                telephoneCommercial = '';
                emailCommercial = prenomCommercial.toLowerCase() + '@2r-immobilier.fr';
            }
        }

        // Formater les points forts et points faibles pour qu'ils s'affichent sur des lignes séparées
        const pointsForts = (mandate.features || [])
            .filter(f => f.type === 'strength')
            .map(f => f.description);

        const pointsFaibles = (mandate.features || [])
            .filter(f => f.type === 'weakness')
            .map(f => f.description);

        const pointsFortsFormatted = pointsForts.join('\n');
        const pointsFaiblesFormatted = pointsFaibles.join('\n');

        // Calculer les totaux des prix au m²
        const calculateAverage = (prices: string[]) => {
            const numericPrices = prices.map(price => parseInt(price.replace(/[^0-9]/g, '')) || 0);
            const sum = numericPrices.reduce((acc, curr) => acc + curr, 0);
            return numericPrices.length ? Math.floor(sum / numericPrices.length) : 0;
        };

        const soldPrices = (mandate.features || [])
            .filter(f => f.type === 'soldPrice')
            .map(f => f.description);

        const forSalePrices = (mandate.features || [])
            .filter(f => f.type === 'forSalePrice')
            .map(f => f.description);

        const soldPricesTotal = calculateAverage(soldPrices);
        const forSalePricesTotal = calculateAverage(forSalePrices);

        // Déterminer les diagnostics obligatoires
        const propertyType = mandate.propertyType;
        const constructionYear = criteria.constructionYear;
        const hasGas = criteria.hasGas;
        const currentYear = new Date().getFullYear();
        const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
        const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
        const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
        const isInCoproperty = propertyType === 'apartment' || mandate.isInCopropriete;

        // Calculer les jours écoulés depuis les dates de vente
        const calculateDaysSince = (dateString: string) => {
            const dateParts = dateString.split('/');
            if (dateParts.length !== 3) return '';
            const [day, month, year] = dateParts.map(Number);
            const date = new Date(year, month - 1, day);
            const today = new Date();

            let diffYears = today.getFullYear() - date.getFullYear();
            let diffMonths = today.getMonth() - date.getMonth();
            let diffDays = today.getDate() - date.getDate();

            // Ajustement pour les années et les mois
            if (diffDays < 0) {
                diffMonths -= 1;
                const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                diffDays += lastMonth.getDate();
            }
            if (diffMonths < 0) {
                diffYears -= 1;
                diffMonths += 12;
            }

            // Construction du résultat
            let result = [];
            if (diffYears > 0) result.push(`${diffYears} an${diffYears > 1 ? 's' : ''}`);
            if (diffMonths > 0) result.push(`${diffMonths} mois`);
            if (diffDays > 0 || result.length === 0) result.push(`${diffDays} jour${diffDays > 1 ? 's' : ''}`);

            return result.join(' et ');
        };

        // Extraire les résultats des dates de vente
        const saleDates = (mandate.features || [])
            .filter(f => f.type === 'saleDate')
            .map(f => calculateDaysSince(f.description));

        // Convertir le titre en format français
        const getTitreFrancais = (title: string | undefined) => {
            console.log("Titre du propriétaire avant traduction:", title);
            switch (title) {
                case 'Mr':
                case 'Monsieur':
                    return 'Monsieur';
                case 'Mrs':
                case 'Madame':
                    return 'Madame';
                case 'Mr and Mrs':
                case 'Monsieur et Madame':
                    return 'Monsieur et Madame';
                default:
                    console.warn("Titre inconnu:", title);
                    return 'Monsieur';
            }
        };

        // Préparer les données pour remplacer les balises
        const titreProprietaire = getTitreFrancais(mandate.sellers?.[0]?.title);
        console.log("Titre du propriétaire formaté:", titreProprietaire);

        const data = {
            titreProprietaire: titreProprietaire || 'Monsieur',
            prenomProprietaire: mandate.sellers?.[0]?.firstName || '',
            nomProprietaire: mandate.sellers?.[0]?.lastName || '',
            adresseProprietaire: mandate.sellers?.[0]?.address?.fullAddress || '',
            telephoneProprietaire: mandate.sellers?.[0]?.phone || '',
            emailProprietaire: mandate.sellers?.[0]?.email || '',
            adresseBien: mandate.propertyAddress?.fullAddress || '',
            villeBien: extractCity(mandate.propertyAddress?.fullAddress),
            typeBien: mandate.propertyType === 'house' ? 'Maison' : 'Appartement',
            surface: mandate.surface || '',
            pieces: mandate.rooms || '',
            chambres: mandate.bedrooms || '',
            etatGeneral: conditionText,
            anneeConstruction: criteria.constructionYear || '',
            etage: criteria.floorNumber || criteria.floor || '',
            nombreEtages: criteria.totalFloors || criteria.floorCount || '',
            chargesCopro: criteria.coproFees || criteria.chargesCopro
                ? `${criteria.coproFees || criteria.chargesCopro} €`
                : '',
            pointsForts: pointsForts,
            pointsFaibles: pointsFaibles,
            pointsFortsFormatted: pointsFortsFormatted,
            pointsFaiblesFormatted: pointsFaiblesFormatted,
            prixMoyen: formatPrice(mandate.marketAnalysis?.averagePrice || 0),
            prixMin: formatPrice(mandate.marketAnalysis?.priceRange?.min || 0),
            prixMax: formatPrice(mandate.marketAnalysis?.priceRange?.max || 0),
            tendanceMarche: getMarketTrendText(mandate.marketAnalysis?.marketTrend || ''),
            delaiVente: mandate.marketAnalysis?.averageSaleTime || '',
            prixRecommande: formatPrice(mandate.estimatedPrice?.recommended || 0),
            prixBas: formatPrice(mandate.estimatedPrice?.low || 0),
            prixHaut: formatPrice(mandate.estimatedPrice?.high || 0),
            fourchetteHaute: formatPrice(mandate.estimatedPrice?.high || 0),
            fourchetteHauteChiffre: mandate.estimatedPrice?.high || 0,
            fourchetteBasseChiffre: mandate.estimatedPrice?.low || 0,
            fourchetteBasseFormatted: new Intl.NumberFormat('fr-FR').format(mandate.estimatedPrice?.low || 0),
            fourchetteBasse: new Intl.NumberFormat('fr-FR').format(mandate.estimatedPrice?.low || 0),
            prixM2: formatPrice(mandate.pricePerSqm || 0),
            commentaires: mandate.comments || '',
            dateEstimation: formatDate(mandate.date),
            prenomCommercial: prenomCommercial,
            nomCommercial: nomCommercial,
            telephoneCommercial: telephoneCommercial,
            emailCommercial: emailCommercial,
            kitchenType: kitchenTypeFrench,
            heatingSystem: heatingSystemFrench,
            exposure: exposureFrench,
            windowsType: windowsTypeFrench,
            constructionMaterial: constructionMaterialFrench,
            adjacency: adjacencyFrench,
            basement: getBooleanText(criteria.hasBasement),
            hasCellar: getBooleanText(criteria.hasCellar),
            hasGarden: getBooleanText(criteria.hasGarden),
            hasDoubleGlazing: getBooleanText(criteria.hasDoubleGlazing),
            hasBalcony: getBooleanText(criteria.hasBalcony),
            hasTerrace: getBooleanText(criteria.hasTerrace),
            hasElevator: getBooleanText(criteria.hasElevator),
            hasGarage: getBooleanText(criteria.hasGarage),
            hasFireplace: getBooleanText(criteria.hasFireplace),
            hasWoodStove: getBooleanText(criteria.hasWoodStove),
            hasElectricShutters: getBooleanText(criteria.hasElectricShutters),
            hasParkingBox: getBooleanText(criteria.hasParkingBox),
            hasElectricGate: getBooleanText(criteria.hasElectricGate),
            hasConvertibleAttic: getBooleanText(criteria.hasConvertibleAttic),
            bathrooms: criteria.bathrooms || 0,
            floorNumber: criteria.floorNumber || criteria.floor || '',
            totalFloors: criteria.totalFloors || criteria.floorCount || '',
            propertyTax: criteria.propertyTax || 0,
            livingRoomSurface: criteria.livingRoomSurface || 0,
            landSurface: criteria.landSurface || 0,
            constructionYear: criteria.constructionYear || '',
            calculateMandatoryPrice: calculateMandatoryPrice(),
            diagCarrez: isInCoproperty ? "☑" : "☐",
            diagDPE: "☑",
            diagElectricite: isOlderThan15Years ? "☑" : "☐",
            diagGaz: isOlderThan15Years && hasGas ? "☑" : "☐",
            diagAmiante: isBeforeAsbestos ? "☑" : "☐",
            diagPlomb: isBeforeLead ? "☑" : "☐",
            diagERP: "☑",
            diagAssainissement: "☑",
            diagPreEtatDate: isInCoproperty ? "☑" : "☐",
            texteDiagCarrez: isInCoproperty ? "Obligatoire" : "Non applicable",
            texteDiagDPE: "Obligatoire",
            texteDiagElectricite: isOlderThan15Years ? "Obligatoire (installation > 15 ans)" : "Non obligatoire",
            texteDiagGaz: isOlderThan15Years && hasGas ? "Obligatoire (installation > 15 ans)" : hasGas ? "Non obligatoire" : "Pas de gaz",
            texteDiagAmiante: isBeforeAsbestos ? "Obligatoire (construction avant 1997)" : "Non obligatoire",
            texteDiagPlomb: isBeforeLead ? "Obligatoire (construction avant 1949)" : "Non obligatoire",
            texteDiagERP: "Obligatoire",
            texteDiagAssainissement: "Recommandé",
            texteDiagPreEtatDate: isInCoproperty ? "Recommandé" : "Non applicable",
            isHouse: mandate.propertyType === 'house',
            isApartment: mandate.propertyType === 'apartment',
            isHouseInCopro: isHouseInCopro,
            totalPrixM2Vendus: soldPricesTotal ? formatPrice(soldPricesTotal) : 'N/A',
            totalPrixM2AVendre: forSalePricesTotal ? formatPrice(forSalePricesTotal) : 'N/A',
            enVenteDepuis1: saleDates[0] ? `En vente depuis ${saleDates[0]}` : 'Bien similaire N°1',
            enVenteDepuis2: saleDates[1] ? `En vente depuis ${saleDates[1]}` : 'Bien similaire N°2',
            enVenteDepuis3: saleDates[2] ? `En vente depuis ${saleDates[2]}` : 'Bien similaire N°3',
            enVenteDepuis4: saleDates[3] ? `En vente depuis ${saleDates[3]}` : 'Bien similaire N°4',
            // Informations du mandat
            dateMandat: formattedDate || '',
            numeroMandat: mandate.mandate_number || '',
            typeMandat: mandate.type === 'exclusive' ? 'EXCLUSIF' : mandate.type === 'semi-exclusive' ? 'SEMI-EXCLUSIF' : 'SIMPLE',

            // Prix et honoraires
            prixNetVendeur: formatPrice(mandate.netPrice || 0),
            honorairesTTC: formatPrice(mandate.fees?.ttc || 0),
            honorairesHT: formatPrice(mandate.fees?.ht || 0),
            chargeHonoraires: mandate.feesPayer === 'seller' ? 'VENDEUR' : 'ACQUÉREUR',
        };

        console.log("Vérification des valeurs de l'objet data avant le rendu :");
        Object.keys(data).forEach(key => {
            console.log(`${key}: ${data[key as keyof typeof data]}`);
        });

        try {
            console.log("Remplacement des balises...");
            doc.render(data);
        } catch (error: any) {
            console.error(error);
            if (error.properties && error.properties.errors) {
                console.log('Détails des erreurs :', error.properties.errors);
                if (error.properties.errors instanceof Array) {
                    error.properties.errors.forEach((e: any) => {
                        console.log('Erreur pour la balise :', e.name);
                        console.log('Message :', e.message);
                    });
                }
            }
            throw error;
        }

        console.log("Génération du document final...");
        const generatedDoc = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const city = extractCity(data.adresseBien);
        const fileName = `Mandat ${data.typeMandat} - ${city} - ${formattedDate}.docx`;

        console.log("Téléchargement du document...");
        saveAs(generatedDoc, fileName);
        return true;
    } catch (error) {
        console.error('Erreur lors de la génération du document Word :', error);
        throw error;
    }
}