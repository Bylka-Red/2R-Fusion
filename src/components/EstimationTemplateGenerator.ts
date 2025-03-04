import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { Estimation } from '../types';

export async function generateEstimationFromTemplate(estimation: Estimation): Promise<boolean> {
    try {
        // Déterminer quel modèle utiliser en fonction du type de propriété
        const isHouseInCopro = estimation.propertyType === 'house' && estimation.isInCopropriete;
        const templatePath = estimation.propertyType === 'apartment' || isHouseInCopro
            ? '/templates/modele_estimation.docx'
            : '/templates/modele_estimation_maison.docx';

        console.log(`Utilisation du modèle : ${templatePath} pour le type de propriété : ${estimation.propertyType}, isInCopropriete : ${estimation.isInCopropriete}`);

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
        const formatPrice = (price: number) => {
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price).replace('€', '').trim();
        };

        const formatDate = (dateString: string) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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

        const getBooleanText = (value: boolean | undefined) => {
            return value ? 'Oui' : 'Non';
        };

        // Extraire la ville de l'adresse complète
        const extractCity = (fullAddress: string) => {
            const codePostalIndex = fullAddress.search(/\d{5}/); // Recherche le code postal à 5 chiffres
            if (codePostalIndex === -1) return '';
            return fullAddress.substring(codePostalIndex + 5).trim().toUpperCase();
        };

        // Vérification des données criteria
        console.log("Données criteria :", estimation.criteria);

        // S'assurer que les critères existent
        const criteria = estimation.criteria || {};

        // Traduire les valeurs directement avant de les placer dans l'objet data
        let kitchenTypeFrench = '';
        switch (criteria.kitchenType) {
            case 'open-equipped': kitchenTypeFrench = 'ouverte équipée'; break;
            case 'open-not-equipped': kitchenTypeFrench = 'ouverte non équipée'; break;
            case 'closed-equipped': kitchenTypeFrench = 'fermée équipée'; break;
            case 'closed-not-equipped': kitchenTypeFrench = 'fermée non équipée'; break;
            case 'american': kitchenTypeFrench = 'américaine'; break;
            case 'integrated': kitchenTypeFrench = 'intégrée'; break;
            default: kitchenTypeFrench = criteria.kitchenType || '';
        }

        let heatingSystemFrench = '';
        switch (criteria.heatingSystem) {
            case 'individual-gas': heatingSystemFrench = 'individuel au gaz'; break;
            case 'individual-electric': heatingSystemFrench = 'individuel électrique'; break;
            case 'collective-gas': heatingSystemFrench = 'collectif au gaz'; break;
            case 'collective-fuel': heatingSystemFrench = 'collectif au fioul'; break;
            case 'heat-pump': heatingSystemFrench = 'pompe à chaleur'; break;
            case 'wood': heatingSystemFrench = 'au bois'; break;
            case 'none': heatingSystemFrench = 'pas de chauffage'; break;
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
            case 'triple': windowsTypeFrench = 'Triple vitrage'; break;
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

        let basementFrench = '';
        switch (criteria.basement) {
            case 'full': basementFrench = 'Sous-sol complet'; break;
            case 'partial': basementFrench = 'Sous-sol partiel'; break;
            case 'none': basementFrench = 'Pas de sous-sol'; break;
            default: basementFrench = criteria.basement || '';
        }

        // Calcul du prix des diagnostics obligatoires
        const calculateMandatoryPrice = () => {
            const propertyType = estimation.propertyType;
            const constructionYear = criteria.constructionYear;
            const hasGas = criteria.hasGas;
            const currentYear = new Date().getFullYear();
            const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
            const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
            const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
            const isInCoproperty = propertyType === 'apartment' || estimation.isInCopropriete;
            let requiredCount = 0;
        
            // DPE - toujours obligatoire
            requiredCount++;
        
            if (isInCoproperty) requiredCount++; // Loi Carrez
            if (isOlderThan15Years) requiredCount++; // Électricité
            if (isOlderThan15Years && hasGas) requiredCount++; // Gaz
            if (isBeforeAsbestos) requiredCount++; // Amiante
            if (isBeforeLead) requiredCount++; // Plomb
        
            if (requiredCount === 0) return 0;
        
            const prices = propertyType === 'apartment' || estimation.isInCoproperty
                ? { 1: 90, 2: 160, 3: 220, 4: 270, 5: 320, 6: 370 }
                : { 1: 120, 2: 200, 3: 270, 4: 320, 5: 370, 6: 420 };
        
            return prices[requiredCount as keyof typeof prices] || 0;
        };
        

        // Préparer les informations du commercial
        let prenomCommercial = '';
        let nomCommercial = '';
        let telephoneCommercial = '';
        let emailCommercial = '';

        if (estimation.commercial) {
            prenomCommercial = estimation.commercial;
            if (prenomCommercial === 'Redhouane') {
                nomCommercial = 'KABACHE';
                telephoneCommercial = '06 12 34 56 78';
                emailCommercial = 'redhouane@2r-immobilier.fr';
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
        const pointsForts = (estimation.features || [])
            .filter(f => f.type === 'strength')
            .map(f => f.description);

        const pointsFaibles = (estimation.features || [])
            .filter(f => f.type === 'weakness')
            .map(f => f.description);

        const pointsFortsFormatted = pointsForts.join('\n');
        const pointsFaiblesFormatted = pointsFaibles.join('\n');

        // Déterminer les diagnostics obligatoires
        const propertyType = estimation.propertyType;
        const constructionYear = criteria.constructionYear;
        const hasGas = criteria.hasGas;
        const currentYear = new Date().getFullYear();
        const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
        const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
        const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
        const isInCoproperty = propertyType === 'apartment' || estimation.isInCopropriete;

        // Préparer les données pour remplacer les balises
        const titreProprietaire = estimation.owners[0]?.title || '';
        const data = {
            titreProprietaire: titreProprietaire,
            prenomProprietaire: estimation.owners[0]?.firstName || '',
            nomProprietaire: estimation.owners[0]?.lastName || '',
            adresseProprietaire: estimation.owners[0]?.address || '',
            telephoneProprietaire: estimation.owners[0]?.phones?.[0] || '',
            emailProprietaire: estimation.owners[0]?.emails?.[0] || '',
            adresseBien: estimation.propertyAddress?.fullAddress || '',
            villeBien: extractCity(estimation.propertyAddress?.fullAddress || ''),
            typeBien: estimation.propertyType === 'house' ? 'Maison' : 'Appartement',
            surface: estimation.surface || '',
            pieces: estimation.rooms || '',
            chambres: estimation.bedrooms || '',
            etatGeneral: getConditionText(estimation.condition || ''),
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
            prixMoyen: formatPrice(estimation.marketAnalysis?.averagePrice || 0),
            prixMin: formatPrice(estimation.marketAnalysis?.priceRange?.min || 0),
            prixMax: formatPrice(estimation.marketAnalysis?.priceRange?.max || 0),
            tendanceMarche: getMarketTrendText(estimation.marketAnalysis?.marketTrend || ''),
            delaiVente: estimation.marketAnalysis?.averageSaleTime || '',
            prixRecommande: formatPrice(estimation.estimatedPrice?.recommended || 0),
            prixBas: formatPrice(estimation.estimatedPrice?.low || 0),
            prixHaut: formatPrice(estimation.estimatedPrice?.high || 0),
            fourchetteHaute: formatPrice(estimation.estimatedPrice?.high || 0),
            fourchetteHauteChiffre: estimation.estimatedPrice?.high || 0,
            fourchetteBasseChiffre: estimation.estimatedPrice?.low || 0,
            fourchetteBasseFormatted: new Intl.NumberFormat('fr-FR').format(estimation.estimatedPrice?.low || 0),
            fourchetteBasse: new Intl.NumberFormat('fr-FR').format(estimation.estimatedPrice?.low || 0),
            prixM2: formatPrice(estimation.pricePerSqm || 0),
            commentaires: estimation.comments || '',
            dateEstimation: formatDate(estimation.visitDate),
            dateVisite: formatDate(estimation.visitDate),
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
            basement: basementFrench,
            hasCellar: getBooleanText(criteria.hasCellar),
            hasGarden: getBooleanText(criteria.hasGarden),
            hasBalcony: getBooleanText(criteria.hasBalcony),
            hasTerrace: getBooleanText(criteria.hasTerrace),
            hasElevator: getBooleanText(criteria.hasElevator),
            hasGarage: getBooleanText(criteria.hasGarage),
            hasFireplace: getBooleanText(criteria.hasFireplace),
            hasWoodStove: getBooleanText(criteria.hasWoodStove),
            hasElectricShutters: getBooleanText(criteria.hasElectricShutters),
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
            isHouse: estimation.propertyType === 'house',
            isApartment: estimation.propertyType === 'apartment',
            isHouseInCopro: isHouseInCopro,
        };

        console.log("Données complètes passées à Docxtemplater :", data);

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
        const fileName = `Estimation ${data.prenomProprietaire} ${data.nomProprietaire} - ${city} - ${data.dateEstimation}.docx`;

        console.log("Téléchargement du document...");
        saveAs(generatedDoc, fileName);
        return true;
    } catch (error) {
        console.error('Erreur lors de la génération du document Word :', error);
        throw error;
    }
}
