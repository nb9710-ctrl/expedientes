import React, { useState } from 'react';
import { Plus, FileText, Download, Calendar } from 'lucide-react';
import { Actuacion } from '../../types';
import { useAuth } from '../../auth/useAuth';
import { formatDateTime, formatFileSize } from '../../utils/format';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ModalActuacion from './ModalActuacion';
import { useQueryClient } from '@tanstack/react-query';

interface PanelActuacionesProps {
  expedienteId: string;
  actuaciones: Actuacion[];
}

const PanelActuaciones: React.FC<PanelActuacionesProps> = ({
  expedienteId,
  actuaciones,
}) => {
  const { hasRole } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const canCreate = hasRole(['admin', 'gestor']);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Actuaciones</h2>
        {canCreate && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Agregar Actuación
          </Button>
        )}
      </div>

      {actuaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay actuaciones registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actuaciones.map((actuacion) => (
            <div
              key={actuacion.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {formatDateTime(actuacion.fecha)}
                  </span>
                  {actuacion.tipo && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                      {actuacion.tipo}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {actuacion.anotacion}
              </p>

              {actuacion.adjuntos && actuacion.adjuntos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Adjuntos:</p>
                  <div className="space-y-2">
                    {actuacion.adjuntos.map((adjunto, index) => (
                      <a
                        key={index}
                        href={adjunto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Download className="h-4 w-4" />
                        <span>{adjunto.nombre}</span>
                        <span className="text-gray-500">
                          ({formatFileSize(adjunto.size)})
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Por: {actuacion.usuarioNombre || 'Usuario desconocido'} • {formatDateTime(actuacion.creadoEl)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Agregar Actuación"
        size="lg"
      >
        <ModalActuacion
          expedienteId={expedienteId}
          onSuccess={() => {
            setShowModal(false);
            queryClient.invalidateQueries({ queryKey: ['actuaciones', expedienteId] });
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PanelActuaciones;
