import MetricCard from '@/components/dashboard/MetricCard';
import CaseCard from '@/components/dashboard/CaseCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { Users, Heart, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Ahmed!</h1>
          <p className="text-muted-foreground mt-1">
            Your dedication is changing lives. Here's your impact overview.
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Case
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Cases"
          value="24"
          change="+3 new this month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Total Raised"
          value="$8,450"
          change="+15% from last month"
          changeType="positive"
          icon={Heart}
        />
        <MetricCard
          title="Lives Impacted"
          value="67"
          change="Direct beneficiaries"
          changeType="neutral"
          icon={TrendingUp}
        />
        <MetricCard
          title="Success Rate"
          value="89%"
          change="+4% improvement"
          changeType="positive"
          icon={AlertTriangle}
        />
      </div>

      {/* Featured Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Active Cases</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CaseCard
            title="Fatima's Education Fund"
            category="Education"
            location="Karachi"
            priority="High"
            raised={37500}
            target={50000}
            image="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=300&fit=crop&crop=faces"
          />
          <CaseCard
            title="Medical Treatment for Ahmed"
            category="Healthcare"
            location="Lahore"
            priority="Critical"
            raised={36000}
            target={80000}
            image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop"
          />
          <CaseCard
            title="Widow Support Program"
            category="Support"
            location="Islamabad"
            priority="Medium"
            raised={18000}
            target={30000}
            image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop&crop=faces"
          />
        </div>
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-primary text-primary-foreground p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white">
                Browse New Cases
              </Button>
              <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white">
                Upload Report
              </Button>
              <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white">
                Contact Donor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;