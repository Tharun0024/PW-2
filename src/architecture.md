# ElectIQ System Architecture

This document provides a high-level overview of the system architecture for the ElectIQ project.

## System Design

The application is built with a modern, decoupled architecture to ensure scalability, maintainability, and resilience.

*   **Frontend**: A responsive and interactive user interface built with **React** and bundled with **Vite**. It leverages a component-based architecture and custom hooks for state management and side effects.

*   **AI Layer**: The core chat functionality is powered by the **Google Gemini API**. A dedicated service layer (`geminiService.js`) abstracts the API communication, making it easy to manage and update.

*   **Translation Layer**: Multilingual support is provided through the **Google Translate API**. A `translateService.js` and a `useTranslate` hook manage API calls and language state throughout the application.

*   **Maps Layer**: The booth finder feature integrates with the **Google Maps API** to provide location-based services and visualizations.

*   **Deployment**: The application is containerized using **Docker** and deployed on **Google Cloud Run**. This provides a scalable, serverless environment that is cost-effective and easy to manage.

## Data Flow

The data flow is designed to be unidirectional and predictable, following standard React patterns.

1.  **User Interaction**: The user interacts with a component in the **UI**.
2.  **Component/Hook**: The component calls a function from a custom **Hook** (e.g., `useGemini`, `useTranslate`).
3.  **Service Layer**: The hook communicates with the corresponding **Service** (e.g., `geminiService`, `translateService`).
4.  **API Call**: The service makes an asynchronous call to the external **API** (Gemini, Translate, etc.).
5.  **API Response**: The API returns a response, which is processed and normalized by the service.
6.  **State Update**: The hook receives the data and updates the application's state.
7.  **UI Update**: React re-renders the relevant components in the **UI** to reflect the new state.

This can be visualized as:
`User → UI → Hooks → Services → APIs → Response → UI`

## Design Principles

The architecture is guided by the following core principles:

*   **Separation of Concerns**: Each part of the application has a distinct responsibility. UI components are for rendering, hooks manage logic and state, and services handle external communication.
*   **Fault Tolerance**: The application is designed to be resilient to API failures. Services and hooks include robust error handling and fallbacks to ensure the UI never crashes and the user receives clear feedback.
*   **Modular Architecture**: Features are encapsulated within their own components, hooks, and services. This makes the codebase easier to understand, test, and maintain.
*   **Scalable API Usage**: API interactions are centralized and managed to handle costs and rate limits effectively. Caching strategies (e.g., for translations) are used to minimize redundant calls.
