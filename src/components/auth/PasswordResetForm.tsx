import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '../../lib/supabaseClient';

const PasswordResetForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 text-green-500 p-3 rounded mb-4">
          Password reset instructions have been sent to your email.
        </div>
        <Button
          variant="link"
          onClick={() => setSuccess(false)}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Try another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Sending instructions...' : 'Reset password'}
        </Button>
      </div>

      <div className="text-sm text-center">
        Remember your password?{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-500">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default PasswordResetForm;