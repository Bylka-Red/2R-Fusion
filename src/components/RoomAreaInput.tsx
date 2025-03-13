import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ArrowDown } from 'lucide-react';
import type { Room, Level } from '../types';

interface RoomAreaInputProps {
  levels: Level[];
  onChange: (levels: Level[]) => void;
  onLivingAreaChange?: (area: number) => void;
}

export function RoomAreaInput({ levels, onChange, onLivingAreaChange }: RoomAreaInputProps) {
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousLivingArea, setPreviousLivingArea] = useState<number>(0);
  const itemsRef = useRef<HTMLDivElement>(null);

  const hasBasement = levels.some(level => level.type === 'basement');
  const hasOutbuilding = levels.some(level => level.type === 'outbuilding');

  const calculateAreas = () => {
    const livingArea = Number(levels
      .filter(level => level.type !== 'basement' && level.type !== 'outbuilding')
      .reduce((total, level) => total + level.rooms.reduce((levelTotal, room) => levelTotal + room.area, 0), 0)
      .toFixed(2));

    const basementArea = Number(levels
      .filter(level => level.type === 'basement')
      .reduce((total, level) => total + level.rooms.reduce((levelTotal, room) => levelTotal + room.area, 0), 0)
      .toFixed(2));

    const outbuildingArea = Number(levels
      .filter(level => level.type === 'outbuilding')
      .reduce((total, level) => total + level.rooms.reduce((levelTotal, room) => levelTotal + room.area, 0), 0)
      .toFixed(2));

    return { livingArea, basementArea, outbuildingArea };
  };

  const { livingArea, basementArea, outbuildingArea } = calculateAreas();

  useEffect(() => {
    if (onLivingAreaChange && livingArea !== previousLivingArea) {
      setPreviousLivingArea(livingArea);
      onLivingAreaChange(livingArea);
    }
  }, [livingArea, onLivingAreaChange, previousLivingArea]);

  const addLevel = (type: 'regular' | 'basement' | 'outbuilding' = 'regular') => {
    const newLevels = [...levels];
    const newLevel: Level = {
      name: type === 'basement' ? 'Sous-sol' : type === 'outbuilding' ? 'Dépendances' : getDefaultLevelName(levels.filter(l => l.type !== 'basement' && l.type !== 'outbuilding').length, levels.length),
      rooms: [],
      type
    };

    if (type === 'basement' || type === 'outbuilding') {
      newLevels.unshift(newLevel);
    } else {
      newLevels.push(newLevel);
    }

    onChange(newLevels);
  };

  const removeLevel = (levelIndex: number) => {
    const newLevels = levels.filter((_, index) => index !== levelIndex);
    const updatedLevels = newLevels.map((level, index) => ({
      ...level,
      name: level.type === 'basement' || level.type === 'outbuilding' ? level.name : getDefaultLevelName(index, newLevels.length)
    }));
    onChange(updatedLevels);
  };

  const addRoom = (levelIndex: number, roomName = '') => {
    const newLevels = [...levels];
    newLevels[levelIndex].rooms.push({ name: roomName, area: 0 });
    onChange(newLevels);
    setShowSuggestions(null);
    setSearchQuery('');
  };

  const removeRoom = (levelIndex: number, roomIndex: number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].rooms.splice(roomIndex, 1);
    onChange(newLevels);
  };

  const updateRoom = (levelIndex: number, roomIndex: number, field: keyof Room, value: string | number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].rooms[roomIndex] = {
      ...newLevels[levelIndex].rooms[roomIndex],
      [field]: value
    };
    onChange(newLevels);
  };

  const updateLevelName = (levelIndex: number, name: string) => {
    const newLevels = [...levels];
    newLevels[levelIndex].name = name;
    onChange(newLevels);
  };

  const groundFloorRooms = [
    'Entrée', 'Séjour', 'Salle à manger', 'Cuisine', 'Chambre',
    'Salle de bains', 'Salle d\'eau', 'WC', 'Buanderie', 'Cellier', 'Bureau'
  ];

  const upperFloorRooms = [
    'Palier', 'Chambre', 'Salle de bains', 'Salle d\'eau', 'WC',
    'Dressing', 'Bureau', 'Combles aménagés'
  ];

  const basementRooms = [
    'Chaufferie', 'Buanderie', 'Cave', 'Garage', 'Atelier', 'Chambre en sous-sol'
  ];

  const outbuildingRooms = [
    'Garage en rez-de-jardin', 'Atelier', 'Abri de jardin', 'Chalet', 'Studio indépendant'
  ];

  const getDefaultLevelName = (index: number, totalLevels: number): string => {
    if (index === 0) return 'Rez-de-chaussée';
    return `${index}${index === 1 ? 'er' : 'ème'} étage`;
  };

  const filteredSuggestions = (levelIndex: number) => {
    const level = levels[levelIndex];
    const suggestions = level.type === 'basement' ? basementRooms :
                        level.type === 'outbuilding' ? outbuildingRooms :
                        levelIndex === 0 ? groundFloorRooms : upperFloorRooms;
    const query = searchQuery.toLowerCase();

    const filteredRooms = suggestions.filter(room =>
      room.toLowerCase().includes(query)
    );

    if (query && !filteredRooms.includes(searchQuery)) {
      return [...filteredRooms, searchQuery];
    }

    return filteredRooms;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-green-700 font-medium">Surface habitable</span>
            <span className="text-green-700 font-bold">{livingArea.toFixed(2)} m²</span>
          </div>
        </div>
        {hasBasement && (
          <div className="bg-blue-50 rounded-lg p-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Surface sous-sol</span>
              <span className="text-blue-700 font-bold">{basementArea.toFixed(2)} m²</span>
            </div>
          </div>
        )}
        {hasOutbuilding && (
          <div className="bg-purple-50 rounded-lg p-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-purple-700 font-medium">Surface dépendances</span>
              <span className="text-purple-700 font-bold">{outbuildingArea.toFixed(2)} m²</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => addLevel('basement')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <ArrowDown className="h-4 w-4 mr-2" />
          Ajouter un sous-sol
        </button>
        <button
          type="button"
          onClick={() => addLevel('outbuilding')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter des dépendances
        </button>
      </div>

      {levels.map((level, levelIndex) => (
        <div
          key={levelIndex}
          className={`bg-white rounded-lg border ${level.type === 'basement' ? 'border-blue-200 bg-blue-50/50' : level.type === 'outbuilding' ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200'} p-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={level.name}
              onChange={(e) => updateLevelName(levelIndex, e.target.value)}
              className={`text-lg font-medium border-none focus:ring-0 p-0 ${
                level.type === 'basement' ? 'bg-transparent text-blue-800' : level.type === 'outbuilding' ? 'bg-transparent text-purple-800' : ''
              }`}
              placeholder={level.type === 'basement' ? 'Sous-sol' : level.type === 'outbuilding' ? 'Dépendances' : getDefaultLevelName(levelIndex, levels.length)}
            />
            <button
              type="button"
              onClick={() => removeLevel(levelIndex)}
              className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {level.rooms.map((room, roomIndex) => (
              <div key={roomIndex} className="flex items-center gap-4">
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom(levelIndex, roomIndex, 'name', e.target.value)}
                  placeholder="Nom de la pièce"
                  className="flex-1 rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={room.area || ''}
                    onChange={(e) => updateRoom(levelIndex, roomIndex, 'area', parseFloat(e.target.value) || 0)}
                    placeholder="Surface"
                    className="w-24 rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <span className="text-gray-500">m²</span>
                  <button
                    type="button"
                    onClick={() => removeRoom(levelIndex, roomIndex)}
                    className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 relative">
            {showSuggestions === levelIndex ? (
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher ou saisir une pièce..."
                    className="w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 pr-8"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-y-auto">
                  {filteredSuggestions(levelIndex).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addRoom(levelIndex, suggestion)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                        !groundFloorRooms.includes(suggestion) && !upperFloorRooms.includes(suggestion) && !basementRooms.includes(suggestion) && !outbuildingRooms.includes(suggestion)
                          ? 'text-green-600 font-medium'
                          : ''
                      }`}
                    >
                      {!groundFloorRooms.includes(suggestion) && !upperFloorRooms.includes(suggestion) && !basementRooms.includes(suggestion) && !outbuildingRooms.includes(suggestion)
                        ? `Ajouter "${suggestion}"`
                        : suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSuggestions(levelIndex)}
                className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une pièce
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addLevel('regular')}
        className="inline-flex items-center px-4 py-2 border border-green-600 rounded-md text-green-600 hover:bg-green-50 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Ajouter un niveau
      </button>
    </div>
  );
}