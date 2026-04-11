// Load data
let entries = JSON.parse(localStorage.getItem('entries')) || [];

// DOM elements
const creditEl = document.getElementById('credit');
const debitEl = document.getElementById('debit');
const reasonEl = document.getElementById('reason');
const dateEl = document.getElementById('date');
const tableBody = document.getElementById('tableBody');
const addBtn = document.getElementById('addBtn');
const searchEl = document.getElementById('search');

// Events
addBtn.onclick = addEntry;
searchEl.oninput = render;

document.getElementById('toggleTheme').onclick = () => {
  document.body.classList.toggle('dark');
};

document.getElementById('exportBtn').onclick = exportCSV;

// Add entry
function addEntry() {
  const entry = {
    id: Date.now(),
    date: dateEl.value || new Date().toISOString().split('T')[0],
    credit: +creditEl.value || 0,
    debit: +debitEl.value || 0,
    reason: reasonEl.value.trim()
  };

  if (entry.credit === 0 && entry.debit === 0) {
    alert('Enter credit or debit');
    return;
  }

  entries.push(entry);
  save();
  render();

  creditEl.value = '';
  debitEl.value = '';
  reasonEl.value = '';
}

// Delete
function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  save();
  render();
}

// Save
function save() {
  localStorage.setItem('entries', JSON.stringify(entries));
}

// Render
function render() {
  const keyword = searchEl.value.toLowerCase();
  tableBody.innerHTML = '';

  let balance = 0;
  let labels = [];
  let data = [];

  entries.forEach(e => {
    if (!e.reason.toLowerCase().includes(keyword)) return;

    balance += e.credit - e.debit;

    labels.push(e.date);
    data.push(balance);

    const row = document.createElement('tr');

row.innerHTML = `
  <td>${e.date}</td>
  <td style="color:${e.credit ? 'white' : 'gray'}">₹${e.credit}</td>
  <td style="color:${e.debit ? 'white' : 'gray'}">₹${e.debit}</td>
  <td>${e.reason}</td>
  <td><b>₹${balance}</b></td>
  <td class="delete">×</td>
`;

// Add swipe support
addSwipeToDelete(row, e.id);

tableBody.appendChild(row);
  });

  // ✅ FIXED: call after balance calculated
  animateBalance(balance);

  drawChart(labels, data);
}

// Chart
let chart;
function drawChart(labels, data) {
  const ctx = document.getElementById('chart');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Balance Trend',
          data,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// CSV export
function exportCSV() {
  let csv = 'Date,Credit,Debit,Reason\n';

  entries.forEach(e => {
    csv += `${e.date},${e.credit},${e.debit},${e.reason}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'expenses.csv';
  a.click();
}

// Ripple effect
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function (e) {
    const circle = document.createElement('span');
    const diameter = Math.max(this.clientWidth, this.clientHeight);

    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = e.offsetX - diameter / 2 + 'px';
    circle.style.top = e.offsetY - diameter / 2 + 'px';

    this.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
});

// Balance animation
function animateBalance(value) {
  const el = document.getElementById('totalBalance');
  if (!el) return;

  let start = 0;
  const duration = 500;
  const step = value / (duration / 16);

  const interval = setInterval(() => {
    start += step;
    if (start >= value) {
      start = value;
      clearInterval(interval);
    }
    el.innerText = `₹${Math.floor(start)}`;
  }, 16);
}

function addSwipeToDelete(element, id) {
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  element.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });

  element.addEventListener('touchmove', e => {
    if (!isSwiping) return;

    currentX = e.touches[0].clientX;
    let diff = currentX - startX;

    if (diff < 0) { // swipe left
      element.style.transform = `translateX(${diff}px)`;
      element.style.background = 'rgba(255,0,0,0.2)';
    }
  });

  element.addEventListener('touchend', () => {
    let diff = currentX - startX;

    if (diff < -100) {
      // delete if swiped enough
      element.style.transition = '0.3s';
      element.style.transform = 'translateX(-100%)';

      setTimeout(() => {
        deleteEntry(id);
      }, 200);
    } else {
      // reset position
      element.style.transition = '0.3s';
      element.style.transform = 'translateX(0)';
      element.style.background = '';
    }

    isSwiping = false;
  });
}
function addSwipeToDelete(element, id) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  // Mouse support
  element.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
  });

  element.addEventListener('mousemove', e => {
    if (!isDragging) return;

    currentX = e.clientX;
    let diff = currentX - startX;

    if (diff < 0) {
      element.style.transform = `translateX(${diff}px)`;
      element.style.background = 'rgba(255,0,0,0.2)';
    }
  });

  element.addEventListener('mouseup', () => {
    handleSwipeEnd(element, id, currentX - startX);
    isDragging = false;
  });

  // Touch (existing)
  element.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });

  element.addEventListener('touchmove', e => {
    currentX = e.touches[0].clientX;
    let diff = currentX - startX;

    if (diff < 0) {
      element.style.transform = `translateX(${diff}px)`;
    }
  });

  element.addEventListener('touchend', () => {
    handleSwipeEnd(element, id, currentX - startX);
  });
}

function handleSwipeEnd(element, id, diff) {
  if (diff < -120) {
    element.style.transform = 'translateX(-100%)';
    setTimeout(() => deleteEntry(id), 200);
  } else {
    element.style.transform = 'translateX(0)';
    element.style.background = '';
  }
}
// Initial load
render();