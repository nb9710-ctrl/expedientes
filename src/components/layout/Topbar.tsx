import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import Button from '../common/Button';
import NotificacionesDropdown from '../common/NotificacionesDropdown';

const Topbar: React.FC = () => {
  const { userData, signOut } = useAuth();

  const roleLabels = {
    admin: 'Administrador',
    gestor: 'Gestor',
    lectura: 'Lectura',
  };

  return (
    <header className="h-20 bg-white shadow-sm border-b border-gray-100">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Título de bienvenida */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sistema de Gestión de Expedientes
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus expedientes de forma eficiente</p>
        </div>
        
        {/* Acciones y perfil */}
        <div className="flex items-center gap-6">
          <NotificacionesDropdown />
          
          {/* Perfil mejorado */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{userData?.displayName}</p>
              <p className="text-xs text-gray-500">{userData?.rol && roleLabels[userData.rol]}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          
          {/* Botón de cerrar sesión mejorado */}
          <button
            onClick={signOut}
            className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
