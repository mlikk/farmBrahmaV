# Farm Brahma - AI Co-pilot for Farmers

Farm Brahma is a Next.js web application designed to provide Indian farmers with AI-powered insights, market data, and community support to increase profitability and reduce agricultural risks.

## Features

- **AI-Powered Recommendations**: Profitability forecasts and personalized planting advice using Google's Gemini models.
- **Live Data Dashboards**: Real-time dashboards for market trends, environmental data, and a location-specific overview.
- **Interactive Farm Mapping**: Tools for users to map their farm boundaries to get precise area calculations and geospatial context.
- **Community Forum**: A real-time forum for farmers to connect, share knowledge, and discuss best practices.
- **Multilingual Support**: Fully internationalized UI supporting English, Hindi, Marathi, Tamil, and Telugu.

## Technology Stack

-   **Framework**: Next.js 14 (App Router) & React
-   **Language**: TypeScript
-   **AI Engine**: Google Gemini 2.5 Flash via Genkit
-   **Styling**: Tailwind CSS with ShadCN UI components
-   **Database**: Firestore (for community posts and user profiles)
-   **Authentication**: Firebase Authentication (Google Sign-In)
-   **Deployment**: Firebase App Hosting (utilizing Google Cloud Run)

---

## Deployment Steps

This guide will walk you through deploying Farm Brahma to Firebase App Hosting.

### Prerequisites

1.  **Node.js**: Make sure you have Node.js (v18 or newer) and npm installed.
2.  **Firebase Account**: You need a Google account and a Firebase project.
3.  **Firebase CLI**: Install the Firebase command-line tools:
    ```bash
    npm install -g firebase-tools
    ```
4.  **Google Cloud CLI**: Install the `gcloud` CLI. This is required for authentication.
    - [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)

### Step 1: Set Up Your Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services**:
    - In the project's dashboard, go to **Build > Authentication** and enable the **Google** sign-in provider.
    - Go to **Build > Firestore Database** and create a database in production mode.
3.  **Register a Web App**:
    - In your project settings (click the gear icon), scroll down to "Your apps".
    - Click the web icon (`</>`) to register a new web app.
    - Give it a name (e.g., "Farm Brahma Web") and register the app.
    - You will be shown a `firebaseConfig` object. Keep this page open; you will need these values.

### Step 2: Configure Environment Variables

1.  **Get a Gemini API Key**:
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key for the Gemini API.
2.  **Create `.env.local` file**: In the root of the project, create a file named `.env.local`.
3.  **Add Configuration**: Copy the values from your Firebase web app config and your Gemini API key into the `.env.local` file. It should look like this:

    ```
    # Gemini API Key
    GEMINI_API_KEY=AIza...

    # Firebase Public Config
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123...:web:...
    ```

### Step 3: Local Development (Optional)

If you want to run the app locally before deploying:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Dev Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

### Step 4: Deploy to Firebase App Hosting

1.  **Login to Firebase and Google Cloud**:
    ```bash
    # Login to your Google account for gcloud
    gcloud auth application-default login

    # Login to Firebase
    firebase login
    ```
2.  **Initialize App Hosting**: In your project's root directory, run the initialization command.
    ```bash
    firebase apphosting:backends:create
    ```
    - Follow the prompts. It will ask you to select your Firebase project and will detect the `apphosting.yaml` file. It will create a backend resource for you.
3.  **Deploy**: Run the deploy command.
    ```bash
    firebase apphosting:deploy
    ```
    - The Firebase CLI will build your Next.js application, create a container, and deploy it to Cloud Run via Firebase App Hosting.
    - After a few minutes, it will provide you with the URL of your live application.

That's it! Your Farm Brahma application is now live.
