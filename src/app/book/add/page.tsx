"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { addBook } from '@/lib/db';

export default function AddBook() {
  const router = useRouter();
  const [bookDetails, setBookDetails] = useState<{ title: string; author: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCapture = (data: { title: string; author: string }) => {
    console.log("Captured book details:", data);
    setBookDetails(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    console.error("Camera capture error:", errorMessage);
    setError(errorMessage);
    setBookDetails(null);
  };

  const handleSubmit = async () => {
    if (!bookDetails) {
      console.error("No book details available");
      return;
    }

    console.log("Attempting to add book:", bookDetails);
    try {
      setIsSubmitting(true);
      const result = await addBook(bookDetails.title, bookDetails.author);
      console.log("Book added successfully:", result);
      
      // Force a revalidation of the books list
      router.refresh();
      
      // Small delay to ensure the cache is invalidated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to home page
      router.push('/');
    } catch (error) {
      console.error("Failed to add book to Supabase:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      setError(error instanceof Error ? error.message : 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Add New Book</h1>
      
      {!bookDetails ? (
        <>
          <CameraCapture 
            mode="book"
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Book Title
              </label>
              <Input
                value={bookDetails.title}
                onChange={(e) => setBookDetails(prev => ({ ...prev!, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Author
              </label>
              <Input
                value={bookDetails.author}
                onChange={(e) => setBookDetails(prev => ({ ...prev!, author: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setBookDetails(null)}
              disabled={isSubmitting}
            >
              Retake Photo
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding Book...' : 'Add Book'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 