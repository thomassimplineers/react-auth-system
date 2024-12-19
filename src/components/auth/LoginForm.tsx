import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid inloggning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">E-postadress</Label>
        <Input
          id="email"
          type="email"
          placeholder="din@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Lösenord</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Loggar in...' : 'Logga in'}
        </Button>

        <div className="flex justify-between">
          <Button 
            type="button"
            variant="link" 
            onClick={() => navigate('/auth/register')}
          >
            Skapa konto
          </Button>
          <Button 
            type="button"
            variant="link" 
            onClick={() => navigate('/auth/reset-password')}
          >
            Glömt lösenord?
          </Button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;