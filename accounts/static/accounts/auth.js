/* auth.js - dipakai oleh login.html DAN register.html */
function start() {
  Mascot.mount();

  // --- halaman login ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = e => {
      e.preventDefault();
      const f = new FormData(loginForm);
      const result = Store.login(f.get('username'), f.get('password'));
      if (result.error) {
        document.querySelector('.auth').classList.add('shake');
        Mascot.hop();
        return UI.toast(result.error, 'bad');
      }
      location.href = 'home.html';
    };
  }

  // --- halaman register ---
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.onsubmit = e => {
      e.preventDefault();
      const f = new FormData(registerForm);
      if (f.get('password') !== f.get('password2')) return UI.toast('Sandi tidak sama', 'bad');
      const result = Store.register(f.get('username'), f.get('password'));
      if (result.error) return UI.toast(result.error, 'bad');
      location.href = 'home.html';
    };
  }
}
if (READY) start();
