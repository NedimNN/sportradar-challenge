# Sports Event Calendar (Sportradar Challenge)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)
- [Testing](#testing)

## Overview

This application is a sports event calendar that allows users to:
- View sports events in a monthly calendar grid
- Navigate between months to see past and future events
- Add new sports events
- View detailed information about events
- Persist user-added events using browser localStorage
- Responsive design that works on desktop and mobile devices

## Features

### Calendar View
- **Monthly Grid Layout**: Calendar, showing events organized by date
- **Event Indicators**: Visual dots indicate days with events
- **Event Preview**: Desktop users can see event details directly on the calendar
- **Mobile Modal**: Mobile users get a dedicated modal for viewing events on selected days
- **Month Navigation**: Navigate between months using buttons

### Event Management
- **Add Events**: Form for creating new sports events with:
  - Basic information (season, sport, status, stadium)
  - Date and time (UTC) selection
  - Home and away team details
  - Competition and stage information
  - Result entry (for past events marked as "played")
- **Event Details Page**: Dedicated page showing all event information
- **Data Persistence**: User-added events are stored in localStorage and persist across sessions

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Touch-optimized interactions for mobile devices
- Adaptive layouts for different screen sizes

## Technology Stack

- **React** (v19.2.0) - UI library
- **React Router DOM** (v6.30.1) - Client-side routing
- **React Context API** - State management
- **localStorage** - Client-side data persistence
- **Remix Icon** (v4.3.0) - Icon library
- **Create React App** - Build tooling and development environment
- **Jest & React Testing Library** - Testing framework

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (v6 or higher) or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NedimNN/sportradar-challenge.git
   cd sportradar-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   
   The application will automatically open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

#### `npm start`
Runs the app in development mode with hot reloading enabled.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run build`
Builds the app for production to the `build` folder. The build is optimized and minified.

#### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App to give you full control over configuration files.

## Usage

### Viewing Events
1. Navigate to the home page to see the calendar
2. Events are displayed as chips within calendar days
3. Click on event names (desktop) or days (mobile) to view details
4. Use arrow buttons to navigate between months

### Adding a New Event
1. Click the "Add Event" button in the header
2. Fill in the event details:
   - **Required fields**: Sport name, date, and time
   - **Team information**: Enter official names and country codes (three letter codes)
   - **Status**: Choose from scheduled, played, postponed, or canceled
   - **Results**: Only available for past events with "played" status
3. Click "Save" to create the event
4. You'll be redirected to the event details page

## Project Structure

```
sportradar-challenge/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── calendar/    # Calendar component and styles
│   │   ├── header/      # Header navigation
│   │   ├── footer/      # Footer component
│   │   └── layout/      # Layout wrapper
│   ├── context/         # React Context providers
│   │   └── EventsContext.jsx  # Event state management
│   ├── data/            # Initial event data
│   │   └── data.json    # Seed data for events
│   ├── pages/           # Page components
│   │   ├── Home.jsx     # Calendar page
│   │   ├── AddEvent.jsx # Event creation form
│   │   └── EventDetails.jsx # Event details view
│   ├── routers/         # Application routing
│   │   └── router.js    # Route configuration
│   ├── tests/           # Test files
│   ├── App.js           # Root component
│   └── index.js         # Application entry point
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Assumptions and Design Decisions

### Data Management
- **Initial Data**: Events are loaded from `data.json` on first render
- **User Events**: New events created by users are stored separately in localStorage under the key `userEvents`
- **Data Merging**: On app initialization, both seed data and user-added events are merged into a single event list
- **ID Generation**: Each event receives a unique ID combining timestamp and random string

### Date and Time Handling
- **UTC Time**: All times are stored and expected in UTC format
- **Date Format**: Dates use ISO format (YYYY-MM-DD) for consistency
- **Result Validation**: Results can only be entered for events with:
  - Status set to "played"
  - Date/time combination that is in the past (compared to current UTC time)

### UI/UX Decisions
- **Responsive Breakpoint**: Mobile view activates at 640px width
- **Event Display Limit**: Desktop calendar shows up to 3 events per day with "+X more" indicator
- **Auto-slug Generation**: Team slugs are automatically generated from official names (spaces → dashes, lowercase)
- **Calendar Grid**: Always shows 6 weeks (42 days) to maintain consistent height

### Form Validation
- **Required Fields**: Only essential fields (sport, date, time, team names) are marked as required
- **Optional Fields**: Stadium, group, and other metadata are optional for flexibility
- **Conditional Fields**: Result section only appears when status is "played" AND event is in the past

### Navigation
- **Client-side Routing**: React Router handles all navigation without page reloads
- **Automatic Redirection**: After creating an event, users are redirected to the event details page
- **Back Navigation**: Cancel buttons use `navigate(-1)` for intuitive back behavior

### Styling Approach
- **CSS Variables**: Color scheme uses CSS custom properties for consistency
- **Component-scoped CSS**: Each component has its own CSS file
- **Responsive Grid**: Calendar uses CSS Grid for flexible layouts

### Testing Strategy
- **Component Tests**: Key components (Calendar, AddEvent) have dedicated test files
- **React Testing Library**: Tests focus on user behavior rather than implementation
- **Test Coverage**: Critical user flows and edge cases are prioritized

## Testing

Run the test suite with:

```bash
npm test
```

Tests cover:
- Calendar rendering and month navigation
- Event creation form validation
- Component integration
- User interaction flows

## License

This project is licensed under the terms specified in [LICENSE.txt](LICENSE.txt).

---

**Thanks Sportradar**

**Last but not least, I really enjoyed making this calendar**
