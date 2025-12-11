import { getSettings } from './db';
import { Reservation, Expense } from '../types';

const formatCurrency = (amount: number) => {
  return amount.toLocaleString() + " so'm";
};

export const sendTelegramMessage = async (text: string): Promise<boolean> => {
  try {
    // Only send if online
    if (!navigator.onLine) {
        console.log('Ofline rejim: Telegram xabari yuborilmadi');
        return false;
    }

    const settings = await getSettings();
    
    if (!settings || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log('Telegram sozlamalari mavjud emas');
      return false;
    }

    const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Telegramga yuborishda xatolik:', error);
    return false;
  }
};

export const sendReservationNotification = async (res: Reservation) => {
  const dateObj = new Date(res.date);
  const date = dateObj.toLocaleDateString('uz-UZ');
  const time = dateObj.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  const message = `
🍽 <b>Yangi Stol Buyurtmasi!</b>

👤 <b>Mijoz:</b> ${res.customerName}
📞 <b>Tel:</b> ${res.phone}
🪑 <b>Stol:</b> ${res.tableNumber}-stol
👥 <b>Mehmonlar:</b> ${res.guests} kishi
📅 <b>Sana:</b> ${date}
⏰ <b>Vaqt:</b> ${time}

<i>Ilovadan yuborildi</i>
  `;
  
  await sendTelegramMessage(message);
};

export const sendExpenseNotification = async (exp: Expense) => {
  const message = `
💸 <b>Yangi Chiqim!</b>

💰 <b>Summa:</b> ${formatCurrency(exp.amount)}
📦 <b>Nomi:</b> ${exp.title}
🏷 <b>Kategoriya:</b> ${exp.category}
📅 <b>Sana:</b> ${exp.date}

<i>Ilovadan yuborildi</i>
  `;

  await sendTelegramMessage(message);
};
