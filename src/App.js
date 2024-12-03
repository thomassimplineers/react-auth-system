import { AuthProvider } from './components/AuthProvider';
import Login from './components/Login';
import { useAuth } from './components/AuthProvider';

const AuthenticatedApp = () => {
  return (
    <div className="p-4">
      <h1>Welcome to your dashboard!</h1>
      {/* Add your authenticated app content here */}
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <div className="App">
        {user ? <AuthenticatedApp /> : <Login />}
      </div>
    </AuthProvider>
  );
}

export default App;