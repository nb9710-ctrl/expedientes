import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createExpediente, updateExpediente, generarRadicacionConsecutiva, generarRadicadoInterno } from '../../api/expedientes';
import { Expediente } from '../../types';
import { expedienteSchema, ExpedienteSchemaType } from '../../utils/validation';
import { useAuth } from '../../auth/useAuth';
import { useCatalogo } from '../../hooks/useCatalogo';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import SelectWithSearch from '../../components/common/SelectWithSearch';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

interface FormExpedienteProps {
  expediente?: Expediente;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormExpediente: React.FC<FormExpedienteProps> = ({
  expediente,
  onSuccess,
  onCancel,
}) => {
  const { userData } = useAuth();
  const toast = useToast();
  const isEditing = !!expediente;
  const [origenSeleccionado, setOrigenSeleccionado] = useState<string>('');

  const { data: clases = [] } = useCatalogo('clases');
  const { data: estados = [] } = useCatalogo('estados');
  const { data: origenes = [] } = useCatalogo('origenes');
  const { data: despachos = [] } = useCatalogo('despachos');
  const { data: ubicaciones = [] } = useCatalogo('ubicaciones');

  // Ordenar listas alfabéticamente
  const clasesOrdenadas = useMemo(() => 
    [...clases].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clases]
  );
  const estadosOrdenados = useMemo(() => 
    [...estados].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estados]
  );
  const origenesOrdenados = useMemo(() => 
    [...origenes].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [origenes]
  );
  const despachosOrdenados = useMemo(() => 
    [...despachos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [despachos]
  );
  const ubicacionesOrdenadas = useMemo(() => 
    [...ubicaciones].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [ubicaciones]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ExpedienteSchemaType>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: expediente
      ? {
          radicacionUnica: expediente.radicacionUnica,
          radicadoInterno: expediente.radicadoInterno,
          claseId: expediente.claseId,
          estadoId: expediente.estadoId,
          origenId: expediente.origenId,
          despachoId: expediente.despachoId,
          ubicacionId: expediente.ubicacionId,
          repositorio: expediente.repositorio || '',
          demandante: expediente.demandante,
          apoderadoDemandante: expediente.apoderadoDemandante,
          demandado: expediente.demandado,
          apoderadoDemandado: expediente.apoderadoDemandado,
          prioridad: expediente.prioridad,
          responsableUserId: expediente.responsableUserId,
        }
      : {
          prioridad: 'Media',
          responsableUserId: userData?.uid || '',
        },
  });

  // Generar radicación consecutiva automáticamente al crear nuevo expediente
  useEffect(() => {
    const generarRadicacion = async () => {
      if (!isEditing) {
        try {
          const radicacion = await generarRadicacionConsecutiva();
          setValue('radicacionUnica', radicacion);
        } catch (error) {
          console.error('Error generando radicación:', error);
          toast.error('Error al generar radicación consecutiva');
        }
      }
    };
    
    generarRadicacion();
  }, [isEditing, setValue, toast]);

  // Generar radicado interno cuando cambia el origen
  useEffect(() => {
    const generarRadicado = async () => {
      if (!isEditing && origenSeleccionado) {
        // Buscar el nombre del origen seleccionado
        const origen = origenes.find(o => o.id === origenSeleccionado);
        if (origen) {
          try {
            const radicado = await generarRadicadoInterno(origen.nombre);
            setValue('radicadoInterno', radicado);
          } catch (error) {
            console.error('Error generando radicado interno:', error);
            // Si el origen no tiene prefijo configurado, limpiar el campo
            setValue('radicadoInterno', '');
          }
        }
      }
    };
    
    generarRadicado();
  }, [origenSeleccionado, origenes, isEditing, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: ExpedienteSchemaType) => {
      if (isEditing) {
        await updateExpediente(expediente.id, data, userData!.uid);
      } else {
        await createExpediente(data, userData!.uid);
      }
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Expediente actualizado correctamente'
          : 'Expediente creado correctamente'
      );
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar el expediente');
    },
  });

  const onSubmit = (data: ExpedienteSchemaType) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="radicacionUnica"
          label="Radicación Única"
          placeholder="11001-31-03-001-2024-00001-00"
          required
          readOnly
          error={errors.radicacionUnica?.message}
          helperText="Generada automáticamente"
          {...register('radicacionUnica')}
        />

        <Input
          id="radicadoInterno"
          label="Radicado Interno"
          readOnly={!isEditing}
          error={errors.radicadoInterno?.message}
          helperText={!isEditing ? "Se genera automáticamente al seleccionar el origen" : ""}
          {...register('radicadoInterno')}
        />

        <Controller
          name="claseId"
          control={control}
          render={({ field }) => (
            <SelectWithSearch
              id="claseId"
              label="Clase"
              required
              options={clasesOrdenadas.map((c) => ({ value: c.id, label: c.nombre }))}
              error={errors.claseId?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Select
          id="estadoId"
          label="Estado"
          required
          options={estadosOrdenados.map((e) => ({ value: e.id, label: e.nombre }))}
          error={errors.estadoId?.message}
          {...register('estadoId')}
        />

        <Controller
          name="origenId"
          control={control}
          render={({ field }) => (
            <SelectWithSearch
              id="origenId"
              label="Origen"
              required
              options={origenesOrdenados.map((o) => ({ value: o.id, label: o.nombre }))}
              error={errors.origenId?.message}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setOrigenSeleccionado(value);
              }}
              onBlur={field.onBlur}
            />
          )}
        />

        <Select
          id="despachoId"
          label="Despacho"
          required
          options={despachosOrdenados.map((d) => ({ value: d.id, label: d.nombre }))}
          error={errors.despachoId?.message}
          {...register('despachoId')}
        />

        <Select
          id="ubicacionId"
          label="Ubicación"
          required
          options={ubicacionesOrdenadas.map((u) => ({ value: u.id, label: u.nombre }))}
          error={errors.ubicacionId?.message}
          {...register('ubicacionId')}
        />

        <Input
          id="repositorio"
          label="Repositorio (URL)"
          placeholder="https://..."
          error={errors.repositorio?.message}
          {...register('repositorio')}
        />

        <Textarea
          id="demandante"
          label="Demandante"
          rows={3}
          error={errors.demandante?.message}
          {...register('demandante')}
        />

        <Textarea
          id="apoderadoDemandante"
          label="Apoderado Demandante"
          rows={3}
          error={errors.apoderadoDemandante?.message}
          {...register('apoderadoDemandante')}
        />

        <Textarea
          id="demandado"
          label="Demandado"
          rows={3}
          error={errors.demandado?.message}
          {...register('demandado')}
        />

        <Textarea
          id="apoderadoDemandado"
          label="Apoderado Demandado"
          rows={3}
          error={errors.apoderadoDemandado?.message}
          {...register('apoderadoDemandado')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEditing ? 'Actualizar' : 'Crear'} Expediente
        </Button>
      </div>
    </form>
  );
};

export default FormExpediente;
