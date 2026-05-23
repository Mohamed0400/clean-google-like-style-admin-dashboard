import { Globe, Smartphone, Monitor, Radio } from 'lucide-react';
import { ChannelStats, LiveGoldRates } from '../types';
import { useI18n } from '../i18n';

interface ChannelsViewProps {
  rates: LiveGoldRates;
  stats: ChannelStats;
}

export default function ChannelsView({ rates, stats }: ChannelsViewProps) {
  const { t } = useI18n();

  type ChannelRow = {
    id: string;
    label: string;
    icon: typeof Globe;
    users: number;
    usersLabel: string;
    todayVolumeGrams: number;
    todayTransactions: number;
  };

  const channels: ChannelRow[] = [
    {
      id: 'website',
      label: t('channels.website'),
      icon: Globe,
      users: stats.website.activeSessions,
      usersLabel: t('channelsPage.webSessions'),
      todayVolumeGrams: stats.website.todayVolumeGrams,
      todayTransactions: stats.website.todayTransactions,
    },
    {
      id: 'mobile',
      label: t('channels.mobile'),
      icon: Smartphone,
      users: stats.mobile_app.activeSessions,
      usersLabel: t('channelsPage.mobileUsers'),
      todayVolumeGrams: stats.mobile_app.todayVolumeGrams,
      todayTransactions: stats.mobile_app.todayTransactions,
    },
    {
      id: 'pos',
      label: t('channels.pos'),
      icon: Monitor,
      users: stats.pos.activeTerminals,
      usersLabel: t('channelsPage.registers'),
      todayVolumeGrams: stats.pos.todayVolumeGrams,
      todayTransactions: stats.pos.todayTransactions,
    },
  ];

  const totalVol =
    stats.website.todayVolumeGrams + stats.mobile_app.todayVolumeGrams + stats.pos.todayVolumeGrams || 1;

  return (
    <div className="space-y-6 animate-fade-in" id="channels-view">
      <header className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-950">{t('channelsPage.title')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('channelsPage.subtitle')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {channels.map(({ id, label, icon: Icon, users, usersLabel, todayVolumeGrams, todayTransactions }) => {
          const vol = todayVolumeGrams;
          const rev = vol * rates['24K'];
          const pct = (vol / totalVol) * 100;
          return (
            <div key={id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-amber-900/40 rounded-lg">
                  <Icon className="w-5 h-5 text-amber-500" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">{label}</h2>
                  <span className="text-[10px] text-emerald-400 font-mono uppercase">{t('channelsPage.collecting')}</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex justify-between">
                  <span>{t('channelsPage.shareVolume')}</span>
                  <span className="text-amber-400 font-mono font-bold">{pct.toFixed(0)}%</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('channelsPage.activeUsers', { label: usersLabel })}</span>
                  <span className="text-white font-mono">{users}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('channelsPage.txToday')}</span>
                  <span className="text-white font-mono">{todayTransactions}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('channelsPage.volumeToday')}</span>
                  <span className="text-white font-mono" dir="ltr">{vol.toLocaleString()}g</span>
                </li>
                <li className="flex justify-between border-t border-slate-800 pt-2">
                  <span>{t('channelsPage.revenueEst')}</span>
                  <span className="text-amber-400 font-mono font-bold" dir="ltr">${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </li>
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-x-auto">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('channelsPage.tracking')}</h2>
        <table className="w-full text-xs text-start">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="py-2 font-bold uppercase tracking-wider text-[10px]">{t('common.channel')}</th>
              <th className="py-2 text-end font-bold uppercase tracking-wider text-[10px]">{t('common.pct')}</th>
              <th className="py-2 text-end font-bold uppercase tracking-wider text-[10px]">{t('common.users')}</th>
              <th className="py-2 text-end font-bold uppercase tracking-wider text-[10px]">{t('common.transactions')}</th>
              <th className="py-2 text-end font-bold uppercase tracking-wider text-[10px]">{t('channelsPage.volumeG')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {channels.map(({ label, icon: Icon, users, todayVolumeGrams, todayTransactions }) => (
              <tr key={label} className="text-slate-700">
                <td className="py-3 flex items-center gap-2 font-semibold">
                  <Icon className="w-4 h-4 text-amber-600" />
                  {label}
                </td>
                <td className="py-3 text-end font-mono">{((todayVolumeGrams / totalVol) * 100).toFixed(0)}%</td>
                <td className="py-3 text-end font-mono">{users}</td>
                <td className="py-3 text-end font-mono">{todayTransactions}</td>
                <td className="py-3 text-end font-mono" dir="ltr">{todayVolumeGrams.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
