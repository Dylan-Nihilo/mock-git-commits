import enMessages from '../../messages/en.json';
import zhMessages from '../../messages/zh.json';

export type Namespace = 'common' | 'nav' | 'landing' | 'generator' | 'alerts' | 'commits' | 'footer';

type MessageObject = Record<string, unknown>;

const messages: Record<string, MessageObject> = {
  en: enMessages,
  zh: zhMessages,
};

function getValue(obj: MessageObject, path: string): string {
  const result = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

export function getCurrentLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const path = window.location.pathname;
  const match = path.match(/^\/([a-z]{2})\//);
  return (match && (match[1] === 'zh' || match[1] === 'en')) ? match[1] : 'en';
}

export function useTranslations(namespace?: string) {
  const locale = getCurrentLocale();
  const localeMessages = messages[locale] || messages.en;
  
  const t = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return getValue(localeMessages, fullKey);
  };
  return t;
}

export function getBrowserLocale() {
  const browserLocale = typeof window !== 'undefined' && window.navigator ? window.navigator.language.toLowerCase() : 'en';
  return browserLocale.startsWith('zh') ? 'zh' : 'en';
}