import React, { useState, useEffect } from 'react';
import { getWorkers } from '../services/api';
import { UserDTO } from '../types';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await getWorkers({ pageNum: 1, pageSize: 10, username: searchTerm });
      if (res.code === 200 || res.code === 1) { 
        // CRITICAL FIX: Check if data and list exist and are arrays
        if (res.data && Array.isArray(res.data.list)) {
          setWorkers(res.data.list);
        } else {
          console.warn('API returned invalid list format for workers', res.data);
          setWorkers([]);
        }
      }
    } catch (err) {
      console.error(err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers();
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 1: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{t('emp.status.active')}</span>;
      case 2: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{t('emp.status.leave')}</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{t('emp.status.inactive')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('emp.title')}</h1>
          <p className="text-secondary">{t('emp.subtitle')}</p>
        </div>
        <button className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {t('emp.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder={t('emp.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            />
          </form>
          <div className="flex gap-2 w-full md:w-auto">
             <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 w-full md:w-auto">
               <Filter size={16} /> {t('common.filter')}
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('emp.table.employee')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('emp.table.dept')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('emp.table.contact')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('emp.table.status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">{t('common.loading')}</td>
                </tr>
              ) : !Array.isArray(workers) || workers.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500">{t('emp.noData')}</td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold mr-3 text-sm">
                          {worker.realName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{worker.realName}</div>
                          <div className="text-xs text-slate-500">{worker.position} • {worker.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">Dept {worker.departmentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{worker.email}</div>
                      <div className="text-xs text-slate-500">{worker.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(worker.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-slate-400 hover:text-accent rounded transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;