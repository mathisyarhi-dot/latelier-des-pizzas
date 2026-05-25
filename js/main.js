// ──────────────────────────────────────────────────────────────────────
// Real menu — 15 pizzas + 3 supplement tiers
// ──────────────────────────────────────────────────────────────────────
const PIZZAS = [
  ['Margherita', 'Sauce tomate, mozzarella fior di latte, basilic frais', '10,90€'],
  ['Napolitaine', 'Sauce tomate, mozzarella fior di latte, anchois, câpres, olives noires', '13,90€'],
  ['Régina', 'Sauce tomate, mozzarella fior di latte, jambon blanc, champignons de Paris', '14,90€'],
  ['Quatre Fromages', 'Sauce tomate, mozzarella fior di latte, gorgonzola DOP, taleggio DOP, scamorza fumée', '14,90€'],
  ['Végétarienne', 'Sauce tomate, mozzarella fior di latte, aubergines, courgettes, poivrons, champignons de Paris, olives noires', '14,90€'],
  ['Tonno', 'Sauce tomate, mozzarella fior di latte, thon, poivrons, olives noires', '14,90€'],
  ['Bufalina', 'Sauce tomate, mozzarella fior di latte, roquette, bufala, tomates cerise, crème balsamique', '15,90€'],
  ['Calzone', 'Sauce tomate, mozzarella fior di latte, jambon blanc, œuf, champignons de Paris, roquette, crème balsamique', '15,90€'],
  ['Pollo', 'Crème fraîche, mozzarella fior di latte, filet de poulet, champignons de Paris, parmigiano reggiano DOP', '15,90€'],
  ['Spianata', 'Sauce tomate, mozzarella fior di latte, spianata piccante, taleggio DOP, tomates semi-confites, olives noires', '15,90€'],
  ['Burratina', 'Sauce tomate, mozzarella fior di latte, roquette, burratinas, tomates cerise, parmigiano reggiano DOP', '16,90€'],
  ['Bresaola', 'Sauce tomate, mozzarella fior di latte, roquette, bresaola, parmigiano reggiano DOP, pesto maison', '16,90€'],
  ['Coppa', 'Crème fraîche, mozzarella fior di latte, coppa IGP, roquette, tomates cerise, parmigiano reggiano DOP', '16,90€'],
  ['Parma', 'Sauce tomate, mozzarella fior di latte, jambon de Parme, roquette, burratina, pesto maison, parmigiano reggiano DOP', '17,90€'],
  ['Tartufo', 'Crème de truffe, mozzarella fior di latte, champignons de Paris, roquette, burratina, parmigiano reggiano DOP', '17,90€'],
];

const SUPPLEMENTS = [
  { price: '2€', list: 'Tomates semi-confites · œuf · champignons de Paris · olives · câpres · pesto maison · poivrons' },
  { price: '3€', list: 'Mozzarella fior di latte · anchois · thon · gorgonzola DOP · taleggio DOP · scamorza fumée · parmigiano reggiano DOP · aubergines · courgettes · tomates cerise · roquette · burratina 50g' },
  { price: '4€', list: 'Jambon blanc · filet de poulet · spianata · jambon de Parme · bresaola · coppa · bufala' },
];

