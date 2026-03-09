import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, BuildingLibraryIcon, WifiIcon } from '@heroicons/react/24/solid';
import Input from '../components/Input';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState(''); // This maps to 'username' or 'email' depending on backend config
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Assuming Backend runs on port 8000
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Django SimpleJWT usually expects 'username' by default, or email if customized
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        navigate('/');
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || t('login_error_auth'));
      }
    } catch (err) {
      console.warn("Backend not reachable, checking for demo credentials");
      
      // Fallback for Demo/Preview Mode
      if (email === 'admin' && password === 'admin') {
         localStorage.setItem('accessToken', 'demo_token_offline');
         // Store a flag to let the app know we are in demo mode
         localStorage.setItem('isDemoMode', 'true');
         navigate('/');
      } else {
        setError(t('login_error_server'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <BuildingLibraryIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('login_title')}</h1>
          <p className="text-gray-500 mt-2">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center flex flex-col items-center gap-1">
              <span className="flex items-center gap-2 font-bold">
                 <WifiIcon className="w-4 h-4" />
                 {t('connection_error')}
              </span>
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
             <Input 
                label={t('username')} 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                required
             />
             <EnvelopeIcon className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
             <Input 
                label={t('password')} 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
             />
             <LockClosedIcon className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold shadow-md
              hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
              transition-all disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {loading ? t('logging_in') : t('login_btn')}
          </button>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            {t('login_note')}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;