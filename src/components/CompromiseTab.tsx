import React, { useState } from 'react';
import { Calendar, Building2, User, Euro, Phone, Mail, Plus, Trash2, FileText, CheckSquare } from 'lucide-react';
import type { Mandate, Seller, Commercial, PurchaseOffer } from '../types';
import { AddressAutocomplete } from './AddressAutocomplete';

interface CompromiseTabProps {
  mandate: Mandate;
  sellers: Seller[];
  offer?: PurchaseOffer;
  commercials: Commercial[];
  propertyType: 'monopropriete' | 'copropriete';
}

export function CompromiseTab({
  mandate,
  sellers,
  offer,
  commercials,
  propertyType
}: CompromiseTabProps) {
  const [compromiseNumber, setCompromiseNumber] = useState('');
  const [compromiseDate, setCompromiseDate] = useState('');
  const [previousOwner, setPreviousOwner] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [syndic, setSyndic] = useState<{
    name: string;
    address: string;
    phone: string;
    email: string;
  }>({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [notaries, setNotaries] = useState<{
    name: string;
    address: string;
    phone: string;
    email: string;
  }[]>([{
    name: '',
    address: '',
    phone: '',
    email: ''
  }]);
  const [exitCommercial, setExitCommercial] = useState(mandate.commercial);
  const [coPropertyRegDate, setCoPropertyRegDate] = useState('');
  const [hasModifications, setHasModifications] = useState(false);
  const [modifications, setModifications] = useState<{ date: string }[]>([]);
  const [assemblies, setAssemblies] = useState<{ date: string }[]>([
    { date: '' },
    { date: '' },
    { date: '' }
  ]);
  const [diagnostics, setDiagnostics] = useState<{
    type: string;
    date: string;
    company: string;
    reference?: string;
    validUntil?: string;
    result?: string;
  }[]>([{
    type: 'dpe',
    date: '',
    company: '',
    reference: '',
    validUntil: '',
    result: ''
  }]);

  const [totalPriceHAI, setTotalPriceHAI] = useState(mandate.netPrice + mandate.fees.ttc);
  const [fees, setFees] = useState({
    ttc: mandate.fees.ttc,
    ht: mandate.fees.ht
  });

  const handleFeesChange = (value: number) => {
    const ttc = value;
    const ht = Math.round(ttc / 1.2);
    const newFees = { ttc, ht };
    setFees(newFees);
    setTotalPriceHAI(mandate.netPrice + ttc);
  };

  const vatAmount = Math.round((fees.ttc / 120) * 20);
  const penaltyClause = Math.round(totalPriceHAI * 0.1);

  const addNotary = () => {
    if (notaries.length < 2) {
      setNotaries([...notaries, {
        name: '',
        address: '',
        phone: '',
        email: ''
      }]);
    }
  };

  const removeNotary = (index: number) => {
    if (notaries.length > 1) {
      setNotaries(notaries.filter((_, i) => i !== index));
    }
  };

  const updateNotary = (index: number, field: string, value: string) => {
    const updatedNotaries = [...notaries];
    updatedNotaries[index] = { ...updatedNotaries[index], [field]: value };
    setNotaries(updatedNotaries);
  };

  const addModification = () => {
    setModifications([...modifications, { date: '' }]);
  };

  const removeModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
  };

  const addAssembly = () => {
    setAssemblies([...assemblies, { date: '' }]);
  };

  const removeAssembly = (index: number) => {
    if (assemblies.length > 3) {
      setAssemblies(assemblies.filter((_, i) => i !== index));
    }
  };

  const addDiagnostic = () => {
    setDiagnostics([...diagnostics, {
      type: '',
      date: '',
      company: '',
      reference: '',
      validUntil: '',
      result: ''
    }]);
  };

  const removeDiagnostic = (index: number) => {
    setDiagnostics(diagnostics.filter((_, i) => i !== index));
  };

  const updateDiagnostic = (index: number, field: string, value: string) => {
    const updatedDiagnostics = [...diagnostics];
    updatedDiagnostics[index] = { ...updatedDiagnostics[index], [field]: value };
    setDiagnostics(updatedDiagnostics);
  };

  const folderName = `${sellers.map(s => s.lastName).join(' & ')} / ${offer?.buyers.map(b => b.lastName).join(' & ') || ''}`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Compromis de vente</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block">
                <span>Nom du dossier</span>
                <input
                  type="text"
                  value={folderName}
                  disabled
                  className="bg-gray-50"
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span>Numéro de compromis</span>
                <input
                  type="text"
                  value={compromiseNumber}
                  onChange={(e) => setCompromiseNumber(e.target.value)}
                  placeholder="Ex: COMP-2024-001"
                />
              </label>
            </div>
            <div>
              <label>
                <span>Date du compromis</span>
                <input
                  type="date"
                  value={compromiseDate}
                  onChange={(e) => setCompromiseDate(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span>Précédent propriétaire</span>
              <input
                type="text"
                value={previousOwner}
                onChange={(e) => setPreviousOwner(e.target.value)}
              />
            </label>
            <label>
              <span>Date de l'enregistrement</span>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span>Commercial entrée</span>
              <input
                type="text"
                value={mandate.commercial}
                disabled
                className="bg-gray-50"
              />
            </label>
            <label>
              <span>Commercial sortie</span>
              <select
                value={exitCommercial}
                onChange={(e) => setExitCommercial(e.target.value as any)}
              >
                {commercials.map((commercial) => (
                  <option key={commercial.id} value={commercial.firstName}>
                    {commercial.firstName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label>
              <span>Honoraires TTC</span>
              <div className="relative">
                <input
                  type="text"
                  value={fees.ttc.toLocaleString('fr-FR')}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                    handleFeesChange(value);
                  }}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
            <label>
              <span>Honoraires HT</span>
              <div className="relative">
                <input
                  type="text"
                  value={fees.ht.toLocaleString('fr-FR')}
                  disabled
                  className="bg-gray-50 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
            <label>
              <span>Montant de la TVA</span>
              <div className="relative">
                <input
                  type="text"
                  value={vatAmount.toLocaleString('fr-FR')}
                  disabled
                  className="bg-gray-50 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label>
              <span>Prix Frais d'Agence Inclus</span>
              <div className="relative">
                <input
                  type="text"
                  value={totalPriceHAI.toLocaleString('fr-FR')}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                    setTotalPriceHAI(value);
                  }}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
            <label>
              <span>Clause pénale</span>
              <div className="relative">
                <input
                  type="text"
                  value={penaltyClause.toLocaleString('fr-FR')}
                  disabled
                  className="bg-gray-50 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </label>
          </div>

          {propertyType === 'copropriete' && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Informations de copropriété
                </h3>
                
                <label>
                  <span>Date du Règlement de copropriété</span>
                  <input
                    type="date"
                    value={coPropertyRegDate}
                    onChange={(e) => setCoPropertyRegDate(e.target.value)}
                  />
                </label>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasModifications}
                        onChange={(e) => setHasModifications(e.target.checked)}
                        className="rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                      />
                      <span>Modificatifs au RDC</span>
                    </label>
                    {hasModifications && (
                      <button
                        onClick={addModification}
                        className="text-[#0b8043] hover:text-[#097339] flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un modificatif
                      </button>
                    )}
                  </div>

                  {hasModifications && modifications.map((mod, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="date"
                        value={mod.date}
                        onChange={(e) => {
                          const newMods = [...modifications];
                          newMods[index].date = e.target.value;
                          setModifications(newMods);
                        }}
                      />
                      <button
                        onClick={() => removeModification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Assemblées générales des 3 dernières années
                    </h4>
                    <button
                      onClick={addAssembly}
                      className="text-[#0b8043] hover:text-[#097339] flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une AG
                    </button>
                  </div>

                  {assemblies.map((assembly, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="date"
                        value={assembly.date}
                        onChange={(e) => {
                          const newAssemblies = [...assemblies];
                          newAssemblies[index].date = e.target.value;
                          setAssemblies(newAssemblies);
                        }}
                      />
                      {index >= 3 && (
                        <button
                          onClick={() => removeAssembly(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}