/* ==========================================================
   common.js  -  kode yang dipakai SEMUA halaman
   Isi file ini (dari atas ke bawah):
     1. Store   : penyimpanan data (pakai localStorage, pengganti backend)
     2. UI      : toast, efek konfeti, baris tugas, popup tambah/edit
     3. Mascot  : maskot (template, mudah diganti)
     4. Penjaga halaman + navigasi atas
   ========================================================== */


/* ---------- 1. STORE: data pengguna & tugas ---------- */
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem('taskie_' + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem('taskie_' + key, JSON.stringify(value)); },
  newId() { return Math.random().toString(36).slice(2, 10); },

  // tanggal hari ini, format "2026-11-25"
  today() {
    const d = new Date();
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  },
  // geser tanggal sebanyak n hari (n bisa negatif)
  shiftDate(date, n) {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  },

  /* --- akun --- */
  users() { return this.get('users', []); },
  me() {                                   // pengguna yang sedang login (atau undefined)
    const id = this.get('session', null);
    return this.users().find(u => u.id === id);
  },
  register(username, password) {
    username = username.trim();
    if (username.length < 3) return { error: 'Username minimal 3 karakter' };
    if (password.length < 4) return { error: 'Sandi minimal 4 karakter' };
    const taken = this.users().some(u => u.username.toLowerCase() === username.toLowerCase());
    if (taken) return { error: 'Username sudah dipakai' };

    const user = { id: this.newId(), username, password };
    this.set('users', [...this.users(), user]);
    this.set('session', user.id);

    // beberapa tugas contoh supaya halaman tidak kosong
    const t = this.today();
    this.set('tasks_' + user.id, [
      { id: this.newId(), title: 'Selesaikan tutorial Taskie', desc: 'Klik lingkaran untuk menyelesaikan tugas', date: t, urgent: true, important: true, done: false },
      { id: this.newId(), title: 'Rancang rencana minggu ini', desc: '', date: t, urgent: false, important: true, done: false },
      { id: this.newId(), title: 'Balas email lama', desc: '', date: this.shiftDate(t, -1), urgent: true, important: false, done: false },
      { id: this.newId(), title: 'Rapikan folder unduhan', desc: '', date: this.shiftDate(t, -1), urgent: false, important: false, done: true },
    ]);
    return { user };
  },
  login(username, password) {
    const user = this.users().find(u =>
      u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (!user) return { error: 'Username atau sandi salah' };
    this.set('session', user.id);
    return { user };
  },
  logout() { localStorage.removeItem('taskie_session'); },
  updateUser(changes) {
    const me = this.me();
    this.set('users', this.users().map(u => u.id === me.id ? { ...u, ...changes } : u));
  },

  /* --- tugas: Create, Read, Update, Delete --- */
  allTasks() { return this.get('tasks_' + this.me().id, []); },            // READ
  saveTasks(list) { this.set('tasks_' + this.me().id, list); },
  createTask(task) { this.saveTasks([...this.allTasks(), { id: this.newId(), done: false, ...task }]); },   // CREATE
  updateTask(id, changes) { this.saveTasks(this.allTasks().map(t => t.id === id ? { ...t, ...changes } : t)); }, // UPDATE
  deleteTask(id) { this.saveTasks(this.allTasks().filter(t => t.id !== id)); },                              // DELETE
  toggleTask(id) {                                                         // centang / batal centang
    const task = this.allTasks().find(t => t.id === id);
    this.updateTask(id, { done: !task.done });
    return !task.done;
  },
  // status: 'done' (selesai), 'failed' (lewat tanggal, belum selesai), 'todo' (masih jalan)
  status(t) { return t.done ? 'done' : (t.date < this.today() ? 'failed' : 'todo'); },

  /* --- statistik untuk home & profil --- */
  stats() {
    const list = this.allTasks();
    const done = list.filter(t => t.done).length;
    const failed = list.filter(t => this.status(t) === 'failed').length;
    const percent = n => list.length ? Math.round(n / list.length * 100) : 0;
    const xp = done * 10;                                // 1 tugas selesai = 10 XP
    return {
      total: list.length, done, failed,
      donePercent: percent(done), failedPercent: percent(failed),
      xp, level: Math.floor(xp / 50) + 1, xpInLevel: xp % 50,   // 50 XP naik 1 level
    };
  },
};


