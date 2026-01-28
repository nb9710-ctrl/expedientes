import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { loginSchema, LoginSchemaType } from '../utils/validation';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Sesión iniciada correctamente');
      navigate('/');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage =
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Email o contraseña incorrectos'
          : error.code === 'auth/too-many-requests'
          ? 'Demasiados intentos fallidos. Intenta más tarde'
          : 'Error al iniciar sesión. Intenta de nuevo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Scale className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistema de Gestión de Expedientes
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Sistema protegido. Todos los accesos son registrados.
        </p>
      </div>
    </div>
  );
};

export default Login;
