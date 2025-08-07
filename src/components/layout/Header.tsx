import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import abvLogo from '@/assets/abv-logo.png';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="pos-header flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img 
          src={abvLogo} 
          alt="ABV Boards Zimbabwe" 
          className="h-12 w-auto"
        />
        <div>
          <h1 className="text-xl font-bold">ABV Boards POS</h1>
          <p className="text-sm opacity-80">Professional Point of Sale System</p>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
            <span className="px-2 py-1 bg-primary-foreground/20 rounded text-xs uppercase">
              {user.role}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;