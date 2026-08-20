const intro = document.getElementById('intro');
const dismissIntro = () => intro?.classList.add('is-hidden');
intro?.addEventListener('click', dismissIntro);
intro?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') dismissIntro(); });
setTimeout(dismissIntro, 2300);

const topbar = document.getElementById('topbar');
const navLinks = [...document.querySelectorAll('.nav a')];
const navIndicator = document.querySelector('.nav-indicator');
const scrollReadout = document.querySelector('[data-scroll-readout]');
let previousScrollY = window.scrollY;
const updateScrollVisual = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
  document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
  document.documentElement.style.setProperty('--scroll-velocity', Math.min(2, Math.abs(window.scrollY - previousScrollY) / 12).toFixed(2));
  if (scrollReadout) scrollReadout.textContent = String(Math.round(window.scrollY)).padStart(5, '0');
  previousScrollY = window.scrollY;
};
const onScroll = () => {
  updateScrollVisual();
  topbar?.classList.toggle('scrolled', window.scrollY > 20);
  const navigableSections = navLinks
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(item => item.section)
    .sort((a, b) => a.section.offsetTop - b.section.offsetTop);
  let activeNavLink = navigableSections[0]?.link;
  for (const item of navigableSections) {
    if (window.scrollY >= item.section.offsetTop - 160) activeNavLink = item.link;
  }
  navLinks.forEach(a => {
    a.classList.toggle('active', a === activeNavLink);
  });
  if (navIndicator && activeNavLink) {
    navIndicator.style.width = `${activeNavLink.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${activeNavLink.offsetLeft}px)`;
    navIndicator.classList.add('is-visible');
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: .11 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
}, { passive: true });

const monthLabel = document.getElementById('monthLabel');
const calendarDays = document.getElementById('calendarDays');
const now = new Date();
let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  monthLabel.textContent = viewDate.toLocaleDateString('en-US', { month:'long', year:'numeric' });
  calendarDays.innerHTML = '';
  const start = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  for (let i=0;i<start;i++) calendarDays.insertAdjacentHTML('beforeend','<span></span>');
  for (let day=1; day<=days; day++) {
    const d = new Date(year, month, day);
    const button = document.createElement('button');
    button.type='button';
    button.textContent = day;
    if (d.getDay() === 0 || d.getDay() === 6) button.classList.add('weekend');
    if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) button.classList.add('today');
    button.addEventListener('click', () => {
      document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'});
    });
    calendarDays.appendChild(button);
  }
}
document.getElementById('prevMonth')?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()-1); renderCalendar(); });
document.getElementById('nextMonth')?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()+1); renderCalendar(); });
renderCalendar();

document.getElementById('year').textContent = new Date().getFullYear();

// Tiny 3D hover treatment for project cards.
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width - .5;
    const y = (e.clientY-r.top)/r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y*2.2}deg) rotateY(${x*2.2}deg) translateY(-8px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform='');
});

const evidenceChart = document.getElementById('evidenceChart');
const evidenceNote = document.getElementById('evidenceNote');
const evidenceTabs = [...document.querySelectorAll('.evidence-tab')];
const evidenceData = {
  echo: {
    title: 'Reported mean range / normalized scale',
    bars: [
      { label: 'procedure low', value: 86.6, display: '8.66 / 10' },
      { label: 'procedure high', value: 94.5, display: '9.45 / 10' },
      { label: 'knowledge low', value: 79, display: '3.95 / 5' },
      { label: 'knowledge high', value: 93.6, display: '4.68 / 5' }
    ],
    note: '<strong>ECHO-UFS</strong>The repository reports consistently high aggregate scores across the instructional-procedure and knowledge-management scales. This view normalizes each scale to 100% so the ranges can be read together without implying that they share the same raw unit.<span>Source: aggregate findings documented in the public case study.</span>'
  },
  carbon: {
    title: 'Baseline comparison / accuracy',
    bars: [
      { label: 'RNN', value: 68.2, display: '68.20%' },
      { label: 'LSTM', value: 98.6, display: '98.60%' },
      { label: 'GRU', value: 99.6, display: '99.60%' },
      { label: 'BI-LSTM', value: 99.8, display: '99.80%' }
    ],
    note: '<strong>Carbon</strong>The BI-LSTM benchmark reached the highest reported accuracy among the four architectures tested on the same split. The project also reports precision, sensitivity, specificity and F1-score for the comparison.<span>Dataset: 9,971 balanced sequences from eight genes.</span>'
  },
  mandacaru: {
    title: 'Document intelligence pipeline / five stages',
    flow: ['validate', 'extract', 'classify', 'structure', 'export'],
    note: '<strong>Mandacaru</strong>The product turns human-oriented institutional PDFs into reusable records through a modular pipeline. The sequence shown here reflects the documented flow from PDF validation to CSV, XLSX or JSONL delivery.<span>Architecture: Python package + Streamlit interface + schema-guided extraction.</span>'
  }
};

function renderEvidence(key) {
  const data = evidenceData[key];
  if (!evidenceChart || !evidenceNote || !data) return;
  evidenceChart.innerHTML = `<p class="evidence-chart__title">${data.title}</p>`;
  if (data.flow) {
    const flow = document.createElement('div');
    flow.className = 'evidence-flow';
    data.flow.forEach((step, index) => {
      const item = document.createElement('div');
      item.className = 'evidence-flow__step';
      item.textContent = step;
      item.title = `Stage ${index + 1}: ${step}`;
      flow.appendChild(item);
      if (index < data.flow.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'evidence-flow__arrow';
        arrow.textContent = '->';
        arrow.setAttribute('aria-hidden', 'true');
        flow.appendChild(arrow);
      }
    });
    evidenceChart.appendChild(flow);
  } else {
    const bars = document.createElement('div');
    bars.className = 'evidence-chart__bars';
    data.bars.forEach(bar => {
      const wrap = document.createElement('div');
      wrap.className = 'evidence-bar-wrap';
      wrap.tabIndex = 0;
      wrap.setAttribute('aria-label', `${bar.label}: ${bar.display}`);
      wrap.innerHTML = `<span class="evidence-bar__value">${bar.display}</span><div class="evidence-bar" style="--bar-height:${bar.value}%"></div><span class="evidence-bar__label">${bar.label}</span>`;
      bars.appendChild(wrap);
    });
    evidenceChart.appendChild(bars);
  }
  evidenceNote.innerHTML = data.note;
  evidenceTabs.forEach(tab => {
    const active = tab.dataset.evidence === key;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

evidenceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderEvidence(tab.dataset.evidence));
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const nextIndex = event.key === 'ArrowRight'
      ? (index + 1) % evidenceTabs.length
      : (index - 1 + evidenceTabs.length) % evidenceTabs.length;
    evidenceTabs[nextIndex].focus();
    renderEvidence(evidenceTabs[nextIndex].dataset.evidence);
  });
});
renderEvidence('echo');
