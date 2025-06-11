import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, Trash2, Edit, Plus } from 'lucide-react';
import type { Notaire } from '../services/notaireService';
import { searchNotaires, addNotaire, updateNotaire, deleteNotaire, toggleNotaireFavori } from '../services/notaireService';
import { debounce } from 'lodash';

interface NotaireSearchProps {
  onSelect: (notaire: Notaire) => void;
  selectedNotaire?: Notaire | null;
}

export function NotaireSearch({ onSelect, selectedNotaire }: NotaireSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Notaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNotaire, setEditingNotaire] = useState<Notaire | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
  });

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchNotaires(term);
        setResults(data);
      } catch (error) {
        console.error('Error searching notaires:', error);
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
      if (editingNotaire) {
        const updated = await updateNotaire(editingNotaire.id, formData);
        setResults(results.map(n => n.id === updated.id ? updated : n));
        setEditingNotaire(null);
      } else {
        const newNotaire = await addNotaire({ ...formData, favori: false });
        setResults([...results, newNotaire]);
      }
      setShowAddForm(false);
      setFormData({ nom: '', adresse: '', telephone: '' });
    } catch (error) {
      console.error('Error saving notaire:', error);
    }
  };

  const handleEdit = (notaire: Notaire) => {
    setEditingNotaire(notaire);
    setFormData({
      nom: notaire.nom,
      adresse: notaire.adresse,
      telephone: notaire.telephone,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce notaire ?')) {
      try {
        await deleteNotaire(id);
        setResults(results.filter(n => n.id !== id));
      } catch (error) {
        console.error('Error deleting notaire:', error);
      }
    }
  };

  const handleToggleFavori = async (notaire: Notaire) => {
    try {
      const updated = await toggleNotaireFavori(notaire.id, !notaire.favori);
      setResults(results.map(n => n.id === updated.id ? updated : n));
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
          placeholder="Rechercher un notaire..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <button
        onClick={() => {
          setEditingNotaire(null);
          setFormData({ nom: '', adresse: '', telephone: '' });
          setShowAddForm(true);
        }}
        className="flex items-center gap-2 text-primary hover:text-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Ajouter un notaire
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium">
            {editingNotaire ? 'Modifier le notaire' : 'Ajouter un notaire'}
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom du notaire"
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
              {editingNotaire ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {results.map((notaire) => (
            <div
              key={notaire.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedNotaire?.id === notaire.id
                  ? 'border-primary bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onSelect(notaire)}
              >
                <div className="font-medium">{notaire.nom}</div>
                <div className="text-sm text-gray-600">{notaire.adresse}</div>
                <div className="text-sm text-gray-600">{notaire.telephone}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavori(notaire)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    notaire.favori ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(notaire)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(notaire.id)}
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