import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import RegistroUsuario from "./RegistroUsuario.jsx";
import NuevaOrden from "./NuevaOrden.jsx"; // <--- 1. NUEVO IMPORT
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null); // <--- 2. ESTADO DE USUARIO
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const fakeEmail = `${username}@Suzuki.com`;

    try {
      // Intentamos loguear
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      // 3. SI ES EXITOSO, GUARDAMOS AL USUARIO
      setUser(userCredential.user);
    } catch (err) {
      console.error("Error de login:", err);
      setError("Usuario o contraseña incorrectos.");
    }
  };

  // --- NAVEGACIÓN ---

  // 4. SI EL USUARIO YA ENTRÓ, MOSTRAMOS LA NUEVA ORDEN
  if (user) {
    return <NuevaOrden />;
  }

  // Si quiere registrarse
  if (showRegister) {
    return (
      <RegistroUsuario
        onClose={() => setShowRegister(false)}
        onRegistered={() => setShowRegister(false)}
      />
    );
  }

  // Pantalla de Login normal
  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Header / Logo */}
        <div className="login-logo flex items-center justify-center gap-2">
          <span className="font-suzuki text-3xl text-white">SUZUKI</span>
        </div>

        <h2 className="login-header">Acceso de Usuario</h2>

        <form onSubmit={handleLogin} className="login-form">
          
          {/* Input: Usuario */}
          <div className="input-group">
            <svg
              className="input-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <input
              type="text"
              placeholder="Nombre de Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Input: Contraseña */}
          <div className="input-group">
            <svg
              className="input-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {/* Botón Submit */}
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>

          {/* Manejo de Errores */}
          {error && <p className="login-error">{error}</p>}
        </form>

        {/* Footer: Ir a Registro */}
        <div className="login-register-link">
          <p>
            <button
              onClick={() => setShowRegister(true)}
              className="login-link-text"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}