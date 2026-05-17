'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // We use raw axios here to avoid the global apiClient interceptors during login
      const response = await axios.post('/api/auth', { email, password });
      
      const { error: apiError, message, data } = response.data;

      if (apiError) {
        setError(message || 'Authentication failed');
      } else if (data && data.token) {
        // Successful login
        const { token, refresh_token, user } = data;
        setAuth(token, refresh_token || '', user);
        router.push('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <Card className="w-[400px] border-[0.5px] shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#378ADD]">RepairMyBike</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Administrative Control Panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Email Address</label>
              <Input
                type="email"
                placeholder="admin@repairmybike.in"
                className="h-10 text-xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-10 text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#378ADD] hover:bg-[#2D6FA3] text-white font-bold uppercase text-[11px] tracking-widest h-10 mt-2 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Secure Sign In'
              )}
            </Button>
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 mt-2">
                <p className="text-center text-[10px] font-bold uppercase text-red-600 tracking-tight">
                  {error}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
