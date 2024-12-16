import { fetchBooks } from '@/lib/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

export default async function Home() {
  // Opt out of caching for this page
  noStore();
  
  const books = await fetchBooks();
  
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Books</h1>
          <Link href="/book/add">
            <Button>Add a New Book</Button>
          </Link>
        </div>
        
        {books.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-gray-600 mb-4">No books added yet.</p>
            <Link href="/book/add">
              <Button>Add Your First Book</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Link 
                href={`/book/${book.id}`} 
                key={book.id}
                className="block"
              >
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
                  <p className="text-gray-600">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
