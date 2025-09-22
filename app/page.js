import React from 'react';

// En una aplicación Next.js real, Tailwind CSS se configura a nivel de proyecto,
// por lo que no es necesario importar el CDN. Esta página asume que Tailwind ya está disponible.

const MixaLabPage = () => {
  return (
    <div className="bg-black text-white antialiased">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center p-4 bg-gray-900 bg-pattern">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Send Your Track. Get Matched Instantly. <span className="text-gray-400">Professional Mixing & Mastering, Human-Powered.</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Mixa Lab is the platform that connects artists with verified engineers worldwide — like ride-sharing, but for music. No algorithms, no guesswork, no AI presets. Just real humans with taste, creativity, and experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#" className="bg-white text-black font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-gray-200 shadow-md transform hover:scale-105">
              Start Your Mix
            </a>
            <a href="#" className="text-white text-sm hover:underline transition-all duration-300">
              I’m a Creator — Join as an Engineer
            </a>
          </div>
        </div>
      </section>

      {/* Why Mixa Lab Section */}
      <section className="py-16 md:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Mixa Lab?</h2>
          <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
            {/* Artist Benefit */}
            <div className="bg-neutral-800 p-8 rounded-xl shadow-lg transition-all duration-300 hover:bg-neutral-700">
              <div className="text-4xl mb-4">🎶</div>
              <h3 className="text-xl font-semibold mb-2">Artists Don’t Hunt Engineers Anymore</h3>
              <p className="text-gray-300">
                Stop scouring forums and social media. Our platform instantly matches you with the perfect, verified engineer for your track's unique needs, so you can focus on making music.
              </p>
            </div>
            {/* Engineer Benefit */}
            <div className="bg-neutral-800 p-8 rounded-xl shadow-lg transition-all duration-300 hover:bg-neutral-700">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Engineers Don’t Chase Clients Anymore</h3>
              <p className="text-gray-300">
                Say goodbye to constant self-promotion. We bring the work to you, matching you with new clients from around the world based on your skills and availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 text-gray-200 rounded-full mb-4 font-bold text-2xl">1</div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Track</h3>
              <p className="text-gray-400">Securely upload your audio files and provide details about your project and vision.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 text-gray-200 rounded-full mb-4 font-bold text-2xl">2</div>
              <h3 className="text-lg font-semibold mb-2">Get Matched Instantly</h3>
              <p className="text-gray-400">Our team matches you with a verified, human engineer who specializes in your genre and style.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 text-gray-200 rounded-full mb-4 font-bold text-2xl">3</div>
              <h3 className="text-lg font-semibold mb-2">Collaborate & Refine</h3>
              <p className="text-gray-400">Work directly with your matched engineer to get the perfect sound for your track.</p>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-800 text-gray-200 rounded-full mb-4 font-bold text-2xl">4</div>
              <h3 className="text-lg font-semibold mb-2">Receive Your Final Mix</h3>
              <p className="text-gray-400">Download your professionally mixed and mastered track, ready for release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center sm:text-left">
          <p>&copy; 2024 Mixa Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MixaLabPage;
