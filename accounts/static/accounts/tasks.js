/* tasks.js - halaman daftar tugas per hari + CRUD */
function start() {
  document.getElementById('add-btn').onclick = () => UI.taskModal(null, render);
  console.log('tasks.js loaded');
  render();
}

function render() {
  // kelompokkan tugas berdasarkan tanggal: { "2026-11-25": [tugas, tugas], ... }
//   const groups = {};
//   Store.allTasks().forEach(t => (groups[t.date] = groups[t.date] || []).push(t));
//   const dates = Object.keys(groups).sort();

//   const list = document.getElementById('list');
//   list.innerHTML = dates.length
//     ? dates.map(d => `
//         <div class="day-title ${d === Store.today() ? 'today' : ''}">${UI.dateLabel(d)}</div>
//         ${groups[d].map(t => UI.taskRow(t)).join('')}`).join('')
//     : '<div class="empty">Belum ada tugas. Klik tombol di atas!</div>';
//   UI.bindTasks(list, render);
}

start();
