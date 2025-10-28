import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link to="/" className="brand">Sports Calendar</Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;