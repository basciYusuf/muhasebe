import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      addNotification({
        type: 'error',
        message: 'Giriş yapılırken bir hata oluştu.',
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
            Muhasebe Yönetim Sistemi
          </h1>
          <p className="text-center text-sm text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Şifreniz"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              // Şifre sıfırlama işlemi eklenecek
              alert('Bu özellik yakında eklenecek!');
            }}
            className="font-medium text-sm text-indigo-600 hover:text-indigo-500"
          >
            Şifrenizi mi unuttunuz?
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Hemen kaydolun
          </button>
        </div>
      </div>
    </div>
  );
} 