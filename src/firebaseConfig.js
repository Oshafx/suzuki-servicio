// Importamos la función de inicialización de la app
import { initializeApp } from "firebase/app";

// Importamos la función para obtener la base de datos Firestore
import { getFirestore } from "firebase/firestore";

// Importamos la función para obtener el servicio de Autenticación
import { getAuth } from "firebase/auth";

// Tu configuración de Firebase
const firebaseConfig = {
  // Asegúrate que tus credenciales sean EXACTAS
  apiKey: "AIzaSyB9Aszj4PQS_BbBYh6sVK_usNL1A9C7Drg",
  authDomain: "suzuki-victoria.firebaseapp.com",
  projectId: "suzuki-victoria",
  storageBucket: "suzuki-victoria.firebasestorage.app",
  messagingSenderId: "450974709381",
  appId: "1:450974709381:web:d60c3f57d1608a7f4f1bec",
  measurementId: "G-N1LS82GSXL"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// EXPORTAMOS la instancia de la base de datos
export const db = getFirestore(app); 

// EXPORTAMOS la instancia de Autenticación (¡CLAVE PARA EL LOGIN!)
export const auth = getAuth(app);

