'use client';
import React from 'react';

import Link from 'next/link';
import Logo from '@/components/Logo';

// Componente para la barra de navegación con efecto Liquid Glass
// Componente para la barra de navegación con efecto Liquid Glass
const Header = ({ onScroll }) => {
  // Estado para controlar la visibilidad del dropdown
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Función que maneja el scroll y cierra el dropdown
  const handleDropdownScroll = (e, targetId) => {
    onScroll(e, targetId);
    setIsDropdownOpen(false); // Cierra el dropdown después del click
  };

  return (
    <header className="sticky top-0 z-50 glass-bg w-full backdrop-blur-lg shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-3xl font-extrabold text-white tracking-widest flex items-center">
          <Logo className="inline-block w-8 h-8 mr-2 text-sky-400" />
          <span className="text-white">Mixa</span> <span className="text-gray-400">Lab</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          {/* Scroll Suave aplicado aquí */}
          <a href="#artists" onClick={(e) => onScroll(e, '#artists')} className="text-white hover:text-gray-400 transition">For Artists</a>
          <a href="#producers" onClick={(e) => onScroll(e, '#producers')} className="text-white hover:text-gray-400 transition">For Producers</a>
          <a href="#why" onClick={(e) => onScroll(e, '#why')} className="text-white hover:text-gray-400 transition">Why Us</a>
        </nav>

        {/* SIMPLE LOGIN BUTTON */}
        <Link
          href="/login"
          className="flex items-center bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition shadow-lg"
        >
          Log In / Join
        </Link>
      </div>
    </header>
  );
};

// Componente para la barra de estadísticas/ventajas clave
const WhyMixaLab = () => (
  <div id="why" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
    <h2 className="text-3xl font-bold text-white mb-6 text-center">Why Mixa Lab</h2>
    <div className="flex flex-col md:flex-row justify-between items-stretch glass-bg rounded-2xl p-6 divide-y md:divide-y-0 md:divide-x divide-white/20">
      <div className="text-center p-4 w-full md:w-1/3">
        <p className="text-xl font-bold text-white mb-1">Verified Professionals Only</p>
        <p className="text-gray-400 text-sm">Quality over Quantity.</p>
      </div>
      <div className="text-center p-4 w-full md:w-1/3">
        <p className="text-xl font-bold text-white mb-1">Smart Matching</p>
        <p className="text-gray-400 text-sm">Saves time and money.</p>
      </div>
      <div className="text-center p-4 w-full md:w-1/3">
        <p className="text-xl font-bold text-white mb-1">Seamless Progress</p>
        <p className="text-gray-400 text-sm">Tracking and notifications.</p>
      </div>
    </div>
  </div>
);

// Datos de las tarjetas para la sección de Artistas
const artistCards = [
  { icon: "🎤", title: "Verified Matching", description: "Get matched with verified engineers and producers from around the world." },
  { icon: "⏳", title: "Real-Time Tracking", description: "Track your project in real time: every stage, every update." },
  { icon: "✨", title: "Polished Results", description: "Receive polished, professional results ready for release." },
];

