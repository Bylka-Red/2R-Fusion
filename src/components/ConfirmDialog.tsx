import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'delete' | 'convert';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  type = 'delete'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${type === 'delete' ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${type === 'delete' ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              type === 'delete'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#0b8043] hover:bg-[#097339]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
