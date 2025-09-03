import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseCardProps {
  title: string;
  category: string;
  location: string;
  priority: 'High' | 'Medium' | 'Critical';
  raised: number;
  target: number;
  image?: string;
  className?: string;
}

const priorityColors = {
  High: 'bg-warning text-warning-foreground',
  Medium: 'bg-info text-info-foreground', 
  Critical: 'bg-destructive text-destructive-foreground'
};

const categoryColors = {
  Education: 'bg-warning text-warning-foreground',
  Healthcare: 'bg-info text-info-foreground',
  Support: 'bg-success text-success-foreground',
  Emergency: 'bg-destructive text-destructive-foreground'
} as const;

const CaseCard = ({ 
  title, 
  category, 
  location, 
  priority, 
  raised, 
  target,
  image,
  className 
}: CaseCardProps) => {
  const progress = (raised / target) * 100;
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-muted text-muted-foreground';

  return (
    <Card className={cn("overflow-hidden shadow-card hover:shadow-hover transition-all", className)}>
      {/* Image */}
      {image && (
        <div className="h-48 bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={categoryColor}>
                {category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {location}
              </div>
            </div>
          </div>
          <Badge className={priorityColors[priority]}>
            {priority}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              ${raised.toLocaleString()} / ${target.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Action */}
        <Button className="w-full" variant="default">
          <Heart className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default CaseCard;