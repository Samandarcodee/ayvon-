import React, { useState } from 'react';
import { LayoutGrid, CalendarDays, Wallet, ChefHat, Settings } from 'lucide-react';
import { ViewState } from './types';
import { ReservationSection } from './components/ReservationSection';
import { ExpenseSection } from './components/ExpenseSection';
import { SettingsSection } from './components/SettingsSection';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('reservations');

  const renderContent = () => {
    switch (currentView) {
      case 'reservations':
        return <ReservationSection />;
      case 'expenses':
        return <ExpenseSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <ReservationSection />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view
          ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <ChefHat size={24} />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-lg text-gray-900">RestoManager</h1>
            <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="reservations" icon={CalendarDays} label="Bron qilish" />
          <NavItem view="expenses" icon={Wallet} label="Chiqimlar" />
          <NavItem view="settings" icon={Settings} label="Sozlamalar" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Onlayn (IndexedDB)
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-20 px-4 py-3 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white">
                <ChefHat size={18} />
            </div>
            <span className="font-bold">RestoManager</span>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-20">
        <button 
          onClick={() => setCurrentView('reservations')}
          className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'reservations' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <CalendarDays size={20} />
          <span className="text-xs mt-1">Bron</span>
        </button>
        <button 
          onClick={() => setCurrentView('expenses')}
          className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'expenses' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <Wallet size={20} />
          <span className="text-xs mt-1">Chiqim</span>
        </button>
        <button 
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'settings' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Sozlama</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
