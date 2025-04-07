'use client';

import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const channelId = searchParams.get('channelId') || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search Transcripts</h1>
        
        <div className="mb-8">
          <SearchForm channelId={channelId} />
        </div>
        
        {query && (
          <SearchResults query={query} channelId={channelId} />
        )}
      </main>
      
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>YouTube Transcript Archive &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
