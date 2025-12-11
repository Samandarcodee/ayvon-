export interface Reservation {
  id?: number;
  customerName: string;
  phone: string;
  tableNumber: number;
  guests: number;
  date: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO string
}

export interface AppSettings {
  id?: string; // usually 'config'
  telegramBotToken: string;
  telegramChatId: string;
  restaurantName: string;
}

export type ViewState = 'reservations' | 'expenses' | 'settings';
