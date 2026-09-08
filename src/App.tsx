
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css'
import LoginPrincipal from './components/login';


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPrincipal />} />
        </Routes>
    </Router>
  );
}

export default App
