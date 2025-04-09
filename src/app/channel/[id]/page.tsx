'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SearchForm from '@/components/SearchForm';
import Link from 'next/link';

interface ChannelDetailProps {
  params: {
    id: string;
  };
}

interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  hasTranscript: boolean;
}

export default function ChannelDetailPage({ params }: ChannelDetailProps) {
  const { id: channelId } = params;
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, use mock data
    // In a real implementation, we would fetch from the API
    const mockChannel: ChannelInfo = {
      id: channelId,
      title: `Channel ${channelId}`,
      description: 'This is a sample channel description that would typically contain information about the channel content and creator.',
      thumbnailUrl: 'https://via.placeholder.com/100',
      videoCount: 45
    };
    
    const mockVideos: Video[] = Array.from({ length: 10 }, (_, i)  => ({
      id: `video-${i}`,
      title: `Video ${i + 1} - Channel ${channelId}`,
      description: 'This is a sample video description that would typically contain information about the video content.',
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      thumbnailUrl: 'https://via.placeholder.com/320x180',
      hasTranscript: Math.random()  > 0.3 // 70% chance of having a transcript
    }));
    
    setChannel(mockChannel);
    setVideos(mockVideos);
    setLoading(false);
  }, [channelId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center p-8">Loading channel information...</div>
        ) : error ? (
          <div className="text-red-500 p-4">Error: {error}</div>
        ) : channel ? (
          <>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                {channel.thumbnailUrl && (
                  <img 
                    src={channel.thumbnailUrl} 
                    alt={channel.title} 
                    className="w-16 h-16 rounded-full mr-4"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">{channel.title}</h1>
                  <p className="text-gray-600">{channel.videoCount} videos archived</p>
                </div>
              </div>
              
              {channel.description && (
                <p className="text-gray-700 mt-2">{channel.description}</p>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Search This Channel</h2>
              <SearchForm channelId={channelId} />
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Videos</h2>
              
              {videos.length === 0 ? (
                <div className="p-4">No videos found for this channel.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                    <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <Link href={`/video/${video.id}`}>
                        <div className="relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-40 object-cover"
                          />
                          {video.hasTranscript && (
                            <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Transcript Available
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-4">
                        <Link href={`/video/${video.id}`} className="block">
                          <h3 className="font-medium text-lg line-clamp-2 hover:text-blue-600">{video.title}</h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(video.publishedAt)}
                        </p>
                        
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{video.description}</p>
                        
                        <div className="mt-4 flex space-x-2">
                          <Link 
                            href={`/video/${video.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          
                          {video.hasTranscript && (
                            <Link 
                              href={`/video/${video.id}/transcript`}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              View Transcript
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4">Channel not found.</div>
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
