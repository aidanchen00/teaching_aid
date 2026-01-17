import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8 inline-block">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          Learning App
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 mb-4 font-light drop-shadow">
          Split-screen learning with LiveKit
        </p>
        
        <p className="text-base md:text-lg text-white/70 mb-12 max-w-2xl mx-auto">
          Experience interactive learning with real-time video collaboration, 
          AI-powered tutoring, and seamless communication.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 text-white/90 shadow-lg">
            <span className="font-medium">🎥 Real-time Video</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 text-white/90 shadow-lg">
            <span className="font-medium">🤖 AI Tutoring</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 text-white/90 shadow-lg">
            <span className="font-medium">📚 Interactive Learning</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/room"
          className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
        >
          <span>Enter Room</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Bottom text */}
        <p className="mt-8 text-white/60 text-sm">
          Powered by LiveKit • Built for modern learning
        </p>
      </div>
    </div>
  );
}