/* ---------- 2. UI: bagian tampilan yang dipakai berulang ---------- */
const UI = {
  // mencegah teks pengguna dibaca sebagai HTML
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

  // "2026-11-25" -> "HARI INI", "BESOK", atau nama hari
  dateLabel(date) {
    const t = Store.today();
    if (date === t) return 'Hari ini';
    if (date === Store.shiftDate(t, 1)) return 'Besok';
    if (date === Store.shiftDate(t, -1)) return 'Kemarin';
    return new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  },

  // notifikasi kecil di atas layar. type: '' (hijau) atau 'bad' (merah)
  toast(message, type = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    document.getElementById('toasts').append(el);
    setTimeout(() => el.remove(), 2800);
  },

  // ledakan konfeti di posisi (x, y), dengan teks melayang opsional
  burst(x, y, label = '') {
    const fx = document.getElementById('fx');
    const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff9600', '#ce82ff', '#ff4b4b'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('i');
      const angle = Math.random() * 6.28, dist = 40 + Math.random() * 90;
      p.className = 'part';
      p.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % 6]};` +
        `--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;--r:${Math.random() * 360}deg`;
      fx.append(p);
      setTimeout(() => p.remove(), 900);
    }
    if (label) {
      const t = document.createElement('div');
      t.className = 'floatxp';
      t.textContent = label;
      t.style.cssText = `left:${x - 20}px;top:${y - 20}px`;
      fx.append(t);
      setTimeout(() => t.remove(), 1000);
    }
  },

  // HTML untuk satu baris tugas. showButtons=false untuk halaman matriks
  taskRow(t, showButtons = true) {
    const status = Store.status(t);
    return `<div class="task ${status}" data-id="${t.id}" draggable="true">
      <input type="checkbox" class="chk" ${t.done ? 'checked' : ''} aria-label="Selesai">
      <div class="body">
        <div class="title">${UI.esc(t.title)}</div>
        <div class="meta">
          ${t.urgent ? '<span class="chip u">URGENT</span>' : ''}
          ${t.important ? '<span class="chip i">PENTING</span>' : ''}
          ${status === 'failed' ? '<span class="chip f">GAGAL</span>' : ''}
          ${UI.esc(t.desc)}
        </div>
      </div>
      ${showButtons ? '<div class="acts"><button class="btn btn-sm edit" title="Edit">✎</button><button class="btn btn-sm del" title="Hapus">✖</button></div>' : ''}
    </div>`;
  },

  // menghidupkan centang / edit / hapus untuk semua baris tugas di dalam "box".
  // refresh = fungsi yang dipanggil untuk menggambar ulang halaman.
  bindTasks(box, refresh) {
    box.querySelectorAll('.task').forEach(row => {
      const id = row.dataset.id;

      row.querySelector('.chk').onchange = e => {
        const nowDone = Store.toggleTask(id);
        if (nowDone) {                                       // efek juicy saat selesai
          const r = e.target.getBoundingClientRect();
          UI.burst(r.left + 14, r.top + 14, '+10 XP');
          UI.toast('Tugas selesai! 🎉');
          Mascot.cheer();
        }
        setTimeout(refresh, nowDone ? 350 : 0);
      };

      const editBtn = row.querySelector('.edit');
      if (editBtn) editBtn.onclick = () => UI.taskModal(Store.allTasks().find(t => t.id === id), refresh);

      const delBtn = row.querySelector('.del');
      if (delBtn) delBtn.onclick = () => {
        row.classList.add('shake');
        setTimeout(() => { Store.deleteTask(id); UI.toast('Tugas dihapus', 'bad'); refresh(); }, 250);
      };
    });
  },

  // popup untuk tambah tugas (task = null) atau edit tugas (task = data tugasnya)
  taskModal(task, onDone) {
    const t = task || { title: '', desc: '', date: Store.today(), urgent: false, important: false };
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="overlay"><form class="card">
      <h2>${task ? 'Edit tugas' : 'Tugas baru'}</h2>
      <label>Judul</label><input type="text" name="title" value="${UI.esc(t.title)}" required maxlength="80">
      <label>Catatan</label><textarea name="desc" rows="2">${UI.esc(t.desc)}</textarea>
      <label>Tanggal</label><input type="date" name="date" value="${t.date}" required>
      <div class="check-row">
        <label><input type="checkbox" name="urgent" ${t.urgent ? 'checked' : ''}> Mendesak</label>
        <label><input type="checkbox" name="important" ${t.important ? 'checked' : ''}> Penting</label>
      </div>
      <div class="card-head" style="margin:22px 0 0">
        <button type="button" class="btn btn-red" id="cancel">Batal</button>
        <button class="btn btn-lime">Simpan</button>
      </div>
    </form></div>`;

    const close = () => root.innerHTML = '';
    root.querySelector('#cancel').onclick = close;
    root.querySelector('.overlay').onclick = e => { if (e.target.classList.contains('overlay')) close(); };
    root.querySelector('form').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const data = { title: f.get('title').trim(), desc: f.get('desc').trim(), date: f.get('date'),
                     urgent: !!f.get('urgent'), important: !!f.get('important') };
      if (task) Store.updateTask(task.id, data); else Store.createTask(data);
      UI.toast(task ? 'Tugas diperbarui' : 'Tugas ditambahkan!');
      close();
      onDone();
    };
    root.querySelector('[name=title]').focus();
  },
};


/* ---------- 3. MASKOT (template) ----------
   Cara mengganti dengan maskot sendiri: ubah isi svg() di bawah, misalnya
       svg: () => '<img class="mascot-svg" src="assets/maskot.png" alt="Maskot">',
   Kalimat-kalimat maskot ada di cheers, pokes, dan greeting().  */
