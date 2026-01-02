import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from '../pages/Login';
import { BottomNav } from './BottomNav';
import { LogOut } from 'lucide-react';

export function Layout({ children }) {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  // Clone children to pass activeTab props if needed, or render specific component based on tab
  // For simplicity, let's assume App.jsx handles the routing/conditional rendering based on activeTab
  // But Layout is usually a wrapper. Let's make Layout receive the current tab content or handle it.
  
  // Better approach: Layout provides the shell, parent component manages state.
  // But here, I'll let Layout manage the tab state and pass it up or render children based on it?
  // Let's change the pattern: App.jsx uses Layout and passes the content.
  // Wait, the requirement is 3 tabs.
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Loan Book</h1>
          <p className="text-xs text-gray-500">Hi, {user.name}</p>
        </div>
        <button 
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {children(activeTab)}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
