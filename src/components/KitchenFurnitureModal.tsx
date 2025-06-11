import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { KitchenFurnitureItem } from '../types';

interface KitchenFurnitureModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: KitchenFurnitureItem[];
  onSave: (items: KitchenFurnitureItem[]) => void;
}

export function KitchenFurnitureModal({ isOpen, onClose, items: initialItems, onSave }: KitchenFurnitureModalProps) {
  const [items, setItems] = useState<KitchenFurnitureItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: '',
        type: 'kitchen',
        price: 0
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof KitchenFurnitureItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Liste du mobilier et électroménager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow mb-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Nom de l'élément"
                    className="w-full"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(item.id, 'type', e.target.value as 'kitchen' | 'bathroom')}
                    className="w-full"
                  >
                    <option value="kitchen">Cuisine</option>
                    <option value="bathroom">Salle de bains</option>
                  </select>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="Prix"
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={addItem}
            className="flex items-center gap-2 text-[#0b8043] hover:text-[#097339]"
          >
            <Plus className="h-5 w-5" />
            Ajouter un élément
          </button>
          <div className="flex items-center gap-4">
            <div className="text-lg">
              Total : <span className="font-semibold">{totalPrice.toLocaleString('fr-FR')} €</span>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0b8043] text-white rounded-lg hover:bg-[#097339]"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}