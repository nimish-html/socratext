"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { addNote } from '@/lib/db';

interface NoteTakingProps {
  params: {
    id: string;
  };
}

export default function NoteTaking({ params }: NoteTakingProps) {
  const router = useRouter();
  const [noteContent, setNoteContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCapture = (data: { note: string }) => {
    setNoteContent(data.note);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setNoteContent(null);
  };

  const handleSubmit = async () => {
    if (!noteContent) return;

    try {
      setIsSubmitting(true);
      await addNote(params.id, noteContent);
      router.push(`/book/${params.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Take a Note</h1>
      
      {!noteContent ? (
        <>
          <CameraCapture 
            mode="note"
            onCapture={handleCapture}
            onError={handleError}
          />
          {error && (
            <div className="text-red-500 text-center">
              {error}
            </div>
          )}
        </>
      ) : (
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Note Content
            </label>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setNoteContent(null)}
              disabled={isSubmitting}
            >
              Retake Photo
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding Note...' : 'Add Note'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 