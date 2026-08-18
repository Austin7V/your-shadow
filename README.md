# Your Shadow

Your Shadow is a web application with an AI companion that helps adults build healthy habits, track nutrition, complete home workouts, and stay consistent through daily support.

## Mission

Help people improve their health and habits through simple daily actions, personalised recommendations, and meaningful long-term context.

## Web MVP Core Loop

1. Sign up and log in
2. Complete onboarding: goals, personal data, and limitations
3. Open the Today dashboard with 3–4 actions
4. Log a meal in text form
5. Complete a home workout
6. Submit a daily well-being and difficulty check-in
7. Review the daily summary
8. View seven-day history
9. Receive the next-day plan

## Web MVP Features

- User registration, login, and protected sessions
- User profile and onboarding
- A daily plan with 3–4 actions
- Text-based meal logging with AI calorie and macro estimates
- Healthier meal and cooking suggestions
- Simple equipment-free home workouts
- Workout substitutions when an exercise is too difficult
- Daily check-ins for well-being, pain, energy, and difficulty
- Minimal structured memory for important limitations and recent history
- Daily summaries and seven-day progress history
- Russian-first user interface with an i18n-ready architecture

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- SWR

### Backend

- NestJS
- TypeScript
- REST API
- JWT authentication

### Database

- PostgreSQL
- TypeORM
- Database migrations

## Planned Project Structure

```text
your-shadow/
├── apps/
│   ├── web/            # Next.js frontend
│   └── api/            # NestJS REST API
├── packages/
│   ├── contracts/      # Shared TypeScript contracts
│   └── config/         # Shared configuration
├── docs/
└── README.md
```
The frontend must never access PostgreSQL directly. All data is accessed through the NestJS API.

## Out of Scope for the Web MVP

The following features are intentionally excluded from the first Web MVP release:

- Native Android and iPhone applications
- React Native or Expo
- App Store and Google Play releases
- Push notifications and reminders
- PWA and offline mode
- Voice control
- Food photo recognition, barcode scanning, or a large food database
- Apple Health, Health Connect, smartwatches, and other fitness devices
- Gamification, group raids, and PvP
- Payments and subscriptions

## Medical Disclaimer and Age Restriction

Your Shadow is not a medical service. It does not diagnose, treat, cure, or replace advice from a qualified healthcare professional.

The Web MVP is intended only for adults aged 18 and older. Users with chronic conditions, injuries, pain, or other health concerns should consult a qualified healthcare professional before following nutrition or workout recommendations.