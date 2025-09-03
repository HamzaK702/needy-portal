import { useState } from 'react';
import { Plus, Search, Filter, Edit, Eye, MapPin, Phone, Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const needyCases = [
  {
    id: 1,
    name: 'Fatima Ahmed',
    cnic: '42101-1234567-8',
    type: 'Recurring',
    status: 'Active',
    location: 'Karachi, Sindh',
    phone: '+92 300 1234567',
    dateAdded: '2024-01-15',
    lastUpdate: '2024-02-28',
    familyMembers: 4,
    totalReceived: 37500,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    cnic: '42101-7654321-9',
    type: 'One-time',
    status: 'Pending',
    location: 'Lahore, Punjab',
    phone: '+92 301 7654321',
    dateAdded: '2024-02-10',
    lastUpdate: '2024-02-25',
    familyMembers: 6,
    totalReceived: 15000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 3,
    name: 'Khadija Bibi',
    cnic: '42101-9876543-2',
    type: 'Recurring',
    status: 'Completed',
    location: 'Islamabad',
    phone: '+92 302 9876543',
    dateAdded: '2024-01-05',
    lastUpdate: '2024-02-20',
    familyMembers: 3,
    totalReceived: 25000,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop&crop=faces'
  }
];

const NeedyManagement = () => {
  const [activeTab, setActiveTab] = useState('existing');
  const [searchTerm, setSearchTerm] = useState('');

  const OnboardNewNeedy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" placeholder="Enter full name" />
          </div>
          <div>
            <Label htmlFor="cnic">CNIC *</Label>
            <Input id="cnic" placeholder="42101-1234567-8" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" placeholder="+92 300 1234567" />
          </div>
          <div>
            <Label htmlFor="needType">Type of Need *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select need type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring Support</SelectItem>
                <SelectItem value="onetime">One-time Emergency</SelectItem>
                <SelectItem value="medical">Medical Treatment</SelectItem>
                <SelectItem value="education">Educational Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Area of Operation</Label>
            <Input id="location" placeholder="City, Province" />
          </div>
          <div>
            <Label htmlFor="familyMembers">Family Members</Label>
            <Input id="familyMembers" type="number" placeholder="Number of family members" />
          </div>
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (PKR)</Label>
            <Input id="monthlyIncome" type="number" placeholder="0" />
          </div>
          <div>
            <Label htmlFor="description">Assessment Notes</Label>
            <Textarea id="description" placeholder="Describe the situation and needs..." rows={3} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Document Uploads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Death Certificate</p>
              <p className="text-xs text-muted-foreground">PDF or Image</p>
            </div>
          </Card>
          <Card className="p-4 border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Living Condition Photos</p>
              <p className="text-xs text-muted-foreground">Multiple Images</p>
            </div>
          </Card>
          <Card className="p-4 border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Income Proof</p>
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">Save Draft</Button>
        <Button variant="outline" className="flex-1">Submit for Review</Button>
      </div>
    </div>
  );

  const ExistingCases = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, CNIC, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {needyCases.map((needyCase) => (
          <Card key={needyCase.id} className="p-6 hover:shadow-hover transition-shadow">
            <div className="flex items-start gap-4">
              <img
                src={needyCase.image}
                alt={needyCase.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{needyCase.name}</h3>
                    <p className="text-sm text-muted-foreground">{needyCase.cnic}</p>
                  </div>
                  <Badge variant={needyCase.status === 'Active' ? 'default' : needyCase.status === 'Pending' ? 'secondary' : 'outline'}>
                    {needyCase.status}
                  </Badge>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {needyCase.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {needyCase.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Added: {needyCase.dateAdded}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Family Members: {needyCase.familyMembers}</span>
                    <span className="font-medium text-success">PKR {needyCase.totalReceived.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{needyCase.name} - Case Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>CNIC</Label>
                              <p className="text-sm">{needyCase.cnic}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Badge className="ml-2">{needyCase.status}</Badge>
                            </div>
                            <div>
                              <Label>Location</Label>
                              <p className="text-sm">{needyCase.location}</p>
                            </div>
                            <div>
                              <Label>Type</Label>
                              <p className="text-sm">{needyCase.type}</p>
                            </div>
                          </div>
                          <div>
                            <Label>Assessment Notes</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Family of {needyCase.familyMembers} members requiring support. Regular assessment shows consistent need for basic necessities and healthcare support.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">Upload New Photos</Button>
                            <Button variant="outline" className="flex-1">Request Follow-up</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Needy Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all beneficiary cases and onboarding
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Case
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Cases ({needyCases.length})</TabsTrigger>
          <TabsTrigger value="onboard">Onboard New Needy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="mt-6">
          <ExistingCases />
        </TabsContent>
        
        <TabsContent value="onboard" className="mt-6">
          <Card className="p-6">
            <OnboardNewNeedy />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NeedyManagement;