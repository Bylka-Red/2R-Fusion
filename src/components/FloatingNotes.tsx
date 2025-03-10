import React, { useEffect, useRef } from 'react';
import { X, FileText } from 'lucide-react';

interface FloatingNotesProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function FloatingNotes({ isOpen, onClose, notes, onNotesChange }: FloatingNotesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Debug pour vérifier que les notes arrivent correctement
  console.log("FloatingNotes reçoit:", notes);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();

      // Assurez-vous que la valeur du textarea est correctement définie
      if (textareaRef.current.value !== notes) {
        textareaRef.current.value = notes;
      }
    }
  }, [isOpen, notes]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (textareaRef.current) {
      onNotesChange(textareaRef.current.value);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 transform transition-transform duration-200 ease-in-out"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0b8043]" />
            <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Saisissez vos notes ici..."
            className="w-full h-48 resize-none rounded-md border-gray-300 shadow-sm focus:border-[#0b8043] focus:ring-[#0b8043]"
          />
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
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
