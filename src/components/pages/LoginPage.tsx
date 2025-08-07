import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/pos';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';
const abvLogo = '/lovable-uploads/74b9aa4f-b004-47a3-a539-e9695446a2e2.png';
import SignupPage from './SignupPage';

const LoginPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('cashier');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (currentView === 'signup') {
    return <SignupPage onBackToLogin={() => setCurrentView('login')} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome to ABV Boards POS`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={abvLogo} 
            alt="ABV Boards Zimbabwe" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to ABV Boards POS System
          </p>
        </div>

        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the POS system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as User['role'])}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="text-sm">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cashier" id="cashier" />
                    <Label htmlFor="cashier" className="text-sm">Cashier</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="viewer" id="viewer" />
                    <Label htmlFor="viewer" className="text-sm">Viewer</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full pos-action-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Don't have an account?
              </p>
              <Button
                variant="outline"
                onClick={() => setCurrentView('signup')}
                className="w-full flex items-center justify-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Account
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Demo Credentials: Use any email/password combination</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;