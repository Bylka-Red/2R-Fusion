import React, { useState } from 'react';
import { User, Phone, Mail, Facebook, Instagram, Image as ImageIcon, Plus, Trash2, MessageCircle } from 'lucide-react';
import type { Commercial } from '../types';

interface SettingsTabProps {
  commercials: Commercial[];
  onCommercialsChange: (commercials: Commercial[]) => void;
}

export function SettingsTab({ commercials, onCommercialsChange }: SettingsTabProps) {
  const [editingCommercial, setEditingCommercial] = useState<Commercial | null>(null);

  const addCommercial = () => {
    const newCommercial: Commercial = {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      photoUrl: '',
    };
    setEditingCommercial(newCommercial);
  };

  const saveCommercial = () => {
    if (editingCommercial) {
      const isEditing = commercials.some(c => c.id === editingCommercial.id);
      if (isEditing) {
        onCommercialsChange(
          commercials.map(c => c.id === editingCommercial.id ? editingCommercial : c)
        );
      } else {
        onCommercialsChange([...commercials, editingCommercial]);
      }
      setEditingCommercial(null);
    }
  };

  const deleteCommercial = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commercial ?')) {
      onCommercialsChange(commercials.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des commerciaux</h2>
          <button
            onClick={addCommercial}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0b8043] hover:bg-[#097339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b8043]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un commercial
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commercials.map((commercial) => (
            <div
              key={commercial.id}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {commercial.photoUrl ? (
                  <img
                    src={commercial.photoUrl}
                    alt={`${commercial.firstName} ${commercial.lastName}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {commercial.firstName} {commercial.lastName}
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${commercial.phone}`} className="hover:text-[#0b8043]">
                      {commercial.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${commercial.email}`} className="hover:text-[#0b8043]">
                      {commercial.email}
                    </a>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  {commercial.facebook && (
                    <a
                      href={commercial.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {commercial.instagram && (
                    <a
                      href={commercial.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {commercial.whatsapp && (
                    <a
                      href={`https://wa.me/${commercial.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCommercial(commercial)}
                    className="text-[#0b8043] hover:text-[#097339] px-3 py-1 rounded-md hover:bg-green-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteCommercial(commercial.id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingCommercial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {commercials.some(c => c.id === editingCommercial.id) ? 'Modifier' : 'Ajouter'} un commercial
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span>Prénom</span>
                  <input
                    type="text"
                    value={editingCommercial.firstName}
                    onChange={(e) => setEditingCommercial({
                      ...editingCommercial,
                      firstName: e.target.value
                    })}
                  />
                </label>
                <label>
                  <span>Nom</span>
                  <input
                    type="text"
                    value={editingCommercial.lastName}
                    onChange={(e) => setEditingCommercial({
                      ...editingCommercial,
                      lastName: e.target.value
                    })}
                  />
                </label>
              </div>
              <label>
                <span>Téléphone portable</span>
                <input
                  type="tel"
                  value={editingCommercial.phone}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    phone: e.target.value
                  })}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={editingCommercial.email}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    email: e.target.value
                  })}
                />
              </label>
              <label>
                <span>URL de la photo</span>
                <input
                  type="url"
                  value={editingCommercial.photoUrl}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    photoUrl: e.target.value
                  })}
                  placeholder="https://example.com/photo.jpg"
                />
              </label>
              <label>
                <span>Facebook (optionnel)</span>
                <input
                  type="url"
                  value={editingCommercial.facebook || ''}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    facebook: e.target.value
                  })}
                  placeholder="https://facebook.com/profile"
                />
              </label>
              <label>
                <span>Instagram (optionnel)</span>
                <input
                  type="url"
                  value={editingCommercial.instagram || ''}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    instagram: e.target.value
                  })}
                  placeholder="https://instagram.com/profile"
                />
              </label>
              <label>
                <span>WhatsApp (optionnel)</span>
                <input
                  type="tel"
                  value={editingCommercial.whatsapp || ''}
                  onChange={(e) => setEditingCommercial({
                    ...editingCommercial,
                    whatsapp: e.target.value
                  })}
                  placeholder="+33612345678"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingCommercial(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={saveCommercial}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0b8043] hover:bg-[#097339] rounded-md"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}