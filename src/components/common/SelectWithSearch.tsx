import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SelectWithSearchProps {
  id?: string;
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

const SelectWithSearch = forwardRef<HTMLInputElement, SelectWithSearchProps>(
  ({ label, error, options, value, onChange, onBlur, name, required, placeholder = 'Seleccione una opción', id }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Ordenar opciones alfabéticamente
    const sortedOptions = [...options].sort((a, b) => a.label.localeCompare(b.label));

    // Filtrar opciones según el término de búsqueda
    const filteredOptions = sortedOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener la etiqueta del valor seleccionado
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      onBlur?.();
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label htmlFor={id} className="label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Campo de visualización */}
          <button
            type="button"
            id={id}
            onClick={() => setIsOpen(!isOpen)}
            className={`input w-full text-left flex items-center justify-between ${
              error ? 'border-red-500 focus:ring-red-500' : ''
            }`}
          >
            <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue || placeholder}
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {/* Input hidden para react-hook-form */}
          <input
            type="hidden"
            name={name}
            value={value || ''}
            ref={ref}
          />

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
              {/* Barra de búsqueda */}
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Lista de opciones */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No se encontraron resultados
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 focus:bg-primary-50 focus:outline-none ${
                        value === option.value ? 'bg-primary-100 text-primary-900 font-medium' : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectWithSearch.displayName = 'SelectWithSearch';

export default SelectWithSearch;
