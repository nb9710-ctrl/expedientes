import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter, Download } from 'lucide-react';
import { getExpedientes } from '../api/expedientes';
import { ExpedienteFilters } from '../types';
import { useAuth } from '../auth/useAuth';
import Table, { Pagination } from '../components/common/Table';
import Button from '../components/common/Button';
import { formatDateTime, getPrioridadColor } from '../utils/format';
import { exportToCSV, prepareExpedientesForCSV } from '../utils/csv';
import FilterComponent from '../features/expedientes/ExpedienteFilters';
import FormExpediente from '../features/expedientes/FormExpediente';
import Modal from '../components/common/Modal';

const ExpedientesList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, userData } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ExpedienteFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expedientes', filters, currentPage],
    queryFn: async () => {
      const result = await getExpedientes(
        filters, 
        20, 
        undefined, 
        userData?.rol, 
        userData?.uid
      );
      return result;
    },
  });

  const canCreateEdit = hasRole(['admin', 'gestor']);

  const handleExportCSV = () => {
    if (data?.expedientes && data.expedientes.length > 0) {
      const csvData = prepareExpedientesForCSV(data.expedientes);
      exportToCSV(csvData, 'expedientes');
    }
  };

  const columns = [
    {
      key: 'radicacionUnica',
      header: 'Radicación Única',
      render: (exp: any) => (
        <span className="font-medium text-primary-600">{exp.radicacionUnica}</span>
      ),
    },
    {
      key: 'demandante',
      header: 'Demandante',
    },
    {
      key: 'demandado',
      header: 'Demandado',
    },
    {
      key: 'modificadoEl',
      header: 'Última Modificación',
      render: (exp: any) => formatDateTime(exp.modificadoEl),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </Button>
          {data?.expedientes && data.expedientes.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleExportCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Exportar CSV
            </Button>
          )}
          {canCreateEdit && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Expediente
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <FilterComponent
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <Table
        data={data?.expedientes || []}
        columns={columns}
        loading={isLoading}
        onRowClick={(exp) => navigate(`/expedientes/${exp.id}`)}
        emptyMessage="No se encontraron expedientes"
      />

      {data && data.expedientes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          hasMore={data.hasMore}
          onPageChange={setCurrentPage}
        />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Expediente"
        size="2xl"
      >
        <FormExpediente
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ExpedientesList;
