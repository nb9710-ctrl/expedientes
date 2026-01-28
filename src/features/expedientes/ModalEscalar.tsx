import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { reasignarExpediente } from '../../api/expedientes';
import { createActuacionEscalamiento } from '../../api/actuaciones';
import { crearNotificacionEscalamiento } from '../../api/notificaciones';
import { useAuth } from '../../auth/useAuth';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';

const escalarSchema = z.object({
  nivel: z.enum(['L1', 'L2', 'L3'], {
    required_error: 'Seleccione un nivel de escalamiento',
  }),
  nuevoResponsableId: z.string().min(1, 'Seleccione un responsable'),
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});

type EscalarSchemaType = z.infer<typeof escalarSchema>;

interface ModalEscalarProps {
  isOpen: boolean;
  onClose: () => void;
  expedienteId: string;
  radicacionUnica: string;
  onSuccess: () => void;
}

const ModalEscalar: React.FC<ModalEscalarProps> = ({
  isOpen,
  onClose,
  expedienteId,
  radicacionUnica,
  onSuccess,
}) => {
  const { userData } = useAuth();
  const toast = useToast();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Log para debug: ver qué usuarios se están listando
  React.useEffect(() => {
    if (users.length > 0) {
      console.log('👥 Usuarios disponibles para asignar:');
      users.forEach(u => {
        console.log(`  - ${u.displayName} (${u.email}) - ID: ${u.uid} - Rol: ${u.rol}`);
      });
    }
  }, [users]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EscalarSchemaType>({
    resolver: zodResolver(escalarSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: EscalarSchemaType) => {
      // Reasignar expediente
      await reasignarExpediente(expedienteId, data.nuevoResponsableId, userData!.uid);
      
      // Crear actuación de escalamiento
      await createActuacionEscalamiento(
        expedienteId,
        data.nivel,
        data.nuevoResponsableId,
        data.motivo,
        userData!.uid
      );
      
      // Crear notificación de escalamiento
      await crearNotificacionEscalamiento(
        data.nuevoResponsableId,
        expedienteId,
        radicacionUnica,
        data.motivo,
        userData!.uid
      );
    },
    onSuccess: () => {
      toast.success('Expediente escalado correctamente');
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al escalar el expediente');
    },
  });

  const onSubmit = (data: EscalarSchemaType) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escalar Expediente" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-700">
            El expediente será reasignado al nuevo responsable y se generará una
            actuación de escalamiento.
          </p>
        </div>

        <Select
          id="nivel"
          label="Nivel de Escalamiento"
          required
          options={[
            { value: 'L1', label: 'Nivel 1' },
            { value: 'L2', label: 'Nivel 2' },
            { value: 'L3', label: 'Nivel 3' },
          ]}
          error={errors.nivel?.message}
          {...register('nivel')}
        />

        <Select
          id="nuevoResponsableId"
          label="Nuevo Responsable"
          required
          options={users
            .filter((u) => u.rol === 'gestor' || u.rol === 'admin')
            .map((u) => ({ value: u.uid, label: u.displayName }))}
          error={errors.nuevoResponsableId?.message}
          {...register('nuevoResponsableId')}
        />

        <div>
          <label htmlFor="motivo" className="label">
            Motivo del Escalamiento <span className="text-red-500">*</span>
          </label>
          <textarea
            id="motivo"
            rows={4}
            className={`input ${errors.motivo ? 'border-red-500' : ''}`}
            placeholder="Describa el motivo del escalamiento..."
            {...register('motivo')}
          />
          {errors.motivo && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.motivo.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Escalar Expediente
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEscalar;
