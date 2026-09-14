import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Escala from './pages/escala'
import ProtectedRoute from './auth/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/escala' element={<ProtectedRoute><Escala /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
