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


import './index.css';

const AppContent = ({ user, userRole, handleLogout }) => {
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Mostrar interfaz según rol
    const renderRoleComponent = () => {
        if (userRole === "mecanico") {
            return <Mecanicos />;
        } else if(userRole === "servicios") { 
             return <Servicios />;
        }else if (userRole === "lavador") {
            return <div>LAVADOR - Aquí va tu interfaz de lavador</div>;
        } else if (userRole === "administrador") {
            return (
                <main className="container mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
                    <Recepcion />
                    <ListaVehiculos />
                </main>
            );
        } else {
            return <div>No se reconoció el rol del usuario.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* Header / Barra de Navegación */}
            <header className="p-4 bg-red-700 text-white shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold tracking-wider">SUZUKI SERVICIO</h1>
                    <div className="flex items-center space-x-4">
                        <p className="text-sm font-light hidden sm:block">
                            Usuario: <span className="font-semibold">{user.email}</span>
                        </p>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition duration-150 font-semibold"
                        >
                            Registrar Nuevo Usuario
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-100 text-red-700 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-white transition duration-150"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido principal según rol */}
            {renderRoleComponent()}

            {/* Modal de Registro de Usuario */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <RegistroUsuario onClose={() => setShowRegisterModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // <-- Estado para guardar el rol
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Obtener rol desde Firestore
                const docRef = doc(db, "usuarios", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserRole(docSnap.data().rol);
                } else {
                    console.warn("No se encontró el documento del usuario en Firestore");
                    setUserRole(null);
                }
            } else {
                setUser(null);
                setUserRole(null);
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
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-red-700 font-semibold">Cargando aplicación...</p>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return <AppContent user={user} userRole={userRole} handleLogout={handleLogout} />;
}
