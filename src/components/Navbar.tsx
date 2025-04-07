import Link from 'next/link';

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = 'YouTube Transcript Archive' }: NavbarProps) {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold hover:text-blue-200">
              {title}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link href="/search" className="hover:text-blue-200">
              Search
            </Link>
            <Link href="/channels" className="hover:text-blue-200">
              Channels
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
