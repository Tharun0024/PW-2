# ElectIQ – AI Election Assistant

An intelligent, multilingual, and persona-driven AI assistant designed to simplify and clarify the Indian election process for every citizen.

## Problem Statement

The Indian electoral process, while robust, is complex and can be intimidating for many citizens. First-time voters, Non-Resident Indians (NRIs), and those in rural areas often face unique challenges in accessing accurate, relevant, and timely information. Language barriers, misinformation, and the sheer volume of procedural details can lead to disengagement and lower voter turnout.

## Solution Overview

ElectIQ is a web-based AI assistant that provides personalized and context-aware guidance on the Indian elections. By adopting different personas (e.g., First-Time Voter, NRI Voter), the AI tailors its responses to address specific user needs. The application integrates powerful Google services to offer a seamless, multilingual, and interactive experience, making election information accessible to all.

## Key Features

*   **Persona-Driven AI Chat**: The AI adapts its communication style and information delivery based on the user's selected persona.
*   **Multilingual Support**: Leverages the Google Translate API to offer the interface and AI chat in multiple Indian languages.
*   **Polling Booth Finder**: An interactive map, powered by the Google Maps API, allows users to find their polling booth by address or current location.
*   **Voter Eligibility Checker**: A simple questionnaire to help users quickly determine if they are eligible to vote.
*   **Automated Demo Mode**: A simulation feature that showcases the AI's capabilities across different user journeys, providing a clear demonstration of its value.
*   **Secure & Accessible**: Built with security best practices, including strict input sanitization and Content Security Policy headers, and designed to be accessible (WCAG compliant).

## Tech Stack

*   **Frontend**: React 18, Vite
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI (for unstyled, accessible components)
*   **State Management**: React Hooks (useState, useContext, useEffect, useReducer)
*   **Testing**: Vitest, React Testing Library
*   **Linting**: ESLint
*   **Deployment**: Firebase Hosting

## Google Services Used

*   **Google Gemini API**: Powers the core conversational AI, providing intelligent and context-aware responses.
*   **Google Maps JavaScript API**: Used for the "Find Booth" feature, including geocoding, map display, and place search.
*   **Google Translate API**: Enables real-time translation for multilingual support across the application.
*   **Firebase Hosting**: Provides fast, secure, and reliable hosting for the production deployment.

## Architecture

The application follows a modern component-based architecture.

1.  **User Interface (React)**: The user interacts with the React components.
2.  **State Management (Hooks)**: Custom hooks (`usePersona`, `useGemini`, `useTranslate`) manage the application's state and business logic.
3.  **Service Layer**: A dedicated service layer abstracts away the complexities of external API calls (Gemini, Google Maps, Translate).
4.  **AI Backend (Gemini)**: User prompts are securely sent to the Gemini API via the service layer.
5.  **Response Flow**: The AI's response is returned to the UI, translated if necessary, and displayed to the user.

## System Intelligence

ElectIQ is designed with a multi-layered intelligence system that allows it to provide highly relevant and personalized information:

*   **Persona Adaptation**: The system's primary intelligence layer. By selecting a persona, the user provides high-level context that primes the Gemini AI to tailor its responses, vocabulary, and the complexity of the information it provides.
*   **Contextual Awareness**: The AI maintains conversation history, allowing it to understand follow-up questions and provide coherent, context-aware answers.
*   **Language Intelligence**: The application seamlessly integrates with the Google Translate API, allowing users to interact in their native language. The system intelligently translates user input for the AI and translates the AI's response back to the user, breaking down language barriers.

## Performance Optimizations

*   **Lazy Loading**: Major components and routes are lazy-loaded to reduce the initial bundle size and improve the initial page load time.
*   **API Caching**: The `useGemini` hook implements an in-memory cache to avoid redundant API calls for identical queries within the same session, reducing latency and cost.
*   **Input Debouncing**: User input in the chat and search fields is debounced to prevent excessive processing and API requests while the user is typing.

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd electiq
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory from the `.env.example` template and add your Google API keys:
    ```
    VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Deployment

This project is configured for seamless deployment with **Firebase Hosting**.

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase:**
    ```bash
    firebase login
    ```

3.  **Initialize Firebase (if not already done):**
    ```bash
    firebase init hosting
    ```
    Follow the prompts, selecting your Firebase project and setting the public directory to `dist`.

4.  **Build the project:**
    ```bash
    npm run build
    ```

5.  **Deploy to Firebase:**
    ```bash
    firebase deploy --only hosting
    ```

## Testing

The project uses **Vitest** and **React Testing Library** for comprehensive unit and integration testing.

### Test Coverage
*   **Total Tests**: 45+
*   **Areas Covered**:
    *   **Hooks**: `useGemini`, `useTranslate`, `useDemo`, `usePersona`.
    *   **Components**: `ChatWindow`, `ElectionFlow`, `PersonaSelector`, `BoothFinder`.
    *   **Utilities**: `validators`, `security`.
*   **Tools**: Vitest for the test runner and React Testing Library for rendering and interacting with components.

Run the full test suite with:
```bash
npm run test
```

## Security Measures

Security is a top priority. The following measures have been implemented:

*   **Input Validation & Sanitization**: All user-generated input is rigorously validated and sanitized using custom utility functions (`src/utils/security.js`) to prevent XSS and other injection attacks.
*   **Content Security Policy (CSP)**: A strict CSP is enforced via `firebase.json` to control which resources can be loaded, mitigating the risk of cross-site scripting.
*   **Security Headers**: Additional headers like `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` are configured to enhance security.
*   **Environment Variables**: All API keys and sensitive information are managed through environment variables (`.env`) and are not exposed on the client-side.

## Accessibility

The application is designed to be accessible and WCAG compliant.

*   **ARIA Roles**: Proper ARIA attributes (`role`, `aria-label`, `aria-live`, etc.) are used throughout the application to ensure compatibility with screen readers.
*   **Keyboard Navigation**: All interactive elements are fully navigable and operable using only a keyboard.
*   **Focus Management**: Focus is managed logically, with focus traps implemented in modal dialogs to enhance usability for keyboard users.
*   **Semantic HTML**: The application uses semantic HTML5 elements to provide inherent meaning and structure.

## Assumptions

*   The user has a modern web browser with JavaScript enabled.
*   For location-based features, the user must grant location permissions.
*   An active internet connection is required for all AI and map functionalities.
