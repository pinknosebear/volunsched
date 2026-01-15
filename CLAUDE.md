# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Volunteer Scheduling System** is a rules-driven volunteer shift coordination platform designed to automate and improve upon manual processes (WhatsApp groups and Google Sheets). The system enforces scheduling rules at the point of sign-up, automates reminders and acknowledgments, and provides coordinators with visibility tools and workflows for substitute finding.

## Architecture

The system follows a **phased, incremental approach** with three core entities:

### Data Model
- **Volunteers**: Tracks ID, name, contact info, and reliability scores
- **Shifts**: Contains date, day name, week of month, and capacity information
- **Signups**: Manages volunteer-to-shift assignments with validation status

### System Design
- **Rules-Driven Validation**: Enforces scheduling constraints at sign-up time
- **Event-Driven Automation**: Triggers for reminders, confirmations, and notifications
- **Multi-Channel Integration**: Coordinates across Google Sheets (data), Apps Script (logic), and WhatsApp/Twilio (communication)
- **Coordinator Tools**: Dashboards and substitute-finding workflows for shift management

### Technology Stack (Incremental Implementation)

**Phase 1 (Current):**
- Google Apps Script (JavaScript) - sign-up validation and automation logic
- Google Sheets - data storage and interface
- Twilio/WhatsApp - volunteer communication

**Future Phases:**
- AppSheet - low-code UI prototype
- React - production-grade frontend
- Flask/Python - scalable backend API

## Repository Structure

```
/src/apps-script/       - Google Apps Script validation logic and triggers
/src/appsheet/          - AppSheet configuration and UI prototypes
/src/future-prototype/  - Experimental code for later phases
/docs/                  - Architecture diagrams and system design artifacts
/workflow/              - Product documentation (roadmap, design thinking, user testing)
/.github/workflows/     - Automated code review and Claude integration workflows
```

## Common Commands

### Development Setup
Currently, this project is in early development with minimal code. Most work is documentation and planning.

### Code Review
Two automated workflows are configured:

**PR Code Review** - Runs automatically on pull requests:
```bash
# Triggered automatically via GitHub Actions (claude-code-review.yml)
# Uses Claude Code Review plugin for automated analysis
```

**Manual Claude Assistance** - Tag Claude in PR comments, reviews, or issues:
- Comment in PRs: `@claude [your request]`
- Mention in issues: `@claude [your request]`
- Triggers via `.github/workflows/claude.yml`

## Development Context

### Key Files to Understand

**Google Apps Script** (`/src/apps-script/signup-validation.js`):
- Currently a placeholder - to be expanded with sign-up validation logic
- Validates volunteer signups against scheduling rules
- Integrates with Google Sheets via form submission triggers
- Communicates with volunteers via Twilio/WhatsApp

**GitHub Actions Workflows** (`/.github/workflows/`):
- `claude-code-review.yml` - Automated code reviews on all PRs
- `claude.yml` - Interactive Claude assistance when tagged with `@claude`

### Architecture Decisions

1. **Phased Implementation**: Start with Apps Script (leverages existing Google ecosystem), validate the business logic, then extend to custom UI and backend
2. **Rules Enforcement at Entry Point**: Validation happens at sign-up time to prevent invalid bookings immediately
3. **Multi-Channel Communication**: Use Twilio/WhatsApp for direct volunteer communication (matches existing user behavior)
4. **Google Sheets as Source of Truth**: Current data storage while architecture matures

### Product Roadmap

1. **Validate Scheduling Logic** - Implement core sign-up validation rules in Apps Script
2. **Build User-Facing UI** - AppSheet prototype for volunteer and coordinator interfaces
3. **Scale to Production** - React/Flask stack for performance and feature expansion
4. **Document & Refine** - Capture user feedback and establish design patterns

### Important Product Context

- This is solving a **coordination problem for volunteers** - emphasis on minimizing friction and maintaining adoption
- The system replaces both **communication** (WhatsApp) and **scheduling** (Google Sheets) functionality
- Reliability scores influence scheduling decisions - the system needs to track and expose this data
- Coordinators need **visibility** (what shifts are understaffed) and **tools** (quick substitute finder)
- Volunteer experience must be **friction-free** - they sign up for shifts they can reliably work

## Testing & Quality

This is an early-stage project. As features are implemented:
- Add unit tests for validation logic in Apps Script
- Document test cases for scheduling rule enforcement
- Validate against user testing feedback (see `/workflow/user-testing.md`)

## Notes for Future Development

- The `/docs/arch.png` and architecture diagram are visual references for the system design
- User testing results are documented in `/workflow/user-testing.md` - refer to these when making UX decisions
- Design thinking process is captured in `/workflow/design-thinking.md` - useful for understanding problem context
