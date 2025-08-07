import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/pos';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, CheckCircle, UserPlus } from 'lucide-react';
const abvLogo = '/lovable-uploads/74b9aa4f-b004-47a3-a539-e9695446a2e2.png';

interface SignupPageProps {
  onBackToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier' as User['role']
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(formData.name, formData.email, formData.password, formData.role);
      if (success) {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to ABV Boards POS System.",
        });
        // User will be automatically redirected due to auth state change
      } else {
        toast({
          title: "Signup Failed",
          description: "An error occurred during signup. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An error occurred during signup. Please try again.",
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
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Join ABV Boards POS System
          </p>
        </div>

        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Sign Up
            </CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin-signup" />
                    <Label htmlFor="admin-signup" className="text-sm">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cashier" id="cashier-signup" />
                    <Label htmlFor="cashier-signup" className="text-sm">Cashier</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="viewer" id="viewer-signup" />
                    <Label htmlFor="viewer-signup" className="text-sm">Viewer</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full pos-action-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Already have an account?
              </p>
              <Button
                variant="outline"
                onClick={onBackToLogin}
                className="w-full"
              >
                Sign In Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;