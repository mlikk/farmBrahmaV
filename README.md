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
-   **Deployment**: Configured for Firebase App Hosting (utilizing Google Cloud Run), but portable to other platforms.

---

## Deployment

### Deployment Flexibility

This application is a standard Next.js project and is **not tightly coupled** to a specific hosting provider. While the instructions below focus on Firebase App Hosting (which uses Google Cloud Run), you can deploy it to any platform that supports Node.js and Next.js, such as Vercel, Netlify, AWS, or your own self-managed server.

To deploy on another platform, you would typically ignore the `apphosting.yaml` file and follow the provider-specific instructions for deploying a Next.js application.

### Buildpack vs. Dockerfile

The project uses `apphosting.yaml`, which relies on a **buildpack** strategy. Firebase automatically detects the Next.js framework, builds an optimized container image for you, and deploys it.

You can also add a `Dockerfile` to your repository if you wish to have full control over the container image for other environments or deployment targets. However, when you deploy using `firebase apphosting:deploy`, Firebase will **always use the `apphosting.yaml` buildpack strategy and ignore the `Dockerfile`**. You would use one or the other, not both for the same deployment.

### Deploying to Firebase App Hosting

This guide will walk you through deploying Farm Brahma to Firebase App Hosting.

#### Prerequisites

1.  **Node.js**: Make sure you have Node.js (v18 or newer) and npm installed.
2.  **Firebase Account**: You need a Google account and a Firebase project.
3.  **Firebase CLI**: Install the Firebase command-line tools:
    ```bash
    npm install -g firebase-tools
    ```
4.  **Google Cloud CLI**: Install the `gcloud` CLI. This is required for authentication.
    - [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)

#### Step 1: Set Up Your Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services**:
    - In the project's dashboard, go to **Build > Authentication** and enable the **Google** sign-in provider.
    - Go to **Build > Firestore Database** and create a database in production mode.
3.  **Register a Web App**:
    - In your project settings (click the gear icon), scroll down to "Your apps".
    - Click the web icon (`</>`) to register a new web app.
    - Give it a name (e.g., "Farm Brahma Web") and register the app.
    - You will be shown a `firebaseConfig` object. Keep this page open; you will need these values.

#### Step 2: Configure Environment Variables

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

#### Step 3: Local Development (Optional)

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

#### Step 4: Deploy to Firebase App Hosting

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

### Deploying on a Self-Managed Server (Node.js)

You can run this application on any server (like a VM from any cloud provider) that has Node.js installed.

#### Prerequisites

1.  **Node.js**: Ensure Node.js (v18 or newer) is installed on your server.
2.  **Process Manager**: It is highly recommended to use a process manager like `pm2` to keep the application running continuously. You can install it globally:
    ```bash
    npm install -g pm2
    ```

#### Step 1: Upload Code and Install Dependencies

1.  **Transfer Code**: Copy your application code to the server (e.g., using `git clone` or `scp`).
2.  **Install Dependencies**: Navigate to the project directory and run:
    ```bash
    npm install
    ```

#### Step 2: Set Up Environment Variables

Create a file named `.env.local` in the root of your project on the server. This file will contain your secret keys. The content should be the same as in "Step 2: Configure Environment Variables" in the Firebase Hosting guide above.

#### Step 3: Build and Start the Application

1.  **Build the App**: Run the Next.js build command to create an optimized production build.
    ```bash
    npm run build
    ```
2.  **Start with `pm2`**: Start the application using `pm2`. This will run the `npm run start` command, which starts the production Next.js server.
    ```bash
    pm2 start npm --name "farm-brahma" -- run start
    ```
    - `--name "farm-brahma"` gives your process a memorable name.
    - `pm2` will now manage the process, automatically restarting it if it crashes.

3.  **Save the Process List**: To make `pm2` automatically restart your app after a server reboot, run:
    ```bash
    pm2 startup
    pm2 save
    ```
    - `pm2 startup` will provide a command you need to run once to set up the startup script.

Your application is now running. You will likely need to configure a reverse proxy (like Nginx or Apache) to forward requests from port 80/443 to the port Next.js is running on (default is 3000).

---

That's it! Your Farm Brahma application is now live.
