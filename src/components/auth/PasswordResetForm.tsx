import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordResetFormProps {
  onPasswordReset: (email: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onPasswordReset,
  onNavigateToLogin
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid återställning av lösenord');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Vi har skickat instruktioner för att återställa ditt lösenord till {email}
          </AlertDescription>
        </Alert>
        <Button 
          variant="link" 
          onClick={onNavigateToLogin}
          className="w-full"
        >
          Tillbaka till inloggning
        </Button>
      </div>
    );
  }

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

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Skickar...' : 'Skicka återställningslänk'}
        </Button>

        <div className="text-center">
          <Button 
            type="button"
            variant="link" 
            onClick={onNavigateToLogin}
          >
            Tillbaka till inloggning
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PasswordResetForm;