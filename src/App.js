import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      {isLogin ? <Login /> : <Register />}
    </div>
  );
}

export default App;