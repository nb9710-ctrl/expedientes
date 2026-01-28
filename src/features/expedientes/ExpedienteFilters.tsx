import React from 'react';
import { X } from 'lucide-react';
import { ExpedienteFilters as FiltersType } from '../../types';
import { useCatalogo } from '../../hooks/useCatalogo';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

interface ExpedienteFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  onClose: () => void;
}

const ExpedienteFilters: React.FC<ExpedienteFiltersProps> = ({
  filters,
  onChange,
  onClose,
}) => {
  const { data: estados = [] } = useCatalogo('estados');
  const { data: ubicaciones = [] } = useCatalogo('ubicaciones');
  const { data: despachos = [] } = useCatalogo('despachos');
  const { data: clases = [] } = useCatalogo('clases');

  const handleChange = (key: keyof FiltersType, value: any) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const handleClear = () => {
    onChange({});
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Cerrar filtros"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          id="estadoId"
          label="Estado"
          value={filters.estadoId || ''}
          options={estados.map((e) => ({ value: e.id, label: e.nombre }))}
          onChange={(e) => handleChange('estadoId', e.target.value)}
        />

        <Select
          id="ubicacionId"
          label="Ubicación"
          value={filters.ubicacionId || ''}
          options={ubicaciones.map((u) => ({ value: u.id, label: u.nombre }))}
          onChange={(e) => handleChange('ubicacionId', e.target.value)}
        />

        <Select
          id="despachoId"
          label="Despacho"
          value={filters.despachoId || ''}
          options={despachos.map((d) => ({ value: d.id, label: d.nombre }))}
          onChange={(e) => handleChange('despachoId', e.target.value)}
        />

        <Select
          id="claseId"
          label="Clase"
          value={filters.claseId || ''}
          options={clases.map((c) => ({ value: c.id, label: c.nombre }))}
          onChange={(e) => handleChange('claseId', e.target.value)}
        />

        <Select
          id="prioridad"
          label="Prioridad"
          value={filters.prioridad || ''}
          options={[
            { value: 'Alta', label: 'Alta' },
            { value: 'Media', label: 'Media' },
            { value: 'Baja', label: 'Baja' },
          ]}
          onChange={(e) => handleChange('prioridad', e.target.value as any)}
        />

        <Input
          id="fechaDesde"
          label="Fecha Desde"
          type="date"
          value={filters.fechaDesde ? filters.fechaDesde.toISOString().split('T')[0] : ''}
          onChange={(e) =>
            handleChange('fechaDesde', e.target.value ? new Date(e.target.value) : null)
          }
        />

        <Input
          id="fechaHasta"
          label="Fecha Hasta"
          type="date"
          value={filters.fechaHasta ? filters.fechaHasta.toISOString().split('T')[0] : ''}
          onChange={(e) =>
            handleChange('fechaHasta', e.target.value ? new Date(e.target.value) : null)
          }
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={handleClear}>
          Limpiar filtros
        </Button>
        <Button onClick={onClose}>Aplicar</Button>
      </div>
    </div>
  );
};

export default ExpedienteFilters;
