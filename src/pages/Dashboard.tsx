import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MetricCard from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Heart, TrendingUp, Upload } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <p className="text-muted-foreground mt-1">
            Track your support requests, document approvals, and donations here.
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Upload className="w-4 h-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Case Status"
          value="In Review"
          change="Documents under verification"
          changeType="neutral"
          icon={FileText}
        />
        <MetricCard
          title="Funds Raised"
          value="₨ 24,500"
          change="+₨ 2,000 this week"
          changeType="positive"
          icon={Heart}
        />
        <MetricCard
          title="Disbursements"
          value="₨ 18,000"
          change="Released to your account"
          changeType="neutral"
          icon={TrendingUp}
        />
        <MetricCard
          title="Profile Completion"
          value="100%"
          change="All details verified"
          changeType="positive"
          icon={CheckCircle}
        />
      </div>

      {/* Support Updates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Your Case Overview</h2>
        </div>

        <div className="bg-card border rounded-lg p-6 text-sm text-muted-foreground space-y-3">
          <p>
            <span className="font-semibold text-foreground">Case Type:</span>{" "}
            Widow Support Program
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Current Status:
            </span>{" "}
            Awaiting approval from admin team.
          </p>
          <p>
            <span className="font-semibold text-foreground">Last Updated:</span>{" "}
            October 12, 2025
          </p>
          <p>
            Once verified, you’ll receive updates here and via email or SMS.
          </p>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-primary text-primary-foreground p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white"
              >
                View My Documents
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white"
              >
                Update Personal Info
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-0 text-white"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