const Mascot = {
  svg: () => `<svg class="mascot-svg" viewBox="0 0 120 124" role="img" aria-label="Maskot">
    <ellipse cx="60" cy="117" rx="32" ry="5" fill="#000" opacity=".08"/>
    <ellipse cx="42" cy="112" rx="12" ry="6" fill="#ff9600"/><ellipse cx="78" cy="112" rx="12" ry="6" fill="#ff9600"/>
    <path d="M24 38 L31 12 L49 27Z M96 38 L89 12 L71 27Z" fill="#46a302" stroke="#46a302" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="14" cy="78" rx="7" ry="15" fill="#46a302" transform="rotate(20 14 78)"/>
    <ellipse cx="106" cy="78" rx="7" ry="15" fill="#46a302" transform="rotate(-20 106 78)"/>
    <ellipse cx="60" cy="68" rx="44" ry="44" fill="#58cc02"/>
    <ellipse cx="60" cy="86" rx="28" ry="23" fill="#b8f26b"/>
    <g class="eye"><circle cx="42" cy="52" r="15" fill="#fff"/><circle cx="44" cy="54" r="7" fill="#3c3c3c"/><circle cx="46" cy="51" r="2.5" fill="#fff"/></g>
    <g class="eye"><circle cx="78" cy="52" r="15" fill="#fff"/><circle cx="76" cy="54" r="7" fill="#3c3c3c"/><circle cx="78" cy="51" r="2.5" fill="#fff"/></g>
    <path d="M53 67 L67 67 L60 77Z" fill="#ff9600" stroke="#ff9600" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="25" cy="68" r="6" fill="#ff8fb1" opacity=".55"/><circle cx="95" cy="68" r="6" fill="#ff8fb1" opacity=".55"/>
  </svg>`,

  cheers: ['Kerja bagus! 🎉', 'Mantap, lanjut terus!', 'Satu tugas beres!', 'Kamu keren banget!', 'XP bertambah!'],
  pokes: ['Hehe, geli!', 'Ayo kerjakan satu tugas lagi!', 'Aku siap menemani kamu!', 'Semangat hari ini!'],
  random: list => list[Math.floor(Math.random() * list.length)],

  // kalimat sapaan sesuai jam
  greeting(name, tasksLeft, tasksTotal) {
    const h = new Date().getHours();
    const hello = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
    const msg = !tasksTotal ? 'Belum ada tugas hari ini. Tambah satu yuk!'
      : tasksLeft ? `Ada ${tasksLeft} tugas hari ini. Yuk, kita mulai!`
      : 'Semua tugas hari ini beres. Waktunya santai! 🎉';
    return `${hello}, ${name}! ${msg}`;
  },

  // pasang maskot ke <div id="mascot"> dan aktifkan klik
  mount() {
    const el = document.getElementById('mascot');
    if (!el) return;
    el.innerHTML = this.svg();
    el.onclick = e => { this.hop(); this.say(this.random(this.pokes)); UI.burst(e.clientX, e.clientY); };
  },
  say(text) {                                    // ganti teks di balon ucapan
    const b = document.getElementById('bubble');
    if (!b) return;
    b.textContent = text;
    b.classList.remove('say'); void b.offsetWidth; b.classList.add('say');
  },
  hop() {                                        // maskot melompat
    const m = document.getElementById('mascot');
    if (!m) return;
    m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop');
  },
  cheer() { this.hop(); this.say(this.random(this.cheers)); },
};


/* ---------- 4. PENJAGA HALAMAN + NAVIGASI ----------
   Setiap <body> punya data-page="nama". Dari situ kita tahu halaman mana ini. */
const PAGE = document.body.dataset.page;
const AUTH_PAGES = ['login', 'register'];

// READY = true jika halaman ini boleh ditampilkan. Skrip tiap halaman mengeceknya.
const READY = (() => {
  const loggedIn = !!Store.me();
  if (!loggedIn && !AUTH_PAGES.includes(PAGE)) { location.replace('login.html'); return false; }
  if (loggedIn && AUTH_PAGES.includes(PAGE)) { location.replace('home.html'); return false; }
  return true;
})();

if (READY) {
  // wadah untuk efek, notifikasi, dan popup (dibuat otomatis, tidak perlu ditulis di HTML)
  document.body.insertAdjacentHTML('beforeend', '<div id="fx"></div><div id="toasts"></div><div id="modal-root"></div>');

  // navigasi atas (hanya untuk halaman setelah login)
  const nav = document.getElementById('nav');
  if (nav) {
    const tabs = [['home', '🏠', 'Beranda'], ['tasks', '📋', 'Tugas'], ['matrix', '🎯', 'Matriks'], ['profile', '👤', 'Profil']];
    nav.innerHTML = `<nav class="nav"><span class="brand">${Mascot.svg()}Taskie</span>
      ${tabs.map(([page, icon, name]) => `<a href="${page}.html" class="${page === PAGE ? 'on' : ''}"><i>${icon}</i>${name}</a>`).join('')}
      <a href="#" id="logout"><i>🚪</i>Keluar</a></nav>`;
    nav.querySelector('#logout').onclick = e => { e.preventDefault(); Store.logout(); location.href = 'login.html'; };
  }
}
