import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add a theme color meta tag for mobile browsers
const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#134e4a'; // Teal-900 color
document.head.appendChild(metaThemeColor);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
