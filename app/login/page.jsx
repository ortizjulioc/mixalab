"use client";
import React, { useEffect } from "react";
import * as THREE from "three";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { CiMusicNote1 } from "react-icons/ci";
import Link from "next/link";

export default function Login() {
  useEffect(() => {
    // --- THREE: escena básica para el fondo de partículas ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const canvasContainer = document.getElementById("bg-animation-canvas-container");
    if (canvasContainer) canvasContainer.appendChild(renderer.domElement);

    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      positions.push(Math.random() * 2000 - 1000);
      positions.push(Math.random() * 2000 - 1000);
      positions.push(Math.random() * 2000 - 1000);

      color.setHSL(0, 0, Math.random() * 0.5 + 0.5); // grises
      colors.push(color.r, color.g, color.b);
    }

    particles.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    particles.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 20,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    camera.position.z = 500;

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      particleSystem.rotation.x += 0.0001;
      particleSystem.rotation.y += 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (canvasContainer && renderer.domElement.parentNode === canvasContainer) {
        canvasContainer.removeChild(renderer.domElement);
      }
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-black text-white min-h-dvh overflow-hidden relative">
      {/* Canvas de fondo */}
      <div
        id="bg-animation-canvas-container"
        className="absolute inset-0 z-0 opacity-20"
        style={{ contain: "layout paint size" }}
      />

      {/* HEADER: reserva espacio para el botón (evita que tape el logo) */}
      <header className="relative z-20 h-12 sm:h-14 px-2 sm:px-4 pt-[env(safe-area-inset-top)]">
        <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
          <Link
            href="/creators"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors duration-300
                     text-xs sm:text-sm font-medium sm:font-semibold text-white
                     py-1 px-2 sm:py-1.5 sm:px-3 rounded-md backdrop-blur-md leading-none"
          >
            <CiMusicNote1 className="w-4 h-4" />
            {/* oculta el texto si el viewport es < 360px para que no empuje */}
            <span className="max-[360px]:hidden ">Login creators</span>
          </Link>
        </div>
      </header>

      {/* MAIN: centrado vertical usando el espacio restante */}
      <main className="relative z-10 min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center p-4 font-poppins">
        {/* Título / logo */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Mixa Lab
          </h1>
        </div>

        {/* Panel de inicio de sesión */}
        <div className="bg-black/40 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">¡Bienvenido!</h2>

          {/* Social login */}
          <div className="flex flex-col space-y-3">
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <FaGoogle />
              <span>Continuar con Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <FaFacebook />
              <span>Continuar con Facebook</span>
            </button>
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <FaApple />
              <span>Continuar con Apple</span>
            </button>
          </div>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black/40 px-3 text-white/60">o</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40"
            />
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-white text-black font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <a href="#" className="text-white/80 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
