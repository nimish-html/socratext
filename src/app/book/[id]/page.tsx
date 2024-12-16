import { fetchBookById, fetchNotes } from '@/lib/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

type Props = {
  params: { id: string }
}

export default async function BookDetails({ params }: Props) {
  // Opt out of caching for this page
  noStore();

  try {
    // Fetch book and notes in parallel
    const [book, notes] = await Promise.all([
      fetchBookById(params.id),
      fetchNotes(params.id)
    ]);

    if (!book) {
      return (
        <div className="container mx-auto p-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{book.title}</h1>
        <p className="text-gray-600 mb-8">by {book.author}</p>

        <div className="space-y-4 mb-8">
          <Link href={`/book/${params.id}/notes`}>
            <Button className="w-full">Take Notes</Button>
          </Link>
          <Link href={`/book/${params.id}/chat`}>
            <Button className="w-full">Chat Mode</Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notes</h2>
          {notes.length === 0 ? (
            <p className="text-gray-500">No notes yet. Start taking notes!</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg">
                <p>{note.note_content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading book details:', error);
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Book</h1>
          <p className="text-gray-600 mb-4">There was an error loading the book details.</p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
} 