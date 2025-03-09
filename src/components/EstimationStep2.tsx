import React from 'react';
import { Building2, Home, MapPin, Copy, Trash2, User } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { PropertyCriteria, Estimation } from '../types';

interface EstimationStep2Props {
  formData: Estimation;
  handleChange: (field: string, value: any) => void;
  copyFirstSellerAddress: () => void;
  onNext: () => void;
}

const EstimationStep2: React.FC<EstimationStep2Props> = ({
  formData,
  handleChange,
  copyFirstSellerAddress,
  onNext,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-gray-500" />
          Type de bien
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleChange('propertyType', 'apartment')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                formData.propertyType === 'apartment'
                  ? 'bg-[#0b8043] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Appartement
            </button>
            <button
              type="button"
              onClick={() => handleChange('propertyType', 'house')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                formData.propertyType === 'house'
                  ? 'bg-[#0b8043] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              Maison
            </button>
            {formData.propertyType === 'house' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isInCopropriete}
                  onChange={(e) => handleChange('isInCopropriete', e.target.checked)}
                  className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Cette maison fait partie d'une copropriété
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label>
          <span className="required">Adresse du bien</span>
          <div className="flex items-center gap-2 w-full">
            <div className="w-[450px]">
              <AddressAutocomplete
                value={formData.propertyAddress.fullAddress}
                onChange={({ label }) =>
                  handleChange('propertyAddress', { fullAddress: label })
                }
                placeholder="Saisissez l'adresse du bien"
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={copyFirstSellerAddress}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              title="Copier l'adresse du propriétaire"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </label>

        {formData.propertyType === 'apartment' && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Nombre de pièces</span>
                <input
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => handleChange('rooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de chambres</span>
                <input
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Surface habitable</span>
                <input
                  type="number"
                  value={formData.surface || ''}
                  onChange={(e) => handleChange('surface', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>État Général</span>
                <select
                  value={formData.condition || ''}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="new">Neuf</option>
                  <option value="excellent">Excellent état</option>
                  <option value="good">Bon état</option>
                  <option value="needs-work">Travaux à prévoir</option>
                  <option value="to-renovate">À rénover</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Surface Séjour</span>
                <input
                  type="number"
                  value={formData.criteria.livingRoomSurface || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    livingRoomSurface: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles de bains</span>
                <input
                  type="number"
                  value={formData.criteria.bathrooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    bathrooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles d'eau</span>
                <input
                  type="number"
                  value={formData.criteria.showerRooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    showerRooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de cuisine</span>
                <select
                  value={formData.criteria.kitchenType || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    kitchenType: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="open-equipped">Ouverte et équipée</option>
                  <option value="closed-equipped">Fermée et équipée</option>
                  <option value="open-fitted">Ouverte et aménagée</option>
                  <option value="closed-fitted">Fermée et aménagée</option>
                  <option value="to-create">Cuisine à créer</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Étage</span>
                <input
                  type="number"
                  value={formData.criteria.floorNumber || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    floorNumber: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre d'étages</span>
                <input
                  type="number"
                  value={formData.criteria.totalFloors || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    totalFloors: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Niveau</span>
                <input
                  type="text"
                  value={formData.criteria.floorLevel || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    floorLevel: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de chauffage</span>
                <select
                  value={formData.criteria.heatingSystem || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    heatingSystem: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="electric">Électrique</option>
                  <option value="individual-gas">Gaz individuel</option>
                  <option value="collective-gas">Gaz collectif</option>
                  <option value="heat-pump">Pompe à chaleur</option>
                  <option value="fuel">Fuel</option>
                  <option value="collective-geothermal">Géothermique collectif</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Année de construction</span>
                <input
                  type="number"
                  value={formData.criteria.constructionYear || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    constructionYear: parseInt(e.target.value) || undefined
                  })}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Charges de Copro : €/Mois</span>
                <input
                  type="number"
                  value={formData.criteria.chargesCopro || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    chargesCopro: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Taxe foncière</span>
                <input
                  type="number"
                  value={formData.criteria.propertyTax || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    propertyTax: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Exposition</span>
                <select
                  value={formData.criteria.exposure || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    exposure: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="north">Nord</option>
                  <option value="south">Sud</option>
                  <option value="east">Est</option>
                  <option value="west">Ouest</option>
                  <option value="north-east">Nord-Est</option>
                  <option value="north-west">Nord-Ouest</option>
                  <option value="south-east">Sud-Est</option>
                  <option value="south-west">Sud-Ouest</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Équipements</h4>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGas || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGas: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Gaz de Ville</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElevator || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElevator: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Ascenseur</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasBalcony || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasBalcony: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Balcon</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasTerrace || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasTerrace: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Terrasse</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGarden || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGarden: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Jardin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasDoubleGlazing || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasDoubleGlazing: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Double Vitrage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElectricShutters || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElectricShutters: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Volets électriques</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasParkingBox || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasParkingBox: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Parking/Box</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasCellar || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasCellar: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Cave</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {formData.propertyType === 'house' && !formData.isInCopropriete && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Nombre de pièces</span>
                <input
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => handleChange('rooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de chambres</span>
                <input
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Surface habitable</span>
                <input
                  type="number"
                  value={formData.surface || ''}
                  onChange={(e) => handleChange('surface', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>État Général</span>
                <select
                  value={formData.condition || ''}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="new">Neuf</option>
                  <option value="excellent">Excellent état</option>
                  <option value="good">Bon état</option>
                  <option value="needs-work">Travaux à prévoir</option>
                  <option value="to-renovate">À rénover</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Surface Séjour</span>
                <input
                  type="number"
                  value={formData.criteria.livingRoomSurface || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    livingRoomSurface: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles de bains</span>
                <input
                  type="number"
                  value={formData.criteria.bathrooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    bathrooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles d'eau</span>
                <input
                  type="number"
                  value={formData.criteria.showerRooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    showerRooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de cuisine</span>
                <select
                  value={formData.criteria.kitchenType || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    kitchenType: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="open-equipped">Ouverte et équipée</option>
                  <option value="closed-equipped">Fermée et équipée</option>
                  <option value="open-fitted">Ouverte et aménagée</option>
                  <option value="closed-fitted">Fermée et aménagée</option>
                  <option value="to-create">Cuisine à créer</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Nombre de niveaux</span>
                <input
                  type="number"
                  value={formData.criteria.levelCount || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    levelCount: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de balcons</span>
                <input
                  type="number"
                  value={formData.criteria.balconyCount || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    balconyCount: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de terrasses</span>
                <input
                  type="number"
                  value={formData.criteria.terraceCount || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    terraceCount: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de chauffage</span>
                <select
                  value={formData.criteria.heatingSystem || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    heatingSystem: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="electric">Électrique</option>
                  <option value="individual-gas">Gaz individuel</option>
                  <option value="collective-gas">Gaz collectif</option>
                  <option value="heat-pump">Pompe à chaleur</option>
                  <option value="fuel">Fuel</option>
                  <option value="collective-geothermal">Géothermique collectif</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Année de construction</span>
                <input
                  type="number"
                  value={formData.criteria.constructionYear || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    constructionYear: parseInt(e.target.value) || undefined
                  })}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Surface Terrain</span>
                <input
                  type="number"
                  value={formData.criteria.landSurface || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    landSurface: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Taxe foncière</span>
                <input
                  type="number"
                  value={formData.criteria.propertyTax || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    propertyTax: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Exposition</span>
                <select
                  value={formData.criteria.exposure || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    exposure: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="north">Nord</option>
                  <option value="south">Sud</option>
                  <option value="east">Est</option>
                  <option value="west">Ouest</option>
                  <option value="north-east">Nord-Est</option>
                  <option value="north-west">Nord-Ouest</option>
                  <option value="south-east">Sud-Est</option>
                  <option value="south-west">Sud-Ouest</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Équipements</h4>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGas || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGas: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Gaz de Ville</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGarage || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGarage: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Garage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasBalcony || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasBalcony: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Balcon</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasTerrace || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasTerrace: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Terrasse</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGarden || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGarden: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Jardin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasFireplace || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasFireplace: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Cheminée</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasWoodStove || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasWoodStove: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Poêle à bois</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasDoubleGlazing || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasDoubleGlazing: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Double Vitrage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElectricShutters || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElectricShutters: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Volets électriques</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElectricGate || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElectricGate: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Portail électrique</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasConvertibleAttic || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasConvertibleAttic: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Combles aménageables</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasBasement || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasBasement: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Sous-sol</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {formData.propertyType === 'house' && formData.isInCopropriete && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Nombre de pièces</span>
                <input
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => handleChange('rooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de chambres</span>
                <input
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Surface habitable</span>
                <input
                  type="number"
                  value={formData.surface || ''}
                  onChange={(e) => handleChange('surface', parseInt(e.target.value) || '')}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>État Général</span>
                <select
                  value={formData.condition || ''}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="new">Neuf</option>
                  <option value="excellent">Excellent état</option>
                  <option value="good">Bon état</option>
                  <option value="needs-work">Travaux à prévoir</option>
                  <option value="to-renovate">À rénover</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Surface Séjour</span>
                <input
                  type="number"
                  value={formData.criteria.livingRoomSurface || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    livingRoomSurface: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles de bains</span>
                <input
                  type="number"
                  value={formData.criteria.bathrooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    bathrooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de salles d'eau</span>
                <input
                  type="number"
                  value={formData.criteria.showerRooms || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    showerRooms: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de cuisine</span>
                <select
                  value={formData.criteria.kitchenType || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    kitchenType: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="open-equipped">Ouverte et équipée</option>
                  <option value="closed-equipped">Fermée et équipée</option>
                  <option value="open-fitted">Ouverte et aménagée</option>
                  <option value="closed-fitted">Fermée et aménagée</option>
                  <option value="to-create">Cuisine à créer</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Nombre de niveaux</span>
                <input
                  type="number"
                  value={formData.criteria.levelCount || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    levelCount: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Nombre de balcons/terrasses</span>
                <input
                  type="number"
                  value={formData.criteria.balconyTerraceCount || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    balconyTerraceCount: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Surface Terrain</span>
                <input
                  type="number"
                  value={formData.criteria.landSurface || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    landSurface: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Type de chauffage</span>
                <select
                  value={formData.criteria.heatingSystem || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    heatingSystem: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="electric">Électrique</option>
                  <option value="individual-gas">Gaz individuel</option>
                  <option value="collective-gas">Gaz collectif</option>
                  <option value="heat-pump">Pompe à chaleur</option>
                  <option value="fuel">Fuel</option>
                  <option value="collective-geothermal">Géothermique collectif</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <label>
                <span>Année de construction</span>
                <input
                  type="number"
                  value={formData.criteria.constructionYear || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    constructionYear: parseInt(e.target.value) || undefined
                  })}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Charges de Copro : €/Mois</span>
                <input
                  type="number"
                  value={formData.criteria.chargesCopro || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    chargesCopro: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Taxe foncière</span>
                <input
                  type="number"
                  value={formData.criteria.propertyTax || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    propertyTax: parseInt(e.target.value) || ''
                  })}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                />
              </label>
              <label>
                <span>Exposition</span>
                <select
                  value={formData.criteria.exposure || ''}
                  onChange={(e) => handleChange('criteria', {
                    ...formData.criteria,
                    exposure: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200"
                >
                  <option value="north">Nord</option>
                  <option value="south">Sud</option>
                  <option value="east">Est</option>
                  <option value="west">Ouest</option>
                  <option value="north-east">Nord-Est</option>
                  <option value="north-west">Nord-Ouest</option>
                  <option value="south-east">Sud-Est</option>
                  <option value="south-west">Sud-Ouest</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Équipements</h4>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGas || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGas: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Gaz de Ville</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGarage || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGarage: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Garage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasBalcony || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasBalcony: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Balcon</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasTerrace || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasTerrace: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Terrasse</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasGarden || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasGarden: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Jardin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasFireplace || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasFireplace: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Cheminée</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasWoodStove || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasWoodStove: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Poêle à bois</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasDoubleGlazing || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasDoubleGlazing: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Double Vitrage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElectricShutters || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElectricShutters: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Volets électriques</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasElectricGate || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasElectricGate: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Portail électrique</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasConvertibleAttic || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasConvertibleAttic: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Combles aménageables</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.criteria.hasBasement || false}
                    onChange={(e) => handleChange('criteria', {
                      ...formData.criteria,
                      hasBasement: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary focus:ring-primary transition duration-200"
                  />
                  <span className="text-sm">Sous-sol</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimationStep2;
