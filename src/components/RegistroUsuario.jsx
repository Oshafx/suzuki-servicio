import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebaseConfig";
import "./RegistroUsuario.css";

// Recibimos 'onClose' para poder regresar al Login
const RegistroUsuario = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Cambio el valor por defecto a uno de los válidos (servicios)
  const [rol, setRol] = useState("servicios"); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fakeEmail = `${username}@Suzuki.com`; 

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;

      // 2. Guardar datos adicionales en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        username: username,
        rol: rol,
        createdAt: new Date(),
      });

      setSuccess(`Usuario registrado correctamente como ${rol}.`);
      
      // Limpiar formulario
      setUsername("");
      setPassword("");
      setRol("servicios"); // Resetear al valor por defecto

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este nombre de usuario ya está en uso.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        console.error("Error de registro:", err.message);
        setError("Ocurrió un error al registrar el usuario.");
      }
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        
        {/* Logo */}
        <div className="registro-logo">
          <span>SUZUKI</span>
        </div>

        <h2 className="registro-header">Crear una cuenta</h2>

        <form onSubmit={handleRegister} className="registro-form">
          
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
              className="registro-input"
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
              className="registro-input"
              required
            />
          </div>

          {/* Selector de Rol (SOLO: Servicios, Mecánico, Refacciones) */}
          <div className="input-group">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="registro-input"
              required
            >
              <option value="servicios">Servicios</option>
              <option value="mecanico">Mecánico</option>
              <option value="refacciones">Refacciones</option>
            </select>
          </div>

          {/* Botón de Registro */}
          <button type="submit" className="registro-button">
            Registrar
          </button>
        </form>

        {/* Mensajes de Estado */}
        {error && <p className="registro-error">{error}</p>}
        {success && <p className="registro-success">{success}</p>}

        {/* Link para volver al Login */}
        <div className="registro-login-link">
          <button 
            type="button" 
            onClick={onClose} 
            className="registro-link-text"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", textDecoration: "underline" }}
          >
            ¿Ya tienes una cuenta? Inicia Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegistroUsuario;