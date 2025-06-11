import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, Trash2, Edit, Plus } from 'lucide-react';
import type { Syndic } from '../services/syndicService';
import { searchSyndics, addSyndic, updateSyndic, deleteSyndic, toggleSyndicFavori } from '../services/syndicService';
import { debounce } from 'lodash';

interface SyndicSearchProps {
  onSelect: (syndic: Syndic) => void;
  selectedSyndic?: Syndic | null;
}

export function SyndicSearch({ onSelect, selectedSyndic }: SyndicSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Syndic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSyndic, setEditingSyndic] = useState<Syndic | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
  });

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchSyndics(term);
        setResults(data);
      } catch (error) {
        console.error('Error searching syndics:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSyndic) {
        const updated = await updateSyndic(editingSyndic.id, formData);
        setResults(results.map(s => s.id === updated.id ? updated : s));
        setEditingSyndic(null);
      } else {
        const newSyndic = await addSyndic({ ...formData, favori: false });
        setResults([...results, newSyndic]);
      }
      setShowAddForm(false);
      setFormData({ nom: '', adresse: '', telephone: '', email: '' });
    } catch (error) {
      console.error('Error saving syndic:', error);
    }
  };

  const handleEdit = (syndic: Syndic) => {
    setEditingSyndic(syndic);
    setFormData({
      nom: syndic.nom,
      adresse: syndic.adresse,
      telephone: syndic.telephone,
      email: syndic.email,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce syndic ?')) {
      try {
        await deleteSyndic(id);
        setResults(results.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting syndic:', error);
      }
    }
  };

  const handleToggleFavori = async (syndic: Syndic) => {
    try {
      const updated = await toggleSyndicFavori(syndic.id, !syndic.favori);
      setResults(results.map(s => s.id === updated.id ? updated : s));
    } catch (error) {
      console.error('Error toggling favori:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un syndic..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <button
        onClick={() => {
          setEditingSyndic(null);
          setFormData({ nom: '', adresse: '', telephone: '', email: '' });
          setShowAddForm(true);
        }}
        className="flex items-center gap-2 text-primary hover:text-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Ajouter un syndic
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">
            {editingSyndic ? 'Modifier le syndic' : 'Ajouter un syndic'}
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom du syndic"
              required
              className="w-full"
            />
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="Adresse"
              required
              className="w-full"
            />
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="Téléphone"
              required
              className="w-full"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              required
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              {editingSyndic ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {results.map((syndic) => (
            <div
              key={syndic.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedSyndic?.id === syndic.id
                  ? 'border-primary bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onSelect(syndic)}
              >
                <div className="font-medium">{syndic.nom}</div>
                <div className="text-sm text-gray-600">{syndic.adresse}</div>
                <div className="text-sm text-gray-600">{syndic.telephone}</div>
                <div className="text-sm text-gray-600">{syndic.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavori(syndic)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    syndic.favori ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(syndic)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(syndic.id)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}