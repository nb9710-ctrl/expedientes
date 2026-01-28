import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getNotificaciones, 
  marcarComoLeida, 
  marcarTodasComoLeidas 
} from '../../api/notificaciones';
import { useAuth } from '../../auth/useAuth';
import { Notificacion } from '../../types';
import { formatDateTime } from '../../utils/format';

const NotificacionesDropdown: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notificaciones = [] } = useQuery({
    queryKey: ['notificaciones', userData?.uid],
    queryFn: () => getNotificaciones(userData!.uid, 10),
    enabled: !!userData,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarLeidaMutation = useMutation({
    mutationFn: marcarComoLeida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const marcarTodasMutation = useMutation({
    mutationFn: () => marcarTodasComoLeidas(userData!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const handleNotificacionClick = (notif: Notificacion) => {
    if (!notif.leida) {
      marcarLeidaMutation.mutate(notif.id);
    }
    setIsOpen(false);
    navigate(`/expedientes/${notif.expedienteId}`);
  };

  const handleMarcarTodas = () => {
    marcarTodasMutation.mutate();
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'asignacion':
        return '📋';
      case 'escalamiento':
        return '⚠️';
      case 'actualizacion':
        return '📝';
      case 'vencimiento':
        return '⏰';
      default:
        return '📬';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-96 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h3>
              {noLeidas > 0 && (
                <button
                  onClick={handleMarcarTodas}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificacionClick(notif)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        !notif.leida ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl" role="img" aria-label={notif.tipo}>
                          {getTipoIcon(notif.tipo)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notif.titulo}
                            </p>
                            {!notif.leida && (
                              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {notif.mensaje}
                          </p>
                          {notif.radicacionUnica && (
                            <p className="mt-1 text-xs font-medium text-primary-600">
                              {notif.radicacionUnica}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDateTime(notif.creadoEl)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notificaciones.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-2 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Aquí podrías navegar a una página de todas las notificaciones
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesDropdown;
