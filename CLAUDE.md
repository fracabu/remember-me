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
- **src/components/ReminderList.tsx & ReminderCard.tsx**: Display and manage reminder items with features like suggestions generation, re-recording, and calendar export
- **src/components/SettingsSidebar.tsx**: Alternative API key configuration via sidebar when no environment key is available
- **src/components/SuggestionsModal.tsx**: AI-powered task suggestions modal for productivity guidance
- **src/services/geminiService.ts**: Gemini AI integration with structured response schema
- **src/types/index.ts**: TypeScript type definitions for the application

### Technical Details

- **Environment Variables**: Gemini API key is exposed to client via Vite config (`vite.config.ts` defines process.env variables). Supports both `VITE_GEMINI_API_KEY` and `GEMINI_API_KEY` for compatibility
- **Storage**: Reminders persist in localStorage under key `'remember-me-reminders'`
- **AI Schema**: Uses structured JSON response schema to ensure consistent reminder format from Gemini with intelligent time parsing and relative date calculation
- **Chat Integration**: Includes chat functionality via `sendChatMessage()` for conversational task assistance
- **Re-recording Feature**: Supports updating existing reminders by integrating new voice input with existing content
- **Error Handling**: Comprehensive error states for API failures, missing API key, and speech recognition issues
- **Styling**: Uses Tailwind CSS classes with custom brand colors

### Data Flow

1. User speaks → Web Speech API transcribes → Gemini processes transcript → Structured reminder data → Added to state → Persisted to localStorage
2. App loads → Reads from localStorage → Populates reminder list
3. Settings modal enforces API key requirement before allowing reminder creation

The app is designed to work entirely in the browser with no backend server required.

### API Integration Details

- **Gemini AI Model**: Uses `gemini-2.5-flash` model for fast processing
- **Multiple AI Functions**: 
  - `processVoiceInput()`: Converts speech transcripts to structured reminders
  - `generateTaskSuggestions()`: Creates productivity advice for specific tasks  
  - `sendChatMessage()`: Enables conversational assistance about tasks
- **Intelligent Time Handling**: Advanced time parsing with AM/PM inference and Italian locale support
- **Update Mode**: Can integrate new voice input with existing reminder data rather than replacing it