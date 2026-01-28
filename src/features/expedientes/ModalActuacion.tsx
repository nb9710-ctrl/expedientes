import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { createActuacion } from '../../api/actuaciones';
import { actuacionSchema, ActuacionSchemaType } from '../../utils/validation';
import { useAuth } from '../../auth/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { formatFileSize } from '../../utils/format';

interface ModalActuacionProps {
  expedienteId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ModalActuacion: React.FC<ModalActuacionProps> = ({
  expedienteId,
  onSuccess,
  onCancel,
}) => {
  const { userData } = useAuth();
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [fechaActual, setFechaActual] = useState<string>('');

  // Actualizar fecha en tiempo real cada segundo
  useEffect(() => {
    const updateFecha = () => {
      const now = new Date();
      // Formato para datetime-local: YYYY-MM-DDThh:mm
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFechaActual(`${year}-${month}-${day}T${hours}:${minutes}`);
    };

    // Actualizar inmediatamente
    updateFecha();

    // Actualizar cada segundo
    const interval = setInterval(updateFecha, 1000);

    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActuacionSchemaType>({
    resolver: zodResolver(actuacionSchema),
    defaultValues: {
      fecha: new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ActuacionSchemaType) => {
      await createActuacion(expedienteId, data, userData!.uid);
    },
    onSuccess: () => {
      toast.success('Actuación agregada correctamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar la actuación');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ActuacionSchemaType) => {
    mutation.mutate({ ...data, adjuntos: files });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id="fecha"
        label="Fecha y Hora (Automática)"
        type="datetime-local"
        required
        value={fechaActual}
        readOnly
        error={errors.fecha?.message}
        {...register('fecha', {
          valueAsDate: true,
        })}
      />

      <Input
        id="tipo"
        label="Tipo de Actuación"
        placeholder="Ej: Audiencia, Notificación, Recurso..."
        error={errors.tipo?.message}
        {...register('tipo')}
      />

      <div>
        <label htmlFor="anotacion" className="label">
          Anotación <span className="text-red-500">*</span>
        </label>
        <textarea
          id="anotacion"
          rows={5}
          className={`input ${errors.anotacion ? 'border-red-500' : ''}`}
          placeholder="Descripción detallada de la actuación..."
          {...register('anotacion')}
        />
        {errors.anotacion && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.anotacion.message}
          </p>
        )}
      </div>

      <div>
        <label className="label">Adjuntos</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Seleccionar archivos</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">o arrastrar y soltar</p>
            </div>
            <p className="text-xs text-gray-500">PDF, DOCX, imágenes hasta 10MB</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Guardar Actuación
        </Button>
      </div>
    </form>
  );
};

export default ModalActuacion;
