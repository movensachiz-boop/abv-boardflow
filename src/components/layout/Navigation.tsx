import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  FileText,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'cashier', 'viewer'] },
    { to: '/sales', icon: ShoppingCart, label: 'Sales Entry', roles: ['admin', 'cashier'] },
    { to: '/stock', icon: Package, label: 'Stock Management', roles: ['admin', 'cashier'] },
    { to: '/stocktaking', icon: ClipboardList, label: 'Stocktaking', roles: ['admin'] },
    { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'viewer'] },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'viewer'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <nav className="pos-nav border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-2 py-4 px-3 text-sm font-medium border-b-2 border-transparent transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'border-accent text-accent'
                    : 'text-secondary-foreground hover:text-accent hover:border-accent/50'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;