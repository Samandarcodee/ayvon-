import React, { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { getReservations, addReservation, deleteReservation, updateReservationStatus } from '../services/db';
import { sendReservationNotification } from '../services/telegram';
import { Plus, Calendar, User, Phone, Users, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const ReservationSection: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRes, setNewRes] = useState<Reservation>({
    customerName: '',
    phone: '',
    tableNumber: 1,
    guests: 2,
    date: new Date().toISOString().slice(0, 16),
    status: 'pending'
  });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    const data = await getReservations();
    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReservations(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReservation(newRes);
    
    // Send Telegram Notification
    sendReservationNotification(newRes);

    setIsModalOpen(false);
    setNewRes({
      customerName: '',
      phone: '',
      tableNumber: 1,
      guests: 2,
      date: new Date().toISOString().slice(0, 16),
      status: 'pending'
    });
    loadReservations();
  };

  const handleStatusChange = async (id: number, status: Reservation['status']) => {
    await updateReservationStatus(id, status);
    loadReservations();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bronni o'chirmoqchimisiz?")) {
      await deleteReservation(id);
      loadReservations();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Tasdiqlangan';
      case 'completed': return 'Yakunlangan';
      case 'cancelled': return 'Bekor qilingan';
      default: return 'Kutilmoqda';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stol Bron Qilish</h2>
          <p className="text-gray-500">Mijozlar uchun stollarni boshqarish</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Yangi bron
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Mijoz</th>
                <th className="px-6 py-4">Vaqt</th>
                <th className="px-6 py-4">Stol / Mehmonlar</th>
                <th className="px-6 py-4">Holat</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{res.customerName}</div>
                    <div className="text-sm text-gray-500">{res.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-orange-500" />
                      {new Date(res.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={16} className="text-gray-400" />
                      {new Date(res.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-medium text-gray-900">Stol: {res.tableNumber}</div>
                     <div className="text-sm text-gray-500">{res.guests} kishi</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
                      {getStatusText(res.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {res.status === 'pending' && (
                        <button 
                          onClick={() => res.id && handleStatusChange(res.id, 'confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" 
                          title="Tasdiqlash"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                         <button 
                           onClick={() => res.id && handleStatusChange(res.id, 'cancelled')}
                           className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                           title="Bekor qilish"
                         >
                           <XCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => res.id && handleDelete(res.id)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                        title="O'chirib tashlash"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Hozircha bronlar yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-fade-in-up shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-2xl font-bold text-gray-900">Stol bron qilish</h3>
                  <p className="text-gray-500 text-sm mt-1">Yangi buyurtma ma'lumotlari</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                 <XCircle size={24} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mijoz ismi</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-orange-500" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="Ismni kiriting"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900 placeholder-gray-400"
                    value={newRes.customerName}
                    onChange={e => setNewRes({...newRes, customerName: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon raqam</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-orange-500" size={20} />
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900 placeholder-gray-400"
                    value={newRes.phone}
                    onChange={e => setNewRes({...newRes, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stol raqami</label>
                   <input
                     type="number"
                     min="1"
                     required
                     className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
                     value={newRes.tableNumber}
                     onChange={e => setNewRes({...newRes, tableNumber: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mehmonlar</label>
                   <div className="relative">
                     <Users className="absolute left-4 top-3.5 text-orange-500" size={20} />
                     <input
                       type="number"
                       min="1"
                       required
                       className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
                       value={newRes.guests}
                       onChange={e => setNewRes({...newRes, guests: Number(e.target.value)})}
                     />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vaqt</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-orange-500" size={20} />
                    <input
                    type="datetime-local"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
                    value={newRes.date}
                    onChange={e => setNewRes({...newRes, date: e.target.value})}
                    />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all font-bold text-lg"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
