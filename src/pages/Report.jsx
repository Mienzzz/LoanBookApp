import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, SearchX, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function Report() {
  const { transactions, paymentHistory } = useData();
  const { user, usersList } = useAuth();
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'completed'
  
  const isAdmin = user?.role === 'admin';

  // 1. Completed Transactions (Tempo === 0)
  const completedTransactions = transactions.filter(t => {
    const isCompleted = t.tempo === 0;
    const isOwner = isAdmin ? true : t.userId === user.id;
    return isCompleted && isOwner;
  });

  // 2. Payment History (Filtered for User)
  const filteredHistory = paymentHistory.map(h => {
    // For admin, show all details. For user, filter details to only show their own.
    const userDetails = isAdmin 
      ? h.details 
      : h.details.filter(d => d.userId === user.id);
      
    return {
      ...h,
      details: userDetails,
      totalTransactions: isAdmin ? h.totalTransactions : userDetails.length
    };
  }).filter(h => h.details.length > 0); // Only show history where user was involved

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const toggleHistory = (id) => {
    if (expandedHistory === id) {
      setExpandedHistory(null);
    } else {
      setExpandedHistory(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'history' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Riwayat Pembayaran
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'completed' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Tagihan Lunas
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar size={48} className="mb-2 opacity-50" />
              <p>Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            filteredHistory.map((h) => (
              <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => toggleHistory(h.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{h.period}</p>
                      <p className="text-xs text-gray-500">{h.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                      {h.totalTransactions} Transaksi
                    </span>
                    {expandedHistory === h.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                
                {expandedHistory === h.id && (
                  <div className="p-4 border-t border-gray-100 bg-white space-y-3 animate-in slide-in-from-top-2">
                    {h.details.map((d, index) => {
                      const trans = transactions.find(t => t.id === d.transactionId);
                      const userName = usersList.find(u => u.id === d.userId)?.name;
                      
                      return (
                        <div key={index} className="flex justify-between items-center text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                          <div>
                            <p className="font-medium text-gray-800">{trans?.description || 'Transaksi dihapus'}</p>
                            {isAdmin && <p className="text-xs text-gray-500">{userName}</p>}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <span className="text-gray-400">Tempo: {d.prevTempo}</span>
                              <span className="text-gray-300">→</span>
                              <span className="text-blue-600 font-bold">{d.newTempo}</span>
                            </div>
                            <p className="text-xs text-gray-500">{formatRupiah(d.amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <SearchX size={48} className="mb-2 opacity-50" />
              <p>Belum ada data pelunasan</p>
            </div>
          ) : (
            completedTransactions.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle2 className="text-green-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 line-through decoration-gray-400">{t.description}</h3>
                      <span className="font-bold text-gray-600 text-sm">{formatRupiah(t.amount)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      <span>Mulai: {t.date}</span>
                      {isAdmin && (
                        <span className="bg-gray-100 px-1.5 rounded text-gray-600">
                          {usersList.find(u => u.id === t.userId)?.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      LUNAS
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
