'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface VideoDetailProps {
  params: {
    id: string;
  };
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  hasTranscript: boolean;
}

interface TranscriptSegment {
  id: number;
  text: string;
  start: number;
  duration: number;
}

export default function VideoDetailPage({ params }: VideoDetailProps) {
  const { id: videoId } = params;
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, use mock data
    // In a real implementation, we would fetch from the API
    const mockVideo: VideoInfo = {
      id: videoId,
      title: `Video ${videoId}`,
      description: 'This is a sample video description that would typically contain information about the video content.',
      publishedAt: new Date().toISOString(),
      thumbnailUrl: 'https://via.placeholder.com/640x360',
      channelId: 'channel-123',
      channelTitle: 'Sample Channel',
      hasTranscript: true
    };
    
    setVideo(mockVideo) ;
    setLoading(false);
    
    // If video has transcript, fetch it
    if (mockVideo.hasTranscript) {
      fetchTranscript(videoId);
    }
  }, [videoId]);

  const fetchTranscript = async (videoId: string) => {
    setTranscriptLoading(true);
    
    // For demo purposes, use mock data
    // In a real implementation, we would fetch from the API
    const mockTranscript: TranscriptSegment[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      text: `This is transcript segment ${i + 1}. It contains sample text that would be part of the video transcript.`,
      start: i * 30,
      duration: 30
    }));
    
    setTranscript(mockTranscript);
    setTranscriptLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center p-8">Loading video information...</div>
        ) : error ? (
          <div className="text-red-500 p-4">Error: {error}</div>
        ) : video ? (
          <>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                  <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
                  
                  <div className="flex items-center mt-2 text-gray-600">
                    <Link href={`/channel/${video.channelId}`} className="hover:text-blue-600">
                      {video.channelTitle}
                    </Link>
                    <span className="mx-2">•</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
                  </div>
                </div>
                
                <div className="md:w-1/3">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-semibold mb-4">Video Transcript</h2>
                    
                    {video.hasTranscript ? (
                      transcriptLoading ? (
                        <div className="p-4 text-center">Loading transcript...</div>
                      ) : transcriptError ? (
                        <div className="text-red-500 p-4">Error: {transcriptError}</div>
                      ) : transcript.length > 0 ? (
                        <div className="max-h-[500px] overflow-y-auto">
                          {transcript.map(segment => (
                            <div key={segment.id} className="mb-4 p-2 hover:bg-gray-50">
                              <a 
                                href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(segment.start) }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline block mb-1"
                              >
                                {formatTimestamp(segment.start)}
                              </a>
                              <p className="text-gray-700">{segment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">No transcript segments found.</div>
                      )
                    ) : (
                      <div className="p-4 text-center">
                        No transcript available for this video.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">Video not found.</div>
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
