import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, Settings, Users, Scale, FileBarChart } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'gestor', 'lectura'] },
    { to: '/expedientes', icon: FolderOpen, label: 'Expedientes', roles: ['admin', 'gestor', 'lectura'] },
    { to: '/informes', icon: FileBarChart, label: 'Informes', roles: ['admin', 'gestor', 'lectura'] },
    { to: '/catalogos', icon: Settings, label: 'Catálogos', roles: ['admin'] },
    { to: '/usuarios', icon: Users, label: 'Usuarios', roles: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl border-r border-gray-100 flex flex-col" aria-label="Navegación principal">
      {/* Logo mejorado */}
      <div className="flex items-center justify-center h-20 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <Scale className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Juzgados</span>
            <p className="text-xs text-blue-100">Sistema de Gestión</p>
          </div>
        </div>
      </div>
      
      {/* Navegación mejorada */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (!hasRole(item.roles as any)) return null;
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`mr-3 p-1.5 rounded-lg transition-colors ${
                        isActive ? 'bg-white/20' : 'group-hover:bg-blue-50'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer con estado del sistema */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-900">Sistema operativo</span>
          </div>
          <p className="text-xs text-green-700 mt-1">Versión 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
