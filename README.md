# Volunteer Scheduling System

## Overview
Replace linear WhatsApp group chat + public google sheet signup process for daily volunteer scheduling with a rules-driven user-friendly system that automates repetitive coordinator workflows. 

## Goals
1. Systemize scheduling rules to ensure fair signups with no double bookings
2. Automate reminders and log confirmations
   2.1 Start of Week reminder
   2.2 Day before confirmation (pop-up requesting confirmation)
3. Make finding substitute volunteers easier
   3.1 Providing easy status update options for users
   3.2 Reduce Coordinator time spent and increase message response rate
   3.3  Escalate urgency as time to dropped shift grows -- ending with --> Admin manual-approvals
    3.3.1 Volunteer type and seniority filtered automated shift pick-up requests
    3.3.2 Reliability Index calculations for each volunteer
5. Provide more effective user interfaces with seamless adoption
  4.1 Volunteer users
   4.1.1 cleaner signups
   4.1.2 rule-failure notification at signup time
   4.1.3 Log-in and see next shift
   4.1.4 Easily pick-up newly opened shifts
 4.2 Coordinators and Adminstrators
   4.2.1 dashboard for one-stop non-mandatory monitoring by top adminstrators
   4.2.2 notification system based on currently assigned coordinators
   4.2.3 Easy status and date filtering 


## Tech Stack (incremental)
- **Phase 1:** Google Apps Script
- **Phase 2:** Google AppSheet UI
- **Phase 3:** React + Flask 


## Repo Structure
- '/src/apps-script' -> Apps Script logic (sign-up validation, reminders)
- '/src/appsheet' -> Config + AppSheet prototype demos
- '/docs' -> PM artifacts, system diagrams, roadmaps
- '/src/future-prototype' -> code experiments for later

## Roadmap
1. Validate scheduling logic with Apps Script.
2. Build user-facing UI with AppSheet.
3. Extend into scalable React/Flask prototypes
4. Document user testing + design patterns

## Screenshots/Demos
