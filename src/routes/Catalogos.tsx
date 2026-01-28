import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getCatalogos, createCatalogo, updateCatalogo, deleteCatalogo } from '../api/catalogos';
import { Catalogo } from '../types';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catalogoSchema, CatalogoSchemaType } from '../utils/validation';
import Input from '../components/common/Input';

const CATALOGOS = [
  { id: 'clases', nombre: 'Clases' },
  { id: 'estados', nombre: 'Estados' },
  { id: 'origenes', nombre: 'Orígenes' },
  { id: 'despachos', nombre: 'Despachos' },
  { id: 'ubicaciones', nombre: 'Ubicaciones' },
];

const Catalogos: React.FC = () => {
  const [selectedCatalogo, setSelectedCatalogo] = useState(CATALOGOS[0].id);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Catalogo | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['catalogos', selectedCatalogo],
    queryFn: () => getCatalogos(selectedCatalogo),
  });

  const createMutation = useMutation({
    mutationFn: (data: CatalogoSchemaType) => createCatalogo(selectedCatalogo, data),
    onSuccess: () => {
      toast.success('Item creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['catalogos', selectedCatalogo] });
      queryClient.invalidateQueries({ queryKey: ['catalogo', selectedCatalogo] });
      setShowModal(false);
    },
    onError: () => toast.error('Error al crear el item'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: CatalogoSchemaType }) =>
      updateCatalogo(selectedCatalogo, data.id, data.values),
    onSuccess: () => {
      toast.success('Item actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['catalogos', selectedCatalogo] });
      queryClient.invalidateQueries({ queryKey: ['catalogo', selectedCatalogo] });
      setShowModal(false);
      setEditingItem(null);
    },
    onError: () => toast.error('Error al actualizar el item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCatalogo(selectedCatalogo, id),
    onSuccess: () => {
      toast.success('Item eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['catalogos', selectedCatalogo] });
      queryClient.invalidateQueries({ queryKey: ['catalogo', selectedCatalogo] });
    },
    onError: () => toast.error('Error al eliminar el item'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este item?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
        <Button onClick={() => { setEditingItem(null); setShowModal(true); }}>
          <Plus className="h-5 w-5 mr-2" />
          Agregar Item
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {CATALOGOS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatalogo(cat.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedCatalogo === cat.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => { setEditingItem(item); setShowModal(true); }}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CatalogoModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        item={editingItem}
        onSave={(data) => {
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, values: data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />
    </div>
  );
};

interface CatalogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Catalogo | null;
  onSave: (data: CatalogoSchemaType) => void;
}

const CatalogoModal: React.FC<CatalogoModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CatalogoSchemaType>({
    resolver: zodResolver(catalogoSchema),
    defaultValues: item || { nombre: '', activo: true },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (item) {
        reset(item);
      } else {
        reset({ nombre: '', activo: true });
      }
    }
  }, [item, reset, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Editar Item' : 'Nuevo Item'}>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input
          id="nombre"
          label="Nombre"
          required
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        <div className="flex items-center">
          <input
            id="activo"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('activo')}
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
            Activo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{item ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default Catalogos;
