import { useState, useEffect } from 'react';

interface SearchResult {
  video_id: string;
  video_title: string;
  channel_title: string;
  published_date: string;
  thumbnail_url: string;
  text: string;
  timestamp: number;
  timestamp_url: string;
}

interface SearchResultsProps {
  query: string;
  channelId?: string;
}

export default function SearchResults({ query, channelId }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const offset = (page - 1) * limit;
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
          offset: offset.toString()
        });
        
        if (channelId) {
          params.append('channel_id', channelId);
        }
        
        const response = await fetch(`/api/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        setResults(data.results);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query, channelId, page]);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && page === 1) {
    return <div className="flex justify-center p-8">Loading search results...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (results.length === 0) {
    return <div className="p-4">No results found for "{query}"</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-gray-600">Found {total} results for "{query}"</p>
      </div>
      
      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={`${result.video_id}-${result.timestamp}-${index}`} className="border rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <a href={result.timestamp_url} target="_blank" rel="noopener noreferrer">
                  <div className="relative">
                    <img 
                      src={result.thumbnail_url} 
                      alt={result.video_title} 
                      className="w-40 h-auto rounded"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      {formatTimestamp(result.timestamp)}
                    </div>
                  </div>
                </a>
              </div>
              
              <div className="flex-grow">
                <a 
                  href={result.timestamp_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {result.video_title}
                </a>
                
                <p className="text-sm text-gray-600 mt-1">
                  {result.channel_title} • {result.published_date}
                </p>
                
                <div className="mt-2 text-gray-800">
                  <p>
                    "...{result.text}..."
                  </p>
                </div>
                
                <a 
                  href={result.timestamp_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                >
                  Watch at {formatTimestamp(result.timestamp)}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
