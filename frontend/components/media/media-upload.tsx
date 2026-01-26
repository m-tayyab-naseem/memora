"use client";

import React from "react"

import { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

interface MediaUploadProps {
  vaultId: string;
  onUploadSuccess?: () => void;
}

export function MediaUpload({ vaultId, onUploadSuccess }: MediaUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("media", file);
      });

      await apiClient.uploadMedia(vaultId, formData);
      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload media"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Media</CardTitle>
        <CardDescription>
          Upload photos and videos to this vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Media uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-violet-400 transition-colors">
          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-2">
            Drop your files here or click to select
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Supported: JPG, PNG, GIF, WebP, MP4, WebM (max 100MB per file)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
            id="file-input"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="gap-2"
          >
            {loading ? "Uploading..." : "Select Files"}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          All files are encrypted and stored securely
        </p>
      </CardContent>
    </Card>
  );
}
