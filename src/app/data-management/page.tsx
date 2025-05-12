"use client";

import React, { useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, DownloadCloud } from 'lucide-react';
import type { AppData } from '@/types';

export default function DataManagementPage() {
  const { exportData, importData: importAppData } = useAppData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `fintrack_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({
      title: "Data Exported",
      description: "Your data has been successfully downloaded.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedData = JSON.parse(content) as AppData;
            // Basic validation (can be more robust)
            if (importedData.expenses && importedData.incomes && importedData.budgets) {
              importAppData(importedData);
              toast({
                title: "Data Imported",
                description: "Your data has been successfully imported.",
              });
            } else {
              throw new Error("Invalid file format.");
            }
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "The selected file is not valid or corrupted. Please try again.",
            variant: "destructive",
          });
          console.error("Import error:", error);
        } finally {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download all your financial data as a JSON file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <DownloadCloud className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will download a JSON file containing all your expenses, incomes, and budgets.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Import data from a previously exported JSON file.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Import data file"
            />
            <Button onClick={handleImportClick} variant="outline" className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-4 w-4" />
              Import Data from File
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Warning: Importing data will overwrite your current data. Ensure the file is a valid FinTrack export.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
