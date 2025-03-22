import React, { useEffect } from 'react';
import { Building2, Map, Copy, Plus, Trash2, Home, FileText } from 'lucide-react';
import type { PropertyAddress, PropertyLot, CadastralSection, Seller, OccupationStatus, DPEStatus, TantiemeDetails } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';

interface PropertyTabProps {
  propertyAddress: PropertyAddress;
  setPropertyAddress: (address: PropertyAddress) => void;
  propertyType: 'apartment' | 'house';
  setPropertyType: (type: 'apartment' | 'house') => void;
  isInCopropriete: boolean;
  setIsInCopropriete: (isInCopropriete: boolean) => void;
  coPropertyAddress: PropertyAddress;
  setCoPropertyAddress: (address: PropertyAddress) => void;
  lots: PropertyLot[];
  setLots: (lots: PropertyLot[]) => void;
  officialDesignation: string;
  setOfficialDesignation: (designation: string) => void;
  cadastralSections: CadastralSection[];
  setCadastralSections: (sections: CadastralSection[]) => void;
  sellers: Seller[];
  onPropertyTypeChange: (type: 'personal-not-family' | 'personal-family') => void;
  propertyFamilyType: 'personal-not-family' | 'personal-family';
  occupationStatus: OccupationStatus;
  setOccupationStatus: (status: OccupationStatus) => void;
  dpeStatus: DPEStatus;
  setDpeStatus: (status: DPEStatus) => void;
}

const formatSurface = (surface: string): string => {
  const num = parseInt(surface) || 0;
  const ha = Math.floor(num / 10000);
  const a = Math.floor((num % 10000) / 100);
  const ca = num % 100;
  return `${ha.toString().padStart(2, '0')}ha ${a.toString().padStart(2, '0')}a ${ca.toString().padStart(2, '0')}ca`;
};

