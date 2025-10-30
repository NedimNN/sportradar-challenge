import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/layout';
import Home from '../pages/Home';
import EventDetails from '../pages/EventDetails';
import AddEvent from '../pages/AddEvent';

const AppRouter = () => (
	<Routes>
		<Route path="/" element={<MainLayout />}>
			<Route index element={<Home />} />
			<Route path="*" element={<Home />} />
			<Route path="/event/:id" element={<EventDetails />} />
			<Route path="/add-event" element={<AddEvent />} />
		</Route>
	</Routes>
);

export default AppRouter;
