// Importa o Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configurações do Firebase (copie do console do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyD7FdNrVcrm1Aquz3wyKx-5d-wIEYge1O0",
  authDomain: "apiamssolucoes.firebaseapp.com",
  projectId: "apiamssolucoes",
  storageBucket: "apiamssolucoes.firebasestorage.app",
  messagingSenderId: "431150386998",
  appId: "1:431150386998:web:690f8ce7a481ddf4fd6d97",
  measurementId: "G-4DD7LE3YR0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// Serviços que você quer usar
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
