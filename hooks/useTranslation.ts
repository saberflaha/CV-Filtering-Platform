
import { useStorage } from './useStorage';
import { translations } from '../locales/translations';

export const useTranslation = () => {
  const { language } = useStorage();
  
  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path; // Fallback to path name if not found
      }
    }
    
    return result;
  };

  return { t, language };
};
