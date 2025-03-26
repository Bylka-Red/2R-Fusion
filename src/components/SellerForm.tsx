import React, { useEffect } from 'react';
import { User2, Building2, MapPin, Phone, Mail, Heart, Copy, Trash2 } from 'lucide-react';
import type { Seller } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { NationalitySelect } from './NationalitySelect';

interface SellerFormProps {
  seller: Seller;
  onChange: (seller: Seller) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
  previousSeller?: Seller;
  onPropertyTypeChange: (type: 'personal-not-family' | 'personal-family') => void;
  propertyFamilyType: 'personal-not-family' | 'personal-family';
  totalSellers: number;
  onCoupleChange?: (isCouple: boolean) => void;
  showPropertyTypeSection?: boolean;
  isSecondary?: boolean;
  isAdditional?: boolean;
}

export function SellerForm({
  seller,
  onChange,
  onRemove,
  canRemove,
  index,
  previousSeller,
  onPropertyTypeChange,
  propertyFamilyType,
  totalSellers,
  onCoupleChange,
  showPropertyTypeSection = true,
  isSecondary = false,
  isAdditional = false
}: SellerFormProps) {
  useEffect(() => {
    console.log(`SellerForm received seller ${index}:`, seller);
  }, [seller, index]);

  // Initialiser marriageDetails avec des valeurs par défaut si undefined
  const sellerWithDefaults = {
    ...seller,
    marriageDetails: seller.marriageDetails || {
      date: '',
      place: '',
      regime: 'community'
    }
  };

  const handleChange = (field: string, value: any) => {
    console.log(`Changing ${field} to:`, value);
    if (field === 'maritalStatus') {
      const newSeller = { ...sellerWithDefaults, [field]: value };

      newSeller.marriageDetails = {
        date: '',
        place: '',
        regime: 'community',
      };
      newSeller.customMaritalStatus = undefined;
      newSeller.pacsDetails = undefined;
      newSeller.divorceDetails = undefined;
      newSeller.widowDetails = undefined;

      if (value === 'celibataire-pacse') {
        newSeller.pacsDetails = {
          date: '',
          place: '',
          reference: '',
          partnerName: '',
        };
      } else if (value === 'divorce') {
        newSeller.divorceDetails = {
          exSpouseName: '',
        };
      } else if (value === 'veuf') {
        newSeller.widowDetails = {
          deceasedSpouseName: '',
        };
      }

      onChange(newSeller);
    } else if (field === 'pacsDetails') {
      onChange({
        ...sellerWithDefaults,
        pacsDetails: { ...sellerWithDefaults.pacsDetails, ...value },
      });
    } else if (field === 'divorceDetails') {
      onChange({
        ...sellerWithDefaults,
        divorceDetails: { ...sellerWithDefaults.divorceDetails, ...value },
      });
    } else if (field === 'widowDetails') {
      onChange({
        ...sellerWithDefaults,
        widowDetails: { ...sellerWithDefaults.widowDetails, ...value },
      });
    } else if (field === 'marriageDetails') {
      onChange({
        ...sellerWithDefaults,
        marriageDetails: { ...sellerWithDefaults.marriageDetails, ...value },
      });
    } else {
      onChange({ ...sellerWithDefaults, [field]: value });
    }
  };

  const copyPreviousAddress = () => {
    if (previousSeller) {
      console.log("Copying previous seller's address.");
      handleChange('address', { ...previousSeller.address });
    }
  };

  const needsMarriageDetails = (status: string) => {
    return [
      'marie-sans-contrat',
      'communaute-acquets',
      'separation-biens',
      'communaute-universelle'
    ].includes(status);
  };

  const shouldShowPropertyTypeSection = index === 0 &&
    !['celibataire-non-pacse', 'divorce', 'veuf'].includes(sellerWithDefaults.maritalStatus) &&
    totalSellers === 1 &&
    showPropertyTypeSection;

  const isMaritalStatusDisabled = index === 1 && sellerWithDefaults.couple?.isCouple;

  // Déterminer le titre de la section en fonction du type de vendeur
  const getSellerTitle = () => {
    if (isSecondary) return "Second vendeur";
    if (isAdditional) return `Vendeur supplémentaire ${index + 1}`;
    return "Vendeur principal";
  };

  return (
    <div className={`form-section border-2 ${
      isSecondary ? 'border-blue-200 hover:border-blue-300' :
      isAdditional ? 'border-purple-200 hover:border-purple-300' :
      'border-gray-200 hover:border-gray-300'
    } transition-colors`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <h3 className="text-lg font-medium text-gray-900">{getSellerTitle()}</h3>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleChange('type', 'individual')}
              className={`relative flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                sellerWithDefaults.type === 'individual'
                  ? 'text-[#0b8043] bg-green-50 ring-1 ring-[#0b8043]'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <User2 className="h-4 w-4" />
              <span className="text-sm font-medium">Particulier</span>
              {sellerWithDefaults.type === 'individual' && (
                <span className="absolute -top-2 -right-2 bg-[#0b8043] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {index + 1}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'company')}
              className={`relative flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                sellerWithDefaults.type === 'company'
                  ? 'text-[#0b8043] bg-green-50 ring-1 ring-[#0b8043]'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Société</span>
              {sellerWithDefaults.type === 'company' && (
                <span className="absolute -top-2 -right-2 bg-[#0b8043] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {index + 1}
                </span>
              )}
            </button>
          </div>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Supprimer le vendeur"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {sellerWithDefaults.type === 'individual' && (
          <div className="grid grid-cols-3 gap-4">
            <label>
              <span>Civilité</span>
              <select
                value={sellerWithDefaults.title}
                onChange={(e) => handleChange('title', e.target.value)}
              >
                <option value="Mr">Monsieur</option>
                <option value="Mrs">Madame</option>
              </select>
            </label>
            <label>
              <span>Nom</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User2 className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={sellerWithDefaults.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value.toUpperCase())}
                  className="pl-10"
                />
              </div>
            </label>
            <label>
              <span>Prénom</span>
              <input
                type="text"
                value={sellerWithDefaults.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </label>
          </div>
        )}

        {sellerWithDefaults.type === 'company' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span>Forme Juridique</span>
                <input
                  type="text"
                  value={sellerWithDefaults.legalForm}
                  onChange={(e) => handleChange('legalForm', e.target.value)}
                  placeholder="Ex: SARL, SAS, SA..."
                />
              </label>
              <label>
                <span>Nom de la société</span>
                <input
                  type="text"
                  value={sellerWithDefaults.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span>Capital de la société</span>
                <input
                  type="text"
                  value={sellerWithDefaults.capital}
                  onChange={(e) => handleChange('capital', e.target.value)}
                  placeholder="Ex: 10000"
                />
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label>
                  <span>Civilité</span>
                  <select
                    value={sellerWithDefaults.managerTitle}
                    onChange={(e) => handleChange('managerTitle', e.target.value)}
                  >
                    <option value="Mr">Monsieur</option>
                    <option value="Mrs">Madame</option>
                  </select>
                </label>
                <label>
                  <span>Nom</span>
                  <input
                    type="text"
                    value={sellerWithDefaults.managerLastName}
                    onChange={(e) => handleChange('managerLastName', e.target.value)}
                  />
                </label>
                <label>
                  <span>Prénom</span>
                  <input
                    type="text"
                    value={sellerWithDefaults.managerFirstName}
                    onChange={(e) => handleChange('managerFirstName', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span>Ville RCS</span>
                <input
                  type="text"
                  value={sellerWithDefaults.rcsCity}
                  onChange={(e) => handleChange('rcsCity', e.target.value)}
                />
              </label>
              <label>
                <span>Numéro RCS</span>
                <input
                  type="text"
                  value={sellerWithDefaults.rcsNumber}
                  onChange={(e) => handleChange('rcsNumber', e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {sellerWithDefaults.type === 'individual' && (
          <div className="grid grid-cols-3 gap-4">
            <label>
              <span>Date de naissance</span>
              <input
                type="date"
                value={sellerWithDefaults.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
            </label>
            <label>
              <span>Lieu de naissance</span>
              <input
                type="text"
                value={sellerWithDefaults.birthPlace}
                onChange={(e) => handleChange('birthPlace', e.target.value)}
              />
            </label>
            <label>
              <span>Code postal de naissance</span>
              <input
                type="text"
                value={sellerWithDefaults.birthPostalCode}
                onChange={(e) => handleChange('birthPostalCode', e.target.value)}
                maxLength={5}
                pattern="[0-9]*"
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {sellerWithDefaults.type === 'individual' && (
            <label>
              <span>Profession</span>
              <input
                type="text"
                value={sellerWithDefaults.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
              />
            </label>
          )}
          <label>
            <span>Téléphone</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={sellerWithDefaults.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10"
              />
            </div>
          </label>
          <label>
            <span>Email</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={sellerWithDefaults.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10"
              />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="form-section-title mb-0">
              <MapPin className="h-5 w-5" />
              {sellerWithDefaults.type === 'company' ? 'Adresse du siège social' : 'Adresse'}
            </h4>
            {index > 0 && previousSeller && (
              <button
                onClick={copyPreviousAddress}
                className="p-2 text-[#0b8043] hover:text-[#097339] hover:bg-green-50 rounded-lg transition-colors"
                title={`Copier l'adresse du vendeur ${index}`}
              >
                <Copy className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <label>
              <span>Adresse complète</span>
              <AddressAutocomplete
                value={sellerWithDefaults.address.fullAddress}
                onChange={({ label }) => handleChange('address', { fullAddress: label })}
                placeholder="Saisissez l'adresse"
              />
            </label>
          </div>
        </div>

        {sellerWithDefaults.type === 'individual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="form-section-title mb-0">
                <Heart className="h-5 w-5" />
                Situation matrimoniale et fiscale
              </h4>
              {index === 1 && onCoupleChange && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sellerWithDefaults.couple?.isCouple || false}
                    onChange={(e) => onCoupleChange(e.target.checked)}
                    className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                  />
                  <span className="text-sm font-medium text-gray-700">En couple</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <span>Nationalité</span>
                <NationalitySelect
                  value={sellerWithDefaults.nationality}
                  onChange={(value) => handleChange('nationality', value)}
                />
              </label>
              <label>
                <span>État civil</span>
                <select
                  value={sellerWithDefaults.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  disabled={isMaritalStatusDisabled}
                  className={`mt-1.5 block w-full rounded-md border-0 px-2.5 py-1.5 ${
                    isMaritalStatusDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
                  } text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0b8043] text-sm`}
                >
                  <option value="celibataire-non-pacse">Célibataire non lié(e) par un PACS</option>
                  <option value="celibataire-pacse">Célibataire lié(e) par un PACS</option>
                  <option value="marie-sans-contrat">Marié(e) sans contrat</option>
                  <option value="communaute-acquets">Marié(e) sous le régime de la communauté d'acquêts</option>
                  <option value="separation-biens">Marié(e) sous le régime de la séparation de biens</option>
                  <option value="communaute-universelle">Marié(e) sous le régime de la communauté universelle</option>
                  <option value="divorce">Divorcé(e), non remarié(e)</option>
                  <option value="veuf">Veuf(ve), non remarié(e)</option>
                  <option value="autre">Autre</option>
                </select>
              </label>
            </div>

            {sellerWithDefaults.maritalStatus === 'autre' && (
              <div className="space-y-4">
                <label>
                  <span>Précisez votre situation matrimoniale</span>
                  <textarea
                    value={sellerWithDefaults.customMaritalStatus || ''}
                    onChange={(e) => handleChange('customMaritalStatus', e.target.value)}
                    placeholder="Décrivez votre situation matrimoniale"
                    className="mt-1.5 block w-full rounded-md border-0 px-2.5 py-1.5 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0b8043] text-sm"
                    rows={3}
                  />
                </label>
              </div>
            )}

            {sellerWithDefaults.maritalStatus === 'celibataire-pacse' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label>
                    <span>Date du PACS</span>
                    <input
                      type="date"
                      value={sellerWithDefaults.pacsDetails?.date || ''}
                      onChange={(e) => handleChange('pacsDetails', { date: e.target.value })}
                      disabled={isMaritalStatusDisabled}
                    />
                  </label>
                  <label>
                    <span>Ville du PACS</span>
                    <input
                      type="text"
                      value={sellerWithDefaults.pacsDetails?.place || ''}
                      onChange={(e) => handleChange('pacsDetails', { place: e.target.value })}
                      placeholder="Ville de la mairie ou du tribunal"
                      disabled={isMaritalStatusDisabled}
                    />
                  </label>
                </div>
                <label>
                  <span>Référence du PACS</span>
                  <input
                    type="text"
                    value={sellerWithDefaults.pacsDetails?.reference || ''}
                    onChange={(e) => handleChange('pacsDetails', { reference: e.target.value })}
                    placeholder="Numéro d'enregistrement du PACS"
                    disabled={isMaritalStatusDisabled}
                  />
                </label>
                {index === 0 && (
                  <label>
                    <span>Nom et prénom du partenaire</span>
                    <input
                      type="text"
                      value={sellerWithDefaults.pacsDetails?.partnerName || ''}
                      onChange={(e) => handleChange('pacsDetails', { partnerName: e.target.value })}
                      placeholder="Nom et prénom du partenaire pacsé"
                      disabled={isMaritalStatusDisabled}
                    />
                  </label>
                )}
              </div>
            )}

            {sellerWithDefaults.maritalStatus === 'divorce' && index === 0 && (
              <div className="space-y-4">
                <label>
                  <span>Nom et prénom de l'ex-conjoint</span>
                  <input
                    type="text"
                    value={sellerWithDefaults.divorceDetails?.exSpouseName || ''}
                    onChange={(e) => handleChange('divorceDetails', { exSpouseName: e.target.value })}
                    placeholder="Nom et prénom de l'ex-conjoint"
                    disabled={isMaritalStatusDisabled}
                  />
                </label>
              </div>
            )}

            {sellerWithDefaults.maritalStatus === 'veuf' && index === 0 && (
              <div className="space-y-4">
                <label>
                  <span>Nom et prénom du conjoint décédé</span>
                  <input
                    type="text"
                    value={sellerWithDefaults.widowDetails?.deceasedSpouseName || ''}
                    onChange={(e) => handleChange('widowDetails', { deceasedSpouseName: e.target.value })}
                    placeholder="Nom et prénom du conjoint décédé"
                    disabled={isMaritalStatusDisabled}
                  />
                </label>
              </div>
            )}

            {needsMarriageDetails(sellerWithDefaults.maritalStatus) && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label>
                    <span>Date du mariage</span>
                    <input
                      type="date"
                      value={sellerWithDefaults.marriageDetails.date}
                      onChange={(e) =>
                        handleChange('marriageDetails', {
                          ...sellerWithDefaults.marriageDetails,
                          date: e.target.value,
                        })
                      }
                      disabled={isMaritalStatusDisabled}
                    />
                  </label>
                  <label>
                    <span>Lieu du mariage</span>
                    <input
                      type="text"
                      value={sellerWithDefaults.marriageDetails.place}
                      onChange={(e) =>
                        handleChange('marriageDetails', {
                          ...sellerWithDefaults.marriageDetails,
                          place: e.target.value,
                        })
                      }
                      disabled={isMaritalStatusDisabled}
                    />
                  </label>
                </div>
              </div>
            )}

            {shouldShowPropertyTypeSection && (
              <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                <span className="block text-sm font-medium text-gray-700">Nature du bien</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={propertyFamilyType === 'personal-not-family'}
                      onChange={() => onPropertyTypeChange('personal-not-family')}
                      className="rounded-full border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                    />
                    <span className="text-sm text-gray-700">
                      Le bien est un bien propre et ne constitue pas le logement de famille
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={propertyFamilyType === 'personal-family'}
                      onChange={() => onPropertyTypeChange('personal-family')}
                      className="rounded-full border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                    />
                    <span className="text-sm text-gray-700">
                      Le bien est un bien propre et constitue le logement de famille
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
              <span className="block text-sm font-medium text-gray-700">
                Le vendeur a sa résidence fiscale en France ?
              </span>
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={sellerWithDefaults.hasFrenchTaxResidence}
                    onChange={() => handleChange('hasFrenchTaxResidence', true)}
                    className="rounded-full border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!sellerWithDefaults.hasFrenchTaxResidence}
                    onChange={() => handleChange('hasFrenchTaxResidence', false)}
                    className="rounded-full border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Non</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}