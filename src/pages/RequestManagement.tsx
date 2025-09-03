import { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Clock, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const requests = [
  {
    id: 1,
    title: 'Emergency Medical Fund for Ahmed Hassan',
    beneficiary: 'Ahmed Hassan',
    category: 'Healthcare',
    amount: 80000,
    urgency: 'Critical',
    status: 'Active',
    visibility: 'Public',
    dateCreated: '2024-02-25',
    deadline: '2024-03-15',
    description: 'Urgent medical treatment required for kidney surgery. Family unable to afford treatment costs.',
    raised: 36000,
    donorCount: 8,
    lastUpdate: '2024-02-28'
  },
  {
    id: 2,
    title: 'Educational Support for Fatima',
    beneficiary: 'Fatima Ahmed',
    category: 'Education',
    amount: 50000,
    urgency: 'High',
    status: 'Fulfilled',
    visibility: 'Public',
    dateCreated: '2024-01-15',
    deadline: '2024-04-01',
    description: 'Support needed for university tuition fees and educational materials.',
    raised: 37500,
    donorCount: 12,
    lastUpdate: '2024-02-20'
  },
  {
    id: 3,
    title: 'Monthly Groceries for Widow Family',
    beneficiary: 'Khadija Bibi',
    category: 'Support',
    amount: 30000,
    urgency: 'Medium',
    status: 'Pending',
    visibility: 'Private',
    dateCreated: '2024-02-20',
    deadline: '2024-06-01',
    description: 'Ongoing monthly support needed for widow with 3 children.',
    raised: 18000,
    donorCount: 6,
    lastUpdate: '2024-02-27'
  }
];

const RequestManagement = () => {
  const [activeTab, setActiveTab] = useState('active');

  const CreateRequestForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="requestTitle">Request Title *</Label>
            <Input id="requestTitle" placeholder="Enter descriptive title" />
          </div>
          <div>
            <Label htmlFor="beneficiary">Beneficiary *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select beneficiary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ahmed">Ahmed Hassan</SelectItem>
                <SelectItem value="fatima">Fatima Ahmed</SelectItem>
                <SelectItem value="khadija">Khadija Bibi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="support">General Support</SelectItem>
                <SelectItem value="emergency">Emergency Relief</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Target Amount (PKR) *</Label>
            <Input id="amount" type="number" placeholder="50000" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="urgency">Urgency Level *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="public-listing" />
            <Label htmlFor="public-listing">Make publicly visible</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="emergency-flag" />
            <Label htmlFor="emergency-flag">Mark as emergency</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea 
          id="description" 
          placeholder="Provide detailed information about the need, situation, and how funds will be used..."
          rows={4}
        />
      </div>

      <div>
        <Label>Supporting Documents</Label>
        <Card className="p-4 border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer">
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload medical reports, bills, or other documents</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB each</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">Create & Publish Request</Button>
        <Button variant="outline" className="flex-1">Save as Draft</Button>
      </div>
    </div>
  );

  const RequestCard = ({ request }: { request: typeof requests[0] }) => {
    const progress = (request.raised / request.amount) * 100;
    
    return (
      <Card className="p-6 hover:shadow-hover transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{request.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>Beneficiary: {request.beneficiary}</span>
              <span>•</span>
              <span>Created: {request.dateCreated}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={
              request.status === 'Active' ? 'default' : 
              request.status === 'Fulfilled' ? 'secondary' : 
              'outline'
            }>
              {request.status}
            </Badge>
            <Badge variant={
              request.urgency === 'Critical' ? 'destructive' :
              request.urgency === 'High' ? 'secondary' :
              'outline'
            }>
              {request.urgency}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>PKR {request.raised.toLocaleString()} / PKR {request.amount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% funded</span>
            <span>{request.donorCount} donors</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{request.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Beneficiary</Label>
                    <p className="text-sm">{request.beneficiary}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{request.category}</p>
                  </div>
                  <div>
                    <Label>Target Amount</Label>
                    <p className="text-sm">PKR {request.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <div className="flex items-center gap-1">
                      {request.visibility === 'Public' ? 
                        <Globe className="w-3 h-3" /> : 
                        <Eye className="w-3 h-3" />
                      }
                      <p className="text-sm">{request.visibility}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-success">PKR {request.raised.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Raised</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{request.donorCount}</div>
                    <div className="text-xs text-muted-foreground">Donors</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-info">{Math.round(progress)}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" className="flex-1">
            <Edit className="w-3 h-3 mr-1" />
            Edit Request
          </Button>
        </div>
      </Card>
    );
  };

  const filteredRequests = requests.filter(request => {
    switch (activeTab) {
      case 'active': return request.status === 'Active';
      case 'pending': return request.status === 'Pending';
      case 'fulfilled': return request.status === 'Fulfilled';
      default: return true;
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and track donation requests for your cases
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
            </DialogHeader>
            <CreateRequestForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Active').length}</p>
                <p className="text-sm text-muted-foreground">Active Requests</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Fulfilled').length}</p>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{requests.filter(r => r.visibility === 'Public').length}</p>
                <p className="text-sm text-muted-foreground">Public Requests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Request Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="active">Active ({requests.filter(r => r.status === 'Active').length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({requests.filter(r => r.status === 'Pending').length})</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled ({requests.filter(r => r.status === 'Fulfilled').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(activeTab === 'all' ? requests : filteredRequests).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RequestManagement;