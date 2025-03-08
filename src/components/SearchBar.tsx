import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, XCircle } from 'lucide-react';
import type { Estimation } from '../types';

interface SearchBarProps {
  estimations: Estimation[];
  onSearch: (results: Estimation[]) => void;
}

interface SearchResult {
  estimation: Estimation;
  matchType: 'owner' | 'address' | 'commercial';
  matchText: string;
}

interface CommercialCount {
  name: string;
  count: number;
}

export function SearchBar({ estimations, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedCommercialCount, setSelectedCommercialCount] = useState<CommercialCount | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const searchEstimations = (searchQuery: string): SearchResult[] => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    estimations.forEach(estimation => {
      // Recherche par propriétaire
      estimation.owners.forEach(owner => {
        const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
        if (fullName.includes(normalizedQuery)) {
          searchResults.push({
            estimation,
            matchType: 'owner',
            matchText: `${owner.firstName} ${owner.lastName}`,
          });
        }
        if (owner.phones.some(phone => phone.includes(normalizedQuery))) {
          searchResults.push({
            estimation,
            matchType: 'owner',
            matchText: `${owner.firstName} ${owner.lastName} (${owner.phones[0]})`,
          });
        }
        if (owner.emails.some(email => email.toLowerCase().includes(normalizedQuery))) {
          searchResults.push({
            estimation,
            matchType: 'owner',
            matchText: `${owner.firstName} ${owner.lastName} (${owner.emails[0]})`,
          });
        }
      });

      // Recherche par adresse
      if (estimation.propertyAddress.fullAddress.toLowerCase().includes(normalizedQuery)) {
        searchResults.push({
          estimation,
          matchType: 'address',
          matchText: estimation.propertyAddress.fullAddress,
        });
      }

      // Recherche par commercial
      if (estimation.commercial?.toLowerCase().includes(normalizedQuery)) {
        searchResults.push({
          estimation,
          matchType: 'commercial',
          matchText: `Commercial: ${estimation.commercial}`,
        });
      }
    });

    // Supprimer les doublons basés sur l'ID de l'estimation
    return searchResults.filter((result, index, self) =>
      index === self.findIndex(r => r.estimation.id === result.estimation.id)
    );
  };

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      setSelectedCommercialCount(null);
      onSearch(estimations);
      return;
    }

    setIsLoading(true);
    debounceTimeout.current = setTimeout(() => {
      const searchResults = searchEstimations(value);
      setResults(searchResults);
      setShowSuggestions(true);
      onSearch(searchResults.map(r => r.estimation));

      // Calculer le nombre d'estimations par commercial si la recherche correspond à un commercial
      const commercialMatch = value.toLowerCase();
      const commercialResults = estimations.filter(
        e => e.commercial?.toLowerCase().includes(commercialMatch)
      );

      if (commercialResults.length > 0) {
        const commercial = commercialResults[0].commercial;
        if (commercial) {
          setSelectedCommercialCount({
            name: commercial,
            count: commercialResults.length
          });
        }
      } else {
        setSelectedCommercialCount(null);
      }

      setIsLoading(false);
    }, 300);
  };

  const handleReset = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
    setSelectedCommercialCount(null);
    onSearch(estimations);
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'owner':
        return '👤';
      case 'address':
        return '📍';
      case 'commercial':
        return '💼';
      default:
        return '•';
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1">
      <div className="relative">
        {isLoading ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Rechercher par nom, prénom, adresse ou commercial..."
          className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
        />
        {query && (
          <XCircle
            className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer"
            onClick={handleReset}
          />
        )}
        {selectedCommercialCount && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedCommercialCount.name}: {selectedCommercialCount.count} estimation{selectedCommercialCount.count > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {showSuggestions && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          <ul className="py-2">
            {results.map((result, index) => (
              <li
                key={`${result.estimation.id}-${index}`}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  onSearch([result.estimation]);
                  setShowSuggestions(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label={result.matchType}>
                    {getMatchTypeIcon(result.matchType)}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {result.matchText}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.estimation.propertyAddress.fullAddress}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
