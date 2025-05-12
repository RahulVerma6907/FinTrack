
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const availableCurrencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'INR', label: 'INR - Indian Rupee' },
];

export default function SettingsPage() {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currency, setCurrency] = useState(user?.currencyPreference || 'USD');
  const [emailNotifications, setEmailNotifications] = useState(user?.notificationSettings?.email || false);
  // const [smsNotifications, setSmsNotifications] = useState(user?.notificationSettings?.sms || false); // SMS example

  useEffect(() => {
    if (user) {
      setCurrency(user.currencyPreference || 'USD');
      setEmailNotifications(user.notificationSettings?.email || false);
      // setSmsNotifications(user.notificationSettings?.sms || false);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      updateUserProfile({
        currencyPreference: currency,
        notificationSettings: {
          email: emailNotifications,
          // sms: smsNotifications,
        },
      });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
     return <AppLayout><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }
  
  if (!user) {
     return <AppLayout><div className="p-4 text-center text-muted-foreground">Please log in to manage settings.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Currency Preferences</CardTitle>
            <CardDescription>Choose your preferred currency for display.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map(curr => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Currency selection is for display purposes only in this demo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications from FinTrack.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive updates and alerts via email.
                </span>
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                aria-label="Toggle email notifications"
              />
            </div>
            {/* Example for another notification type, can be uncommented if needed
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                <span>SMS Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Get important alerts via SMS (placeholder).
                </span>
              </Label>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                disabled // Placeholder
              />
            </div>
            */}
          </CardContent>
        </Card>
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

