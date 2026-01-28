import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, UserCog, AlertTriangle, ExternalLink } from 'lucide-react';
import { getExpedienteById, updateExpediente } from '../api/expedientes';
import { getActuaciones } from '../api/actuaciones';
import { useAuth } from '../auth/useAuth';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatDateTime, getPrioridadColor } from '../utils/format';
import { useToast } from '../components/common/Toast';
import FormExpediente from '../features/expedientes/FormExpediente';
import PanelActuaciones from '../features/expedientes/PanelActuaciones';
import ModalEscalar from '../features/expedientes/ModalEscalar';

const ExpedienteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, userData } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEscalarModal, setShowEscalarModal] = useState(false);

  const { data: expediente, isLoading } = useQuery({
    queryKey: ['expediente', id],
    queryFn: () => getExpedienteById(id!),
    enabled: !!id,
  });

  const { data: actuaciones } = useQuery({
    queryKey: ['actuaciones', id],
    queryFn: () => getActuaciones(id!),
    enabled: !!id,
  });

  const canEdit = hasRole(['admin', 'gestor']);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Expediente no encontrado</p>
        <Button onClick={() => navigate('/expedientes')} className="mt-4">
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/expedientes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Expediente: {expediente.radicacionUnica}
          </h1>
        </div>

        <div className="flex gap-3">
          {canEdit && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowEscalarModal(true)}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Escalar
              </Button>
              <Button onClick={() => setShowEditModal(true)}>
                <Edit2 className="h-5 w-5 mr-2" />
                Editar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Datos del expediente */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Radicación Única
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {expediente.radicacionUnica}
            </p>
          </div>

          {expediente.radicadoInterno && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Radicado Interno
              </label>
              <p className="mt-1 text-lg text-gray-900">{expediente.radicadoInterno}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500">Prioridad</label>
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getPrioridadColor(
                expediente.prioridad
              )}`}
            >
              {expediente.prioridad}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Estado</label>
            <p className="mt-1 text-gray-900">{expediente.estadoNombre || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Clase</label>
            <p className="mt-1 text-gray-900">{expediente.claseNombre || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Origen</label>
            <p className="mt-1 text-gray-900">{expediente.origenNombre || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Despacho</label>
            <p className="mt-1 text-gray-900">{expediente.despachoNombre || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Ubicación</label>
            <p className="mt-1 text-gray-900">{expediente.ubicacionNombre || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Demandante</label>
            <p className="mt-1 text-gray-900">{expediente.demandante || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Apoderado Demandante
            </label>
            <p className="mt-1 text-gray-900">{expediente.apoderadoDemandante || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Demandado</label>
            <p className="mt-1 text-gray-900">{expediente.demandado || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Apoderado Demandado
            </label>
            <p className="mt-1 text-gray-900">{expediente.apoderadoDemandado || '-'}</p>
          </div>

          {expediente.repositorio && (
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-500">
                Repositorio
              </label>
              <a
                href={expediente.repositorio}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                Ver repositorio
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}

          <div className="col-span-full border-t pt-4">
            <p className="text-sm text-gray-500">
              Creado: {formatDateTime(expediente.creadoEl)} por {expediente.creadoPorNombre || 'Usuario desconocido'}
            </p>
            <p className="text-sm text-gray-500">
              Modificado: {formatDateTime(expediente.modificadoEl)} por{' '}
              {expediente.modificadoPorNombre || 'Usuario desconocido'}
            </p>
          </div>
        </div>
      </div>

      {/* Panel de actuaciones */}
      <PanelActuaciones expedienteId={id!} actuaciones={actuaciones || []} />

      {/* Modales */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Expediente"
        size="xl"
      >
        <FormExpediente
          expediente={expediente}
          onSuccess={() => {
            setShowEditModal(false);
            queryClient.invalidateQueries({ queryKey: ['expediente', id] });
            toast.success('Expediente actualizado correctamente');
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <ModalEscalar
        isOpen={showEscalarModal}
        onClose={() => setShowEscalarModal(false)}
        expedienteId={id!}
        radicacionUnica={expediente?.radicacionUnica || ''}
        onSuccess={() => {
          setShowEscalarModal(false);
          queryClient.invalidateQueries({ queryKey: ['expediente', id] });
          queryClient.invalidateQueries({ queryKey: ['actuaciones', id] });
          queryClient.invalidateQueries({ queryKey: ['expedientes'] });
          
          // Si el usuario no es admin/auditor, redirigir a la lista
          // porque ya no puede ver este expediente
          if (userData?.rol && !['admin', 'auditor'].includes(userData.rol)) {
            toast.success('Expediente escalado. El expediente ya no está asignado a ti.');
            navigate('/expedientes');
          }
        }}
      />
    </div>
  );
};

export default ExpedienteView;
