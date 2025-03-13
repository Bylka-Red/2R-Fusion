import React from 'react';
import { User2, Phone, Mail, MapPin, Trash2, Plus, Calendar, User } from 'lucide-react';
import type { Owner, PropertyAddress, Commercial } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';

interface EstimationStep1Props {
  owners: Owner[];
  onOwnersChange: (owners: Owner[]) => void;
  propertyAddress: PropertyAddress;
  onPropertyAddressChange: (address: PropertyAddress) => void;
  propertyType: 'house' | 'apartment';
  onPropertyTypeChange: (type: 'house' | 'apartment') => void;
  isInCopropriete: boolean;
  onIsInCoproprieteChange: (value: boolean) => void;
  onNext: () => void;
  commercial: string;
  onCommercialChange: (commercial: string) => void;
  commercials: Commercial[];
  estimationDate: string;
  onEstimationDateChange: (date: string) => void;
}

const EstimationStep1: React.FC<EstimationStep1Props> = ({
  owners,
  onOwnersChange,
  propertyAddress,
  onPropertyAddressChange,
  propertyType,
  onPropertyTypeChange,
  isInCopropriete,
  onIsInCoproprieteChange,
  onNext,
  commercial,
  onCommercialChange,
  commercials,
  estimationDate,
  onEstimationDateChange
}) => {
  const addOwner = () => {
    onOwnersChange([
      ...owners,
      {
        title: 'Monsieur',
        firstName: '',
        lastName: '',
        address: '',
        phones: [''],
        emails: [''],
      },
    ]);
  };

  const removeOwner = (index: number) => {
    onOwnersChange(owners.filter((_, i) => i !== index));
  };

  const updateOwner = (index: number, field: keyof Owner, value: any) => {
    const newOwners = [...owners];
    if (field === 'phones' || field === 'emails') {
      newOwners[index][field] = [value];
    } else {
      newOwners[index][field] = value;
    }
    onOwnersChange(newOwners);
  };

  const isFormValid = () => {
    return (
      owners.length > 0 &&
      owners.every(
        (owner) =>
          owner.firstName.trim() &&
          owner.lastName.trim() &&
          owner.phones[0].trim() &&
          owner.emails[0].trim()
      )
    );
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/(\d{1,2})/g);
    return match ? match.join(' ') : '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Date Estimation</span>
              </div>
              <input
                type="date"
                value={estimationDate}
                onChange={(e) => onEstimationDateChange(e.target.value)}
                className="h-[38px] w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
              />
            </label>
            <label className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>Commercial</span>
              </div>
              <select
                className="h-[38px] w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                value={commercial}
                onChange={(e) => onCommercialChange(e.target.value)}
              >
                {commercials.map((commercial) => (
                  <option key={commercial.id} value={commercial.firstName}>
                    {commercial.firstName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User2 className="h-5 w-5 text-gray-500" />
              Propriétaires
            </h3>
            <button
              type="button"
              onClick={addOwner}
              className="p-2 text-primary hover:text-primary-dark hover:bg-green-50 rounded-lg transition-colors"
              title="Ajouter un propriétaire"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {owners.map((owner, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg space-y-4 relative"
              >
                {index > 0 && (
                  <button
                    onClick={() => removeOwner(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <User2 className="h-4 w-4 text-gray-400" />
                      <span>Titre</span>
                    </div>
                    <select
                      value={owner.title || 'Monsieur'}
                      onChange={(e) =>
                        updateOwner(index, 'title', e.target.value)
                      }
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                    >
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                      <option value="Monsieur et Madame">Monsieur et Madame</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <User2 className="h-4 w-4 text-gray-400" />
                      <span>Nom</span>
                    </div>
                    <input
                      type="text"
                      value={owner.lastName}
                      onChange={(e) =>
                        updateOwner(index, 'lastName', e.target.value.toUpperCase())
                      }
                      placeholder="Nom du propriétaire"
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                    />
                  </label>
                  <label className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <User2 className="h-4 w-4 text-gray-400" />
                      <span>Prénom</span>
                    </div>
                    <input
                      type="text"
                      value={owner.firstName}
                      onChange={(e) =>
                        updateOwner(index, 'firstName', e.target.value)
                      }
                      placeholder="Prénom du propriétaire"
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                    />
                  </label>
                </div>

<label className="flex flex-col">
  <div className="flex items-center gap-2 mb-2">
    <MapPin className="h-4 w-4 text-gray-400" />
    <span>Adresse</span>
  </div>
  <AddressAutocomplete
    value={owner.address?.fullAddress || ''}
    onChange={(result) => {
      console.log("AddressAutocomplete result:", result); // Affiche le résultat dans la console
      if (result && typeof result === 'object' && 'label' in result) {
        updateOwner(index, 'address', { fullAddress: result.label });
      } else if (typeof result === 'string') {
        updateOwner(index, 'address', { fullAddress: result });
      }
    }}
    placeholder="Adresse du propriétaire"
    showIcon={false}
  />
</label>







                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>Téléphone</span>
                    </div>
                    <input
                      type="tel"
                      value={owner.phones[0]}
                      onChange={(e) =>
                        updateOwner(index, 'phones', formatPhoneNumber(e.target.value))
                      }
                      placeholder="Numéro de téléphone"
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                    />
                  </label>
                  <label className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Email</span>
                    </div>
                    <input
                      type="email"
                      value={owner.emails[0]}
                      onChange={(e) =>
                        updateOwner(index, 'emails', e.target.value.toLowerCase())
                      }
                      placeholder="Adresse email"
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimationStep1;
