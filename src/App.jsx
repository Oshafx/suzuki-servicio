import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Componentes
import Servicios from "./components/Servicios.jsx";
import RegistroUsuario from './components/RegistroUsuario.jsx';
import Recepcion from './components/Recepcion.jsx';
import ListaVehiculos from './components/ListaVehiculos.jsx';
import Login from './components/Login.jsx';
import Mecanicos from './components/Mecanicos.jsx';
import Refacciones from './components/Refacciones.jsx'; // ✅ Importado correctamente

// Importamos los estilos globales (Asegúrate de que tu CSS esté aquí o en index.css)
import './App.css'; 

const AppContent = ({ user, userRole, userName, handleLogout }) => {
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Formateadores de texto
    const formatDate = (date) => {
        return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    
    const formatTime = (date) => {
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    };

    const formatRole = (role) => {
        if (!role) return "";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    // --- LÓGICA DE ROLES (Fusionada: Refacciones + Diseño) ---
    const renderRoleComponent = () => {
        switch (userRole) {
            case "mecanico":
                return <Mecanicos />;
            case "servicios":
                return <Servicios />;
            case "refacciones":
                return <Refacciones />; // ✅ Nuevo panel
            case "lavador":
                return <div style={{textAlign:'center', padding:'50px', color:'#666'}}>Interfaz de Lavado en construcción...</div>;
            case "administrador":
            case "recepcion":
                return (
                    <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'20px'}}>
                        <Recepcion />
                        <ListaVehiculos />
                    </div>
                );
            default:
                return <div style={{textAlign:'center', padding:'20px', color:'red'}}>Rol no reconocido: {userRole}</div>;
        }
    };

    return (
        <div className="app-layout">
            
            {/* FONDO ANIMADO */}
            <div className="app-background"></div>

            {/* HEADER PRINCIPAL (Diseño Profesional) */}
            <header className="app-header">
                <div className="header-container">
                    
                    {/* 1. LOGO Y TÍTULO */}
                    <div className="brand-section">
                        <div className="brand-logo">S</div>
                        <div className="brand-text">
                            <h1>SUZUKI</h1>
                            <span>Aplicación de Servicio</span>
                        </div>
                    </div>

                    {/* 2. INFO USUARIO Y RELOJ */}
                    <div className="user-section">
                        
                        {/* Reloj */}
                        <div className="time-display">
                            <span className="date-text">{formatDate(currentTime)}</span>
                            <span className="time-text">{formatTime(currentTime)}</span>
                        </div>

                        {/* Tarjeta de Usuario */}
                        <div className="user-card">
                            <div className="avatar">
                                {userName ? userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="user-info">
                                <span className="username">{userName || "Usuario"}</span>
                                <span className={`role-badge ${userRole === 'administrador' ? 'admin' : ''}`}>
                                    {formatRole(userRole)}
                                </span>
                            </div>
                        </div>

                        {/* Botón Salir */}
                        <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* BARRA EXTRA SOLO PARA ADMINS/RECEPCIÓN */}
                {(userRole === 'administrador' || userRole === 'recepcion') && (
                    <div className="header-container admin-bar">
                         <button onClick={() => setShowRegisterModal(true)} className="btn-register">
                            <span>+</span> Registrar Nuevo Personal
                        </button>
                    </div>
                )}
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="main-container">
                {renderRoleComponent()}
            </main>

            {/* MODAL REGISTRO */}
            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal-btn" onClick={() => setShowRegisterModal(false)}>✕</button>
                        <RegistroUsuario onClose={() => setShowRegisterModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "usuarios", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserRole(data.rol);
                    setUserName(data.username || currentUser.email.split('@')[0]);
                } else {
                    setUserRole(null);
                    setUserName("Invitado");
                }
            } else {
                setUser(null);
                setUserRole(null);
                setUserName("");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("No se pudo cerrar la sesión.");
        }
    };

    if (loading) {
        return (
            <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', background:'#f3f4f6'}}>
                <div style={{fontSize:'40px', color:'#E60012', fontWeight:'bold'}}>S</div>
                <p style={{color:'#666', marginTop:'10px', fontSize:'12px', letterSpacing:'2px'}}>CARGANDO SISTEMA...</p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return <AppContent user={user} userRole={userRole} userName={userName} handleLogout={handleLogout} />;
}