import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, UserPlus, UserX, Trash2, UserCheck } from 'lucide-react';
import { getUsers, updateUserRole, createUser, disableUser, enableUser, deleteUser } from '../api/users';
import { User, UserRole } from '../types';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { useForm } from 'react-hook-form';

const Usuarios: React.FC = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: ({ uid, rol, equipo }: { uid: string; rol: UserRole; equipo?: string }) =>
      updateUserRole(uid, rol, equipo),
    onSuccess: () => {
      toast.success('Usuario actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setEditingUser(null);
    },
    onError: () => toast.error('Error al actualizar el usuario'),
  });

  const createMutation = useMutation({
    mutationFn: ({ email, password, displayName, rol }: {
      email: string;
      password: string;
      displayName: string;
      rol: UserRole;
    }) => createUser(email, password, displayName, rol),
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      console.log('Error capturado:', error);
      
      let errorMessage = 'Error al crear el usuario';
      
      if (error?.message === 'DUPLICATE_EMAIL') {
        errorMessage = 'El email ya está en uso';
      } else if (error?.message === 'WEAK_PASSWORD') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'El email ya está en uso';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      toast.error(errorMessage);
    },
  });

  const disableMutation = useMutation({
    mutationFn: disableUser,
    onSuccess: () => {
      toast.success('Usuario inhabilitado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al inhabilitar el usuario'),
  });

  const enableMutation = useMutation({
    mutationFn: enableUser,
    onSuccess: () => {
      toast.success('Usuario habilitado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al habilitar el usuario'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Error al eliminar el usuario'),
  });

  const handleToggleActive = (user: User) => {
    const isActive = user.activo !== false; // Por defecto true si no existe
    if (isActive) {
      if (confirm(`¿Estás seguro de inhabilitar a ${user.displayName}?`)) {
        disableMutation.mutate(user.uid);
      }
    } else {
      enableMutation.mutate(user.uid);
    }
  };

  const handleDelete = (user: User) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.displayName}? Esta acción marca el usuario como eliminado.`)) {
      deleteMutation.mutate(user.uid);
    }
  };

  const roleLabels = {
    admin: 'Administrador',
    gestor: 'Gestor',
    lectura: 'Lectura',
    auditor: 'Auditor',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <Button onClick={() => setShowCreateModal(true)} icon={UserPlus}>
          Nuevo Usuario
        </Button>
      </div>

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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
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
              {users
                .filter(user => !user.eliminado) // No mostrar usuarios eliminados
                .map((user) => {
                  const isActive = user.activo !== false; // Por defecto true
                  
                  return (
                    <tr key={user.uid} className={!isActive ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {roleLabels[user.rol]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                            title={isActive ? 'Inhabilitar cuenta' : 'Habilitar cuenta'}
                          >
                            {isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <UserModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onSave={(rol) => {
            mutation.mutate({ uid: editingUser.uid, rol });
          }}
        />
      )}

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (rol: UserRole, equipo?: string) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      rol: user.rol,
      equipo: user.equipo || '',
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <form
        onSubmit={handleSubmit((data) => onSave(data.rol as UserRole, data.equipo))}
        className="space-y-4"
      >
        <div>
          <label className="label">Nombre</label>
          <p className="text-gray-900">{user.displayName}</p>
        </div>

        <div>
          <label className="label">Email</label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <Select
          id="rol"
          label="Rol"
          required
          options={[
            { value: 'admin', label: 'Administrador' },
            { value: 'gestor', label: 'Gestor' },
            { value: 'lectura', label: 'Lectura' },
          ]}
          {...register('rol')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </Modal>
  );
};

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    email: string;
    password: string;
    displayName: string;
    rol: UserRole;
  }) => void;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      rol: 'lectura' as UserRole,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Usuario">
      <form
        onSubmit={handleSubmit((data) => {
          onSave(data);
          reset();
        })}
        className="space-y-4"
      >
        <Input
          id="displayName"
          label="Nombre Completo"
          required
          {...register('displayName', { required: 'El nombre es requerido' })}
          error={errors.displayName?.message}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          required
          {...register('email', {
            required: 'El email es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          required
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: {
              value: 6,
              message: 'Mínimo 6 caracteres',
            },
          })}
          error={errors.password?.message}
        />

        <Select
          id="rol"
          label="Rol"
          required
          options={[
            { value: 'admin', label: 'Administrador' },
            { value: 'gestor', label: 'Gestor' },
            { value: 'lectura', label: 'Lectura' },
          ]}
          error={errors.rol?.message}
          {...register('rol', { required: 'El rol es requerido' })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Crear Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Usuarios;
