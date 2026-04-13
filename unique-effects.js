/* ═══════════════════════════════════════════════
   unique-effects.js  — Gold Course Selection
   Adds: Live Clock · Cursor Sparkles · Confetti
═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════
   DYNAMIC THEME CONTROLLER
═══════════════════════════════════════ */
const ThemeManager = (() => {
  let previousTabTheme = 'gold';

  function setTheme(theme) {
    document.body.classList.remove('theme-gold', 'theme-cyan', 'theme-red', 'theme-purple');
    document.body.classList.add(`theme-${theme}`);
  }

  // Monitor Tabs
  const initTabs = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) {
      setTimeout(initTabs, 100);
      return;
    }
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        let theme = 'gold';
        if (tab === 'schedule') theme = 'cyan';
        if (tab === 'gpa') theme = 'red';
        
        setTheme(theme);
        previousTabTheme = theme;
      });
    });
  };

  initTabs();
  setTheme('gold'); // Initial state

  return {
    setTheme,
    restoreTabTheme: () => setTheme(previousTabTheme),
    getThemeColors: () => {
      const color = getComputedStyle(document.body).getPropertyValue('--theme-color').trim();
      const rgb = getComputedStyle(document.body).getPropertyValue('--theme-color-rgb').trim();
      return {
        solid: color,
        faded: `rgba(${rgb}, 0.7)`,
        veryFaded: `rgba(${rgb}, 0.3)`
      };
    }
  };
})();

