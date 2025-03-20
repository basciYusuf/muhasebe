import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        type: 'error',
        message: 'Şifreler eşleşmiyor.',
      });
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Kullanıcı profili oluştur
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          email: formData.email,
          full_name: formData.fullName,
          role: 'user',
        },
      ]);

      if (profileError) throw profileError;

      addNotification({
        type: 'success',
        message: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error registering:', error);
      addNotification({
        type: 'error',
        message: 'Kayıt olurken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-center text-sm text-gray-600">
            Muhasebe Yönetim Sistemine kayıt olun
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="fullName" className="sr-only">
                Ad Soyad
              </label>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                👤
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ad Soyad"
              />
            </div>
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                E-posta
              </label>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                ✉️
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="E-posta adresiniz"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                🔒
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Şifre"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Şifre Tekrar
              </label>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                🔒
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Şifre Tekrar"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Giriş yapın
          </button>
        </div>
      </div>
    </div>
  );
} 