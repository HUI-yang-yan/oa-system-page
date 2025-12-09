import React, { useState, useEffect } from 'react';
import { applyLeave, getLeaveTypes } from '../services/api';
import { LeaveApplicationDTO } from '../types';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

const LeaveManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('apply');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const [formData, setFormData] = useState<LeaveApplicationDTO>({
    leaveTypeId: 1,
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getLeaveTypes();
      if (res.code === 200 || res.code === 1) {
        setLeaveTypes(res.data);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await applyLeave(formData);
      if (res.code === 200 || res.code === 1) { 
        setNotification({ type: 'success', msg: t('leave.success') });
        setFormData({ leaveTypeId: 1, startTime: '', endTime: '', reason: '' }); 
      } else {
        setNotification({ type: 'error', msg: res.msg || t('common.error') });
      }
    } catch (error) {
       setNotification({ type: 'error', msg: t('common.networkError') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('leave.title')}</h1>
        <p className="text-secondary">{t('leave.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('apply')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'apply'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('leave.tab.apply')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('leave.tab.history')}
          </button>
        </nav>
      </div>

      {activeTab === 'apply' ? (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h2 className="text-lg font-semibold text-slate-800 mb-6">{t('leave.newApp')}</h2>
             
             {notification && (
               <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                 {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                 {notification.msg}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t('leave.type')}</label>
                     <select 
                       name="leaveTypeId"
                       value={formData.leaveTypeId}
                       onChange={handleChange}
                       className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none bg-white"
                     >
                        {leaveTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t('leave.startDate')}</label>
                     <input 
                       type="date" 
                       name="startTime"
                       required
                       value={formData.startTime}
                       onChange={handleChange}
                       className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t('leave.endDate')}</label>
                     <input 
                       type="date" 
                       name="endTime"
                       required
                       value={formData.endTime}
                       onChange={handleChange}
                       className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none"
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t('leave.reason')}</label>
                   <textarea 
                      name="reason"
                      rows={4}
                      required
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder={t('leave.reasonPlaceholder')}
                      className="block w-full border border-slate-300 rounded-lg p-2.5 focus:ring-accent focus:border-accent outline-none"
                   ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-accent hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                  >
                    {submitting ? t('leave.submitting') : t('leave.submit')}
                  </button>
                </div>
             </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Calendar size={48} className="text-slate-300 mb-4" />
              <p className="text-lg font-medium">{t('leave.historyEmpty')}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;