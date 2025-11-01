import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventsProvider } from '../context/EventsContext';
import AppRouter from '../routers/router';

test('app router renders without crashing', () => {
  const { container } = render(
    <MemoryRouter>
      <EventsProvider>
        <AppRouter />
      </EventsProvider>
    </MemoryRouter>
  );
  expect(container).toBeTruthy();
});
