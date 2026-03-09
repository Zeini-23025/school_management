import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, BuildingLibraryIcon, GlobeAltIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Input from '../../components/Input';
import { useTranslation } from 'react-i18next';
import { useSchoolContext } from '../../context/SchoolContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { fetchData, fetchCurrentUser } = useSchoolContext();
  const language = i18n.language === 'ar' ? 'ar' : 'fr';
  const toggleLanguage = () => {
    const next = language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('app_lang', next);
  };
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username, // Django SimpleJWT expects 'username'
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        
        // جلب معلومات المستخدم بعد الدخول
        await fetchCurrentUser();
        
        // جلب البيانات فوراً بعد الدخول للتأكد من نجاح الربط
        await fetchData();
        navigate('/');
      } else {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401) {
           setError(t('login_error_bad_credentials'));
        } else {
           setError(errData.detail || t('login_error_server_unexpected'));
        }
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      setError(t('login_error_server_offline'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm hover:bg-slate-50 text-slate-700 transition font-bold border border-slate-200"
      >
        <GlobeAltIcon className="w-4 h-4 text-primary-500" />
        <span className="text-sm">{language === 'ar' ? t('lang_switch_fr') : t('lang_switch_ar')}</span>
      </button>

      <div className="bg-white p-10 rounded-[40px] shadow-soft-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 mb-6 shadow-inner">
            <BuildingLibraryIcon className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">{t('login_title')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-black mb-1">
                 <ExclamationTriangleIcon className="w-4 h-4" />
                 {t('connection_error')}
              </div>
              <p className="font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <div className="relative">
             <Input 
                label={t('username')} 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login_placeholder_username')}
                required
             />
             <EnvelopeIcon className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-[42px] w-5 h-5 text-slate-400`} />
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
             <LockClosedIcon className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-[42px] w-5 h-5 text-slate-400`} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
            {loading ? t('logging_in') : t('login_btn')}
          </button>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-400 font-bold">
              {t('login_note_username')}
            </p>
            <div className="h-px bg-slate-100 w-1/2 mx-auto"></div>
            <button 
              type="button"
              onClick={() => { setUsername('admin'); setPassword('admin'); }}
              className="text-[10px] text-primary-500 font-black uppercase tracking-widest hover:underline"
            >
              {t('demo_account_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
