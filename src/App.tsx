import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Wrapper from './auth/Wrapper'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/home' element={<Wrapper><Home /></Wrapper>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
