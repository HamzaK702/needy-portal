import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, CheckCircle, Share, FileText } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'donation',
    title: 'Received $500',
    description: "Widow Support Program • 2 hours ago",
    icon: DollarSign,
    iconColor: 'text-success'
  },
  {
    id: 2,
    type: 'completion',
    title: 'Case completed',
    description: "Emergency Medical Aid • 1 day ago", 
    icon: CheckCircle,
    iconColor: 'text-success'
  },
  {
    id: 3,
    type: 'monthly',
    title: 'Monthly report submitted',
    description: "Ahmed Family Case • 3 days ago",
    icon: FileText,
    iconColor: 'text-info'
  },
  {
    id: 4,
    type: 'shared',
    title: 'Case shared with donor',
    description: "Fatima Education Fund • 5 days ago",
    icon: Share,
    iconColor: 'text-muted-foreground'
  },
];

const ActivityFeed = () => {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.75 6.75a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;