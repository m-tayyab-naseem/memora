"use client";

import React from "react"

import { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";

interface MediaUploadProps {
  vaultId: string;
  onUploadSuccess?: () => void;
}

export function MediaUpload({ vaultId, onUploadSuccess }: MediaUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedFiles(Array.from(files));
    setError(null);
    setSuccess(false);
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setCaption("");
    setMemoryDate("");
    setTags("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // If multiple files, we'll upload them one by one to keep the backend simple 
      // or we can update the backend to handle multiple. 
      // Given the user's request for "media items", and specific defaults, 
      // uploading one by one from the frontend is safer if the metadata is shared.

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("media", file);
        if (caption) formData.append("description", caption);
        if (memoryDate) formData.append("capturedAt", memoryDate);
        if (tags) formData.append("tags", tags);

        await apiClient.uploadMedia(vaultId, formData);
      }

      setSuccess(true);
      resetForm();
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
          {selectedFiles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-violet-600">
                {selectedFiles.length} file(s) selected
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles([])}
                disabled={loading}
              >
                Clear Selection
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Drop your files here or click to select
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Supported: JPG, PNG, GIF, WebP, MP4, WebM, MKV (max 100MB per file)
              </p>
            </>
          )}
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
          {!selectedFiles.length && (
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="gap-2"
            >
              Select Files
            </Button>
          )}
        </div>

        {/* Optional Metadata Form */}
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="text-sm font-medium">Add Context (Optional)</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showForm ? "rotate-180" : ""}`} />
        </Button>

        {showForm && (
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Caption
              </label>
              <Input
                placeholder="e.g., Family dinner on Christmas"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                When did this memory happen?
              </label>
              <Input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Tags (comma-separated)
              </label>
              <Input
                placeholder="e.g., family, celebration, 2023"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm"
              />
            </div>

            <p className="text-xs text-slate-500 italic">
              This information will be saved with your media and help organize your memories
            </p>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <Button
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? `Uploading ${selectedFiles.length} item(s)...` : `Upload ${selectedFiles.length} Memory(ies)`}
          </Button>
        )}

        <p className="text-xs text-slate-500 text-center">
          All files are encrypted and stored securely
        </p>
      </CardContent>
    </Card>
  );
}
