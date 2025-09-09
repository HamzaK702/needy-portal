import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Camera, MapPin, FileText, User, Phone, IdCard, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AddCase = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    phone: '',
    address: '',
    needType: '',
    description: '',
    familyMembers: '',
    monthlyIncome: '',
    isRecurring: false,
    emergencyContact: '',
    emergencyPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Case Added Successfully",
      description: "The new case has been created and is now under review.",
    });
    // Reset form
    setFormData({
      name: '',
      cnic: '',
      phone: '',
      address: '',
      needType: '',
      description: '',
      familyMembers: '',
      monthlyIncome: '',
      isRecurring: false,
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add New Case</h1>
        <p className="text-muted-foreground">Create a new case for someone in need of assistance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic details of the person in need</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC *</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => handleInputChange('cnic', e.target.value)}
                  placeholder="00000-0000000-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+92 300 0000000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyMembers">Family Members</Label>
                <Input
                  id="familyMembers"
                  value={formData.familyMembers}
                  onChange={(e) => handleInputChange('familyMembers', e.target.value)}
                  placeholder="Number of family members"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address including area, city"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Need Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Need Assessment
            </CardTitle>
            <CardDescription>Details about the type of assistance required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="needType">Type of Need *</Label>
                <Select value={formData.needType} onValueChange={(value) => handleInputChange('needType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select need type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical Treatment</SelectItem>
                    <SelectItem value="education">Education Support</SelectItem>
                    <SelectItem value="food">Food Assistance</SelectItem>
                    <SelectItem value="shelter">Housing/Shelter</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (PKR)</Label>
                <Input
                  id="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="Enter monthly household income"
                  type="number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the situation and assistance needed"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleInputChange('isRecurring', !!checked)}
              />
              <Label htmlFor="recurring">This is a recurring need (monthly assistance)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Alternate contact person details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contact Person Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Name of emergency contact"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Person Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>Upload supporting documents and photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNIC Copy</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <IdCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload CNIC</p>
                  <Input type="file" className="hidden" accept="image/*,.pdf" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Living Conditions Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload photos</p>
                  <Input type="file" className="hidden" accept="image/*" multiple />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Additional Documents (Medical reports, bills, etc.)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload additional supporting documents</p>
                <Input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" multiple />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>Precise location for verification and visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Mark Location on Map</h3>
              <p className="text-sm text-muted-foreground mb-4">Click to open map and mark the exact location</p>
              <Button variant="outline" type="button">
                <MapPin className="h-4 w-4 mr-2" />
                Open Map
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Create Case
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCase;