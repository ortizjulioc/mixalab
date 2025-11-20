"use client";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Card from "@/components/Card";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    const canvasContainer = document.getElementById(
      "bg-animation-canvas-container-creators"
    );
    if (canvasContainer) canvasContainer.appendChild(renderer.domElement);

    const makeNoteTexture = (glyph) => {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");

      ctx.clearRect(0, 0, size, size);
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 10;

      ctx.fillStyle = "#ffffff";
      ctx.font =
        Math.floor(size * 0.8) +
        'px "Segoe UI Symbol","Apple Color Emoji","Noto Color Emoji",Arial';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(glyph, size / 2, size / 2 + size * 0.05);

      const tex = new THREE.CanvasTexture(c);
      const maxAniso = renderer.capabilities.getMaxAnisotropy
        ? renderer.capabilities.getMaxAnisotropy()
        : 1;
      tex.anisotropy = Math.min(maxAniso, 8);
      tex.needsUpdate = true;
      return tex;
    };

    const glyphs = ["♪", "♫", "♩", "♬"];
    const textures = glyphs.map(makeNoteTexture);

    const total = 2000;
    const groups = glyphs.length;
    const perGroup = Math.ceil(total / groups);
    const systems = [];
    const materials = [];
    const geometries = [];

    for (let g = 0; g < groups; g++) {
      const count =
        g === groups - 1 ? total - perGroup * (groups - 1) : perGroup;

      const positions = [];
      const colors = [];
      const color = new THREE.Color();

      for (let i = 0; i < count; i++) {
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);
        positions.push(Math.random() * 2000 - 1000);

        color.setHSL(0, 0, Math.random() * 0.02);
        colors.push(color.r, color.g, color.b);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geo.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      const mat = new THREE.PointsMaterial({
        size: 22,
        map: textures[g],
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const pts = new THREE.Points(geo, mat);
      pts.rotation.x = Math.random() * Math.PI;
      pts.rotation.y = Math.random() * Math.PI;

      scene.add(pts);
      systems.push(pts);
      materials.push(mat);
      geometries.push(geo);
    }

    camera.position.z = 500;

    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
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
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("admin-login", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setErrorMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin/home"
  };

  return (
    <div className="bg-white text-black min-h-dvh overflow-hidden relative">
      <div
        id="bg-animation-canvas-container-creators"
        className="absolute inset-0 z-0 opacity-10"
      />

      {/* MAIN */}
      <main className="relative z-10 min-h-dvh flex flex-col items-center justify-center p-4 font-poppins">


        <Card className="bg-black/5 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-black/20 liquid-glass">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Mixa Lab
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Admin Login</h2>

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm text-center mb-4">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-black/5 text-black placeholder-black/50 rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-black/5 text-black placeholder-black/50 rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg text-white font-semibold tracking-wide transition-all duration-300 ${loading
                  ? "bg-black/40 cursor-not-allowed"
                  : "bg-black hover:scale-105 hover:shadow-lg"
                }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