/* ── 1. LIVE CLOCK ── */
(function initClock() {
  const clockEl = document.getElementById('liveClock');
  const dateEl  = document.getElementById('liveDate');
  if (!clockEl || !dateEl) return;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function tick() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const pad = n => String(n).padStart(2, '0');
    clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)} ${ampm}`;
    dateEl.textContent  = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
  }

  tick();
  setInterval(tick, 1000);
})();


/* ── 2. CURSOR SPARKLE TRAIL ── */
(function initSparkles() {
  const SIZES = [5, 7, 9, 6, 4];
  let lastSpawn = 0;

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastSpawn < 40) return;
    lastSpawn = now;

    const themeColors = ThemeManager.getThemeColors();
    const colors = [themeColors.solid, themeColors.faded, '#fff8e7'];

    const el = document.createElement('div');
    el.className = 'cursor-sparkle';
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const offsetX = (Math.random() - 0.5) * 16;
    const offsetY = (Math.random() - 0.5) * 16;

    Object.assign(el.style, {
      left:             (e.clientX + offsetX) + 'px',
      top:              (e.clientY + offsetY) + 'px',
      width:            size + 'px',
      height:           size + 'px',
      background:       color,
      boxShadow:        `0 0 ${size * 2}px ${color}`,
    });

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  });
})();


/* ── 3. FIRST-COURSE CONFETTI BURST ── */
(function initConfetti() {
  let confettiTriggered = false;

  function burst(cx, cy) {
    const themeColors = ThemeManager.getThemeColors();
    const colors = [themeColors.solid, themeColors.faded, '#fff8e7'];
    const COUNT = 36;
    
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (360 / COUNT) * i + (Math.random() * 15);
      const rad   = angle * Math.PI / 180;
      const dist  = 60 + Math.random() * 80;
      const tx    = Math.cos(rad) * dist;
      const ty    = Math.sin(rad) * dist - 60;
      const delay = Math.random() * 0.15;

      Object.assign(el.style, {
        left:            (cx - 4) + 'px',
        top:             (cy - 4) + 'px',
        background:      color,
        boxShadow:       `0 0 6px ${color}`,
        transform:       `rotate(${Math.random() * 360}deg)`,
        animationDuration: (0.9 + Math.random() * 0.5) + 's',
        animationDelay:  delay + 's',
      });

      el.style.setProperty('--tx', tx + 'px');
      el.style.setProperty('--ty', ty + 'px');
      el.style.animation = 'none';
      el.style.opacity   = '1';

      document.body.appendChild(el);

      // Manually animate with JS for directional control
      const start = performance.now() + delay * 1000;
      const duration = (0.9 + Math.random() * 0.5) * 1000;

      requestAnimationFrame(function animate(now) {
        if (now < start) { requestAnimationFrame(animate); return; }
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.style.transform = `translate(${tx * eased}px, ${ty * eased + progress * progress * 60}px) rotate(${eased * 540}deg) scale(${1 - progress * 0.7})`;
        el.style.opacity = 1 - progress;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
        }
      });
    }
  }

  // Watch for any "Add" button click in the course list
  document.addEventListener('click', function(e) {
    if (confettiTriggered) return;
    const btn = e.target.closest('button');
    if (!btn) return;
    // Only trigger on Add buttons (not Remove / tab buttons)
    const txt = btn.textContent.trim().toLowerCase();
    if (txt === 'add' || txt.startsWith('add')) {
      confettiTriggered = true;
      const rect = btn.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  });
})();


/* ── 4. KEYBOARD EASTER EGG: type "gold" to flash the page ── */
(function initEasterEgg() {
  let buffer = '';
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    buffer = (buffer + e.key).slice(-4).toLowerCase();
    if (buffer === 'gold') {
      document.body.style.transition = 'filter 0.2s';
      document.body.style.filter = 'sepia(1) saturate(3) hue-rotate(10deg) brightness(1.3)';
      setTimeout(() => { document.body.style.filter = ''; }, 600);
    }
  });
})();


/* ── 5. COURSE LIST GENERATOR ── */
(function initListGenerator() {
  const generateBtn = document.getElementById('generateListBtn');
  const modal       = document.getElementById('listModal');
  const closeModal  = document.querySelector('.close-modal');
  const listContent = document.getElementById('modalListContent');
  const copyBtn     = document.getElementById('copyListBtn');

  if (!generateBtn || !modal || !closeModal || !listContent || !copyBtn) return;

  function openModal() {
    // Access 'selected' from script.js global scope
    if (typeof selected === 'undefined' || selected.length === 0) {
      alert("No courses selected yet!");
      return;
    }

    listContent.innerHTML = '';
    
    // Group selected courses similarly to how script.js does it
    const selectedGroups = new Map();
    selected.forEach(c => {
      const key = c.split(" [")[0]; // Get the Section Key
      if (!selectedGroups.has(key)) selectedGroups.set(key, []);
      selectedGroups.get(key).push(c);
    });

    selectedGroups.forEach((parts, key) => {
      const item = document.createElement('div');
      item.className = 'list-item';
      
      const title = document.createElement('div');
      title.className = 'list-item-title';
      title.textContent = key;
      
      const info = document.createElement('div');
      info.className = 'list-item-info';
      
      // Extract faculty (assuming standard format)
      const facultyMatch = parts[0].match(/- ([A-Z]+)\s*\[/);
      const faculty = facultyMatch ? facultyMatch[1] : 'TBA';
      
      const timings = parts.map(p => {
        const tMatch = p.match(/\[(.*?)\]/);
        return tMatch ? tMatch[1] : '';
      }).join(' | ');
      
      info.textContent = `Faculty: ${faculty} • ${timings}`;
      
      item.appendChild(title);
      item.appendChild(info);
      listContent.appendChild(item);
    });

    modal.style.display = 'flex';
    ThemeManager.setTheme('purple');
  }

  function hideModal() {
    modal.style.display = 'none';
    ThemeManager.restoreTabTheme();
  }

  generateBtn.addEventListener('click', openModal);
  closeModal.addEventListener('click', hideModal);
  
  // Close on clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  copyBtn.addEventListener('click', () => {
    const modalTitle = document.querySelector('#listModal h2').textContent;
    const items = listContent.querySelectorAll('.list-item');
    let text = `${modalTitle} (Summer 2026)\n${'='.repeat(modalTitle.length + 14)}\n\n`;
    
    items.forEach(item => {
      const titleEl = item.querySelector('.list-item-title');
      const infoEl = item.querySelector('.list-item-info');
      if (!titleEl || !infoEl) return;

      const title = titleEl.textContent;
      const info  = infoEl.innerText.replace(/\n/g, ' | '); // Flatten the info lines
      
      text += `• ${title}\n  ${info}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = 'rgba(74, 222, 128, 0.2)';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
      }, 2000);
    });
  });
})();


