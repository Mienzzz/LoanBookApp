import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

const INITIAL_TRANSACTIONS = [
  { id: 1, userId: 'user1', amount: 500000, description: 'Pinjaman Awal', tempo: 5, date: '2024-01-01', category: 'Spaylater' },
  { id: 2, userId: 'user2', amount: 1000000, description: 'Modal Usaha', tempo: 10, date: '2024-01-05', category: 'Kredivo' },
  { id: 3, userId: 'user1', amount: 200000, description: 'Tambahan', tempo: 2, date: '2024-01-10', category: 'Traveloka' },
];

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('loan_book_data');
    if (storedData) {
      setTransactions(JSON.parse(storedData));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('loan_book_data', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    const storedHistory = localStorage.getItem('loan_book_history');
    if (storedHistory) {
      setPaymentHistory(JSON.parse(storedHistory));
    }

    setLoading(false);
  }, []);

  const saveToStorage = (newData) => {
    setTransactions(newData);
    localStorage.setItem('loan_book_data', JSON.stringify(newData));
  };

  const saveHistory = (newHistory) => {
    setPaymentHistory(newHistory);
    localStorage.setItem('loan_book_history', JSON.stringify(newHistory));
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    saveToStorage([...transactions, newTransaction]);
  };

  const deleteTransaction = (id) => {
    saveToStorage(transactions.filter(t => t.id !== id));
  };

  // Fungsi khusus Admin: Bayar (Kurangi Tempo Semua) & Catat History
  const processPaymentCycle = () => {
    const today = new Date();
    const monthYear = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const paymentDate = today.toISOString().split('T')[0];

    // Simpan history pembayaran periode ini
    const affectedTransactions = transactions.filter(t => t.tempo > 0);
    const newHistoryEntry = {
      id: Date.now(),
      date: paymentDate,
      period: monthYear,
      totalTransactions: affectedTransactions.length,
      details: affectedTransactions.map(t => ({
        transactionId: t.id,
        userId: t.userId,
        amount: t.amount,
        prevTempo: t.tempo,
        newTempo: t.tempo - 1
      }))
    };

    saveHistory([newHistoryEntry, ...paymentHistory]);

    // Update tempo
    const updatedTransactions = transactions.map(t => {
      if (t.tempo > 0) {
        return { ...t, tempo: t.tempo - 1 };
      }
      return t;
    });
    saveToStorage(updatedTransactions);
  };

  return (
    <DataContext.Provider value={{ 
      transactions, 
      paymentHistory,
      addTransaction, 
      deleteTransaction, 
      processPaymentCycle,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
