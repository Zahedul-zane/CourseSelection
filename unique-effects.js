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
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#0284c7', '#0d9488', '#f59e0b'];
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
    let text = `${modalTitle} (Fall 2026)\n${'='.repeat(modalTitle.length + 12)}\n\n`;
    
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

/* ── 4. CGPA CALCULATOR & COURSE AUTO-FILL LOGIC ── */
(function initGpaCalculator() {
  const gpaRowsContainer = document.getElementById('gpaRows');
  const addRowBtn        = document.getElementById('addGpaRow');
  const importBtn        = document.getElementById('importSelectedGpaBtn');
  const resetBtn         = document.getElementById('resetGpaBtn');
  const semesterGpaEl    = document.getElementById('semesterGpa');
  const totalCreditsEl   = document.getElementById('totalCredits');
  const finalGpaEl       = document.getElementById('finalGpa');
  const standingEl       = document.getElementById('academicStanding');
  const reportBtn        = document.getElementById('generateGpaReportBtn');
  
  const prevCgpaInput    = document.getElementById('prevCgpa');
  const prevCreditsInput = document.getElementById('prevCredits');

  if (!gpaRowsContainer || !addRowBtn) return;

  const GRADE_SCALE = {
    'A+': 4.00,
    'A':  3.75,
    'A-': 3.50,
    'B+': 3.25,
    'B':  3.00,
    'B-': 2.75,
    'C+': 2.50,
    'C':  2.25,
    'D':  2.00,
    'F':  0.00
  };

  // Helper to extract numeric credits (e.g. "3+1=4" -> 4, "3" -> 3)
  function parseNumericCredits(credStr) {
    if (!credStr) return 3;
    if (typeof credStr === 'number') return credStr;
    const str = String(credStr).trim();
    if (str.includes('=')) {
      const parts = str.split('=');
      const val = parseFloat(parts[parts.length - 1]);
      if (!isNaN(val)) return val;
    }
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 3;
  }

  // Get master list of courses for autocomplete lookup
  function getMasterCourseList() {
    const list = [];
    const map = new Map();

    const processArr = (arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach(c => {
        if (c && c.code && !map.has(c.code.toUpperCase())) {
          const numCr = parseNumericCredits(c.credits);
          const item = {
            code: c.code.toUpperCase(),
            title: c.title || '',
            credits: numCr,
            rawCredits: c.credits || String(numCr)
          };
          map.set(c.code.toUpperCase(), item);
          list.push(item);
        }
      });
    };

    if (typeof CSE_CURRICULUM_DATA !== 'undefined') processArr(CSE_CURRICULUM_DATA.courses);
    if (typeof ICE_CURRICULUM_DATA !== 'undefined') processArr(ICE_CURRICULUM_DATA.courses);

    return list;
  }

  // Show Toast notification banner
  function showToast(message, actionText, actionCallback) {
    let container = document.querySelector('.app-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'app-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.innerHTML = `<span>${message}</span>`;
    
    if (actionText && actionCallback) {
      const btn = document.createElement('button');
      btn.className = 'toast-btn';
      btn.textContent = actionText;
      btn.onclick = () => {
        actionCallback();
        toast.remove();
      };
      toast.appendChild(btn);
    }

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Academic Standing calculation for EWU
  function updateAcademicStanding(cgpa, totalCredits) {
    if (!standingEl) return;
    standingEl.className = 'academic-standing-badge';

    if (totalCredits === 0) {
      standingEl.textContent = 'No Graded Courses';
      standingEl.classList.add('standing-neutral');
      return;
    }

    if (cgpa >= 3.75) {
      standingEl.textContent = '⭐ First Class with Distinction';
      standingEl.classList.add('standing-distinction');
    } else if (cgpa >= 3.00) {
      standingEl.textContent = '🎯 First Class';
      standingEl.classList.add('standing-first');
    } else if (cgpa >= 2.50) {
      standingEl.textContent = '📈 Second Class';
      standingEl.classList.add('standing-second');
    } else if (cgpa >= 2.00) {
      standingEl.textContent = '✔️ Passing / Good Standing';
      standingEl.classList.add('standing-pass');
    } else {
      standingEl.textContent = '⚠️ Academic Probation (< 2.00)';
      standingEl.classList.add('standing-probation');
    }
  }

  function createRow(initialName = '', initialCredits = 3, initialGrade = 'A') {
    const row = document.createElement('div');
    row.className = 'gpa-row-entry';
    row.innerHTML = `
      <div class="gpa-name-wrap">
        <input type="text" placeholder="e.g. CSE103 or English" class="gpa-name" value="${initialName}" autocomplete="off">
        <div class="gpa-autocomplete-dropdown" style="display:none;"></div>
      </div>
      <input type="number" step="0.5" min="0" max="6" placeholder="3.0" class="gpa-credits" value="${initialCredits}">
      <select class="gpa-grade">
        ${Object.keys(GRADE_SCALE).map(g => `<option value="${g}" ${g === initialGrade ? 'selected' : ''}>${g} (${GRADE_SCALE[g].toFixed(2)})</option>`).join('')}
      </select>
      <button class="remove-row-btn" title="Remove Course">&times;</button>
      
      <div class="gpa-row-sub">
        <label class="gpa-retake-label">
          <input type="checkbox" class="gpa-retake-check"> Retake Course
        </label>
        <div class="gpa-prev-grade-wrap" style="display:none;">
          <span>Previous Grade:</span>
          <select class="gpa-prev-grade">
            ${Object.keys(GRADE_SCALE).map(g => `<option value="${g}" ${g === 'D' ? 'selected' : ''}>${g} (${GRADE_SCALE[g].toFixed(2)})</option>`).join('')}
          </select>
        </div>
      </div>
    `;

    const nameInput = row.querySelector('.gpa-name');
    const creditsInput = row.querySelector('.gpa-credits');
    const dropdown = row.querySelector('.gpa-autocomplete-dropdown');
    const retakeCheck = row.querySelector('.gpa-retake-check');
    const prevGradeWrap = row.querySelector('.gpa-prev-grade-wrap');

    retakeCheck.addEventListener('change', () => {
      prevGradeWrap.style.display = retakeCheck.checked ? 'inline-flex' : 'none';
      calculateGPA();
    });

    // Autocomplete & Auto-Fill handler
    function handleAutocomplete() {
      const val = nameInput.value.trim();
      if (!val) {
        dropdown.style.display = 'none';
        return;
      }

      const allCourses = getMasterCourseList();
      const query = val.toLowerCase();
      const matches = allCourses.filter(c => 
        c.code.toLowerCase().includes(query) || 
        c.title.toLowerCase().includes(query)
      ).slice(0, 6);

      // Auto-fill credits if exact code match exists
      const exactMatch = allCourses.find(c => c.code.toLowerCase() === query);
      if (exactMatch && (!creditsInput.value || creditsInput.value == 0)) {
        creditsInput.value = exactMatch.credits;
        calculateGPA();
      }

      if (matches.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      dropdown.innerHTML = '';
      matches.forEach(c => {
        const item = document.createElement('div');
        item.className = 'gpa-auto-item';
        item.innerHTML = `
          <div>
            <span class="gpa-auto-code">${c.code}</span>
            <span class="gpa-auto-title">${c.title}</span>
          </div>
          <span class="gpa-auto-credits">${c.credits} Cr</span>
        `;
        item.onmousedown = (e) => {
          e.preventDefault(); // prevent blur
          nameInput.value = `${c.code} - ${c.title}`;
          creditsInput.value = c.credits;
          dropdown.style.display = 'none';
          calculateGPA();
        };
        dropdown.appendChild(item);
      });

      dropdown.style.display = 'flex';
    }

    nameInput.addEventListener('input', () => {
      handleAutocomplete();
      calculateGPA();
    });

    nameInput.addEventListener('focus', handleAutocomplete);

    nameInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (dropdown) dropdown.style.display = 'none';
      }, 200);
    });

    row.querySelector('.remove-row-btn').onclick = () => {
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        if (gpaRowsContainer.querySelectorAll('.gpa-row-entry').length === 0) {
          createRow('', 3, 'A');
        }
        calculateGPA();
      }, 200);
    };

    // Add listeners for real-time calculation
    row.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', calculateGPA);
      el.addEventListener('change', calculateGPA);
    });

    gpaRowsContainer.appendChild(row);
    calculateGPA();
    return row;
  }

  function calculateGPA() {
    const rows = gpaRowsContainer.querySelectorAll('.gpa-row-entry');
    let semCredits = 0;
    let semPoints = 0;
    let cumCreditsAdded = 0;
    let cumPointsAdded = 0;

    rows.forEach(row => {
      const credits = Math.max(0, parseFloat(row.querySelector('.gpa-credits').value) || 0);
      const grade = row.querySelector('.gpa-grade').value;
      const currentPoints = GRADE_SCALE[grade] !== undefined ? GRADE_SCALE[grade] : 0;
      
      const isRetake = row.querySelector('.gpa-retake-check') && row.querySelector('.gpa-retake-check').checked;
      const prevGrade = row.querySelector('.gpa-prev-grade') ? row.querySelector('.gpa-prev-grade').value : 'D';
      const prevPoints = GRADE_SCALE[prevGrade] !== undefined ? GRADE_SCALE[prevGrade] : 0;

      if (credits > 0) {
        semCredits += credits;
        semPoints += (credits * currentPoints);

        if (isRetake) {
          // In EWU retake, grade delta updates cumulative points without duplicating degree credits
          cumPointsAdded += credits * (currentPoints - prevPoints);
        } else {
          cumCreditsAdded += credits;
          cumPointsAdded += (credits * currentPoints);
        }
      }
    });

    // Semester GPA
    const semGpa = semCredits > 0 ? (semPoints / semCredits) : 0;
    semesterGpaEl.textContent = semGpa.toFixed(2);

    // Cumulative CGPA
    const prevCgpa = Math.min(4.00, Math.max(0, parseFloat(prevCgpaInput.value) || 0));
    const prevCredits = Math.max(0, parseFloat(prevCreditsInput.value) || 0);

    const totalCumCredits = prevCredits + cumCreditsAdded;
    const prevTotalPoints = prevCgpa * prevCredits;
    const totalCumPoints = prevTotalPoints + cumPointsAdded;

    let finalCgpa = 0;
    if (totalCumCredits > 0) {
      finalCgpa = totalCumPoints / totalCumCredits;
    } else if (semCredits > 0) {
      finalCgpa = semGpa;
    }

    finalCgpa = Math.min(4.00, Math.max(0.00, finalCgpa));

    totalCreditsEl.textContent = totalCumCredits.toFixed(1);
    finalGpaEl.textContent = finalCgpa.toFixed(2);
    
    updateAcademicStanding(finalCgpa, totalCumCredits || semCredits);

    // Animate the values on update
    [semesterGpaEl, finalGpaEl].forEach(el => {
      el.classList.remove('pulse-glow');
      void el.offsetWidth; // trigger reflow
      el.classList.add('pulse-glow');
    });
  }

  // Global helper for 1-click addition from Curriculum tab
  window.addCourseToGpaCalculator = function(code, credits, title) {
    const numCredits = parseNumericCredits(credits);
    const displayName = code + (title ? ' - ' + title : '');

    // Check if there is an unfilled empty row
    let targetRow = null;
    const rows = gpaRowsContainer.querySelectorAll('.gpa-row-entry');
    rows.forEach(r => {
      const nInput = r.querySelector('.gpa-name');
      const cInput = r.querySelector('.gpa-credits');
      if (!nInput.value.trim() && (!cInput.value || cInput.value == 0) && !targetRow) {
        targetRow = r;
      }
    });

    if (targetRow) {
      targetRow.querySelector('.gpa-name').value = displayName;
      targetRow.querySelector('.gpa-credits').value = numCredits;
      calculateGPA();
    } else {
      createRow(displayName, numCredits, 'A');
    }

    showToast(`Added <strong>${code}</strong> (${numCredits} Cr) to GPA Calculator`, 'View GPA Tab', () => {
      const gpaTabBtn = document.querySelector('.tab-btn[data-tab="gpa"]');
      if (gpaTabBtn) gpaTabBtn.click();
    });
  };

  addRowBtn.addEventListener('click', () => createRow('', 3, 'A'));
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      if (typeof selected === 'undefined' || selected.length === 0) {
        showToast("No courses selected in Search tab yet!", "Go to Search", () => {
          const searchTabBtn = document.querySelector('.tab-btn[data-tab="search"]');
          if (searchTabBtn) searchTabBtn.click();
        });
        return;
      }

      // Group selected courses by course code
      const selectedGroups = new Map();
      selected.forEach(c => {
        const key = c.split(" [")[0];
        const code = key.split(" (")[0].trim().toUpperCase();
        if (!selectedGroups.has(code)) {
          selectedGroups.set(code, key);
        }
      });

      gpaRowsContainer.innerHTML = '';
      const allCourses = getMasterCourseList();
      let count = 0;

      selectedGroups.forEach((fullTitle, code) => {
        const match = allCourses.find(c => c.code === code);
        const creds = match ? match.credits : 3;
        createRow(fullTitle, creds, 'A');
        count++;
      });

      calculateGPA();
      showToast(`Imported ${count} selected courses into GPA Calculator!`);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      prevCgpaInput.value = '';
      prevCreditsInput.value = '';
      gpaRowsContainer.innerHTML = '';
      createRow('', 3, 'A');
      createRow('', 3, 'A');
      createRow('', 3, 'A');
      calculateGPA();
      showToast("GPA Calculator reset to defaults.");
    });
  }

  [prevCgpaInput, prevCreditsInput].forEach(input => {
    input.addEventListener('input', calculateGPA);
    input.addEventListener('change', calculateGPA);
  });

  reportBtn.addEventListener('click', () => {
    const rows = gpaRowsContainer.querySelectorAll('.gpa-row-entry');
    let reportText = `🎓 EAST WEST UNIVERSITY — CGPA ACADEMIC REPORT\n`;
    reportText += `Generated: ${new Date().toLocaleDateString()} | Semester: Fall 2026\n`;
    reportText += `====================================================\n\n`;
    
    reportText += `ACADEMIC SUMMARY:\n`;
    reportText += `• Semester GPA:   ${semesterGpaEl.textContent}\n`;
    reportText += `• Cumulative CGPA: ${finalGpaEl.textContent}\n`;
    reportText += `• Total Credits:   ${totalCreditsEl.textContent}\n`;
    if (standingEl) {
      reportText += `• Academic Status: ${standingEl.textContent}\n`;
    }
    reportText += `\n`;
    
    if (rows.length > 0) {
      reportText += `REGISTERED COURSES & GRADES:\n`;
      rows.forEach(row => {
        const name = row.querySelector('.gpa-name').value || 'Course';
        const credits = row.querySelector('.gpa-credits').value || '3';
        const grade = row.querySelector('.gpa-grade').value;
        const gradePoint = (GRADE_SCALE[grade] !== undefined) ? GRADE_SCALE[grade].toFixed(2) : '0.00';
        const isRetake = row.querySelector('.gpa-retake-check') && row.querySelector('.gpa-retake-check').checked;
        const retakeInfo = isRetake ? ` [Retake, Prev: ${row.querySelector('.gpa-prev-grade').value}]` : '';
        reportText += `- ${name.padEnd(20)} | ${credits} Cr | Grade: ${grade} (${gradePoint})${retakeInfo}\n`;
      });
    }

    reportText += `\nOfficial EWU Grading Policy: A+ (4.00), A (3.75), A- (3.50), B+ (3.25), B (3.00), B- (2.75), C+ (2.50), C (2.25), D (2.00), F (0.00)\n`;

    navigator.clipboard.writeText(reportText).then(() => {
      const originalText = reportBtn.textContent;
      reportBtn.textContent = '✅ Report Copied!';
      setTimeout(() => { reportBtn.textContent = originalText; }, 2500);
    });
  });

  // Initial 3 clean rows for quick calculation
  createRow('', 3, 'A');
  createRow('', 3, 'A');
  createRow('', 3, 'A');
})();
