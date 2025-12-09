import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Coffee,
  CheckCircle,
  XCircle,
  Activity,
  Server
} from 'lucide-react';
import { signIn, signOut, getMeetingRoomStatus, debugConnection } from '../services/api';
import { MeetingRoomStatus } from '../types';
import { useTranslation } from '../utils/i18n';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoomStatus[]>([]);
  
  // Safe user parsing
  const [user, setUser] = useState<any>({});
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    } catch(e) {}
  }, []);

  // Diagnostic State
  const [showDebug, setShowDebug] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    basic: { msg: string, success: boolean } | null,
    cors: { msg: string, success: boolean } | null
  }>({ basic: null, cors: null });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const roomRes = await getMeetingRoomStatus();
        if (roomRes.code === 200 || roomRes.code === 1) { 
          // CRITICAL FIX: Ensure data is actually an array before setting state
          if (Array.isArray(roomRes.data)) {
            setMeetingRooms(roomRes.data);
          } else {
            console.warn('API returned non-array data for meeting rooms:', roomRes.data);
            setMeetingRooms([]); // Fallback to empty array
          }
        }
      } catch (e) {
        console.error("Failed to fetch meeting rooms", e);
        setMeetingRooms([]);
      }
    };
    fetchData();

    return () => clearInterval(timer);
  }, []);

  const handleAttendance = async (type: 'in' | 'out') => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const action = type === 'in' ? signIn : signOut;
      const res = await action();
      if (res.code === 200 || res.code === 1) {
        setStatusMessage(type === 'in' ? 'Sign in successful' : 'Sign out successful');
      } else {
        setStatusMessage(res.msg || 'Operation failed');
      }
    } catch (err) {
      setStatusMessage(t('common.networkError'));
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const runDiagnostics = async () => {
    setDebugResult({ basic: { msg: t('common.loading'), success: false }, cors: { msg: t('common.loading'), success: false } });
    const basicRes = await debugConnection(false);
    const corsRes = await debugConnection(true);
    setDebugResult({
      basic: { msg: basicRes.message, success: basicRes.success },
      cors: { msg: corsRes.message, success: corsRes.success }
    });
  };

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getDateString = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('nav.dashboard')}</h1>
          <p className="text-secondary">{t('dash.welcome')}, {user.realName || 'User'}</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-3xl font-light text-primary">{getTimeString(currentTime)}</div>
          <div className="text-sm text-secondary">{getDateString(currentTime)}</div>
        </div>
      </header>

      {/* Debugger Toggle */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
        >
          <Activity size={14} /> {showDebug ? t('dash.hideIssues') : t('dash.issues')}
        </button>
      </div>

      {showDebug && (
        <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg border border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Server size={18} /> Backend Diagnostics</h3>
            <button 
              onClick={runDiagnostics} 
              className="bg-accent hover:bg-blue-600 px-3 py-1 rounded text-xs font-bold transition-colors"
            >
              Run Test
            </button>
          </div>
          
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span>Test 1: Basic Connection</span>
              {debugResult.basic ? (
                <span className={debugResult.basic.success ? "text-green-400" : "text-red-400"}>
                  {debugResult.basic.msg}
                </span>
              ) : <span className="text-slate-500">Not run</span>}
            </div>
            
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span>Test 2: With Cookie + Token</span>
              {debugResult.cors ? (
                 <div className="text-right">
                    <span className={debugResult.cors.success ? "text-green-400" : "text-red-400 block"}>
                      {debugResult.cors.msg}
                    </span>
                 </div>
              ) : <span className="text-slate-500">Not run</span>}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
            <Clock size={120} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-medium mb-1 opacity-90">{t('dash.quickAttendance')}</h2>
            <p className="text-sm opacity-70 mb-8">{t('dash.attendanceDesc')}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleAttendance('in')}
                disabled={loading}
                className="flex-1 bg-white text-primary hover:bg-slate-100 font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <CheckCircle size={20} className="text-green-600" />
                <span>{t('dash.signIn')}</span>
              </button>
              <button
                onClick={() => handleAttendance('out')}
                disabled={loading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all backdrop-blur-sm"
              >
                <XCircle size={20} />
                <span>{t('dash.signOut')}</span>
              </button>
            </div>
            
            {statusMessage && (
              <div className="mt-4 p-2 bg-white/20 rounded-lg text-center text-sm animate-fade-in">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <h3 className="font-semibold text-slate-700 mb-4">{t('dash.myStatus')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                     <Calendar size={18} />
                   </div>
                   <span className="text-sm font-medium text-slate-700">{t('dash.daysWorked')}</span>
                </div>
                <span className="text-lg font-bold text-slate-800">18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                     <Coffee size={18} />
                   </div>
                   <span className="text-sm font-medium text-slate-700">{t('dash.leaveBalance')}</span>
                </div>
                <span className="text-lg font-bold text-slate-800">5.5</span>
              </div>
            </div>
        </div>
      </div>

      {/* Meeting Rooms */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin size={20} /> {t('dash.meetingRooms')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strict Render Guard: ensure meetingRooms is a valid array before mapping */}
          {!Array.isArray(meetingRooms) || meetingRooms.length === 0 ? (
             <div className="col-span-3 text-center py-8 text-secondary">{t('common.loading')} / {t('emp.noData')}</div>
          ) : (
            meetingRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-slate-700">{room.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'available' ? 'bg-green-100 text-green-700' : 
                    room.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {t(`dash.status.${room.status}`)}
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  {room.status === 'occupied' ? (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {room.nextMeeting || 'Busy'}
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1">
                       <CheckCircle size={14} /> {t('dash.status.available')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Quick View (Dummy) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800">{t('dash.teamMembers')}</h3>
          <button className="text-sm text-accent hover:underline">{t('dash.viewAll')}</button>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold">
               U{i}
             </div>
           ))}
           <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">
             +12
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;