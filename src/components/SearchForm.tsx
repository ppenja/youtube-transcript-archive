import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  channelId?: string;
}

export default function SearchForm({ channelId }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Construct search URL with query parameters
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (channelId) {
      searchParams.append('channelId', channelId);
    }
    
    // Navigate to search results page
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center border-b border-gray-300 py-2">
        <input
          type="text"
          placeholder="Search for keywords in transcripts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
