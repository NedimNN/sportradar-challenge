import React from 'react';
import Calendar from '../components/calendar/calendar';

const Home = () => {
  return (
    <div className="container">
      <h1 style={{ color: 'var(--texttitle)', textAlign: 'center' }}>Calendar</h1>
      <Calendar />
    </div>
  );
};

export default Home;
