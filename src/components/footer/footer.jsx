import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <small>© {new Date().getFullYear()} Sports Calendar • Built for the Sportradar challenge</small>
      </div>
    </footer>
  );
};

export default Footer;