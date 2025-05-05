import MidiLyricsGenerator from "@/components/midi-lyrics-generator";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="absolute top-2 right-2">
        <Link href="/web-component">
          <a className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
            Web Component Demo
          </a>
        </Link>
      </div>
      <MidiLyricsGenerator />
    </div>
  );
}
