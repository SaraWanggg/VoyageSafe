# VoyageSafe -- AI Travel Safety Assistant

A modern AI-powered travel assistant that helps users plan safe trips by providing personalized safety recommendations, local insights, and real-time travel information.

## 🌟 Features

- 🤖 AI-powered travel recommendations
- 🗺️ Google Maps integration for location insights
- 🏨 Hotel safety information
- 🔒 Location-specific safety alerts
- 💬 Interactive chat interface
- 📱 Responsive design
- 🎨 Modern gradient UI

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Maps:** Google Maps API
- **AI Model:** Anthropic Claude
- **Deployment:** Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voyagesafe.git

```
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in .env.local:
NEXT_API_KEY=your_api_key

4. Start the development server:
```bash
npm run dev
```

### Project Structure
voyagesafe/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main page
│   └── api/               # API test pages (Google Maps API, Rapid API etc.)
├── components/            # React components
├── utils/                 # Utility functions
│   └── googleMaps.ts     # Maps API utilities
└── public/               # Static assets

### 🔑API Keys Required

1.Google Maps API Key

Enable the following APIs:

Maps JavaScript API
Places API
Geocoding API


Add restrictions in Google Cloud Console
Set up billing


2.Other API Keys

Add as needed for additional features

### 🛠️ Development
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### 🔒 Security

API keys are protected using environment variables
Implementation includes error handling
Rate limiting implemented where necessary

### 📝 License
This project is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.
You are free to:

Share: Copy and redistribute the material
Adapt: Remix and transform the content

Under these terms:

⭐ Attribution required
🚫 No commercial use
📄 License and copyright notice required

### 📧 Contact
Sara Wang - sarawang1124@gmail.com
Project Link: https://github.com/SaraWanggg/Voyagesafe

