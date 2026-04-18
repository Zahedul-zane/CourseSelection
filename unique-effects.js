/* ═══════════════════════════════════════════════
   unique-effects.js  — Professional Version
   Adds: Live Clock · Subtle Burst · Theme Management
   Removed: Comic SFX · Heavy Sparkles
═══════════════════════════════════════════════ */

const ThemeManager = (() => {
  let previousTabTheme = 'default';

  function setTheme(theme) {
    document.body.classList.remove('theme-gold', 'theme-cyan', 'theme-red', 'theme-purple');
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  const initTabs = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) {
      setTimeout(initTabs, 100);
      return;
    }
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Professional theme keeps colors subtle and consistent
        setTheme('default');
      });
    });
  };

  initTabs();

  return {
    setTheme,
    restoreTabTheme: () => setTheme(previousTabTheme),
    getThemeColors: () => {
      return {
        solid: '#6FCF97',     // Soft Mint
        faded: 'rgba(111, 207, 151, 0.4)',
        veryFaded: 'rgba(31, 111, 95, 0.4)' // Deep Forest
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

/* ── 2. SUBTLE INTERACTION BURST ── */
(function initInteraction() {
  let interactionTriggered = false;

  function burst(cx, cy) {
    const colors = ['#6FCF97', '#2FA084', '#1F6F5F', '#EEEEEE'];
    const COUNT = 12;
    
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      Object.assign(el.style, {
        position:        'fixed',
        left:            (cx - 2) + 'px',
        top:             (cy - 2) + 'px',
        width:           '4px',
        height:          '4px',
        borderRadius:    '50%',
        background:      color,
        zIndex:          '9999',
        pointerEvents:   'none'
      });

      document.body.appendChild(el);

      const angle = (360 / COUNT) * i;
      const rad   = angle * Math.PI / 180;
      const dist  = 30 + Math.random() * 20;
      const tx    = Math.cos(rad) * dist;
      const ty    = Math.sin(rad) * dist;

      const duration = 600 + Math.random() * 400;
      const start = performance.now();

      requestAnimationFrame(function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        el.style.transform = `translate(${tx * eased}px, ${ty * eased}px) scale(${1 - progress})`;
        el.style.opacity = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
        }
      });
    }
  }

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const rect = btn.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
})();

/* ── 3. LIST GENERATOR & MODAL ── */
(function initListGenerator() {
  const generateBtn = document.getElementById('generateListBtn');
  const modal       = document.getElementById('listModal');
  const closeModal  = document.querySelector('.close-modal');
  const listContent = document.getElementById('modalListContent');
  const copyBtn     = document.getElementById('copyListBtn');

  if (!generateBtn || !modal || !closeModal || !listContent || !copyBtn) return;

  function openModal() {
    if (typeof selected === 'undefined' || selected.length === 0) {
      alert("No courses selected yet!");
      return;
    }

    listContent.innerHTML = '';
    const selectedGroups = new Map();
    selected.forEach(c => {
      const key = c.split(" [")[0];
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
  }

  function hideModal() {
    modal.style.display = 'none';
  }

  generateBtn.addEventListener('click', openModal);
  closeModal.addEventListener('click', hideModal);
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
      text += `• ${titleEl.textContent}\n  ${infoEl.textContent}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    });
  });
})();

/* ── 4. CGPA CALCULATOR LOGIC ── */
(function initGpaCalculator() {
  const gpaRowsContainer = document.getElementById('gpaRows');
  const addRowBtn        = document.getElementById('addGpaRow');
  const semesterGpaEl    = document.getElementById('semesterGpa');
  const totalCreditsEl   = document.getElementById('totalCredits');
  const finalGpaEl       = document.getElementById('finalGpa');
  const reportBtn        = document.getElementById('generateGpaReportBtn');
  
  const prevCgpaInput    = document.getElementById('prevCgpa');
  const prevCreditsInput = document.getElementById('prevCredits');

  if (!gpaRowsContainer || !addRowBtn) return;

  const GRADE_SCALE = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  function createRow() {
    const row = document.createElement('div');
    row.className = 'gpa-row-entry';
    row.innerHTML = `
      <input type="text" placeholder="e.g. CSE110" class="gpa-name">
      <input type="number" step="0.5" min="0" placeholder="3.0" class="gpa-credits">
      <select class="gpa-grade">
        ${Object.keys(GRADE_SCALE).map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
      <button class="remove-row-btn">&times;</button>
    `;

    row.querySelector('.remove-row-btn').onclick = () => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        calculateGPA();
      }, 200);
    };

    // Add listeners for real-time calculation
    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', calculateGPA);
    });

    gpaRowsContainer.appendChild(row);
    calculateGPA();
  }

  function calculateGPA() {
    const rows = gpaRowsContainer.querySelectorAll('.gpa-row-entry');
    let semCredits = 0;
    let semPoints = 0;

    rows.forEach(row => {
      const credits = parseFloat(row.querySelector('.gpa-credits').value) || 0;
      const grade = row.querySelector('.gpa-grade').value;
      const points = GRADE_SCALE[grade] || 0;

      if (credits > 0) {
        semCredits += credits;
        semPoints += (credits * points);
      }
    });

    const semGpa = semCredits > 0 ? (semPoints / semCredits) : 0;
    semesterGpaEl.textContent = semGpa.toFixed(2);

    // Cumulative Logic
    const prevCgpa = parseFloat(prevCgpaInput.value) || 0;
    const prevCredits = parseFloat(prevCreditsInput.value) || 0;

    const totalCredits = prevCredits + semCredits;
    const totalPoints = (prevCgpa * prevCredits) + semPoints;
    const finalCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    totalCreditsEl.textContent = totalCredits.toFixed(1);
    finalGpaEl.textContent = finalCgpa.toFixed(2);
    
    // Animate the values if they change
    [semesterGpaEl, finalGpaEl].forEach(el => {
      el.classList.remove('pulse-glow');
      void el.offsetWidth; // trigger reflow
      el.classList.add('pulse-glow');
    });
  }

  addRowBtn.addEventListener('click', createRow);
  [prevCgpaInput, prevCreditsInput].forEach(input => {
    input.addEventListener('input', calculateGPA);
  });

  reportBtn.addEventListener('click', () => {
    const rows = gpaRowsContainer.querySelectorAll('.gpa-row-entry');
    let reportText = `🎓 CGPA ACADEMIC REPORT (Emerald Edition)\n`;
    reportText += `Generated: ${new Date().toLocaleDateString()}\n`;
    reportText += `====================================\n\n`;
    
    reportText += `SUMMARY STATS:\n`;
    reportText += `• Semester GPA: ${semesterGpaEl.textContent}\n`;
    reportText += `• Overall CGPA: ${finalGpaEl.textContent}\n`;
    reportText += `• Total Credits: ${totalCreditsEl.textContent}\n\n`;
    
    if (rows.length > 0) {
      reportText += `COURSE DETAILS:\n`;
      rows.forEach(row => {
        const name = row.querySelector('.gpa-name').value || 'Unnamed Course';
        const credits = row.querySelector('.gpa-credits').value || '0';
        const grade = row.querySelector('.gpa-grade').value;
        reportText += `- ${name.padEnd(10)} | ${credits} Credits | Grade: ${grade}\n`;
      });
    }

    navigator.clipboard.writeText(reportText).then(() => {
      const originalText = reportBtn.textContent;
      reportBtn.textContent = 'Report Copied!';
      setTimeout(() => { reportBtn.textContent = originalText; }, 2000);
    });
  });

  // Initial row
  createRow();
})();
