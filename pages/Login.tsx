import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getUserProfile } from '../services/api';
import { Lock, User } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result: any = await login({ username, password });
      
      if (result.code === 200 || result.code === 1) {
        let token = '';
        let user = null;

        if (typeof result.data === 'string') {
          token = result.data;
        } else if (result.data && typeof result.data === 'object') {
          token = result.data.token || result.data;
          user = result.data.user;
        }

        if (token) {
          localStorage.setItem('token', token);
          
          if (!user) {
            try {
              const base64Url = token.split('.')[1];
              if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                
                if (payload.sub) {
                  const profileRes = await getUserProfile(Number(payload.sub));
                  if ((profileRes.code === 200 || profileRes.code === 1) && profileRes.data) {
                    user = profileRes.data;
                  }
                }
              }
            } catch (err) {
              console.warn("Could not fetch user profile from token", err);
            }
          }

          // Defensive Check: Ensure user is a valid object before saving
          // This prevents "null" being saved to localStorage and crashing the Layout
          if (!user || typeof user !== 'object') {
            user = { realName: username, position: 'Employee', id: 0 };
          }

          localStorage.setItem('user', JSON.stringify(user));
          navigate('/');
        } else {
          setError('Login succeeded but no token was received.');
        }
      } else {
        setError(result.msg || t('auth.loginFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Language Switcher Fixed Top Right */}
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">{t('auth.welcome')}</h1>
            <p className="text-secondary">{t('auth.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.username')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-accent border-slate-300 rounded focus:ring-accent" />
                <span className="ml-2 text-sm text-slate-600">{t('auth.remember')}</span>
              </label>
              <a href="#" className="text-sm font-medium text-accent hover:text-blue-700">{t('auth.forgot')}</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? t('auth.signing') : t('auth.signin')}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">{t('app.copyright')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;