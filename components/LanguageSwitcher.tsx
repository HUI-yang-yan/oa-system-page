import React from 'react';
import { useTranslation } from '../utils/i18n';
import { Globe } from 'lucide-react';

interface Props {
  className?: string;
}

const LanguageSwitcher: React.FC<Props> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all cursor-pointer select-none active:scale-95 ${className}`}
      title={language === 'en' ? "Switch to Chinese" : "切换到英文"}
    >
      <Globe size={18} className="text-accent" />
      <span>{language === 'en' ? 'English' : '中文'}</span>
    </button>
  );
};

export default LanguageSwitcher;