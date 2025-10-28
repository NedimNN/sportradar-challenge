import React from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';
import { Outlet } from 'react-router-dom';
import '../../App.css';

const MainLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
