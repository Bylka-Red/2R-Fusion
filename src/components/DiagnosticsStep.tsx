import React, { useMemo } from 'react';
import { FileCheck, Plus, Euro } from 'lucide-react';
import type { PropertyCriteria } from '../types';

interface DiagnosticsStepProps {
  propertyType: 'house' | 'apartment' | 'houseInCopro';
  constructionYear?: number;
  hasGas: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  isInCopropriete?: boolean;
}

export function DiagnosticsStep({
  propertyType,
  constructionYear,
  hasGas,
  onNext,
  onPrevious,
  onCancel,
  isInCopropriete = false,
}: DiagnosticsStepProps) {
  const currentYear = new Date().getFullYear();
  const isOlderThan15Years = constructionYear ? currentYear - constructionYear > 15 : false;
  const isBeforeAsbestos = constructionYear ? constructionYear < 1998 : false;
  const isBeforeLead = constructionYear ? constructionYear < 1949 : false;
  const isInCoproperty = propertyType === 'apartment' || propertyType === 'houseInCopro' || isInCopropriete;

  const mandatoryDiagnostics = [
    {
      name: 'Loi Carrez',
      description: 'Mesurage de la surface privative',
      required: isInCoproperty,
      checked: isInCoproperty,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'DPE',
      description: 'Diagnostic de Performance Énergétique',
      required: true,
      checked: true,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'Diagnostic Électricité',
      description: 'Installation électrique de plus de 15 ans',
      required: isOlderThan15Years,
      checked: isOlderThan15Years,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'Diagnostic Gaz',
      description: 'Installation gaz de plus de 15 ans',
      required: isOlderThan15Years && hasGas,
      checked: isOlderThan15Years && hasGas,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'Amiante',
      description: 'Construction avant 1997',
      required: isBeforeAsbestos,
      checked: isBeforeAsbestos,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'Plomb',
      description: 'Construction avant 1949',
      required: isBeforeLead,
      checked: isBeforeLead,
      disabled: true,
      countInTotal: true,
    },
    {
      name: 'ERP',
      description: 'État des Risques et Pollutions',
      required: true,
      checked: true,
      disabled: true,
      countInTotal: false,
    },
  ];

  const additionalDiagnostics = [
    {
      name: 'Assainissement',
      description: 'Contrôle de l\'assainissement',
      required: true,
      checked: true,
      price: 200,
      disabled: true,
    },
    {
      name: 'Pré État Daté',
      description: 'Bilan financier de la copropriété',
      required: isInCoproperty,
      checked: isInCoproperty,
      price: 380,
      disabled: true,
    },
  ];

  const calculateMandatoryPrice = useMemo(() => {
    const requiredCount = mandatoryDiagnostics.filter(d => d.checked && d.countInTotal).length;
    if (requiredCount === 0) return 0;

    const prices = propertyType === 'apartment' || isInCopropriete ? {
      1: 90,
      2: 160,
      3: 220,
      4: 270,
      5: 320,
      6: 370,
    } : {
      1: 120,
      2: 200,
      3: 270,
      4: 320,
      5: 370,
      6: 420,
    };

    return prices[requiredCount as keyof typeof prices] || 0;
  }, [mandatoryDiagnostics, propertyType, isInCopropriete]);

  const additionalPrice = useMemo(() => {
    return additionalDiagnostics
      .filter(d => d.checked)
      .reduce((sum, diagnostic) => sum + diagnostic.price, 0);
  }, [additionalDiagnostics]);

  const totalPrice = calculateMandatoryPrice + additionalPrice;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileCheck className="h-5 w-5 text-[#0b8043]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Diagnostics Obligatoires
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mandatoryDiagnostics.map((diagnostic, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  diagnostic.required ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={diagnostic.checked}
                    disabled={diagnostic.disabled}
                    className="h-4 w-4 rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    {diagnostic.name}
                  </p>
                  <p className="text-sm text-gray-500">{diagnostic.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {diagnostic.name === 'ERP' && (
                    <span className="text-sm font-medium text-[#0b8043]">Offert</span>
                  )}
                  {diagnostic.required && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Obligatoire
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="bg-green-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#0b8043]" />
                <span className="text-sm font-medium text-gray-700">Total diagnostics obligatoires :</span>
                <span className="text-lg font-semibold text-[#0b8043]">{calculateMandatoryPrice} €</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="h-5 w-5 text-[#0b8043]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Diagnostics Supplémentaires
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {additionalDiagnostics.map((diagnostic, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  diagnostic.required ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={diagnostic.checked}
                    disabled={diagnostic.disabled}
                    className="h-4 w-4 rounded border-gray-300 text-[#0b8043] focus:ring-[#0b8043]"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">
                    {diagnostic.name}
                  </p>
                  <p className="text-sm text-gray-500">{diagnostic.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">{diagnostic.price} €</span>
                  {diagnostic.required && (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Obligatoire
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="bg-green-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#0b8043]" />
                <span className="text-sm font-medium text-gray-700">Total diagnostics supplémentaires :</span>
                <span className="text-lg font-semibold text-[#0b8043]">{additionalPrice} €</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0b8043] text-white rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Total des diagnostics</h3>
            </div>
            <div className="text-2xl font-bold">{totalPrice} €</div>
          </div>
        </div>
      </div>
    </div>
  );
}