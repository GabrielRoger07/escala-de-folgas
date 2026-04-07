import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Setores from './pages/setores'
import Funcionarios from './pages/funcionarios'
import Escalas from './pages/escalas'
import ProtectedRoute from './auth/ProtectedRoute'
import { ThemeProvider } from './context/ThemeContext'

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
          <Route path='/setores' element={<ProtectedRoute><Setores /></ProtectedRoute>}/>
          <Route path='/funcionarios' element={<ProtectedRoute><Funcionarios /></ProtectedRoute>}/>
          <Route path='/escalas' element={<ProtectedRoute><Escalas /></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App