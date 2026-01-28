import React, { useState } from 'react';
import { FileDown, FileBarChart, TrendingUp, AlertCircle, Users, Calendar, Building2, Settings } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { exportToCSV } from '../utils/csv';
import {
  generateProductividadReport,
  generateActuacionesReport,
  generateAlertasReport,
  generateGestionUsuarioReport,
  generatePeriodoReport,
  generateDespachoClaseReport,
  generateReporteMensual,
  generateReportePersonalizado,
} from '../utils/informes';
import { useToast } from '../components/common/Toast';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Informes: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showPersonalizadoModal, setShowPersonalizadoModal] = useState(false);
  const [camposSeleccionados, setCamposSeleccionados] = useState<string[]>([
    'radicacionUnica',
    'estado',
    'prioridad',
  ]);

  const handleDownload = async (tipo: string, generarDatos: () => Promise<any[]>, filename: string) => {
    setLoading(tipo);
    try {
      const datos = await generarDatos();
      if (datos.length === 0) {
        toast.error('No hay datos disponibles para este informe');
        return;
      }
      exportToCSV(datos, filename);
      toast.success('Informe descargado correctamente');
    } catch (error) {
      console.error('Error generando informe:', error);
      toast.error('Error al generar el informe');
    } finally {
      setLoading(null);
    }
  };

  const handlePersonalizadoDownload = async () => {
    if (camposSeleccionados.length === 0) {
      toast.error('Selecciona al menos un campo');
      return;
    }
    
    setLoading('personalizado');
    try {
      const datos = await generateReportePersonalizado(camposSeleccionados);
      if (datos.length === 0) {
        toast.error('No hay datos disponibles');
        return;
      }
      exportToCSV(datos, 'informe_personalizado');
      toast.success('Informe descargado correctamente');
      setShowPersonalizadoModal(false);
    } catch (error) {
      console.error('Error generando informe:', error);
      toast.error('Error al generar el informe');
    } finally {
      setLoading(null);
    }
  };

  const toggleCampo = (campo: string) => {
    setCamposSeleccionados(prev =>
      prev.includes(campo)
        ? prev.filter(c => c !== campo)
        : [...prev, campo]
    );
  };

  const informes = [
    {
      id: 'productividad',
      titulo: 'Productividad por Usuario',
      descripcion: 'Expedientes creados, asignados y resueltos por cada usuario',
      icon: TrendingUp,
      color: 'bg-blue-500',
      generar: () => generateProductividadReport(),
      filename: 'productividad_usuarios',
    },
    {
      id: 'actuaciones',
      titulo: 'Historial de Actuaciones',
      descripcion: 'Todas las actuaciones registradas con fechas y usuarios',
      icon: FileBarChart,
      color: 'bg-green-500',
      generar: () => generateActuacionesReport(),
      filename: 'historial_actuaciones',
    },
    {
      id: 'alertas',
      titulo: 'Alertas y SLA',
      descripcion: 'Expedientes con alertas de inactividad (6 meses, 2 años) y SLA vencidos',
      icon: AlertCircle,
      color: 'bg-red-500',
      generar: () => generateAlertasReport(),
      filename: 'alertas_sla',
    },
    {
      id: 'gestion',
      titulo: 'Gestión por Usuario',
      descripcion: 'Carga de trabajo actual y distribución por usuario',
      icon: Users,
      color: 'bg-purple-500',
      generar: () => generateGestionUsuarioReport(),
      filename: 'gestion_usuarios',
    },
    {
      id: 'despacho',
      titulo: 'Distribución por Despacho y Clase',
      descripcion: 'Expedientes agrupados por juzgado y tipo de proceso',
      icon: Building2,
      color: 'bg-orange-500',
      generar: () => generateDespachoClaseReport(),
      filename: 'distribucion_despachos',
    },
    {
      id: 'mensual',
      titulo: 'Reporte Mensual (Mes Actual)',
      descripcion: 'Estadísticas completas del mes en curso',
      icon: Calendar,
      color: 'bg-indigo-500',
      generar: () => generateReporteMensual(new Date()),
      filename: 'reporte_mensual_actual',
    },
    {
      id: 'mensual-anterior',
      titulo: 'Reporte Mensual (Mes Anterior)',
      descripcion: 'Estadísticas completas del mes anterior',
      icon: Calendar,
      color: 'bg-teal-500',
      generar: () => generateReporteMensual(subMonths(new Date(), 1)),
      filename: 'reporte_mensual_anterior',
    },
    {
      id: 'personalizado',
      titulo: 'Informe Personalizado',
      descripcion: 'Selecciona los campos específicos que deseas incluir en el reporte',
      icon: Settings,
      color: 'bg-gray-500',
      generar: null, // Se maneja con modal
      filename: 'informe_personalizado',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Informes y Reportes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Descarga informes en formato CSV para análisis detallado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {informes.map((informe) => {
          const Icon = informe.icon;
          const isLoading = loading === informe.id;

          return (
            <div
              key={informe.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${informe.color} p-3 rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {informe.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {informe.descripcion}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => {
                      if (informe.id === 'personalizado') {
                        setShowPersonalizadoModal(true);
                      } else {
                        handleDownload(informe.id, informe.generar!, informe.filename);
                      }
                    }}
                    loading={isLoading}
                    disabled={loading !== null && !isLoading}
                    className="w-full"
                  >
                    <FileDown className="h-5 w-5 mr-2" />
                    {informe.id === 'personalizado' ? 'Configurar y Descargar' : 'Descargar CSV'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <FileBarChart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Acerca de los informes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Los archivos CSV se pueden abrir en Excel, Google Sheets o LibreOffice</li>
                <li>Los informes incluyen todos los datos hasta el momento de la descarga</li>
                <li>Alertas de inactividad: 🟡 6 meses sin actuaciones, 🔴 2 años sin actuaciones</li>
                <li>Alertas SLA: calculadas según prioridad (Alta: 30 días, Media: 60 días, Baja: 90 días)</li>
                <li>La tasa de resolución se calcula sobre expedientes asignados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Informe Personalizado */}
      <Modal
        isOpen={showPersonalizadoModal}
        onClose={() => setShowPersonalizadoModal(false)}
        title="Configurar Informe Personalizado"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona los campos que deseas incluir en tu informe:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
            {[
              { id: 'radicacionUnica', label: 'Radicación Única' },
              { id: 'radicadoInterno', label: 'Radicado Interno' },
              { id: 'clase', label: 'Clase' },
              { id: 'estado', label: 'Estado' },
              { id: 'origen', label: 'Origen' },
              { id: 'despacho', label: 'Despacho' },
              { id: 'ubicacion', label: 'Ubicación' },
              { id: 'prioridad', label: 'Prioridad' },
              { id: 'demandante', label: 'Demandante' },
              { id: 'apoderadoDemandante', label: 'Apoderado Demandante' },
              { id: 'demandado', label: 'Demandado' },
              { id: 'apoderadoDemandado', label: 'Apoderado Demandado' },
              { id: 'responsable', label: 'Responsable' },
              { id: 'fechaCreacion', label: 'Fecha Creación' },
              { id: 'fechaModificacion', label: 'Fecha Modificación' },
              { id: 'creadoPor', label: 'Creado Por' },
              { id: 'modificadoPor', label: 'Modificado Por' },
            ].map((campo) => (
              <label
                key={campo.id}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={camposSeleccionados.includes(campo.id)}
                  onChange={() => toggleCampo(campo.id)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {campo.label}
                </span>
              </label>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Campos seleccionados:</strong> {camposSeleccionados.length}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPersonalizadoModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handlePersonalizadoDownload}
              loading={loading === 'personalizado'}
              disabled={camposSeleccionados.length === 0}
            >
              <FileDown className="h-5 w-5 mr-2" />
              Descargar Informe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Informes;
