import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingDown, AlertCircle, CheckCircle2, User } from 'lucide-react';

export function Dashboard() {
  const { transactions, processPaymentCycle } = useData();
  const { user, usersList } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  // Calculate Summary
  // Admin sees all broken down by user, User sees own total
  const activeTransactions = transactions.filter(t => t.tempo > 0);

  // Group by user for Admin
  const userTotals = usersList
    //.filter(u => u.role !== 'admin') // Include admin as requested
    .map(u => {
      const userTrans = activeTransactions.filter(t => t.userId === u.id);
      const total = userTrans.reduce((sum, t) => sum + t.amount, 0);
      return {
        ...u,
        totalDebt: total,
        count: userTrans.length
      };
    });

  // Calculate Grand Total or Personal Total
  const totalDebt = isAdmin 
    ? activeTransactions.reduce((sum, t) => sum + t.amount, 0)
    : activeTransactions.filter(t => t.userId === user.id).reduce((sum, t) => sum + t.amount, 0);
    
  const activeCount = isAdmin 
    ? activeTransactions.length
    : activeTransactions.filter(t => t.userId === user.id).length;
  
  // Find transactions that will finish if payment happens
  const finishingSoonCount = activeTransactions.filter(t => t.tempo === 1).length;

  const handlePayment = () => {
    if (window.confirm('Apakah Anda yakin ingin melakukan pembayaran? Tempo semua tagihan aktif akan berkurang 1.')) {
      processPaymentCycle();
      alert('Pembayaran berhasil dicatat. Tempo tagihan telah diperbarui.');
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium">
              {isAdmin ? 'Total Seluruh Pinjaman' : 'Total Pinjaman Saya'}
            </p>
            <h2 className="text-3xl font-bold">{formatRupiah(totalDebt)}</h2>
          </div>
        </div>
        <div className="flex items-center justify-between text-blue-100 text-sm border-t border-white/20 pt-3">
          <span>Jumlah Transaksi</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold">{activeCount}</span>
        </div>
      </div>

      {/* Admin: Breakdown per User */}
      {isAdmin && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Rincian Per User</h3>
          <div className="grid gap-3">
            {userTotals.map((u) => (
              <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.count} transaksi aktif</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatRupiah(u.totalDebt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Action */}
      {isAdmin && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mt-6">
          
          {finishingSoonCount > 0 && (
            <div className="mb-4 flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Ada <strong>{finishingSoonCount} tagihan</strong> yang akan lunas (tempo jadi 0) jika pembayaran dilakukan.
              </p>
            </div>
          )}

          <button
            onClick={handlePayment}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95"
          >
            <TrendingDown size={20} />
            Bayar Tagihan Periode Ini
          </button>
        </div>
      )}

      {/* Info Card User */}
      {!isAdmin && activeCount > 0 && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
          <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-orange-800 text-sm">Info Tagihan</h4>
            <p className="text-orange-700 text-xs mt-1">
              Mohon lakukan pembayaran sesuai jadwal. Hubungi admin jika ada kendala pembayaran.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
