import { useState } from 'react';
import { Calendar, Camera, FileText, DollarSign, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const cases = [
  {
    id: 1,
    name: 'Fatima Ahmed Education Fund',
    beneficiary: 'Fatima Ahmed',
    status: 'Active',
    priority: 'High',
    progress: 75,
    raised: 37500,
    target: 50000,
    startDate: '2024-01-15',
    lastUpdate: '2024-02-28',
    nextFollowup: '2024-03-15',
    donorCount: 12,
    timeline: [
      { date: '2024-02-28', type: 'donation', title: 'Received $500 donation', amount: 500 },
      { date: '2024-02-25', type: 'report', title: 'Monthly progress report uploaded' },
      { date: '2024-02-20', type: 'visit', title: 'Family visit completed' },
      { date: '2024-02-15', type: 'photo', title: 'Updated living condition photos' },
    ]
  },
  {
    id: 2,
    name: 'Ahmed Hassan Medical Treatment',
    beneficiary: 'Ahmed Hassan',
    status: 'Critical',
    priority: 'Critical',
    progress: 45,
    raised: 36000,
    target: 80000,
    startDate: '2024-02-10',
    lastUpdate: '2024-02-27',
    nextFollowup: '2024-03-05',
    donorCount: 8,
    timeline: [
      { date: '2024-02-27', type: 'urgent', title: 'Urgent funding request submitted', amount: 10000 },
      { date: '2024-02-24', type: 'medical', title: 'Hospital bills submitted' },
      { date: '2024-02-20', type: 'donation', title: 'Emergency donation received', amount: 2000 },
    ]
  }
];

const CaseManagement = () => {
  const [selectedCase, setSelectedCase] = useState(cases[0]);

  const TimelineView = ({ caseData }: { caseData: typeof cases[0] }) => (
    <div className="space-y-4">
      {caseData.timeline.map((event, index) => (
        <div key={index} className="flex gap-4 p-4 border border-border rounded-lg">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            {event.type === 'donation' && <DollarSign className="w-5 h-5 text-success" />}
            {event.type === 'report' && <FileText className="w-5 h-5 text-info" />}
            {event.type === 'visit' && <Users className="w-5 h-5 text-primary" />}
            {event.type === 'photo' && <Camera className="w-5 h-5 text-warning" />}
            {event.type === 'urgent' && <AlertTriangle className="w-5 h-5 text-destructive" />}
            {event.type === 'medical' && <FileText className="w-5 h-5 text-info" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{event.title}</h4>
              <span className="text-sm text-muted-foreground">{event.date}</span>
            </div>
            {event.amount && (
              <p className="text-success font-medium mt-1">+${event.amount.toLocaleString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const ProgressTracker = ({ caseData }: { caseData: typeof cases[0] }) => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Funding Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Raised</span>
            <span className="font-medium">${caseData.raised.toLocaleString()} / ${caseData.target.toLocaleString()}</span>
          </div>
          <Progress value={caseData.progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{caseData.progress}% Complete</span>
            <span>${(caseData.target - caseData.raised).toLocaleString()} remaining</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{caseData.donorCount}</div>
            <div className="text-sm text-muted-foreground">Active Donors</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-success">PKR {caseData.raised.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Raised</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Upcoming Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Follow-up Visit</p>
              <p className="text-xs text-muted-foreground">{caseData.nextFollowup}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="w-4 h-4 text-warning" />
            <div className="flex-1">
              <p className="font-medium text-sm">Monthly Report Due</p>
              <p className="text-xs text-muted-foreground">March 1, 2024</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const DonationUtilization = ({ caseData }: { caseData: typeof cases[0] }) => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Utilization Log</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Add Utilization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Fund Utilization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (PKR)</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input id="purpose" placeholder="e.g., School fees, Medical bills" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional details..." />
                </div>
                <div>
                  <Label>Upload Receipt/Proof</Label>
                  <Card className="p-4 border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm">Upload receipt or photo proof</p>
                    </div>
                  </Card>
                </div>
                <Button className="w-full">Record Utilization</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {[
            { date: '2024-02-25', amount: 5000, purpose: 'School fees payment', verified: true },
            { date: '2024-02-20', amount: 2500, purpose: 'Medical checkup', verified: true },
            { date: '2024-02-15', amount: 3000, purpose: 'Monthly groceries', verified: false },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">{item.purpose}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">PKR {item.amount.toLocaleString()}</p>
                <Badge variant={item.verified ? 'default' : 'secondary'}>
                  {item.verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground mt-1">
            Track progress and manage active cases
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <TrendingUp className="w-4 h-4 mr-2" />
          Request More Help
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Case List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Active Cases</h3>
            <div className="space-y-2">
              {cases.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCase.id === caseItem.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm truncate">{caseItem.name}</div>
                  <div className="text-xs opacity-75 mt-1">{caseItem.beneficiary}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant={caseItem.status === 'Critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {caseItem.status}
                    </Badge>
                    <span className="text-xs opacity-75">{caseItem.progress}%</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedCase.name}</h2>
                <p className="text-muted-foreground">Beneficiary: {selectedCase.beneficiary}</p>
              </div>
              <Badge 
                variant={selectedCase.priority === 'Critical' ? 'destructive' : 'default'}
              >
                {selectedCase.priority} Priority
              </Badge>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
                <TabsTrigger value="utilization">Fund Utilization</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <TimelineView caseData={selectedCase} />
              </TabsContent>

              <TabsContent value="progress" className="mt-6">
                <ProgressTracker caseData={selectedCase} />
              </TabsContent>

              <TabsContent value="utilization" className="mt-6">
                <DonationUtilization caseData={selectedCase} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseManagement;