import React from 'react';

export type Room = {
  name: string;
  area: number;
};

export type Level = {
  name: string;
  rooms: Room[];
  type: 'basement' | 'regular' | 'outbuilding';
  floorNumber?: number;
  totalFloors?: number;
  floorLevel?: string;
  chargesCopro?: number;
};

export type EstimationStatus = 'draft' | 'completed' | 'converted';

export type PropertyCriteria = {
  hasElevator: boolean;
  floorNumber?: number;
  totalFloors?: number;
  heatingType: 'individual' | 'collective' | 'none';
  heatingEnergy: 'gas' | 'electricity' | 'fuel' | 'wood' | 'other' | 'none';
  hasCellar: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  exposure: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
  livingRoomSurface: number;
  bathrooms: number;
  showerRooms: number;
  kitchenType: string;
  heatingSystem: string;
  basement: string;
  landSurface: number;
  constructionYear?: number;
  propertyTax: number;
  hasGas: boolean;
  hasGarage: boolean;
  hasFireplace: boolean;
  hasWoodStove: boolean;
  hasElectricShutters: boolean;
  hasElectricGate: boolean;
  hasConvertibleAttic: boolean;
  chargesCopro?: number;
  floorLevel?: string;
};

export type DiagnosticInfo = {
  propertyType: 'monopropriete' | 'copropriete' | 'asl';
  hasCityGas: boolean;
};

export type Comparable = {
  address: string;
  price: number;
  surface: number;
  rooms: number;
  saleDate: string;
};

export type MarketAnalysis = {
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketTrend: 'up' | 'down' | 'stable';
  averageSaleTime: number;
};

export type PropertyFeature = {
  type: 'strength' | 'weakness';
  description: string;
};

export type Owner = {
  firstName: string;
  lastName: string;
  address: string;
  phones: string[];
  emails: string[];
};

export type Estimation = {
  id: string;
  createdAt: string;
  status: EstimationStatus;
  estimationDate: string;
  owners: Owner[];
  notes?: string;
  commercial?: string;

  propertyAddress: PropertyAddress;
  propertyType: 'house' | 'apartment';
  isInCopropriete: boolean;
  surface: number;
  landSurface?: number;
  rooms: number;
  bedrooms: number;
  constructionYear?: number;
  energyClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  condition: 'new' | 'excellent' | 'good' | 'needs-work' | 'to-renovate';

  criteria: PropertyCriteria;
  diagnosticInfo: DiagnosticInfo;
  features: PropertyFeature[];
  comparables: Comparable[];
  marketAnalysis: MarketAnalysis;
  levels: Level[];

  estimatedPrice: {
    low: number;
    high: number;
  };
  pricePerSqm: number;

  comments?: string;
};

export type PropertyAddress = {
  fullAddress: string;
};

export type TantiemeDetails = {
  numerator: string;
  denominator: '1000' | '10000' | '100000';
  type: 'general' | 'soil-and-general' | 'custom';
  customType?: string;
};

export type PropertyLot = {
  number: string;
  description: string;
  tantiemes: TantiemeDetails[];
  carrezSurface: string;
  carrezGuarantor: {
    type: 'diagnostician' | 'owner';
    name: string;
    date: string;
  };
};

export type CadastralSection = {
  section: string;
  number: string;
  lieuDit: string;
  surface: string;
};

export type MaritalStatus =
  | 'celibataire-non-pacse'
  | 'celibataire-pacse'
  | 'marie-sans-contrat'
  | 'communaute-acquets'
  | 'separation-biens'
  | 'communaute-universelle'
  | 'divorce'
  | 'veuf'
  | 'autre';

export type Seller = {
  type: 'individual' | 'company';
  title?: 'Mr' | 'Mrs';
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthPostalCode?: string;
  nationality?: string;
  profession?: string;
  maritalStatus?: MaritalStatus;
  customMaritalStatus?: string;
  marriageDetails: {
    date: string;
    place: string;
    regime: 'community' | 'separation' | 'universal' | 'other';
  };
  pacsDetails?: {
    date: string;
    place: string;
    reference: string;
    partnerName: string;
  };
  divorceDetails?: {
    exSpouseName: string;
  };
  widowDetails?: {
    deceasedSpouseName: string;
  };
  address: PropertyAddress;
  phone: string;
  email: string;
  hasFrenchTaxResidence: boolean;
  couple?: {
    isCouple: boolean;
    partnerId: number;
  };

  legalForm?: string;
  companyName?: string;
  capital?: string;
  rcsCity?: string;
  rcsNumber?: string;
  managerTitle?: 'Mr' | 'Mrs';
  managerFirstName?: string;
  managerLastName?: string;
};

export type MandateType = 'exclusive' | 'simple' | 'semi-exclusive';
export type FeesPayer = 'seller' | 'buyer';
export type CommercialName = 'Redhouane' | 'Jérémy' | 'Audrey' | 'Christelle' | 'Guilhem';

export type PriceAmendment = {
  date: string;
  netPrice: number;
  fees: {
    ttc: number;
    ht: number;
  };
};

export type Mandate = {
  date: string;
  type: MandateType;
  mandateNumber: string;
  netPrice: number;
  fees: {
    ttc: number;
    ht: number;
  };
  feesPayer: FeesPayer;
  commercial: CommercialName;
  keys: {
    hasKeys: boolean;
    receivedDate?: string;
    returnedDate?: string;
    details: string;
  };
  amendments?: PriceAmendment[];
  purchaseOffers?: PurchaseOffer[];
};

export type OccupationStatus = 'occupied-by-seller' | 'vacant' | 'rented';
export type DPEStatus = 'completed' | 'in-progress' | 'not-required';

export type Commercial = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photoUrl: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
};

export type PurchaseOffer = {
  id: string;
  date: string;
  amount: number;
  personalContribution: number;
  monthlyIncome: number;
  currentLoans: number;
  deposit: number;
  buyers: Seller[];
};
