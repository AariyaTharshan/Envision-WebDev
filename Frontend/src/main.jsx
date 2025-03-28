import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import LoadingPage from './components/LoadingPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/dashboard" element={<App />} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>
)
