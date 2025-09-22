"use client";
import React, { useEffect } from "react";
import * as THREE from "three";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { CiMusicNote1 } from "react-icons/ci";
import Link from "next/link";

export default function Login() {
  useEffect(() => {
    // --- THREE: escena con notas musicales y animación de entrada ---
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

    // --- texturas de notas musicales ---
    const makeNoteTexture = (glyph) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffffff";
      ctx.font = Math.floor(size * 0.8) + 'px "Segoe UI Symbol","Apple Color Emoji","Noto Color Emoji",Arial';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(glyph, size / 2, size / 2 + size * 0.05);
      const tex = new THREE.CanvasTexture(c);
      const getMaxAniso = renderer.capabilities.getMaxAnisotropy
        ? renderer.capabilities.getMaxAnisotropy()
        : 1;
      tex.anisotropy = Math.min(getMaxAniso, 8);
      tex.needsUpdate = true;
      return tex;
    };

    const glyphs = ["♪", "♫", "♩", "♬"];
    const textures = glyphs.map(makeNoteTexture);

    // --- grupos de puntos ---
    const total = 2000;
    const groups = glyphs.length;
    const perGroup = Math.ceil(total / groups);
    const systems = [];
    const materials = [];
    const geometries = [];

    // opacidad objetivo para el fade-in
    const TARGET_OPACITY = 0.95;

    for (let g = 0; g < groups; g++) {
      const count = g === groups - 1 ? total - perGroup * (groups - 1) : perGroup;
      const positions = [];
      const colors = [];
      const color = new THREE.Color();

      for (let i = 0; i < count; i++) {
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);

        // blancos/grises (tema oscuro, look original)
        color.setHSL(0, 0, Math.random() * 0.5 + 0.5);
        colors.push(color.r, color.g, color.b);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 26,
        map: textures[g],
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        opacity: 0, // empieza en 0 para el fade-in
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const pts = new THREE.Points(geo, mat);
      // ligera variación inicial
      pts.rotation.x = Math.random() * Math.PI;
      pts.rotation.y = Math.random() * Math.PI;

      scene.add(pts);
      systems.push(pts);
      materials.push(mat);
      geometries.push(geo);
    }

    // cámara con zoom-in de entrada
    const START_Z = 800;
    const END_Z = 500;
    camera.position.z = START_Z;

    // interacción con mouse (parallax suave)
    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // animación
    const startTime = performance.now();
    let rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // progreso del intro (1.2s) con easeOutQuad
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / 1200);
      const ease = 1 - (1 - t) * (1 - t);

      // fade-in de partículas
      materials.forEach((m) => (m.opacity = TARGET_OPACITY * ease));

      // zoom-in de cámara
      camera.position.z = START_Z + (END_Z - START_Z) * ease;

      // rotación base + parallax por mouse
      systems.forEach((sys, i) => {
        const f = 0.0005 + i * 0.00015;
        sys.rotation.y += (mouseX * 0.005 - sys.rotation.y) * 0.02 + f * 0.5;
        sys.rotation.x += (mouseY * 0.005 - sys.rotation.x) * 0.02 + f * 0.25;
      });

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
      window.removeEventListener("mousemove", handleMouseMove);
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

  return (
    <div className="bg-black text-white min-h-dvh overflow-hidden relative">
      {/* Canvas de fondo */}
      <div
        id="bg-animation-canvas-container"
        className="absolute inset-0 z-0 opacity-20"
        style={{ contain: "layout paint size" }}
      />

      {/* HEADER */}
      <header className="relative z-20 h-12 sm:h-14 px-2 sm:px-4 pt-[env(safe-area-inset-top)]">
        <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
          <Link
            href="/creators"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors duration-300
                     text-xs sm:text-sm font-medium sm:font-semibold text-white
                     py-1 px-2 sm:py-1.5 sm:px-3 rounded-md backdrop-blur-md leading-none"
          >
            <CiMusicNote1 className="w-4 h-4" />
            <span className="max-[360px]:hidden ">Login creators</span>
          </Link>
        </div>
      </header>

      {/* MAIN */}
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