// ── Render accordion menu ─────────────────────────────────────────────
(function renderMenu() {
  const list = document.getElementById('menu-list');
  list.innerHTML = `
    <div class="menu-cat open" data-cat="pizzas">
      <button class="menu-cat-head" aria-expanded="true">
        <div class="lead">
          <span class="num">01.</span>
          <h3>Nos pizzas</h3>
          <span class="cat-meta">· ${PIZZAS.length} pizzas</span>
        </div>
        <span class="sign">+</span>
      </button>
      <div class="menu-cat-body">
        <div class="menu-cat-inner">
          ${PIZZAS.map(([n, d, p]) => `
            <div class="dish">
              <div class="dish-body">
                <h4>${n}</h4>
                <p>${d}</p>
              </div>
              <div class="dish-price">${p}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="menu-cat" data-cat="supplements">
      <button class="menu-cat-head" aria-expanded="false">
        <div class="lead">
          <span class="num">02.</span>
          <h3>Suppléments</h3>
          <span class="cat-meta">· 3 niveaux</span>
        </div>
        <span class="sign">+</span>
      </button>
      <div class="menu-cat-body">
        <div class="supps-inner">
          <p class="supps-intro">Personnalisez votre pizza. Tarifs par supplément ajouté.</p>
          ${SUPPLEMENTS.map(s => `
            <div class="supps-row">
              <div class="price">+ ${s.price}</div>
              <div class="list">${s.list}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.querySelectorAll('.menu-cat-head').forEach(head => {
    head.addEventListener('click', () => {
      const cat = head.closest('.menu-cat');
      const wasOpen = cat.classList.contains('open');
      document.querySelectorAll('.menu-cat').forEach(c => {
        c.classList.remove('open');
        c.querySelector('.menu-cat-head').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { cat.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
    });
  });
})();

// ── Hours by day, no grouping ─────────────────────────────────────────
const DAYS = [
  { lbl: 'Lundi',    closed: true },
  { lbl: 'Mardi',    times: ['11:30 – 14:30', '18:30 – 22:30'] },
  { lbl: 'Mercredi', times: ['11:30 – 14:30', '18:30 – 22:30'] },
  { lbl: 'Jeudi',    times: ['11:30 – 14:30', '18:30 – 22:30'] },
  { lbl: 'Vendredi', times: ['11:30 – 14:30', '18:30 – 22:30'] },
  { lbl: 'Samedi',   times: ['11:30 – 14:30', '18:30 – 22:30'] },
  { lbl: 'Dimanche', times: ['18:00 – 22:30'] },
];

(function renderHours() {
  const list = document.getElementById('hours-list');
  const todayJs = new Date().getDay(); // 0=Sun
  // map JS day index → our DAYS index (Mon..Sun = 0..6)
  const todayIdx = todayJs === 0 ? 6 : todayJs - 1;
  list.innerHTML = DAYS.map((d, i) => `
    <div class="hours-row ${d.closed ? 'closed' : ''} ${i === todayIdx ? 'today' : ''}">
      <b>${d.lbl}</b>
      <div class="times">${d.closed ? '<span>Fermé</span>' : d.times.map(t => `<span>${t}</span>`).join('')}</div>
    </div>
  `).join('');
})();

// ── Topbar scroll ─────────────────────────────────────────────────────
const topbar = document.getElementById('topbar');
const railProgress = document.getElementById('rail-progress');
function updateScrollUI() {
  topbar.classList.toggle('scrolled', window.scrollY > 30);
  if (railProgress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    railProgress.style.height = (pct * 100) + '%';
  }
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
updateScrollUI();

// ── Mobile drawer ─────────────────────────────────────────────────────
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
function closeDrawer() {
  burger.classList.remove('open'); drawer.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
burger.addEventListener('click', () => {
  const open = !burger.classList.contains('open');
  burger.classList.toggle('open', open);
  drawer.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// ── Rail active link ──────────────────────────────────────────────────
const railLinks = document.querySelectorAll('.rail-links a');
const sections = document.querySelectorAll('section[id], header[id]');
// rootMargin-based scrollspy: section becomes active when its top crosses the
// upper 30% band of the viewport. Works for sections taller than the viewport,
// unlike a threshold-based observer which can never fire on long sections.
const railObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
sections.forEach(s => railObserver.observe(s));

// ── Guests segmented picker ───────────────────────────────────────────
const guestsHidden = document.getElementById('r-guests');
const guestsBtns = document.querySelectorAll('#guests-picker button');
guestsBtns.forEach(b => {
  b.addEventListener('click', () => {
    guestsBtns.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-checked', 'false'); });
    b.classList.add('active');
    b.setAttribute('aria-checked', 'true');
    guestsHidden.value = b.dataset.g;
    // clear field error
    const field = guestsHidden.closest('.field-r');
    if (field) field.classList.remove('invalid');
  });
});

// ── Form validation ───────────────────────────────────────────────────
const form = document.getElementById('reserve-form');
const successEl = document.getElementById('form-success');
const dateInput = document.getElementById('r-date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

function validate(field) {
  let valid = field.checkValidity();
  if (field.id === 'r-date' && field.value) {
    valid = valid && new Date(field.value) >= new Date(today);
  }
  if (field.id === 'r-guests') {
    valid = !!field.value;
  }
  const parent = field.closest('.field-r');
  if (parent) parent.classList.toggle('invalid', !valid);
  return valid;
}

form.querySelectorAll('input, select, textarea').forEach(f => {
  if (f.type === 'hidden') return;
  f.addEventListener('blur', () => validate(f));
  f.addEventListener('input', () => {
    const parent = f.closest('.field-r');
    if (parent && parent.classList.contains('invalid')) validate(f);
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let allValid = true;
  ['r-date', 'r-time', 'r-guests', 'r-name', 'r-phone', 'r-email'].forEach(id => {
    const f = document.getElementById(id);
    if (!validate(f)) allValid = false;
  });
  if (!allValid) {
    const firstInvalid = form.querySelector('.field-r.invalid input, .field-r.invalid select, .field-r.invalid .guests-picker button');
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  form.style.display = 'none';
  successEl.classList.add('show');
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ── Open status (live + every minute) ─────────────────────────────────
function checkOpen() {
  const now = new Date();
  const d = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  let open = false, label = '', heroHours = '';

  if (d >= 2 && d <= 6) {
    const lunch = minutes >= 690 && minutes <= 870;
    const dinner = minutes >= 1110 && minutes <= 1350;
    open = lunch || dinner;
    if (lunch) label = 'Ouvert · jusqu\'à 14h30';
    else if (dinner) label = 'Ouvert · jusqu\'à 22h30';
    else if (minutes < 690) label = 'Ouvre à 11h30';
    else if (minutes < 1110) label = 'Réouvre à 18h30';
    else label = 'Fermé · à demain';
    heroHours = '11h30 – 14h30 · 18h30 – 22h30';
  } else if (d === 0) {
    open = minutes >= 1080 && minutes <= 1350;
    label = open ? 'Ouvert · jusqu\'à 22h30' : (minutes < 1080 ? 'Ouvre à 18h00' : 'Fermé · à mardi');
    heroHours = '18h00 – 22h30';
  } else if (d === 1) {
    label = 'Fermé le lundi';
    heroHours = 'Fermé aujourd\'hui';
  }

  const topbarEl = document.getElementById('open-status');
  topbarEl.classList.toggle('closed', !open);
  topbarEl.querySelector('.lbl').textContent = label;

  // Hero info cell
  const heroText = document.getElementById('hero-status-text');
  const heroCell = document.getElementById('hero-status-cell');
  if (heroText) heroText.textContent = open ? 'Ouvert' : 'Fermé';
  if (heroCell) heroCell.classList.toggle('closed', !open);
  const hh = document.getElementById('hero-hours');
  if (hh) hh.textContent = heroHours;
}
checkOpen();
setInterval(checkOpen, 60000);
