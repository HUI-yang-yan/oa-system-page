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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-sm text-sm font-medium text-slate-600 hover:text-primary hover:border-primary transition-all ${className}`}
      title="Switch Language"
    >
      <Globe size={16} />
      <span>{language === 'en' ? 'EN' : '中文'}</span>
    </button>
  );
};

export default LanguageSwitcher;