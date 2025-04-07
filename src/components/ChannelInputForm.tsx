import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelInputForm() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelUrl.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to validate and process the channel URL
      const response = await fetch(`/api/channel?url=${encodeURIComponent(channelUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process channel URL');
      }
      
      const channelData = await response.json();
      
      // Redirect to channel page
      router.push(`/channel/${channelData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="channelUrl">
            YouTube Channel URL
          </label>
          <input
            id="channelUrl"
            type="text"
            placeholder="https://www.youtube.com/channel/..."
            value={channelUrl}
            onChange={(e)  => setChannelUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a YouTube channel URL (e.g., https://www.youtube.com/c/channelname) 
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading || !channelUrl.trim()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Archive Channel'}
          </button>
          
          <Link href="/search" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Search Existing Archives
          </Link>
        </div>
      </form>
    </div>
  );
}
