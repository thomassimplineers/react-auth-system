import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '../../lib/supabaseClient';

const AuthCallback = () => {
  const [message, setMessage] = useState('Verifying...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user?.aud === 'authenticated') {
          setMessage('Email verified successfully!');
          // Redirect after short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {error ? (
              <>
                <div className="text-red-500">{error}</div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Return to login
                </Button>
              </>
            ) : (
              <div className="text-green-600">{message}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;