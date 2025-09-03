import { useState } from 'react';
import { MessageSquare, Phone, Mail, Heart, Calendar, DollarSign, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const donors = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 555 0123',
    totalDonated: 15000,
    casesSupported: 3,
    lastDonation: '2024-02-28',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c4?w=100&h=100&fit=crop&crop=faces',
    assignedCases: ['Fatima Education Fund', 'Ahmed Medical Treatment'],
    communicationHistory: [
      { date: '2024-02-28', type: 'message', content: 'Thank you for the recent update on Fatima\'s progress!' },
      { date: '2024-02-25', type: 'call', content: 'Phone call - discussed monthly report' },
      { date: '2024-02-20', type: 'email', content: 'Sent case progress photos and documentation' }
    ]
  },
  {
    id: 2,
    name: 'Ahmad Ali',
    email: 'ahmad.ali@email.com', 
    phone: '+92 300 1234567',
    totalDonated: 25000,
    casesSupported: 5,
    lastDonation: '2024-02-26',
    status: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    assignedCases: ['Widow Support Program', 'Orphan Care Initiative'],
    communicationHistory: [
      { date: '2024-02-26', type: 'message', content: 'Increased monthly donation amount' },
      { date: '2024-02-22', type: 'email', content: 'Shared success stories from supported families' }
    ]
  },
  {
    id: 3,
    name: 'Emma Chen',
    email: 'emma.chen@email.com',
    phone: '+1 555 0456',
    totalDonated: 8500,
    casesSupported: 2,
    lastDonation: '2024-02-15',
    status: 'Regular',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    assignedCases: ['Emergency Relief Fund'],
    communicationHistory: [
      { date: '2024-02-15', type: 'message', content: 'Would like quarterly updates instead of monthly' },
      { date: '2024-02-10', type: 'call', content: 'Discussed transparency and reporting preferences' }
    ]
  }
];

const DonorRelations = () => {
  const [selectedDonor, setSelectedDonor] = useState(donors[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const DonorProfile = ({ donor }: { donor: typeof donors[0] }) => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={donor.avatar} />
            <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{donor.name}</h3>
                <p className="text-muted-foreground">{donor.email}</p>
                <p className="text-sm text-muted-foreground">{donor.phone}</p>
              </div>
              <Badge variant={donor.status === 'VIP' ? 'default' : 'secondary'}>
                {donor.status} Donor
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold text-success">${donor.totalDonated.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Donated</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold text-primary">{donor.casesSupported}</div>
                <div className="text-xs text-muted-foreground">Cases Supported</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold text-info">{donor.lastDonation}</div>
                <div className="text-xs text-muted-foreground">Last Donation</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Assigned Cases</h4>
        <div className="space-y-3">
          {donor.assignedCases.map((caseName, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">{caseName}</span>
              <Button size="sm" variant="outline">View Details</Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to {donor.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter subject" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Write your message..." rows={4} />
              </div>
              <Button className="w-full">Send Message</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" className="flex-1">
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        
        <Button variant="outline" className="flex-1">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </div>
    </div>
  );

  const CommunicationHistory = ({ donor }: { donor: typeof donors[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Communication History</h4>
        <Button size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>
      
      <div className="space-y-3">
        {donor.communicationHistory.map((comm, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {comm.type === 'message' && <MessageSquare className="w-4 h-4" />}
                {comm.type === 'call' && <Phone className="w-4 h-4" />}
                {comm.type === 'email' && <Mail className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{comm.type}</span>
                  <span className="text-sm text-muted-foreground">{comm.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{comm.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const DonationTracking = ({ donor }: { donor: typeof donors[0] }) => (
    <div className="space-y-4">
      <h4 className="font-semibold">Donation History</h4>
      
      <Card className="p-4">
        <div className="space-y-3">
          {[
            { date: '2024-02-28', amount: 500, case: 'Fatima Education Fund', type: 'Monthly' },
            { date: '2024-02-15', amount: 1000, case: 'Ahmed Medical Treatment', type: 'Emergency' },
            { date: '2024-02-01', amount: 500, case: 'Fatima Education Fund', type: 'Monthly' },
            { date: '2024-01-28', amount: 250, case: 'General Fund', type: 'One-time' },
          ].map((donation, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">{donation.case}</p>
                <p className="text-sm text-muted-foreground">{donation.date} • {donation.type}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-success">${donation.amount}</p>
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
          <h1 className="text-3xl font-bold">Donor Relations</h1>
          <p className="text-muted-foreground mt-1">
            Manage relationships with your assigned donors
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Heart className="w-4 h-4 mr-2" />
          Add New Donor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Donor List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {donors.map((donor) => (
                  <button
                    key={donor.id}
                    onClick={() => setSelectedDonor(donor)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDonor.id === donor.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={donor.avatar} />
                        <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{donor.name}</div>
                        <div className="text-xs opacity-75">${donor.totalDonated.toLocaleString()}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <DonorProfile donor={selectedDonor} />
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <CommunicationHistory donor={selectedDonor} />
            </TabsContent>

            <TabsContent value="donations" className="mt-6">
              <DonationTracking donor={selectedDonor} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DonorRelations;