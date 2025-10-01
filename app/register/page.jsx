"use client";
import React, { useEffect, useState } from "react";
import * as THREE from "three";

// Componente principal de Registro
export default function Register() {
  // Estados para manejar el formulario y los efectos visuales
  // Se mantienen para controlar los campos de entrada estéticamente.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState(""); // Usado para mostrar mensajes
  const [loading, setLoading] = useState(false);

  // --- Lógica de la Animación Three.js (Estética) ---
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

  // --- Lógica de Registro Eliminada (Solo Placeholder Estético) ---
  const handleRegister = (e) => {
    e.preventDefault();
    console.log("¡El diseño es genial! Aquí se conectará tu lógica de registro real.");

    // Muestra el estado de carga por 1 segundo solo por el efecto visual del botón
    setLoading(true);
    setMessage({ type: 'info', text: "Lógica de registro desactivada (solo estética)." });
    
    setTimeout(() => {
        setLoading(false);
        setMessage("");
    }, 1000); 
  };


  return (
    <div className="bg-black text-white min-h-dvh overflow-hidden relative">
      {/* Canvas de fondo - La estética principal */}
      <div
        id="bg-animation-canvas-container"
        className="absolute inset-0 z-0 opacity-20"
        style={{ contain: "layout paint size" }}
      />

      {/* HEADER */}
      <header className="relative z-20 h-12 sm:h-14 px-2 sm:px-4 pt-[env(safe-area-inset-top)]">
        <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
          {/* Enlace estético para creadores */}
          <a
            href="/creators"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors duration-300
                      text-xs sm:text-sm font-medium sm:font-semibold text-white
                      py-1 px-2 sm:py-1.5 sm:px-3 rounded-md backdrop-blur-md leading-none"
          >
            {/* Music Note SVG (Icono estético) */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v10.375a3.375 3.375 0 00-3.375 3.375.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75c0-1.554 1.258-2.813 2.813-2.813h.187a.75.75 0 01.75.75v5.625a.75.75 0 01-1.5 0V14.125a.75.75 0 00-.75-.75h-.75a.75.75 0 01-.75-.75V5.25a.75.75 0 011.5 0v7.125a.75.75 0 00.75.75h.75a.75.75 0 01.75.75v-10.875a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            <span className="max-[360px]:hidden ">Acceso para creadores</span>
          </a>
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

        {/* Panel de registro */}
        <div className="bg-black/40 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20">
          {/* Título */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Crea tu cuenta
          </h2>

          {/* Social login (Estético) */}
          <div className="flex flex-col space-y-3">
            {/* Botón Google */}
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-[1.03]">
                {/* Google SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11.5v3h3.5c-.19 1.4-1.51 3.52-3.5 3.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5c1.19 0 2.19.49 2.94 1.29l2.25-2.25C15.42 5.67 13.88 5 12 5c4.42 0 8 3.58 8 8s-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8c2.48 0 4.7 1.13 6.25 2.95l-2.25 2.25c-.75-.8-1.75-1.29-2.94-1.29z"/></svg>
                <span>Registrarse con Google</span>
            </button>
            {/* Botón Facebook */}
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-[1.03]">
                {/* Facebook SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 6h3v-3h-3c-3.1 0-4 2.1-4 4v3H7v3h3v7h4v-7h3l1-3h-4v-3c0-.8.2-2 2-2z"/></svg>
                <span>Registrarse con Facebook</span>
            </button>
            {/* Botón Apple */}
            <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-white/40 bg-white text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-[1.03]">
                {/* Apple SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 10c.84 0 1.63.15 2.37.45-.6-.94-.85-2.28-.75-3.61c.15-2.05 1.51-3.64 3.01-4.38-1.48-1.87-3.79-2.06-4.9-.76-.75.87-1.12 2.34-.73 3.96c.35 1.43 1.07 2.65 1.95 3.65m-5.06 13.56c-1.26 0-2.33-.82-2.86-1.89-1.27-.47-2.61-.31-3.77.34-.34-.94-.52-2.14.36-3.8c.67-1.3.94-2.84.72-4.36-.2-1.45-1.04-2.67-2.03-3.23.2-.23.47-.5.73-.78 1.43-1.45 3.32-2.17 5.21-2.17 3.52 0 6.64 2.8 6.72 6.88.07 3.7-2.38 6.75-5.32 6.75z"/></svg>
                <span>Registrarse con Apple</span>
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

          {/* Formulario de Registro */}
          <form className="space-y-4" onSubmit={handleRegister}>
             {/* Mensaje de estado (éxito o error) */}
            {message && (
                <div className={`p-3 text-sm font-medium text-center rounded-lg border 
                                 ${message.type === 'error' 
                                    ? 'bg-red-600/20 text-red-300 border-red-500/50' 
                                    : 'bg-green-600/20 text-green-300 border-green-500/50'}`
                                 }>
                    {message.text}
                </div>
            )}
             {/* Campo de Nombre de Usuario */}
            <div className="relative">
                {/* User Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.715.706 15.698 15.698 0 01-15.068 0 .75.75 0 01-.715-.706z" clipRule="evenodd" /></svg>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 pl-10 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 placeholder-white/50 transition duration-200"
                    required
                    disabled={loading}
                />
            </div>
            {/* Campo de Correo Electrónico */}
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 placeholder-white/50 transition duration-200"
                    required
                    disabled={loading}
                />
            </div>
             {/* Campo de Contraseña */}
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8V5a2 2 0 00-2-2H4a2 2 0 00-2 2v3m18 0l-8 4-8-4m8 4v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" clipRule="evenodd"/></svg>
                <input
                    type="password"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 placeholder-white/50 transition duration-200"
                    required
                    disabled={loading}
                />
            </div>
             {/* Campo de Confirmar Contraseña */}
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8V5a2 2 0 00-2-2H4a2 2 0 00-2 2v3m18 0l-8 4-8-4m8 4v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" clipRule="evenodd"/></svg>
                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 pl-10 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 placeholder-white/50 transition duration-200"
                    required
                    disabled={loading}
                />
            </div>

            {/* Botón de Registro con efecto de carga */}
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-white text-black font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                 <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {/* Enlace estético para ir al Login */}
          <div className="mt-6 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <a href="#" className="text-white font-medium hover:underline">
              Inicia sesión
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
