import MidiLyricsGenerator from "@/components/midi-lyrics-generator";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <Link href="/web-component" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center">
          <span className="mr-2">Web Componentデモ</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </Link>
      </div>
      <MidiLyricsGenerator />
    </div>
  );
}