export function PropertyTab({
  propertyAddress,
  setPropertyAddress,
  propertyType,
  setPropertyType,
  isInCopropriete,
  setIsInCopropriete,
  coPropertyAddress,
  setCoPropertyAddress,
  lots,
  setLots,
  officialDesignation,
  setOfficialDesignation,
  cadastralSections,
  setCadastralSections,
  sellers,
  onPropertyTypeChange,
  propertyFamilyType,
  occupationStatus,
  setOccupationStatus,
  dpeStatus,
  setDpeStatus,
}: PropertyTabProps) {
  const addLot = () => {
    if (lots.length < 10) {
      const newLot: PropertyLot = {
        number: '',
        description: '',
        tantiemes: [{
          numerator: '',
          denominator: '10000',
          type: 'general',
          customType: ''
        }],
        carrezSurface: '',
        carrezGuarantor: {
          type: 'owner',
          name: '',
          date: ''
        }
      };
      setLots([...lots, newLot]);
    }
  };

  const removeLot = (index: number) => {
    if (lots.length > 1) {
      setLots(lots.filter((_, i) => i !== index));
    }
  };

  const addTantieme = (lotIndex: number) => {
    const newLots = [...lots];
    newLots[lotIndex].tantiemes.push({
      numerator: '',
      denominator: '10000',
      type: 'general',
      customType: ''
    });
    setLots(newLots);
  };

  const removeTantieme = (lotIndex: number, tantiemeIndex: number) => {
    const newLots = [...lots];
    if (newLots[lotIndex].tantiemes.length > 1) {
      newLots[lotIndex].tantiemes = newLots[lotIndex].tantiemes.filter((_, i) => i !== tantiemeIndex);
      setLots(newLots);
    }
  };

  const updateTantieme = (lotIndex: number, tantiemeIndex: number, field: keyof TantiemeDetails | 'customType', value: string) => {
    const newLots = [...lots];
    const tantieme = { ...newLots[lotIndex].tantiemes[tantiemeIndex] };

    if (field === 'customType') {
      tantieme.customType = value;
    } else if (field === 'numerator') {
      tantieme.numerator = value.replace(/\D/g, '');
    } else {
      tantieme[field] = value as any;
    }

    newLots[lotIndex].tantiemes[tantiemeIndex] = tantieme;
    setLots(newLots);
  };

  const updateLot = (index: number, field: keyof PropertyLot | 'carrezGuarantorType' | 'carrezGuarantorName' | 'carrezGuarantorDate', value: string) => {
    const newLots = [...lots];
    if (field === 'carrezGuarantorType') {
      newLots[index] = {
        ...newLots[index],
        carrezGuarantor: {
          ...newLots[index].carrezGuarantor,
          type: value as 'diagnostician' | 'owner',
        },
      };
    } else if (field === 'carrezGuarantorName') {
      newLots[index] = {
        ...newLots[index],
        carrezGuarantor: {
          ...newLots[index].carrezGuarantor,
          name: value,
        },
      };
    } else if (field === 'carrezGuarantorDate') {
      newLots[index] = {
        ...newLots[index],
        carrezGuarantor: {
          ...newLots[index].carrezGuarantor,
          date: value,
        },
      };
    } else {
      newLots[index] = { ...newLots[index], [field]: value };
    }
    setLots(newLots);
  };

  const addCadastralSection = () => {
    setCadastralSections([...cadastralSections, {
      section: '',
      number: '',
      lieuDit: '',
      surface: '',
    }]);
  };

  const removeCadastralSection = (index: number) => {
    if (cadastralSections.length > 1) {
      setCadastralSections(cadastralSections.filter((_, i) => i !== index));
    }
  };

  const updateCadastralSection = (index: number, field: keyof CadastralSection, value: string) => {
    const newSections = [...cadastralSections];
    if (field === 'section') {
      value = value.toUpperCase().slice(0, 2);
    } else if (field === 'number') {
      value = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'surface') {
      value = value.replace(/\D/g, '');
    }
    newSections[index] = { ...newSections[index], [field]: value };
    setCadastralSections(newSections);
  };

  const totalSurface = cadastralSections.reduce((total, section) => {
    return total + (parseInt(section.surface) || 0);
  }, 0);

  const handleCopyFirstSellerAddress = () => {
    console.log("Button clicked: Copy First Seller Address");

    if (sellers.length > 0) {
      const address = sellers[0].address;
      console.log("Address object:", address);

      if (address && typeof address === 'object' && address.label) {
        const fullAddress = address.label;
        console.log("Full address to be copied:", fullAddress);
        setPropertyAddress({ fullAddress });
      } else {
        console.error("Address does not contain a valid label:", address);
      }
    } else {
      console.error("No sellers available to copy address from.");
    }
  };

  useEffect(() => {
    if (cadastralSections.length === 0) {
      setCadastralSections([{
        section: '',
        number: '',
        lieuDit: '',
        surface: ''
      }]);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Adresse du bien
            </h2>
            <button
              onClick={() => {
                console.log("Copy button clicked");
                handleCopyFirstSellerAddress();
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
              title="Copier l'adresse du premier vendeur"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier l'adresse du vendeur
            </button>
          </div>

          <div className="space-y-4">
            <label>
              <span>Adresse complète</span>
              <AddressAutocomplete
                value={propertyAddress.fullAddress}
                onChange={({ label }) => {
                  console.log("Changing property address to:", label);
                  setPropertyAddress({ fullAddress: label });
                }}
                placeholder="Saisissez l'adresse du bien"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Type de bien</h2>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newValue = 'apartment';
                console.log("Changing property type to:", newValue);
                setPropertyType(newValue);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'apartment'
                  ? 'bg-[#0b8043] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Appartement
            </button>
            <button
              onClick={() => {
                const newValue = 'house';
                console.log("Changing property type to:", newValue);
                setPropertyType(newValue);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                propertyType === 'house'
                  ? 'bg-[#0b8043] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              Maison
            </button>
            {propertyType === 'house' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isInCopropriete}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    console.log("Changing isInCopropriete to:", newValue);
                    setIsInCopropriete(newValue);
                  }}
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

      {propertyType === 'apartment' || (propertyType === 'house' && isInCopropriete) ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Adresse officielle de la copropriété
            </h3>
            <div className="space-y-4">
              <label>
                <span>Adresse complète</span>
                <AddressAutocomplete
                  value={coPropertyAddress.fullAddress}
                  onChange={({ label }) => {
                    console.log("Changing co-property address to:", label);
                    setCoPropertyAddress({ fullAddress: label });
                  }}
                  placeholder="Saisissez l'adresse de la copropriété"
                />
              </label>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lots de copropriété</h3>
                {lots.length < 10 && (
                  <button
                    onClick={addLot}
                    className="text-[#0b8043] hover:text-[#097339] flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un lot
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {lots.map((lot, lotIndex) => (
                  <div key={lotIndex} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <label>
                        <span>Numéro du lot</span>
                        <input
                          type="text"
                          value={lot.number}
                          onChange={(e) => updateLot(lotIndex, 'number', e.target.value)}
                        />
                      </label>
                      <label className="col-span-2">
                        <span>Désignation du lot</span>
                        <input
                          type="text"
                          value={lot.description}
                          onChange={(e) => updateLot(lotIndex, 'description', e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Tantièmes</h4>
                        <button
                          onClick={() => addTantieme(lotIndex)}
                          className="text-sm text-[#0b8043] hover:text-[#097339] flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter un tantième
                        </button>
                      </div>

                      {lot.tantiemes.map((tantieme, tantiemeIndex) => (
                        <div key={tantiemeIndex} className="grid grid-cols-3 gap-4 items-start bg-white p-3 rounded-md">
                          <label>
                            <span>Numérateur</span>
                            <input
                              type="text"
                              value={tantieme.numerator}
                              onChange={(e) => updateTantieme(lotIndex, tantiemeIndex, 'numerator', e.target.value)}
                              placeholder="Ex: 1932"
                            />
                          </label>
                          <label>
                            <span>Dénominateur</span>
                            <select
                              value={tantieme.denominator}
                              onChange={(e) => updateTantieme(lotIndex, tantiemeIndex, 'denominator', e.target.value as '1000' | '10000' | '100000')}
                              className="w-full"
                            >
                              <option value="1000">1000</option>
                              <option value="10000">10000</option>
                              <option value="100000">100000</option>
                            </select>
                          </label>
                          <div className="space-y-2">
                            <label>
                              <span>Type de tantièmes</span>
                              <select
                                value={tantieme.type}
                                onChange={(e) => updateTantieme(lotIndex, tantiemeIndex, 'type', e.target.value)}
                                className="w-full"
                              >
                                <option value="general">des parties communes générales</option>
                                <option value="soil-and-general">de la propriété du sol et des parties communes générales</option>
                                <option value="custom">Autre (à préciser)</option>
                              </select>
                            </label>
                            {tantieme.type === 'custom' && (
                              <input
                                type="text"
                                value={tantieme.customType || ''}
                                onChange={(e) => updateTantieme(lotIndex, tantiemeIndex, 'customType', e.target.value)}
                                placeholder="Précisez le type de tantième"
                                className="w-full mt-2"
                              />
                            )}
                          </div>
                          {lot.tantiemes.length > 1 && (
                            <button
                              onClick={() => removeTantieme(lotIndex, tantiemeIndex)}
                              className="col-span-3 text-red-500 hover:text-red-700 mt-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {lotIndex === 0 && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                        <label>
                          <span>Surface Carrez (m²)</span>
                          <input
                            type="text"
                            value={lot.carrezSurface}
                            onChange={(e) => updateLot(lotIndex, 'carrezSurface', e.target.value)}
                            placeholder="Ex: 75.5"
                          />
                        </label>
                        <div>
                          <span className="block text-sm font-medium leading-6 text-gray-600 mb-0.5">
                            Surface garantie par
                          </span>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={lot.carrezGuarantor.type === 'diagnostician'}
                                onChange={() => updateLot(lotIndex, 'carrezGuarantorType', 'diagnostician')}
                                className="mr-2"
                              />
                              <span>Diagnostiqueur</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={lot.carrezGuarantor.type === 'owner'}
                                onChange={() => updateLot(lotIndex, 'carrezGuarantorType', 'owner')}
                                className="mr-2"
                              />
                              <span>Propriétaire</span>
                            </label>
                          </div>
                        </div>
                        {lot.carrezGuarantor.type === 'diagnostician' && (
                          <label>
                            <span>Nom du diagnostiqueur</span>
                            <input
                              type="text"
                              value={lot.carrezGuarantor.name}
                              onChange={(e) => updateLot(lotIndex, 'carrezGuarantorName', e.target.value)}
                            />
                          </label>
                        )}
                        <label>
                          <span>Date de la mesure</span>
                          <input
                            type="date"
                            value={lot.carrezGuarantor.date}
                            onChange={(e) => updateLot(lotIndex, 'carrezGuarantorDate', e.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    {lots.length > 1 && (
                      <button
                        onClick={() => removeLot(lotIndex)}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : propertyType === 'house' && !isInCopropriete && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Désignation du bien
          </h3>
          <div className="space-y-4">
            <label>
              <span>Description officielle</span>
              <textarea
                value={officialDesignation}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log("Changing official designation to:", newValue);
                  setOfficialDesignation(newValue);
                }}
                rows={4}
                className="w-full"
                placeholder="Saisissez la désignation officielle du bien..."
              />
            </label>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Map className="h-6 w-6" />
              Sections cadastrales
            </h2>
            <button
              onClick={addCadastralSection}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#0b8043] hover:text-[#097339]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une section
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu-dit
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surface
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surface convertie
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cadastralSections.map((section, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={section.section}
                        onChange={(e) => updateCadastralSection(index, 'section', e.target.value)}
                        className="w-20"
                        placeholder="AB"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={section.number}
                        onChange={(e) => updateCadastralSection(index, 'number', e.target.value)}
                        className="w-24"
                        placeholder="123"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={section.lieuDit}
                        onChange={(e) => updateCadastralSection(index, 'lieuDit', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={section.surface}
                        onChange={(e) => updateCadastralSection(index, 'surface', e.target.value)}
                        className="w-32"
                        placeholder="360"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {formatSurface(section.surface)}
                    </td>
                    <td className="px-3 py-2">
                      {cadastralSections.length > 1 && (
                        <button
                          onClick={() => removeCadastralSection(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="text-sm">
              <span className="font-medium text-gray-500">Total : </span>
              <span className="font-semibold text-gray-900">{formatSurface(totalSurface.toString())}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-base font-medium text-gray-800">État d'occupation</span>
                </div>
                <select
                  value={occupationStatus}
                  onChange={(e) => {
                    const newValue = e.target.value as OccupationStatus;
                    console.log("Changing occupation status to:", newValue);
                    setOccupationStatus(newValue);
                  }}
                  className="w-full"
                >
                  <option value="occupied-by-seller">Occupé par le(s) vendeur(s)</option>
                  <option value="vacant">Libre d'occupants</option>
                  <option value="rented">Bail en cours</option>
                </select>
              </label>
            </div>

            <div>
              <label className="block">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-base font-medium text-gray-800">DPE</span>
                </div>
                <select
                  value={dpeStatus}
                  onChange={(e) => {
                    const newValue = e.target.value as DPEStatus;
                    console.log("Changing DPE status to:", newValue);
                    setDpeStatus(newValue);
                  }}
                  className="w-full"
                >
                  <option value="completed">DPE déjà établi</option>
                  <option value="in-progress">DPE en cours</option>
                  <option value="not-required">Le bien n'est pas soumis au DPE</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
