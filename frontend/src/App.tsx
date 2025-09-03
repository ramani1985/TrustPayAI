import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import TransactionsPage from '@/pages/TransactionsPage';
import HealthPage from '@/pages/HealthPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/health" element={<HealthPage />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
