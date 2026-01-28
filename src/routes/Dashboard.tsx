import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  FolderOpen, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Expediente } from '../types';
import Button from '../components/common/Button';
import { calcularEstadoSLA, calcularEstadoInactividad, requiereAtencion } from '../utils/sla';
import { getUltimaActuacionFecha } from '../api/actuaciones';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const expedientesRef = collection(db, 'expedientes');
      const snapshot = await getDocs(expedientesRef);
      const expedientes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expediente[];

      // Filtrar expedientes abiertos (no cerrados, resueltos ni archivados)
      const expedientesAbiertos = expedientes.filter(exp => {
        const estadoNombre = exp.estadoNombre?.toLowerCase() || '';
        return !estadoNombre.includes('cerrado') && 
               !estadoNombre.includes('resuelto') && 
               !estadoNombre.includes('archivado');
      });

      // Calcular alertas SLA y de inactividad
      let totalVencidos = 0;
      let totalInactivos6m = 0;
      let totalInactivos2a = 0;

      for (const exp of expedientesAbiertos) {
        // SLA por prioridad
        const estadoSLA = calcularEstadoSLA(exp);
        if (estadoSLA.estado === 'vencido') {
          totalVencidos++;
        }

        // Inactividad
        const fechaUltimaActuacion = await getUltimaActuacionFecha(exp.id);
        const fechaCreacion = exp.creadoEl?.toDate() || new Date();
        const estadoInactividad = calcularEstadoInactividad(fechaUltimaActuacion, fechaCreacion);
        
        if (estadoInactividad.estado === 'inactivo_2a') {
          totalInactivos2a++;
        } else if (estadoInactividad.estado === 'inactivo_6m') {
          totalInactivos6m++;
        }
      }

      const porEstado: { [key: string]: { nombre: string, count: number } } = {};
      expedientes.forEach((exp) => {
        if (!porEstado[exp.estadoId]) {
          porEstado[exp.estadoId] = { nombre: exp.estadoNombre || 'Desconocido', count: 0 };
        }
        porEstado[exp.estadoId].count++;
      });

      const porPrioridad = {
        alta: expedientes.filter((exp) => exp.prioridad === 'Alta').length,
        media: expedientes.filter((exp) => exp.prioridad === 'Media').length,
        baja: expedientes.filter((exp) => exp.prioridad === 'Baja').length,
      };

      return {
        totalAbiertos: expedientesAbiertos.length,
        totalVencidos,
        totalInactivos6m,
        totalInactivos2a,
        porEstado: Object.entries(porEstado).map(([id, data]) => ({
          id,
          nombre: data.nombre,
          count: data.count
        })),
        porPrioridad,
        total: expedientes.length,
      };
    },
    staleTime: 60000, // Cache por 1 minuto
  });

  const statCards = [
    {
      title: 'Total de Expedientes',
      value: kpis?.total || 0,
      icon: FolderOpen,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'En el sistema',
    },
    {
      title: 'Expedientes Abiertos',
      value: kpis?.totalAbiertos || 0,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'En gestión activa',
    },
    {
      title: 'Alta Prioridad',
      value: kpis?.porPrioridad.alta || 0,
      icon: AlertCircle,
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      description: 'Requieren atención',
    },
    {
      title: 'Vencidos (SLA)',
      value: kpis?.totalVencidos || 0,
      icon: Clock,
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      description: 'Fuera de tiempo',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Ejecutivo</h1>
          <p className="text-gray-600">Resumen general del sistema de gestión de expedientes</p>
        </div>
        <button
          onClick={() => navigate('/expedientes')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Ver todos los expedientes
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Cards mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="kpi-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${card.textColor}`}>
                    {card.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500">{card.description}</p>
              <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`}></div>
            </div>
          );
        })}
      </div>

      {/* Alertas de inactividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="corporate-card p-6 bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Inactivos 6+ meses</h3>
          </div>
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {kpis?.totalInactivos6m || 0}
          </div>
          <p className="text-sm text-gray-600">Expedientes sin actuaciones recientes</p>
        </div>

        <div className="corporate-card p-6 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Inactivos 2+ años</h3>
          </div>
          <div className="text-4xl font-bold text-red-600 mb-2">
            {kpis?.totalInactivos2a || 0}
          </div>
          <p className="text-sm text-gray-600">Requieren revisión urgente</p>
        </div>
      </div>

      {/* Gráficos mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expedientes por Estado */}
        <div className="corporate-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Expedientes por Estado</h2>
          </div>

          <div className="space-y-4">
            {kpis?.porEstado.slice(0, 6).map((estado, index) => {
              const percentage = ((estado.count / (kpis?.total || 1)) * 100).toFixed(1);
              const colors = [
                { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
                { bar: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
                { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
                { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                { bar: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
                { bar: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
              ];
              const color = colors[index % colors.length];

              return (
                <div key={estado.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{estado.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${color.text}`}>{estado.count}</span>
                      <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                  <div className={`h-3 ${color.bg} rounded-full overflow-hidden shadow-inner`}>
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expedientes por Prioridad */}
        <div className="corporate-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Expedientes por Prioridad</h2>
          </div>

          <div className="space-y-4">
            {/* Alta Prioridad */}
            <div className="p-5 bg-gradient-to-br from-red-50 to-white rounded-xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-bold text-red-900">Alta Prioridad</span>
                </div>
                <span className="text-3xl font-bold text-red-700">
                  {kpis?.porPrioridad.alta || 0}
                </span>
              </div>
              <div className="h-3 bg-red-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700"
                  style={{ width: `${((kpis?.porPrioridad.alta || 0) / (kpis?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-red-700 mt-2 font-medium">
                {(((kpis?.porPrioridad.alta || 0) / (kpis?.total || 1)) * 100).toFixed(1)}% del total
              </p>
            </div>

            {/* Media Prioridad */}
            <div className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-bold text-amber-900">Media Prioridad</span>
                </div>
                <span className="text-3xl font-bold text-amber-700">
                  {kpis?.porPrioridad.media || 0}
                </span>
              </div>
              <div className="h-3 bg-amber-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
                  style={{ width: `${((kpis?.porPrioridad.media || 0) / (kpis?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-amber-700 mt-2 font-medium">
                {(((kpis?.porPrioridad.media || 0) / (kpis?.total || 1)) * 100).toFixed(1)}% del total
              </p>
            </div>

            {/* Baja Prioridad */}
            <div className="p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-bold text-green-900">Baja Prioridad</span>
                </div>
                <span className="text-3xl font-bold text-green-700">
                  {kpis?.porPrioridad.baja || 0}
                </span>
              </div>
              <div className="h-3 bg-green-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                  style={{ width: `${((kpis?.porPrioridad.baja || 0) / (kpis?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-green-700 mt-2 font-medium">
                {(((kpis?.porPrioridad.baja || 0) / (kpis?.total || 1)) * 100).toFixed(1)}% del total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de alertas corporativo */}
      <div className="corporate-card p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-600">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sistema de Monitoreo</h3>
            <p className="text-sm text-gray-700 mb-5">
              Seguimiento continuo de expedientes que requieren atención prioritaria
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
                <div className="text-3xl font-bold text-amber-600 mb-1">{kpis?.totalVencidos || 0}</div>
                <div className="text-xs text-gray-600 font-medium">SLA Vencido</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">{kpis?.totalInactivos6m || 0}</div>
                <div className="text-xs text-gray-600 font-medium">Inactivos +6 meses</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
                <div className="text-3xl font-bold text-green-600 mb-1">{kpis?.totalAbiertos || 0}</div>
                <div className="text-xs text-gray-600 font-medium">En Proceso Activo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
