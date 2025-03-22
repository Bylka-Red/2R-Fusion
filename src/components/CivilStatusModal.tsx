import React from 'react';
import { X, FileText } from 'lucide-react';
import type { Seller } from '../types';
import { generateCivilStatus } from '../utils/civilStatus';

interface CivilStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: Seller[];
}

export function CivilStatusModal({ isOpen, onClose, sellers }: CivilStatusModalProps) {
  if (!isOpen) return null;

  const civilStatus = generateCivilStatus(sellers);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0b8043]" />
            <h3 className="text-lg font-medium text-gray-900">État Civil</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
            {civilStatus}
          </pre>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(civilStatus);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
          >
            Copier
          </button>
        </div>
      </div>
    </div>
  );
}