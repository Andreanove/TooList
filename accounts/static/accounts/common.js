const UI = {
  esc: value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character])),

  toast(message, type = '') {
    const element = document.createElement('div');
    element.className = `toast ${type}`;
    element.textContent = message;
    document.getElementById('toasts').append(element);
    setTimeout(() => element.remove(), 2800);
  },

  burst(x, y) {
    const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff9600', '#ce82ff', '#ff4b4b'];
    const effects = document.getElementById('fx');

    for (let index = 0; index < 22; index++) {
      const particle = document.createElement('i');
      const angle = Math.random() * 6.28;
      const distance = 40 + Math.random() * 90;
      particle.className = 'part';
      particle.style.cssText = `left:${x}px;top:${y}px;background:${colors[index % colors.length]};` +
        `--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance}px;` +
        `--r:${Math.random() * 360}deg`;
      effects.append(particle);
      setTimeout(() => particle.remove(), 900);
    }
  },
};

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

document.body.insertAdjacentHTML('beforeend', '<div id="fx"></div><div id="toasts"></div>');
Mascot.mount();
const userEl = document.getElementById('user-data');
if (userEl) {
  const username = JSON.parse(userEl.textContent);
  Mascot.say(Mascot.greeting(username, 0, 0));
}