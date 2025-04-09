'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, use mock data
    // In a real implementation, we would fetch from the API
    const mockChannels: Channel[] = [
      {
        id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        title: 'Google Developers',
        description: 'The official YouTube channel for Google Developers',
        thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/APkrFKZGyBWoF-7Ax9H-eyA8Q8Lcy9rQgqQSHXTKNKkJ=s176-c-k-c0x00ffffff-no-rj',
        videoCount: 128
      },
      {
        id: 'UCsBjURrPoezykLs9EqgamOA',
        title: 'Fireship',
        description: 'High-intensity ⚡ code tutorials and tech news',
        thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/APkrFKb--NH6RwAGHYsD3KfxX-SAgWgIHrjx5tiYO8LEBg=s176-c-k-c0x00ffffff-no-rj',
        videoCount: 87
      },
      {
        id: 'UCmXmlB4-HJytD7wek0Uo97A',
        title: 'JavaScript Mastery',
        description: 'Master modern web development with JavaScript',
        thumbnailUrl: 'https://yt3.googleusercontent.com/wg1TITEoPfxvBGfzuqWyt3bqm_qu35ZhMswUv3feetU3xNX_6wsAXZF40OlPIgY4TmqbqCmAZ1U=s176-c-k-c0x00ffffff-no-rj',
        videoCount: 65
      }
    ];
    
    setChannels(mockChannels) ;
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Archived Channels</h1>
        
        <div className="mb-8">
          <p className="text-gray-600">
            Browse all YouTube channels that have been archived. Click on a channel to view its videos and search through transcripts.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">Loading channels...</div>
        ) : error ? (
          <div className="text-red-500 p-4">Error: {error}</div>
        ) : channels.length === 0 ? (
          <div className="text-center p-8">
            <p className="mb-4">No channels have been archived yet.</p>
            <Link 
              href="/" 
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Archive a Channel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <Link 
                key={channel.id} 
                href={`/channel/${channel.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    {channel.thumbnailUrl && (
                      <img 
                        src={channel.thumbnailUrl} 
                        alt={channel.title} 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{channel.title}</h3>
                      <p className="text-sm text-gray-500">{channel.videoCount} videos archived</p>
                    </div>
                  </div>
                  
                  {channel.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{channel.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>YouTube Transcript Archive &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
