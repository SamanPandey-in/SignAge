# SignAge Web - Sign Language Learning App

A complete React web application for learning sign language with AI-powered camera practice.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## ✨ Features

- **Interactive Learning**: Browse lessons by category
- **AI-Powered Practice**: Use your webcam with ML predictions
- **Progress Tracking**: Monitor your learning journey
- **Firebase Integration**: Cloud storage (with local fallbacks)
- **Fully Responsive**: Works on desktop, tablet, and mobile

## 📁 Project Structure

```
src/
├── screens/          # All app screens
├── navigation/       # Navigation component
├── services/         # Firebase & ML services
├── constants/        # Theme & lesson data
├── utils/            # Helper functions
└── App.js           # Main app component
```

## 🔧 Configuration

### Firebase (Optional)

Edit `src/services/firebase.js` and update the config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  // ... your config
};
```

### ML Model (Optional)

Edit `src/services/mlModel.js` to add your TensorFlow.js model.

## 🎯 What Works Without Configuration

✅ All navigation and screens
✅ Lesson browsing and viewing
✅ Camera with mock predictions
✅ Local data storage
✅ Progress tracking

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📝 Notes

- Camera features require HTTPS in production
- Firebase is optional - app works with local mock data
- ML predictions are mocked for development

## 🚀 Deployment

```bash
# Build production version
npm run build

# Deploy the 'build' folder to your hosting service
```

Compatible with: Vercel, Netlify, GitHub Pages, any static hosting.

---

**Built with React** - Ready for production use!
