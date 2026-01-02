import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transaction } from './pages/Transaction';
import { Report } from './pages/Report';

function AppContent() {
  return (
    <Layout>
      {(activeTab) => {
        switch (activeTab) {
          case 'dashboard':
            return <Dashboard />;
          case 'transaction':
            return <Transaction />;
          case 'report':
            return <Report />;
          default:
            return <Dashboard />;
        }
      }}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
