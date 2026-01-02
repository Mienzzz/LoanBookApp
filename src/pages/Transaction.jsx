import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Calendar, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Transaction() {
  const { transactions, addTransaction, deleteTransaction } = useData();
  const { user, usersList } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  
  // Ambil semua user untuk opsi peminjam (termasuk admin)
  const availableUsers = usersList;
  const defaultUserId = availableUsers.length > 0 ? availableUsers[0].id : '';

  // Form State
  const [formData, setFormData] = useState({
    userId: defaultUserId, 
    amount: '',
    description: '',
    tempo: 12,
    category: 'Spaylater'
  });

  // Update default user ID if usersList loads later
  useEffect(() => {
    if (defaultUserId && !formData.userId) {
      setFormData(prev => ({ ...prev, userId: defaultUserId }));
    }
  }, [defaultUserId]);

  const isAdmin = user?.role === 'admin';

  // Filter Transactions
  // 1. Tempo > 0
  // 2. If not admin, only own transactions
  const activeTransactions = transactions.filter(t => {
    const isActive = t.tempo > 0;
    const isOwner = isAdmin ? true : t.userId === user.id;
    return isActive && isOwner;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    addTransaction({
      userId: formData.userId,
      amount: Number(formData.amount),
      description: formData.description,
      tempo: Number(formData.tempo),
      category: formData.category
    });
    
    setIsAdding(false);
    setFormData({
      userId: defaultUserId,
      amount: '',
      description: '',
      tempo: 12,
      category: 'Spaylater'
    });
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Daftar Tagihan Aktif</h2>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={16} />
            Tambah
          </button>
        )}
      </div>

      {/* Add Transaction Form (Admin Only) */}
      {isAdding && isAdmin && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-semibold mb-3 text-blue-800">Tambah Tagihan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Peminjam</label>
              <select
                value={formData.userId}
                onChange={e => setFormData({...formData, userId: e.target.value})}
                className="w-full rounded-md border-gray-300 border p-2 text-sm"
              >
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full rounded-md border-gray-300 border p-2 text-sm"
              >
                <option value="Spaylater">Spaylater</option>
                <option value="Kredivo">Kredivo</option>
                <option value="Traveloka">Traveloka</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full rounded-md border-gray-300 border p-2 text-sm"
                placeholder="Contoh: 1000000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border-gray-300 border p-2 text-sm"
                placeholder="Keperluan..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tempo (Bulan/Kali)</label>
              <input
                type="number"
                value={formData.tempo}
                onChange={e => setFormData({...formData, tempo: e.target.value})}
                className="w-full rounded-md border-gray-300 border p-2 text-sm"
                min="1"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {activeTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <p>Tidak ada tagihan aktif</p>
          </div>
        ) : (
          activeTransactions.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="mb-1">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                      {t.category || 'Loan'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{t.description}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Calendar size={12} />
                    <span>{t.date}</span>
                    {isAdmin && (
                      <>
                        <span className="mx-1">•</span>
                        <User size={12} />
                        <span>{usersList.find(u => u.id === t.userId)?.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-blue-600">{formatRupiah(t.amount)}</span>
                  <div className="flex items-center justify-end gap-1 text-xs font-medium text-orange-600 mt-0.5 bg-orange-50 px-2 py-0.5 rounded-full inline-flex">
                    <Clock size={12} />
                    <span>Sisa Tempo: {t.tempo}</span>
                  </div>
                </div>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    if (window.confirm('Hapus transaksi ini?')) deleteTransaction(t.id);
                  }}
                  className="absolute bottom-0 right-0 p-2 text-gray-300 hover:text-red-500 bg-gray-50 rounded-tl-xl"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
