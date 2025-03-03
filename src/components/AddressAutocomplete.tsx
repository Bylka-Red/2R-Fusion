import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: { label: string; postcode: string; city: string }) => void;
  placeholder?: string;
  showIcon?: boolean;
}

interface AddressSuggestion {
  properties: {
    label: string;
    postcode: string;
    city: string;
    context: string;
  };
}

export function AddressAutocomplete({ value = '', onChange, placeholder, showIcon = false }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<number>();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=5&type=housenumber`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange({ label: newQuery, postcode: '', city: '' });
    setShowSuggestions(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const { label, postcode, city } = suggestion.properties;
    setQuery(label);
    onChange({ label, postcode, city });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={componentRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200 ${showIcon ? "w-full pl-10" : "w-full"}`}
        />
        {showIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 transition-colors duration-200"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {suggestion.properties.label}
                </span>
                <span className="text-xs text-gray-500">
                  {suggestion.properties.context}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}