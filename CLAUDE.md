# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

## Project Setup

This is a React + TypeScript + Vite application that requires a Gemini API key to function. The API key must be set in `.env.local` as `GEMINI_API_KEY`.

## Architecture Overview

### Core Application Flow
The app is a voice-to-reminder converter that uses Google's Gemini AI to process spoken input:

1. **Voice Recording**: Uses Web Speech API (browser-native) to capture and transcribe speech
2. **AI Processing**: Sends transcripts to Gemini AI via `processVoiceInput()` to extract structured reminder data (title, description, date, time)
3. **Data Storage**: Stores reminders in localStorage with automatic persistence
4. **State Management**: Uses React hooks for state, no external state management library

### Key Components Architecture

- **src/App.tsx**: Main application container managing global state (reminders, API key, processing status, error handling)
- **src/components/Recorder.tsx**: Handles Web Speech API integration with extensive TypeScript definitions for speech recognition interfaces
- **src/components/SettingsModal.tsx**: API key configuration (required for app functionality)
- **src/components/ReminderList.tsx & ReminderCard.tsx**: Display and manage reminder items
- **src/services/geminiService.ts**: Gemini AI integration with structured response schema
- **src/types/index.ts**: TypeScript type definitions for the application

### Technical Details

- **Environment Variables**: Gemini API key is exposed to client via Vite config (`vite.config.ts` defines process.env variables)
- **Storage**: Reminders persist in localStorage under key `'remember-me-reminders'`
- **AI Schema**: Uses structured JSON response schema to ensure consistent reminder format from Gemini
- **Error Handling**: Comprehensive error states for API failures, missing API key, and speech recognition issues
- **Styling**: Uses Tailwind CSS classes with custom brand colors

### Data Flow

1. User speaks → Web Speech API transcribes → Gemini processes transcript → Structured reminder data → Added to state → Persisted to localStorage
2. App loads → Reads from localStorage → Populates reminder list
3. Settings modal enforces API key requirement before allowing reminder creation

The app is designed to work entirely in the browser with no backend server required.