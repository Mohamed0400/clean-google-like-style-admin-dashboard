import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher, useI18n } from '../i18n';

export default function SettingsView() {
  const { t } = useI18n();
  const [notifyChannels, setNotifyChannels] = useState(true);
  const [autoTickRates, setAutoTickRates] = useState(true);
  const [darkExecutive, setDarkExecutive] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in" id="settings-view">
      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-700" />
            <div>
              <h1 className="text-xl font-bold text-slate-950">{t('settings.title')}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t('settings.subtitle')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-700" />
            {t('settings.notifications')}
          </h2>
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="text-slate-600">{t('settings.channelToasts')}</span>
            <input type="checkbox" checked={notifyChannels} onChange={(e) => setNotifyChannels(e.target.checked)} className="accent-amber-600 w-4 h-4" />
          </label>
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="text-slate-600">{t('settings.autoTick')}</span>
            <input type="checkbox" checked={autoTickRates} onChange={(e) => setAutoTickRates(e.target.checked)} className="accent-amber-600 w-4 h-4" />
          </label>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-700" />
            {t('settings.display')}
          </h2>
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="text-slate-600">{t('settings.darkExecutive')}</span>
            <input type="checkbox" checked={darkExecutive} onChange={(e) => setDarkExecutive(e.target.checked)} className="accent-amber-600 w-4 h-4" />
          </label>
          <p className="text-[11px] text-slate-500">{t('settings.displayNote')}</p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-amber-500" />
            {t('settings.integrations')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: t('settings.news'), status: t('settings.newsStatus'), icon: Globe },
              { name: t('settings.django'), status: t('settings.djangoStatus'), icon: Database },
              { name: t('settings.posApi'), status: t('settings.posStatus'), icon: Database },
            ].map((int) => (
              <div key={int.name} className="bg-stone-950 border border-stone-800 rounded-lg p-3">
                <int.icon className="w-4 h-4 text-amber-600 mb-2" />
                <p className="text-xs font-bold text-white">{int.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">{int.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">{t('settings.footer')}</div>
    </div>
  );
}