/* ── 6. CGPA CALCULATOR LOGIC ── */
(function initGPACalculator() {
  const addBtn        = document.getElementById('addGpaRow');
  const rowsContainer = document.getElementById('gpaRows');
  const totalCredsEl  = document.getElementById('totalCredits');
  const finalGpaEl    = document.getElementById('finalGpa');
  const semesterGpaEl = document.getElementById('semesterGpa');
  
  // Historical inputs
  const prevCgpaInput    = document.getElementById('prevCgpa');
  const prevCreditsInput = document.getElementById('prevCredits');
  const reportBtn        = document.getElementById('generateGpaReportBtn');
  
  // Reuse existing modal elements
  const modal       = document.getElementById('listModal');
  const listContent = document.getElementById('modalListContent');

  if (!addBtn || !rowsContainer || !totalCredsEl || !finalGpaEl || !semesterGpaEl || !prevCgpaInput || !prevCreditsInput || !reportBtn) return;

  const GRADE_SCALE = {
    'A+': 4.00, 'A': 3.75, 'A-': 3.50, 'B+': 3.25, 'B': 3.00,
    'B-': 2.75, 'C+': 2.50, 'C': 2.25, 'C-': 2.00, 'F': 0.00
  };

  function createRow(data = { name: '', credits: 3.0, grade: 'A+' }) {
    const row = document.createElement('div');
    row.className = 'gpa-row';
    
    row.innerHTML = `
      <input type="text" placeholder="e.g. CSE101" value="${data.name}" class="gpa-name">
      <input type="number" step="0.5" min="0" value="${data.credits}" class="gpa-creds">
      <select class="gpa-grade">
        ${Object.keys(GRADE_SCALE).map(g => `<option value="${g}" ${data.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
      <button class="btn-delete-row" title="Remove">&times;</button>
    `;

    // Listeners for real-time calculation
    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => {
        calculate();
        saveData();
      });
    });

    row.querySelector('.btn-delete-row').addEventListener('click', () => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        calculate();
        saveData();
      }, 300);
    });

    rowsContainer.appendChild(row);
  }

  function calculate() {
    const rows = rowsContainer.querySelectorAll('.gpa-row');
    
    // 1. Current Semester Calculation
    let currentPoints = 0;
    let currentCredits = 0;

    rows.forEach(row => {
      const creds = parseFloat(row.querySelector('.gpa-creds').value) || 0;
      const grade = row.querySelector('.gpa-grade').value;
      const points = GRADE_SCALE[grade] || 0;

      currentPoints += (points * creds);
      currentCredits += creds;
    });

    const semesterGpa = currentCredits > 0 ? (currentPoints / currentCredits) : 0;
    semesterGpaEl.textContent = semesterGpa.toFixed(2);

    // 2. Historical Data
    const prevCgpa = parseFloat(prevCgpaInput.value) || 0;
    const prevCredits = parseFloat(prevCreditsInput.value) || 0;
    const prevPoints = prevCgpa * prevCredits;

    // 3. Overall Calculation
    const totalPoints = currentPoints + prevPoints;
    const totalCredits = currentCredits + prevCredits;
    const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    totalCredsEl.textContent = totalCredits.toFixed(1);
    finalGpaEl.textContent = overallCgpa.toFixed(2);
    
    // Aesthetic update for GPA color
    if (overallCgpa >= 3.5) finalGpaEl.style.color = '#d4af37';
    else if (overallCgpa >= 2.5) finalGpaEl.style.color = '#fff8e7';
    else if (overallCgpa > 0) finalGpaEl.style.color = '#ff4d6d';
  }

  function generateReport() {
    const rows = rowsContainer.querySelectorAll('.gpa-row');
    if (rows.length === 0 && !prevCgpaInput.value) {
      alert("No data to report!");
      return;
    }

    listContent.innerHTML = '';
    
    // Summary Section in Modal
    const summaryItem = document.createElement('div');
    summaryItem.className = 'list-item';
    summaryItem.style.background = 'rgba(212, 175, 55, 0.08)';
    summaryItem.style.border = '1px solid rgba(212, 175, 55, 0.2)';
    summaryItem.style.marginBottom = '20px';
    
    const summaryTitle = document.createElement('div');
    summaryTitle.className = 'list-item-title';
    summaryTitle.textContent = 'ACADEMIC PERFORMANCE SUMMARY';
    summaryTitle.style.textAlign = 'center';
    
    const summaryInfo = document.createElement('div');
    summaryInfo.className = 'list-item-info';
    summaryInfo.style.textAlign = 'center';
    summaryInfo.style.fontSize = '1.1rem';
    summaryInfo.innerHTML = `
      Semester GPA: <strong>${semesterGpaEl.textContent}</strong><br>
      Overall CGPA: <strong>${finalGpaEl.textContent}</strong><br>
      Total Credits: <strong>${totalCredsEl.textContent}</strong>
    `;
    
    summaryItem.appendChild(summaryTitle);
    summaryItem.appendChild(summaryInfo);
    listContent.appendChild(summaryItem);

    // Current Courses Heading
    const heading = document.createElement('div');
    heading.textContent = 'Current Semester Courses';
    heading.style.fontSize = '0.8rem';
    heading.style.opacity = '0.6';
    heading.style.marginBottom = '10px';
    heading.style.textTransform = 'uppercase';
    listContent.appendChild(heading);

    // List individual rows
    rows.forEach(row => {
      const name = row.querySelector('.gpa-name').value || 'Unnamed Course';
      const creds = row.querySelector('.gpa-creds').value;
      const grade = row.querySelector('.gpa-grade').value;

      const item = document.createElement('div');
      item.className = 'list-item';
      
      const title = document.createElement('div');
      title.className = 'list-item-title';
      title.textContent = name;
      
      const info = document.createElement('div');
      info.className = 'list-item-info';
      info.textContent = `Grade: ${grade}  •  Credits: ${creds}`;
      
      item.appendChild(title);
      item.appendChild(info);
      listContent.appendChild(item);
    });

    document.querySelector('#listModal h2').textContent = 'GPA Analysis Result';
    modal.style.display = 'flex';
    ThemeManager.setTheme('purple');
  }

  function saveData() {
    // Current rows
    const rows = rowsContainer.querySelectorAll('.gpa-row');
    const data = Array.from(rows).map(row => ({
      name: row.querySelector('.gpa-name').value,
      credits: row.querySelector('.gpa-creds').value,
      grade: row.querySelector('.gpa-grade').value
    }));
    localStorage.setItem('gpa_data', JSON.stringify(data));
    
    // Historical data
    localStorage.setItem('gpa_prev_cgpa', prevCgpaInput.value);
    localStorage.setItem('gpa_prev_credits', prevCreditsInput.value);
  }

  function loadData() {
    // Load historical
    prevCgpaInput.value = localStorage.getItem('gpa_prev_cgpa') || '';
    prevCreditsInput.value = localStorage.getItem('gpa_prev_credits') || '';

    // Load rows
    const saved = localStorage.getItem('gpa_data');
    if (saved) {
      const data = JSON.parse(saved);
      data.forEach(d => createRow(d));
    } else {
      for(let i=0; i<3; i++) createRow();
    }
    calculate();
  }

  // Listeners for historical inputs
  [prevCgpaInput, prevCreditsInput].forEach(input => {
    input.addEventListener('input', () => {
      calculate();
      saveData();
    });
  });

  addBtn.addEventListener('click', () => {
    createRow();
    calculate();
    saveData();
  });

  reportBtn.addEventListener('click', generateReport);

  loadData();
})();
