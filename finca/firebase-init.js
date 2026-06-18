/* ===== FINCA BURICA — conexión a Firebase (central) =====
   Config web del proyecto finca-burica (no secreta, va en el cliente).
   Seguridad real = reglas de Firestore + colección "usuarios". */
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

/* El super-administrador siempre tiene acceso total (no se puede bloquear).
   El resto de la gente se gestiona en la colección "usuarios" (email -> {nombre, rol, activo}). */
const SUPER_ADMIN = 'juan2r@gmail.com';
let USUARIO_ACTUAL = null;   // {email, rol, nombre}

/* Resuelve si un usuario autenticado tiene acceso y con qué rol. */
function resolverAcceso(user, onOk, onDeny){
  const email = (user.email||'').toLowerCase();
  if(email === SUPER_ADMIN){ onOk({email:email, rol:'admin', nombre:'Administrador'}); return; }
  fbDB.collection('usuarios').doc(email).get().then(function(doc){
    if(doc.exists && doc.data().activo !== false){
      onOk({email:email, rol:(doc.data().rol||'oficina'), nombre:(doc.data().nombre||email)});
    } else { onDeny(email); }
  }).catch(function(){ onDeny(email); });
}

/* Guard para páginas protegidas. */
function requireAuth(onOk){
  fbAuth.onAuthStateChanged(function(user){
    if(!user){ location.href='login.html'; return; }
    resolverAcceso(user, function(u){
      USUARIO_ACTUAL = u;
      if(typeof onOk === 'function') onOk(u);
    }, function(email){
      alert('La cuenta ' + email + ' todavía no tiene acceso.\nPedile al administrador que te autorice.');
      fbAuth.signOut().then(function(){ location.href='login.html'; });
    });
  });
}

function esAdminActual(){ return !!(USUARIO_ACTUAL && USUARIO_ACTUAL.rol === 'admin'); }
function cerrarSesion(){ fbAuth.signOut().then(function(){ location.href='login.html'; }); }
