AgriN — Agricultural Intelligence Platform

AgriN is a full-stack, AI-powered agricultural intelligence platform designed to help farmers make practical and informed farming decisions using farm data, AI assistance, crop analysis, farm-risk insights, and regenerative agriculture recommendations.

The application is designed with a simple, farmer-friendly interface and supports English and Hindi.

What AgriN Does

👨‍🌾 Farmer profile and farm setup

📊 Farmer dashboard

🤖 AI Farmer Assistant

🩺 Crop Doctor / crop analyzer

⚠️ Farm Risk assessment

🌿 Regenerative Agriculture Advisor

🌐 English + Hindi language support

📱 Responsive web interface

🔥 Firebase / Firestore data storage

🚀 Production deployment with Render

✨ Main Features

👨‍🌾 Farmer Profile & Farm Setup

Farmers can create and manage their basic profile and farm information.

Stored information can include:

Farmer name

Phone number

Preferred language

Farm name

Land size

Land unit

Soil type

Irrigation type

Farm location

Crop information

📊 Farmer Dashboard

The dashboard acts as the main control center after farm setup and provides access to the agricultural tools, AI-powered features, farm risk information, crop analysis, and regenerative farming recommendations.

🤖 AI Farmer Assistant

The AI Assistant provides farmer-friendly agricultural guidance using the Gemini API, including farming questions, crop guidance, soil and irrigation guidance, and practical recommendations.

🩺 Crop Doctor

Crop Doctor provides AI-assisted crop analysis to help farmers analyze plant problems, identify possible issues, understand causes, and receive recommended actions.

⚠️ Farm Risk

The Farm Risk module provides AI-assisted assessment of agricultural risks, including risk severity, possible causes, and recommended preventive actions.

🌿 Regenerative Agriculture Advisor

The Regenerative Advisor focuses on long-term farm health and sustainable farming practices such as soil health, water management, and regenerative agriculture.

🌐 Language Support

AgriN supports:

🇬🇧 English

🇮🇳 Hindi

The application uses a translation-based approach rather than maintaining separate pages for every language.

🛠️ Tech Stack

Frontend

React

Vite

JavaScript

Tailwind CSS

React Router

Backend

Node.js

Express.js

REST APIs

Database

Firebase Firestore

Firebase Admin SDK

AI

Google Gemini API

Development & Testing

VS Code

Git

GitHub

Hoppscotch

Deployment

Render

📁 Project Structure

AgriN/
│
├── public/
├── src/
│   ├── components/
│   │   ├── navigation/
│   │   │   └── AppShell.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Welcome.jsx
│   │   ├── Profile.jsx
│   │   ├── FarmSetup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CropDoctor.jsx
│   │   ├── FarmRisk.jsx
│   │   ├── RegenerativeAdvisor.jsx
│   │   └── FarmerAssistant.jsx
│   ├── services/
│   │   └── api.js
│   ├── config/
│   ├── context/
│   ├── locales/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── config/
│   │   └── firebase.js
│   ├── controllers/
│   │   └── farmerController.js
│   ├── routes/
│   │   └── farmerRoutes.js
│   ├── services/
│   │   └── farmerService.js
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md

🧭 Application Routes

Route

Page

/

Welcome / Language Selection

/profile

Farmer Profile

/farm-setup

Farm Setup

/dashboard

Farmer Dashboard

/crop-doctor

Crop Doctor

/risk

Farm Risk

/improve

Regenerative Advisor

/assistant

AI Farmer Assistant

🔄 Main User Flow

Welcome / Language Selection
          ↓
    Farmer Profile
          ↓
      Farm Setup
          ↓
       Dashboard
          │
    ┌─────┼─────────────┐
    ↓     ↓      ↓      ↓
Weather  Crop   Farm    AI
         Doctor  Risk Assistant
              │
              ↓
     Regenerative Advisor

🔥 Firebase / Firestore

AgriN uses Firebase Firestore for application data storage.

The backend uses the Firebase Admin SDK to communicate securely with Firestore.

farmers

id
name
phone
language
location
createdAt
updatedAt

farms

id
farmerId
farmName
landSize
landUnit
soilType
irrigationType
location
createdAt
updatedAt

crops

Crop-related information can be associated with farmer/farm data as the application expands.

🔌 Backend API

Local Backend

http://localhost:5000

Health Check

GET /api/health

Farmer APIs

POST /api/farmers
GET /api/farmers/:farmerId
PUT /api/farmers/:farmerId

Farm APIs

POST /api/farmers/farm/create
GET /api/farmers/:farmerId/farms

