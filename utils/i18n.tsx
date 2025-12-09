import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Common
    'app.name': 'Enterprise OA System',
    'app.copyright': 'Enterprise System v1.0 © 2024',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.networkError': 'Network Error',
    'common.actions': 'Actions',
    'common.search': 'Search',
    'common.filter': 'Filter',
    
    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.subtitle': 'Sign in to the OA System',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.remember': 'Remember me',
    'auth.forgot': 'Forgot password?',
    'auth.signin': 'Sign In',
    'auth.signing': 'Signing in...',
    'auth.signout': 'Sign Out',
    'auth.loginFailed': 'Login failed',
    
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.leave': 'Leave Management',
    'nav.profile': 'Profile',
    
    // Dashboard
    'dash.welcome': 'Welcome back',
    'dash.issues': 'Network Issues?',
    'dash.hideIssues': 'Hide Network Diagnostics',
    'dash.quickAttendance': 'Quick Attendance',
    'dash.attendanceDesc': 'Record your daily work hours.',
    'dash.signIn': 'Sign In',
    'dash.signOut': 'Sign Out',
    'dash.myStatus': 'My Status',
    'dash.daysWorked': 'Days Worked',
    'dash.leaveBalance': 'Leave Balance',
    'dash.meetingRooms': 'Meeting Rooms',
    'dash.teamMembers': 'Team Members',
    'dash.viewAll': 'View All',
    'dash.backendOffline': 'Backend Connection Failed',
    'dash.mockMode': 'The application is running in Mock Mode.',
    'dash.status.available': 'Available',
    'dash.status.occupied': 'Occupied',
    'dash.status.maintenance': 'Maintenance',
    
    // Employee List
    'emp.title': 'Employee Management',
    'emp.subtitle': 'View and manage company staff.',
    'emp.add': '+ Add Employee',
    'emp.searchPlaceholder': 'Search by name or ID...',
    'emp.table.employee': 'Employee',
    'emp.table.dept': 'Department',
    'emp.table.contact': 'Contact',
    'emp.table.status': 'Status',
    'emp.status.active': 'Active',
    'emp.status.leave': 'On Leave',
    'emp.status.inactive': 'Inactive',
    'emp.noData': 'No employees found.',
    
    // Leave
    'leave.title': 'Leave Management',
    'leave.subtitle': 'Apply for leave or check approval status.',
    'leave.tab.apply': 'Apply for Leave',
    'leave.tab.history': 'Approval History',
    'leave.newApp': 'New Application',
    'leave.type': 'Leave Type',
    'leave.startDate': 'Start Date',
    'leave.endDate': 'End Date',
    'leave.reason': 'Reason',
    'leave.submit': 'Submit Application',
    'leave.submitting': 'Submitting...',
    'leave.reasonPlaceholder': 'Please describe the reason for your leave...',
    'leave.success': 'Leave application submitted successfully.',
    'leave.historyEmpty': 'No leave history found',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information and account settings.',
    'profile.contactInfo': 'Contact Info',
    'profile.security': 'Security Settings',
    'profile.currentPass': 'Current Password',
    'profile.newPass': 'New Password',
    'profile.confirmPass': 'Confirm New Password',
    'profile.updatePass': 'Update Password',
  },
  zh: {
    // Common
    'app.name': '企业 OA 系统',
    'app.copyright': '企业系统 v1.0 © 2024',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',
    'common.networkError': '网络错误',
    'common.actions': '操作',
    'common.search': '搜索',
    'common.filter': '筛选',
    
    // Auth
    'auth.welcome': '欢迎回来',
    'auth.subtitle': '登录您的 OA 账户',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.remember': '记住我',
    'auth.forgot': '忘记密码?',
    'auth.signin': '登录',
    'auth.signing': '登录中...',
    'auth.signout': '退出登录',
    'auth.loginFailed': '登录失败',
    
    // Nav
    'nav.dashboard': '工作台',
    'nav.employees': '员工管理',
    'nav.leave': '请假管理',
    'nav.profile': '个人中心',
    
    // Dashboard
    'dash.welcome': '欢迎回来',
    'dash.issues': '网络问题?',
    'dash.hideIssues': '隐藏诊断信息',
    'dash.quickAttendance': '快速考勤',
    'dash.attendanceDesc': '记录您的每日工时',
    'dash.signIn': '签到',
    'dash.signOut': '签退',
    'dash.myStatus': '我的状态',
    'dash.daysWorked': '出勤天数',
    'dash.leaveBalance': '剩余假期',
    'dash.meetingRooms': '会议室状态',
    'dash.teamMembers': '团队成员',
    'dash.viewAll': '查看全部',
    'dash.backendOffline': '后端连接失败',
    'dash.mockMode': '系统正在运行于演示模式 (Mock Mode)。',
    'dash.status.available': '空闲',
    'dash.status.occupied': '使用中',
    'dash.status.maintenance': '维护中',
    
    // Employee List
    'emp.title': '员工管理',
    'emp.subtitle': '查看和管理公司员工信息',
    'emp.add': '+ 新增员工',
    'emp.searchPlaceholder': '按姓名或 ID 搜索...',
    'emp.table.employee': '员工',
    'emp.table.dept': '部门',
    'emp.table.contact': '联系方式',
    'emp.table.status': '状态',
    'emp.status.active': '在职',
    'emp.status.leave': '休假中',
    'emp.status.inactive': '离职',
    'emp.noData': '未找到员工',
    
    // Leave
    'leave.title': '请假管理',
    'leave.subtitle': '申请假期或查看审批进度',
    'leave.tab.apply': '请假申请',
    'leave.tab.history': '审批历史',
    'leave.newApp': '新建申请',
    'leave.type': '请假类型',
    'leave.startDate': '开始日期',
    'leave.endDate': '结束日期',
    'leave.reason': '事由',
    'leave.submit': '提交申请',
    'leave.submitting': '提交中...',
    'leave.reasonPlaceholder': '请描述您的请假事由...',
    'leave.success': '请假申请提交成功',
    'leave.historyEmpty': '暂无请假记录',
    
    // Profile
    'profile.title': '个人中心',
    'profile.subtitle': '管理您的个人信息和账户设置',
    'profile.contactInfo': '联系信息',
    'profile.security': '安全设置',
    'profile.currentPass': '当前密码',
    'profile.newPass': '新密码',
    'profile.confirmPass': '确认新密码',
    'profile.updatePass': '更新密码',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh'); // Default to Chinese

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    return (dict as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};