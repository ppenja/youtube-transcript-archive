import Navbar from '@/components/Navbar';
import ChannelInputForm from '@/components/ChannelInputForm';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">YouTube Transcript Archive</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Archive and search through transcripts from any YouTube channel. 
            Find every mention of keywords across all videos with precise timestamps.
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Enter a YouTube Channel URL</h2>
          <ChannelInputForm />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">1. Input Channel URL</div>
              <p className="text-gray-600">
                Enter any YouTube channel URL to begin the archiving process.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">2. Extract Transcripts</div>
              <p className="text-gray-600">
                We automatically extract and archive transcripts from all videos on the channel.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">3. Search Content</div>
              <p className="text-gray-600">
                Search for any keyword or phrase across all videos with clickable timestamps.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>YouTube Transcript Archive &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
