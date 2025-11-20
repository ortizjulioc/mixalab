'use client';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { CiMusicNote1 } from "react-icons/ci";
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function CreatorLogin() {
  useEffect(() => {
    // --- Fondo de partículas: notas musicales ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const canvasContainer = document.getElementById('bg-animation-canvas-container-creators');
    if (canvasContainer) canvasContainer.appendChild(renderer.domElement);

    // --- Genera una textura de nota musical (glyph) en un canvas 2D ---
    const makeNoteTexture = (glyph) => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      // fondo transparente
      ctx.clearRect(0, 0, size, size);
      // ligera sombra para dar brillo suave
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      // dibuja el glifo en blanco (el color final lo dan los vertexColors)
      ctx.fillStyle = '#ffffff';
      ctx.font = Math.floor(size * 0.8) + 'px "Segoe UI Symbol","Apple Color Emoji","Noto Color Emoji",Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, size / 2, size / 2 + size * 0.05);

      const tex = new THREE.CanvasTexture(c);
      const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      tex.anisotropy = Math.min(maxAniso, 8);
      tex.needsUpdate = true;
      return tex;
    };

    const glyphs = ['♪', '♫', '♩', '♬'];
    const textures = glyphs.map(makeNoteTexture);

    // --- Crea 4 grupos de puntos con distintas texturas ---
    const total = 2000;
    const groups = glyphs.length;
    const perGroup = Math.ceil(total / groups);
    const systems = [];
    const materials = [];
    const geometries = [];

    for (let g = 0; g < groups; g++) {
      const count = g === groups - 1 ? total - perGroup * (groups - 1) : perGroup;

      const positions = [];
      const colors = [];
      const color = new THREE.Color();

      for (let i = 0; i < count; i++) {
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);

        // negros/grises oscuros para verse bien sobre fondo blanco
        color.setHSL(0, 0, Math.random() * 0.02); // 0–0.2 = oscuro
        colors.push(color.r, color.g, color.b);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 22,
        map: textures[g],         // textura con forma de nota
        vertexColors: true,       // los colores dan el tono oscuro
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      const pts = new THREE.Points(geo, mat);
      // rotaciones iniciales variadas
      pts.rotation.x = Math.random() * Math.PI;
      pts.rotation.y = Math.random() * Math.PI;

      scene.add(pts);
      systems.push(pts);
      materials.push(mat);
      geometries.push(geo);
    }

    camera.position.z = 500;

    // Interacción con mouse (suave)
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      systems.forEach((sys, i) => {
        const f = 0.0005 + i * 0.00015;
        // rotación base + pequeña influencia del mouse
        sys.rotation.y += (mouseX * 0.005 - sys.rotation.y) * 0.02 + f * 0.5;
        sys.rotation.x += (mouseY * 0.005 - sys.rotation.x) * 0.02 + f * 0.25;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (canvasContainer && renderer.domElement.parentNode === canvasContainer) {
        canvasContainer.removeChild(renderer.domElement);
      }
      systems.forEach((s) => scene.remove(s));
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);
  const handleGoogleLogin = (role) => {
    const callbackUrl = `/auth/redirect?role=${role}`; // puedes redirigir a donde quieras
    signIn("google", { callbackUrl });
  };

  return (
    <div className="bg-white text-black min-h-dvh overflow-hidden relative">
      {/* Canvas de fondo */}
      <div
        id="bg-animation-canvas-container-creators"
        className="absolute inset-0 z-0 opacity-10"
        style={{ contain: 'layout paint size' }}
      />

      {/* HEADER */}
      <header className="relative z-20 h-12 sm:h-14 px-2 sm:px-4 pt-[env(safe-area-inset-top)]">
        <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
          <Link
            href="/login"
            className="flex items-center gap-1 bg-black/10 hover:bg-black/20 transition-colors duration-300
                       text-xs sm:text-sm font-medium sm:font-semibold text-black
                       py-1 px-2 sm:py-1.5 sm:px-3 rounded-md backdrop-blur-md leading-none"
          >
            <CiMusicNote1 className="w-4 h-4" />
            <span className="max-[360px]:hidden">Login artists</span>
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-3.5rem)]
                       flex flex-col items-center justify-center p-4 font-poppins">
        {/* Título / logo */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Mixa Lab
          </h1>
        </div>

        {/* Panel de inicio de sesión */}
        <div className="bg-black/5 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-black/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Hi creator!</h2>

          {/* Social login */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() =>
                signIn("google", { callbackUrl: `/api/auth/finalize?role=CREATOR`})
              }
              className="flex items-center justify-center gap-3 p-3 rounded-lg border border-black/30 bg-black text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <FaGoogle />
              <span>Login with Google</span>
            </button>
          </div>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/60 px-3 text-black/60">o</span>
            </div>
          </div>

          {/* Formulario */}
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full p-3 bg-black/5 text-black placeholder-black/50 rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-3 bg-black/5 text-black placeholder-black/50 rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40"
            />
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-black text-white font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <a href="#" className="text-black/80 hover:underline">Forgot password?</a>
          </div>
           <div className="mt-6 text-center text-sm">
            <Link href="/register/CREATOR" className="text-black/80 hover:underline">
              Don’t have an account? Sign up.
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
