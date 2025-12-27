import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Languages } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-35">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-sm">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
