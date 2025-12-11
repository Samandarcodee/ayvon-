import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../services/db';
import { Settings, Save, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { sendTelegramMessage } from '../services/telegram';

export const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    telegramBotToken: '',
    telegramChatId: '',
    restaurantName: 'Restoran',
    id: 'config'
  });
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    if (data) {
      setSettings(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setIsSaved(false);
    setTestStatus('idle');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestMessage = async () => {
    setTestStatus('sending');
    const success = await sendTelegramMessage(`✅ <b>Sinov Xabari</b>\n\n${settings.restaurantName} tizimidan muvaffaqiyatli ulandi!`);
    setTestStatus(success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <Settings size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tizim Sozlamalari</h2>
          <p className="text-gray-500">Telegram integratsiyasi va umumiy sozlamalar</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-orange-500" />
            Umumiy Ma'lumotlar
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Muassasa nomi</label>
            <input
              type="text"
              name="restaurantName"
              placeholder="Masalan: Rayhon Milliy Taomlar"
              value={settings.restaurantName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
            />
          </div>
        </div>

        {/* Telegram Config */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Send size={20} className="text-blue-500" />
            Telegram Integratsiyasi
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-700 flex gap-3">
             <AlertCircle className="shrink-0" size={20} />
             <div>
               <p className="font-semibold mb-1">Botni qanday ulash mumkin?</p>
               <ul className="list-disc list-inside space-y-1 opacity-90">
                 <li>Telegramda <b>@BotFather</b> orqali yangi bot yarating va Tokenni oling.</li>
                 <li>Botingizga /start bosing.</li>
                 <li><b>@userinfobot</b> ga kiring va o'z ID raqamingizni oling.</li>
               </ul>
             </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bot Token</label>
              <input
                type="text"
                name="telegramBotToken"
                placeholder="123456789:AAH..."
                value={settings.telegramBotToken}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chat ID (Admin ID)</label>
              <input
                type="text"
                name="telegramChatId"
                placeholder="12345678"
                value={settings.telegramChatId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
             <button
                type="button"
                onClick={handleTestMessage}
                disabled={!settings.telegramBotToken || !settings.telegramChatId || testStatus === 'sending'}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    testStatus === 'success' ? 'bg-green-100 text-green-700' :
                    testStatus === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
             >
                {testStatus === 'sending' ? 'Yuborilmoqda...' : 
                 testStatus === 'success' ? 'Yuborildi!' :
                 testStatus === 'error' ? 'Xatolik!' : 'Sinov Xabari'}
             </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {isSaved ? 'Saqlandi!' : 'Sozlamalarni Saqlash'}
        </button>
      </form>
    </div>
  );
};
