'use client';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { CiMusicNote1 } from "react-icons/ci";
export default function CreatorLogin() {
    useEffect(() => {
        // Inicialización de la escena 3D para la animación de fondo
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        const canvasContainer = document.getElementById('bg-animation-canvas-container-creators');
        if (canvasContainer) {
            canvasContainer.appendChild(renderer.domElement);
        }

        // Configuración de las partículas
        const particleCount = 2000;
        const particles = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            positions.push(Math.random() * 2000 - 1000);
            positions.push(Math.random() * 2000 - 1000);
            positions.push(Math.random() * 2000 - 1000);

            // Partículas de color negro para un fondo blanco
            color.setHSL(0, 0, Math.random() * 0.2); 
            colors.push(color.r, color.g, color.b);
        }

        particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 20,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        camera.position.z = 500;

        // Variables para la interacción con el mouse
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Bucle de animación
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotación suave del sistema de partículas basada en el mouse
            particleSystem.rotation.y += (mouseX * 0.005 - particleSystem.rotation.y) * 0.05;
            particleSystem.rotation.x += (mouseY * 0.005 - particleSystem.rotation.x) * 0.05;

            // Movimiento de las partículas
            particleSystem.rotation.z += 0.0002;
            
            renderer.render(scene, camera);
        };

        animate();

        // Manejar el redimensionamiento de la ventana
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Función de limpieza para desmontar el componente
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (canvasContainer) {
                canvasContainer.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div className="bg-white text-black h-screen overflow-hidden">
            {/* Contenedor para el canvas de la animación */}
            <div id="bg-animation-canvas-container-creators" className="absolute top-0 left-0 w-full h-full z-0 opacity-10"></div>
            {/* Botón de login de creadores */}
            <div className="absolute top-4 right-4 z-20">
                <button className="bg-black/10 hover:bg-black/20 transition-colors duration-300 text-black font-semibold py-2 px-4 rounded-md backdrop-blur-md">
                    <CiMusicNote1 className="inline h-6 mr-2" />
                    Login artists
                </button>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 font-poppins">

                {/* Título y logo */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                        Mixa Lab
                    </h1>
                </div>

                {/* Panel de inicio de sesión */}
                <div className="bg-black/10 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-black/20">

                    <h2 className="text-3xl font-bold mb-6 text-center">Hi creator!</h2>

                    {/* Botones de inicio de sesión social */}
                    <div className="flex flex-col space-y-4">
                        <button className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-black/40 bg-black text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <FaGoogle />
                            <span>Login with Google</span>
                        </button>
                        <button className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-black/40 bg-black text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <FaFacebook />
                            <span>Login with Facebook</span>
                        </button>
                        <button className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-black/40 bg-black text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <FaApple />
                            <span>Login with Apple</span>
                        </button>
                    </div>

                    {/* Separador */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-black/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white/40 px-3 text-black/60">o</span>
                        </div>
                    </div>

                    {/* Formulario de login */}
                    <form className="space-y-4">
                        <div>
                            <input type="email" placeholder="Correo electrónico" className="w-full p-3 bg-black/10 text-white rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40" />
                        </div>
                        <div>
                            <input type="password" placeholder="Contraseña" className="w-full p-3 bg-black/10 text-white rounded-lg border border-black/20 focus:outline-none focus:ring-1 focus:ring-black/40" />
                        </div>
                        <button type="submit" className="w-full p-3 rounded-lg bg-black text-white font-semibold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            Login
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <a href="#" className="text-black/80 hover:underline">Forgot password?</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