// Componente para la sección de Artistas
const ArtistsSection = () => (
  <section id="artists" className="py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-normal text-white mb-4">For <strong className='font-extrabold'>Artists</strong>: Focus on <strong className='font-extrabold'>Creating</strong>.</h2>
      <p className="text-xl text-gray-400 mb-16 max-w-2xl">We handle the rest. No waiting. No guessing. Just results that sound like success.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {artistCards.map((card, index) => (
          <div key={index} className="p-8 rounded-3xl glass-bg transition duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="text-4xl text-white mb-4">{card.icon}</div>
            <h3 className="text-2xl font-semibold text-white mb-3">{card.title}</h3>
            <p className="text-gray-400">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Componente para la sección de Ingenieros y Productores
const ProducersSection = ({ onScroll }) => (
  <section id="producers" className="py-24 bg-[#080808]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center space-y-12 lg:space-y-0 lg:space-x-12">
        {/* Left: Text */}
        <div className="lg:w-1/2">
          <h2 className="text-5xl font-normal text-white mb-6">For <strong className='font-extrabold'>Engineers & Producers</strong>: Your talent. <strong className='font-extrabold'>Our network.</strong></h2>
          <p className="text-xl text-gray-300 mb-8">
            Work with real artists who value quality. Earn, grow, and connect globally all from one platform.
          </p>
          <ul className="space-y-4 text-gray-300">
            {['Get projects assigned **automatically**, no pitching required.', 'Build your profile through our **verified tier system**.'].map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
                <p dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Abstract Glass Card */}
        <div className="lg:w-1/2 flex justify-center">
          <div className="w-full max-w-lg p-10 rounded-[40px] glass-bg glow-border transform rotate-3 hover:rotate-0 transition-all duration-500">
            <h3 className="text-3xl font-bold text-white mb-4">Unlimited Potential.</h3>
            <p className="text-gray-400 mb-6">
              Global collaboration that pushes you forward. A clean, professional ecosystem for serious creators.
            </p>
            {/* Scroll Suave aplicado aquí, apunta a la CTA final */}
            <a href="#final-cta" onClick={(e) => onScroll(e, '#final-cta')} className="inline-block bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition">
              Start Earning
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Componente de CTA central
const CentralCTA = () => (
  <section className="py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-bg p-12 rounded-[40px] text-center">
        <h2 className="text-6xl font-black mb-4 tracking-tight" style={{ background: 'linear-gradient(180deg, #FFFFFF 60%, #AAAAAA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          No Noise. No Middlemen.
        </h2>
        <p className="text-3xl font-bold text-white">
          Just music done right.
        </p>
      </div>
    </div>
  </section>
);

// Componente de Llamada a la Acción Final
const FinalCTA = ({ onScroll }) => (
  <section id="final-cta" className="py-24 text-center">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-6xl font-normal text-white mb-6">
        Join the <strong className='font-bold'>New Standard</strong>
      </h2>
      <p className="text-xl text-gray-400 mb-10">
        Whether you're creating or collaborating, Mixa Lab is where music moves forward.
      </p>
      <div className="flex justify-center space-x-6">
        {/* Scroll Suave aplicado aquí */}
        <Link href="/login" className="bg-white text-black px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition transform hover:scale-105 shadow-xl glow-border">
          Join as Artist
        </Link>
        <Link href="/login" className="bg-transparent text-white px-10 py-4 rounded-xl text-lg font-bold border border-white/40 hover:bg-white/10 transition transform hover:scale-105">
          Join as Creator
        </Link>
      </div>
    </div>
  </section>
);

// Componente de Pie de Página
const Footer = () => (
  <footer className="glass-bg border-t border-white/10 mt-12 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
      <p>&copy; 2024 Mixa Lab. All Rights Reserved.</p>
      <div className="space-x-4 mt-4 md:mt-0">
        <a href="#" className="hover:text-white transition">Privacy</a>
        <a href="#" className="hover:text-white transition">Terms</a>
        <a href="#" className="hover:text-white transition">Contact</a>
      </div>
    </div>
  </footer>
);


// Componente principal de la aplicación
const App = () => {
  // Función para el scroll suave
  const handleScroll = (e, targetId) => {
    // Evita el comportamiento de salto predeterminado del navegador
    e.preventDefault();

    // El targetId viene como '#id', removemos '#' para usarlo con getElementById
    const targetElement = document.getElementById(targetId.substring(1));

    if (targetElement) {
      // Desplazamiento suave nativo
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Definición de estilos CSS directamente en el componente para su uso en JSX
  const globalStyles = `
        @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0), 0 0 20px rgba(255, 255, 255, 0.2); }
            50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.5); }
        }
        @keyframes wave-move {
            0% { transform: translateX(0) scaleX(1); }
            50% { transform: translateX(-1%) scaleX(1.02); }
            100% { transform: translateX(0) scaleX(1); }
        }
        
        .glass-bg {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .glow-border {
            box-shadow: 0 0 50px rgba(135, 206, 235, 0.2);
        }
        .animate-title-glow {
            animation: pulse-glow 4s infinite ease-in-out;
        }
        .audio-wave-bg {
            background: linear-gradient(135deg, #1A1A1A 0%, #000000 100%);
            border: 1px solid rgba(135, 206, 235, 0.2);
            box-shadow: 0 0 80px rgba(135, 206, 235, 0.3);
        }
        .animate-wave-path {
            animation: wave-move 15s infinite ease-in-out;
        }
    `;

  // Componente del Hero
  const HeroSection = ({ onScroll, globalStyles }) => (
    <section className="relative pt-24 pb-20 overflow-hidden">
      {/* Inject CSS styles */}
      <style>{globalStyles}</style>

      {/* Simulación de gradiente sutil de fondo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center top, #222 1%, transparent 60%)' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className='flex justify-center items-center mb-6'>
          <Logo className="inline-block w-[100px] h-[100px] mr-6" />
          {/* Título con animación de brillo */}
          <h1
            className="text-6xl md:text-8xl font-black mb-4 tracking-tight animate-title-glow"
            style={{ background: 'linear-gradient(180deg, #FFFFFF 60%, #AAAAAA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Mixa Lab
          </h1>
        </div>
        <p className="text-2xl md:text-3xl font-light text-gray-300 mb-6 max-w-5xl mx-auto">
          Where <strong className='font-bold'>sound</strong> meets <strong className='font-bold'>precision</strong>.
        </p>
        <p className="text-xl text-gray-500 mb-10 max-w-4xl mx-auto">
          A global platform connecting artists, producers, and engineers in one <strong>seamless</strong> experience. Built for creators who take their craft seriously.
        </p>

        {/* Botones de acción subidos */}
        <div className="flex justify-center space-x-6 mb-16">
          {/* Scroll Suave aplicado aquí */}
          <Link href="/login" className="bg-white text-black px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition transform hover:scale-105 shadow-xl glow-border">
            Join as Artist
          </Link>
          <Link href="/login" className="bg-transparent text-white px-10 py-4 rounded-xl text-lg font-bold border border-white/40 hover:bg-white/10 transition transform hover:scale-105">
            Join as Creator
          </Link>
        </div>
      </div>

      {/* Abstract Visual Placeholder: Onda de Audio SVG/Efecto */}
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-5xl h-64 audio-wave-bg rounded-3xl glow-border relative overflow-hidden flex items-center justify-center p-6">
          {/* SVG de una onda de audio abstracta */}
          <svg className="w-full h-full text-white/50" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'rgba(135,206,235,0.5)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Simulación de onda de audio con movimiento sutil */}
            <path d="M 0 15 Q 12 5, 25 15 T 50 15 T 75 15 T 100 15" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none" className="animate-wave-path" />
            <path d="M 0 15 Q 10 10, 20 15 T 40 15 T 60 15 T 80 15 T 100 15" stroke="url(#waveGradient)" strokeWidth="1" fill="none" className="animate-wave-path" style={{ opacity: 0.7, transform: 'translateY(-5px)' }} />
            <path d="M 0 15 Q 15 25, 30 15 T 60 15 T 90 15 T 100 15" stroke="url(#waveGradient)" strokeWidth="0.7" fill="none" className="animate-wave-path" style={{ opacity: 0.4, transform: 'translateY(5px)' }} />
          </svg>
        </div>
      </div>
    </section>
  );

  return (
    <div className="bg-[#000000] min-h-screen text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#090909] via-[#0b0b0b] to-[#121212]" /> */}
      <Header onScroll={handleScroll} />
      <main>
        {/* Pasando la función de scroll a HeroSection */}
        <HeroSection onScroll={handleScroll} globalStyles={globalStyles} />
        <WhyMixaLab />
        <ArtistsSection />
        {/* Pasando la función de scroll a ProducersSection */}
        <ProducersSection onScroll={handleScroll} />
        <CentralCTA />
        {/* Pasando la función de scroll a FinalCTA */}
        <FinalCTA onScroll={handleScroll} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
