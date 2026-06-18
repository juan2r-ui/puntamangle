/* ===== FINCA BURICA — conexión a Firebase (central) =====
   Config web del proyecto finca-burica (no secreta, va en el cliente).
   Seguridad real = reglas de Firestore + lista de autorizados de abajo. */
const firebaseConfig = {
  apiKey: "AIzaSyAZpHBukyAit5O1HTDq9oOI1ovl0ihj9Tc",
  authDomain: "finca-burica.firebaseapp.com",
  projectId: "finca-burica",
  storageBucket: "finca-burica.firebasestorage.app",
  messagingSenderId: "386010371646",
  appId: "1:386010371646:web:c29a2f4edf9160dcfa636f"
};
firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDB = firebase.firestore();
fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){});

/* ===== Autorización (v1: lista fija de administradores) =====
   Más adelante esto pasa a una colección "usuarios" con roles. */
const ADMINS = ['juan2r@gmail.com'];
function esAutorizado(user){
  return !!(user && user.email && ADMINS.indexOf(user.email.toLowerCase()) !== -1);
}

/* Guard para páginas protegidas: si no hay sesión o no está autorizado, manda al login. */
function requireAuth(onOk){
  fbAuth.onAuthStateChanged(function(user){
    if(!user){ location.href = 'login.html'; return; }
    if(!esAutorizado(user)){
      alert('La cuenta ' + (user.email||'') + ' todavía no está autorizada.\nAvisale al administrador para que te dé acceso.');
      fbAuth.signOut().then(function(){ location.href = 'login.html'; });
      return;
    }
    if(typeof onOk === 'function') onOk(user);
  });
}

function cerrarSesion(){
  fbAuth.signOut().then(function(){ location.href = 'login.html'; });
}
