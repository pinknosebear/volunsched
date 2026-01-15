# Volunteer Scheduling System

A rules-driven volunteer shift coordination platform designed to automate and improve manual scheduling processes. The system enforces scheduling rules at sign-up, automates reminders and acknowledgments, and provides coordinators with visibility tools and substitute-finding workflows.

## Project Overview

This system replaces manual coordination (WhatsApp groups and Google Sheets) with an automated platform that:

- **Enforces Scheduling Rules**: Validates volunteer signups against defined constraints at the point of sign-up
- **Automates Communications**: Sends reminders, confirmations, and notifications via WhatsApp
- **Tracks Reliability**: Maintains and uses volunteer reliability scores for scheduling decisions
- **Provides Coordinator Tools**: Dashboards and workflows for shift visibility and substitute management

## Architecture

### Core Entities

- **Volunteers**: ID, name, contact information, and reliability scores
- **Shifts**: Date, day name, week of month, and capacity information
- **Signups**: Volunteer-to-shift assignments with validation status

### System Design

- **Rules-Driven Validation**: Constraints enforced at sign-up time
- **Event-Driven Automation**: Triggers for reminders, confirmations, and notifications
- **Multi-Channel Integration**: Google Sheets (data), Flask API (backend), React (frontend), Twilio/WhatsApp (communication)
- **Coordinator Tools**: Dashboards and substitute-finding workflows

## Technology Stack

### Current Implementation (Phase 1)

- **Backend**: Flask (Python)
- **Frontend**: React + Vite
- **Database**: SQLite (development)
- **Communication**: Twilio/WhatsApp
- **Data Storage**: Google Sheets integration

### Planned Phases

- **Phase 2**: AppSheet low-code UI prototype
- **Phase 3**: Production-grade scalable deployment

## Repository Structure

```
/backend/                  - Flask API server
  /app/
    /models/              - Data models (Volunteer, Shift, Signup)
    /routes/              - API endpoints
    /services/            - Business logic and validation
  requirements.txt        - Python dependencies
  run.py                  - Entry point

/frontend/                - React application
  /src/
    /pages/               - Page components
    /context/             - React context for state management
    /services/            - API client services
  package.json            - Node dependencies
  vite.config.js          - Vite configuration

/SETUP.md                 - Development setup guide
/IMPLEMENTATION_STATUS.md - Current implementation status
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip and npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Run the server:
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Features

### Volunteer Interface

- Sign up for available shifts
- View personal schedule and reliability score
- Receive shift reminders and confirmations
- Update availability status

### Coordinator Interface

- View all shifts and current signups
- Monitor shift capacity and gaps
- Access reliability scores for volunteers
- Initiate substitute-finding workflows
- Send communications to volunteers

### Scheduling Rules

The system validates signups against configurable rules:

- Maximum shifts per volunteer per week
- Volunteer reliability thresholds
- Shift capacity limits
- Time-off and availability constraints

## Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ES6+ conventions

### Contributing

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Push to your branch
4. Create a pull request with a description of changes

## Documentation

- `SETUP.md` - Detailed setup and configuration instructions
- `IMPLEMENTATION_STATUS.md` - Current feature implementation status
- API documentation available at `/backend/docs` (when running the server)

## Key Design Decisions

1. **Phased Implementation**: Start with core validation logic, then expand to UI and production infrastructure
2. **Rules Enforcement at Entry**: Validation happens at sign-up to prevent invalid bookings immediately
3. **Multi-Channel Communication**: Direct volunteer communication via WhatsApp for adoption and engagement
4. **Reliability Tracking**: System maintains and exposes volunteer reliability scores for decision-making

## License

MIT License - see LICENSE file for details

## Contact & Support

For questions or issues, please open an issue on GitHub or contact the project maintainers.

---

**Current Status**: Early development - Phase 1 implementation in progress

See `IMPLEMENTATION_STATUS.md` for detailed progress tracking.