Additional AI and agricultural feature routes are implemented as part of the application.

🌍 Production Deployment

AgriN is deployed using Render with separate frontend and backend services.

                 🌱 AgriN
                    │
                    ▼
          ┌──────────────────┐
          │ React Frontend   │
          │ Render Static     │
          │ Site              │
          └────────┬─────────┘
                   │
                   │ REST API
                   ▼
          ┌──────────────────┐
          │ Express Backend  │
          │ Render Web       │
          │ Service          │
          └────────┬─────────┘
                   │
             ┌─────┴─────┐
             ▼           ▼
         Firestore     Gemini

🌐 Production Frontend

https://agrin-ai-frontend.onrender.com/

⚙️ Production Backend

https://agrin-ai.onrender.com/

The frontend communicates with the production backend through the configured VITE_API_URL.

⚙️ Local Development

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>

2. Enter the project

cd agrin-ai

3. Install dependencies

npm install

🔐 Environment Variables

Create the required environment variables locally.

Frontend variables use the VITE_ prefix.

Example:

VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

Backend variables:

PORT=5000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model

Production

The production frontend uses:

VITE_API_URL=https://agrin-ai.onrender.com

Production environment variables are configured directly in Render.

🔒 Security

Never commit secrets to GitHub.

The following must remain private:

Firebase Admin private key

Firebase service-account credentials

Gemini API key

Other private API credentials

The .env file must be included in .gitignore.

Frontend Firebase configuration values are used through environment variables and must never contain Firebase Admin credentials.

▶️ Run the Project

Start Frontend

npm run dev

Frontend:

http://localhost:5173

Start Backend

In another terminal:

npm run server

Backend:

http://localhost:5000

🧪 API Testing

Backend APIs can be tested using Hoppscotch or another REST API testing tool.

Example:

POST /api/farmers

Successful response:

{
  "success": true,
  "message": "Farmer created successfully",
  "data": {
    "id": "example-id",
    "name": "Example Farmer",
    "phone": "XXXXXXXXXX",
    "language": "en"
  }
}

🎯 Project Goal

The goal of AgriN is to combine agricultural data, weather intelligence, artificial intelligence, crop analysis, farm risk assessment, and regenerative agriculture knowledge into one accessible platform.

AgriN focuses on making agricultural technology:

Accessible

Practical

Data-driven

AI-assisted

Farmer-friendly

Available in English and Hindi

📈 Current Project Status

✅ Completed

Project architecture

React + Vite frontend

Tailwind CSS

Frontend routing

Responsive application shell

Welcome / language selection

Farmer profile flow

Farm setup flow

Dashboard

Express backend

REST API structure

React → Express integration

Firebase Admin SDK

Firestore integration

Farmer API

Farm API

AI Assistant

Crop Doctor / Analyzer

Farm Risk

Regenerative Agriculture Advisor

English + Hindi support

Production environment configuration

GitHub repository

Render backend deployment

Render frontend deployment

Frontend → production backend connection

Production Firebase configuration

Production AI configuration

🚀 Future Improvements

Real-time weather API integration

More regional languages

Voice-based AI Assistant

Advanced crop disease detection

Offline / low-connectivity support

Personalized crop recommendations

Government agricultural scheme information

Market price information

Advanced farm analytics

Push notifications

Automated testing

Advanced AI personalization

Further UI/UX refinement

🗺️ Development Roadmap

[✓] Project Setup
[✓] React + Vite
[✓] Tailwind CSS
[✓] Express Backend
[✓] Firebase / Firestore
[✓] Farmer API
[✓] Farm API
[✓] Frontend Routing
[✓] Farmer Profile
[✓] Farm Setup
[✓] Dashboard
[✓] AI Farmer Assistant
[✓] Crop Doctor
[✓] Farm Risk
[✓] Regenerative Advisor
[✓] English + Hindi Support
[✓] Production Frontend
[✓] Production Backend
[✓] Frontend → Backend Connection

Future
[ ] Weather API
[ ] Voice Assistant
[ ] Advanced Crop Vision
[ ] Notifications
[ ] Automated Testing
[ ] Advanced Analytics
[ ] Additional Languages

👨‍💻 Development

AgriN is developed as a full-stack agricultural technology project focused on solving real-world farming problems through modern web technologies, artificial intelligence, cloud services, and sustainable agriculture concepts.

📄 License

This project is currently intended for educational, development, and demonstration purposes.

A formal open-source or commercial license can be added before public commercial use.

🌱 AgriN

Smart technology for better farming decisions.

Empowering farmers with AI, data, and sustainable agriculture.