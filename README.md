# FIR Legal Analysis System

An automated AI-powered system for analyzing First Information Reports (FIR) against Indian legal codes.

## Features

- **Automated Analysis**: Uses AI to automatically analyze FIR documents against BNS (Bharatiya Nyaya Sanhita) and BNSS (Bharatiya Nagarik Suraksha Sanhita)
- **Intelligent Caching**: Results are cached for instant retrieval of similar cases
- **Interactive UI**: Modern, responsive interface with step-by-step workflow
- **Report Generation**: Download detailed analysis reports

## How to Run

1. **Simple Method**: Open `index.html` in your web browser
2. **Development Method**: 
   - Install Node.js
   - Run `npm install` to install dependencies
   - Run `npm start` to start the development server

## How to Use

1. **Upload FIR**: Click "Choose File" and select your FIR document (supports images and PDFs)
2. **AI Analysis**: Click "Start Automated Analysis" to process the document
3. **View Results**: Review the identified BNS and BNSS sections with detailed explanations

## Key Features

- **BNS Section Mapping**: Automatically identifies applicable sections from Bharatiya Nyaya Sanhita 2023
- **BNSS Procedural Analysis**: Maps procedural requirements from Bharatiya Nagarik Suraksha Sanhita 2023
- **Relevance Scoring**: Each section is scored for relevance (high/medium/low)
- **Punishment Details**: Shows prescribed punishments for each applicable section
- **Cache System**: Similar cases are instantly retrieved from cache

## Technical Details

- Built with React 18
- Uses Lucide React for icons
- Tailwind CSS for styling
- Simulated AI analysis (can be connected to real Claude API)
- Client-side caching system

## API Integration

To use real AI analysis instead of simulated results:

1. Get an API key from Anthropic
2. Replace the simulated analysis in `analyzeWithClaude()` function
3. Add your API key to the fetch requests

## File Structure

```
├── index.html          # Main application file
├── package.json        # Dependencies and scripts
├── auto_app.js         # Original React component
└── README.md          # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- The current version uses simulated analysis for demonstration
- Real API integration requires Anthropic API key
- All analysis is performed client-side
- Results are cached in browser memory
