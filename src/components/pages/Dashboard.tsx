import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ShoppingCart 
} from 'lucide-react';
import { DashboardStats } from '@/types/pos';
import { useDashboardStats } from '@/hooks/useSales';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-6">
              <div className="h-4 bg-muted animate-pulse rounded mb-4"></div>
              <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-6">
              <div className="h-6 bg-muted animate-pulse rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error loading dashboard data</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: `$${stats.todaySales.toLocaleString()}`,
      description: "Total sales today",
      icon: DollarSign,
      trend: "+12.5%",
      color: "text-green-600"
    },
    {
      title: "Weekly Sales",
      value: `$${stats.weeklySales.toLocaleString()}`,
      description: "Sales this week",
      icon: TrendingUp,
      trend: "+8.2%",
      color: "text-blue-600"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      description: "Items in inventory",
      icon: Package,
      trend: "+3 new",
      color: "text-purple-600"
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockItems.toString(),
      description: "Items need restocking",
      icon: AlertTriangle,
      trend: "Requires attention",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time overview of your ABV Boards business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="pos-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center pt-1">
                <span className={`text-xs ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Top Selling Products
            </CardTitle>
            <CardDescription>
              Best performing items this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.code} • {item.product.size}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantitySold} sold</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full pos-action-btn text-left">
              + New Sale Transaction
            </button>
            <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              Add New Product
            </button>
            <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              Generate Report
            </button>
            <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              View Low Stock Items
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;