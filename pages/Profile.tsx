import React from 'react';
import { Mail, Phone, Briefcase, Key } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Use Context

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('profile.title')}</h1>
        <p className="text-secondary">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-slate-500 text-3xl font-bold mb-4">
              {user?.realName ? user.realName.charAt(0) : 'U'}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user?.realName || 'User'}</h2>
            <p className="text-secondary mb-4">{user?.position || 'Employee'}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('emp.status.active')}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h3 className="font-semibold text-slate-800 mb-4">{t('profile.contactInfo')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={16} /> {user?.email || 'N/A'}
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} /> {user?.phone || 'N/A'}
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Briefcase size={16} /> Dept ID: {user?.departmentId || 'N/A'}
              </li>
            </ul>
          </div>
        </div>

        {/* Settings Area */}
        <div className="col-span-1 md:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
               <Key size={18} /> {t('profile.security')}
             </h3>
             
             <form className="space-y-6 max-w-md">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('profile.currentPass')}</label>
                 <input type="password" className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('profile.newPass')}</label>
                 <input type="password" className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t('profile.confirmPass')}</label>
                 <input type="password" className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none" />
               </div>
               <button type="button" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
                 {t('profile.updatePass')}
               </button>
             </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
