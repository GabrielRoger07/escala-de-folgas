import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Setores from './pages/setores'
import Funcionarios from './pages/funcionarios'
import Escalas from './pages/escalas'
import EscalaDetail from './pages/escalas/detail'
import EscalaMes from './pages/escalas/mes'
import Managers from './pages/managers'
import ProtectedRoute from './auth/ProtectedRoute'
import CeoRoute from './auth/CeoRoute'
import { ThemeProvider } from './context/ThemeContext'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={400}>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/setores' element={<ProtectedRoute><Setores /></ProtectedRoute>} />
            <Route path='/funcionarios' element={<ProtectedRoute><Funcionarios /></ProtectedRoute>} />
            <Route path='/escalas' element={<ProtectedRoute><Escalas /></ProtectedRoute>} />
            <Route path='/escalas/mes/:ano/:mes' element={<ProtectedRoute><EscalaMes /></ProtectedRoute>} />
            <Route path='/escalas/:id' element={<ProtectedRoute><EscalaDetail /></ProtectedRoute>} />
            <Route path='/managers' element={<CeoRoute><Managers /></CeoRoute>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App