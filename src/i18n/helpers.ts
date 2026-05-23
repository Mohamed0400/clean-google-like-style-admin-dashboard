import type { ActivityLog } from '../types';

export function translateLogType(t: (k: string) => string, type: ActivityLog['type']) {
  const key = `logType.${type}`;
  const v = t(key);
  return v === key ? type.replace('_', ' ') : v;
}

export function translateSource(
  t: (k: string) => string,
  source: ActivityLog['source']
): string {
  if (source === 'website') return t('channels.webSite');
  if (source === 'mobile_app') return t('channels.mobile');
  return t('channels.posInShop');
}

export function translateCategory(t: (k: string) => string, category: string) {
  const map: Record<string, string> = {
    'Gold Bars': 'categories.goldBars',
    'Estate Jewelry': 'categories.estate',
    'Spot Web Gold': 'categories.spotWeb',
    'Limit Web Gold': 'categories.limitWeb',
  };
  const key = map[category];
  return key ? t(key) : category;
}
