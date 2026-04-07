import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Setores from './pages/setores'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
          <Route path='/setores' element={<ProtectedRoute><Setores /></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
