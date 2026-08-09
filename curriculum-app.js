// Curriculum & Course Finder Application Module

(function () {
  // State
  let currentProgram = 'CSE'; // 'CSE' or 'ICE'
  let currentView = 'sheet';   // 'sheet', 'cards', 'flowchart'
  let searchTerm = '';
  let selectedCategory = 'ALL';
  let selectedMajor = 'ALL';
  let sortColumn = 'code';
  let sortDirection = 'asc';
  let activeModalCourse = null;

  // DOM Elements
  const progBtns = document.querySelectorAll('.program-btn');
  const viewBtns = document.querySelectorAll('.view-mode-btn');
  const searchInput = document.getElementById('curriculumSearch');
  const clearSearchBtn = document.getElementById('clearCurrSearch');
  const categoryFilter = document.getElementById('currCategoryFilter');
  const majorFilter = document.getElementById('currMajorFilter');
  const resetFiltersBtn = document.getElementById('resetCurrFiltersBtn');
  const exportCsvBtn = document.getElementById('exportCurrCsvBtn');

  const sheetBody = document.getElementById('curriculumSheetBody');
  const cardsContainer = document.getElementById('curriculumCardsContainer');
  const flowchartContainer = document.getElementById('curriculumFlowchartContainer');

  const statCredits = document.getElementById('currTotalCredits');
  const statCourses = document.getElementById('currTotalCourses');
  const statCategories = document.getElementById('currCategoriesCount');
  const statFiltered = document.getElementById('currFilteredCount');

  const prereqModal = document.getElementById('prereqModal');
  const closePrereqModalBtn = document.getElementById('closePrereqModal');
  const prereqModalCode = document.getElementById('prereqModalCode');
  const prereqModalTitle = document.getElementById('prereqModalTitle');
  const prereqModalContent = document.getElementById('prereqModalContent');
  const searchSectionFromModalBtn = document.getElementById('searchSectionFromModalBtn');

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    populateCategoryDropdown();
    renderCurriculum();
  });

  // Event Listeners Setup
  function initEvents() {
    // Program Selector (CSE / ICE)
    progBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        progBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentProgram = btn.getAttribute('data-program');
        
        // Show/hide major filter for CSE vs ICE
        if (currentProgram === 'CSE') {
          majorFilter.style.display = 'inline-block';
        } else {
          majorFilter.style.display = 'none';
        }
        
        selectedCategory = 'ALL';
        selectedMajor = 'ALL';
        majorFilter.value = 'ALL';
        populateCategoryDropdown();
        renderCurriculum();
      });
    });

    // View Mode Switcher
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.getAttribute('data-view');

        document.querySelectorAll('.curriculum-view').forEach(v => v.classList.remove('active'));
        if (currentView === 'sheet') document.getElementById('currSheetView').classList.add('active');
        else if (currentView === 'cards') document.getElementById('currCardsView').classList.add('active');
        else if (currentView === 'flowchart') document.getElementById('currFlowchartView').classList.add('active');

        renderCurriculum();
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        renderCurriculum();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        clearSearchBtn.style.display = 'none';
        renderCurriculum();
      });
    }

    // Category & Major Filters
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        renderCurriculum();
      });
    }

    if (majorFilter) {
      majorFilter.addEventListener('change', (e) => {
        selectedMajor = e.target.value;
        renderCurriculum();
      });
    }

    // Reset Filters Button
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        searchTerm = '';
        selectedCategory = 'ALL';
        selectedMajor = 'ALL';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (categoryFilter) categoryFilter.value = 'ALL';
        if (majorFilter) majorFilter.value = 'ALL';
        renderCurriculum();
      });
    }

    // Export CSV Button
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', exportCurriculumToCsv);
    }

    // Table Header Sorting
    const sortHeaders = document.querySelectorAll('.curriculum-table th.sortable');
    sortHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortColumn === col) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = col;
          sortDirection = 'asc';
        }
        
        sortHeaders.forEach(h => {
          const icon = h.querySelector('.sort-icon');
          if (icon) icon.textContent = '↕';
        });
        const activeIcon = th.querySelector('.sort-icon');
        if (activeIcon) activeIcon.textContent = sortDirection === 'asc' ? '↑' : '↓';

        renderCurriculum();
      });
    });

    // Prerequisite Modal Close
    if (closePrereqModalBtn) {
      closePrereqModalBtn.addEventListener('click', () => {
        if (prereqModal) prereqModal.style.display = 'none';
      });
    }

    if (prereqModal) {
      prereqModal.addEventListener('click', (e) => {
        if (e.target === prereqModal) prereqModal.style.display = 'none';
      });
    }

    // Search Section From Modal
    if (searchSectionFromModalBtn) {
      searchSectionFromModalBtn.addEventListener('click', () => {
        if (activeModalCourse) {
          if (prereqModal) prereqModal.style.display = 'none';
          findSectionsInSearchTab(activeModalCourse.code);
        }
      });
    }
  }

  // Get active dataset
  function getActiveData() {
    return currentProgram === 'CSE' ? CSE_CURRICULUM_DATA : ICE_CURRICULUM_DATA;
  }

  // Populate Category Filter Dropdown
  function populateCategoryDropdown() {
    if (!categoryFilter) return;
    const data = getActiveData();
    categoryFilter.innerHTML = '<option value="ALL">All Categories & Groups</option>';

    data.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = `${cat.name} (${cat.credits} Cr)`;
      categoryFilter.appendChild(opt);
    });
  }

  // Filter and Sort Courses
  function getFilteredCourses() {
    const data = getActiveData();
    let list = [...data.courses];

    // Filter by Search Term
    if (searchTerm) {
      list = list.filter(c => 
        c.code.toLowerCase().includes(searchTerm) ||
        c.title.toLowerCase().includes(searchTerm) ||
        c.prereq.toLowerCase().includes(searchTerm) ||
        c.category.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      list = list.filter(c => c.category === selectedCategory || c.group === selectedCategory);
    }

    // Filter by Major Area
    if (selectedMajor !== 'ALL' && currentProgram === 'CSE') {
      list = list.filter(c => c.majorTrack === selectedMajor || c.category.includes(selectedMajor));
    }

    // Sort List
    list.sort((a, b) => {
      let valA = a[sortColumn] || '';
      let valB = b[sortColumn] || '';
      if (sortColumn === 'credits') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }

  // Main Render Function
  function renderCurriculum() {
    const data = getActiveData();
    const filtered = getFilteredCourses();

    // Update Stats
    if (statCredits) statCredits.textContent = data.totalCredits;
    if (statCourses) statCourses.textContent = data.courses.length;
    if (statCategories) statCategories.textContent = data.categories.length;
    if (statFiltered) statFiltered.textContent = filtered.length;

    // Render active view
    if (currentView === 'sheet') {
      renderSheetView(filtered);
    } else if (currentView === 'cards') {
      renderCardsView(filtered);
    } else if (currentView === 'flowchart') {
      renderFlowchartView(filtered);
    }
  }

  // View 1: Full Sheet View Table
  function renderSheetView(courses) {
    if (!sheetBody) return;
    sheetBody.innerHTML = '';

    if (courses.length === 0) {
      sheetBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">
            No matching courses found in ${currentProgram} curriculum for your search criteria.
          </td>
        </tr>`;
      return;
    }

    courses.forEach((c, index) => {
      const tr = document.createElement('tr');
      tr.className = 'curr-row';

      // Prerequisite Pill HTML
      let prereqHtml = '<span class="prereq-none">None</span>';
      if (c.prereq && c.prereq !== 'None' && c.prereq !== '') {
        const parts = c.prereq.split(/[\s,;&]+/);
        prereqHtml = parts.map(p => {
          const cleanP = p.trim();
          if (!cleanP) return '';
          if (cleanP.length >= 4 && /[A-Z]+\d+/.test(cleanP)) {
            return `<span class="prereq-tag" onclick="window.showPrereqModal('${cleanP}')">${cleanP}</span>`;
          }
          return `<span>${cleanP}</span>`;
        }).join(' ');
      }

      // Category Badge Class
      let catClass = 'cat-badge';
      if (c.category.includes('General')) catClass += ' cat-ge';
      else if (c.category.includes('Math') || c.category.includes('Science')) catClass += ' cat-math';
      else if (c.category.includes('Core')) catClass += ' cat-core';
      else if (c.category.includes('Major')) catClass += ' cat-major';

      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.82rem;">${index + 1}</td>
        <td><span class="curr-code-badge">${c.code}</span></td>
        <td style="font-weight: 600; color: var(--text-primary);">${c.title}</td>
        <td><span class="curr-credits-tag">${c.credits} Cr</span></td>
        <td>${prereqHtml}</td>
        <td><span class="${catClass}">${c.category}</span></td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="tbl-act-btn" title="View Prerequisite Tree" onclick="window.showPrereqModal('${c.code}')">🔍 Tree</button>
            <button class="tbl-act-btn" title="Search Section" onclick="window.findSectionsInSearchTab('${c.code}')">⚡ Find</button>
            <button class="tbl-act-btn add-gpa-act-btn" title="Add to GPA Calculator" onclick="window.addCourseToGpaCalculator('${c.code}', '${c.credits}', '${c.title.replace(/'/g, "\\'")}')">➕ GPA</button>
          </div>
        </td>
      `;

      sheetBody.appendChild(tr);
    });
  }

  // View 2: Grouped Cards View
  function renderCardsView(courses) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = '';

    // Group courses by Category
    const groups = {};
    courses.forEach(c => {
      const groupName = c.category || 'Other Courses';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(c);
    });

    if (Object.keys(groups).length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);" class="glass-panel">
          No courses match current filter criteria.
        </div>`;
      return;
    }

    Object.keys(groups).forEach(grpName => {
      const grpCourses = groups[grpName];
      const card = document.createElement('div');
      card.className = 'curr-category-card glass-panel';

      let courseListHtml = '';
      grpCourses.forEach(c => {
        const safeTitle = c.title.replace(/'/g, "\\'");
        courseListHtml += `
          <div class="curr-card-item">
            <div class="curr-card-item-left" onclick="window.showPrereqModal('${c.code}')" style="flex:1;">
              <span class="curr-card-code">${c.code}</span>
              <span class="curr-card-title">${c.title}</span>
            </div>
            <div class="curr-card-item-right" style="display:flex; align-items:center; gap:8px;">
              <span class="curr-credits-tag">${c.credits} Cr</span>
              <button class="tbl-act-btn add-gpa-act-btn" title="Add to GPA Calculator" onclick="event.stopPropagation(); window.addCourseToGpaCalculator('${c.code}', '${c.credits}', '${safeTitle}')">➕ GPA</button>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="curr-card-head">
          <h3>${grpName}</h3>
          <span class="curr-card-count">${grpCourses.length} Courses</span>
        </div>
        <div class="curr-card-course-list">
          ${courseListHtml}
        </div>
      `;

      cardsContainer.appendChild(card);
    });
  }

  // View 3: Flowchart View
  function renderFlowchartView(courses) {
    if (!flowchartContainer) return;
    flowchartContainer.innerHTML = '';

    const yearNames = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const semNames = ['1st Semester', '2nd Semester', '3rd Semester'];

    yearNames.forEach((yName, yIdx) => {
      const yearNum = yIdx + 1;
      const yearBlock = document.createElement('div');
      yearBlock.className = 'flowchart-year-block';

      let semRowsHtml = '';
      semNames.forEach((sName, sIdx) => {
        const semNum = sIdx + 1;
        // Filter courses for this year & semester
        const semCourses = courses.filter(c => c.year === yearNum && c.semester === semNum);

        let pillsHtml = '';
        if (semCourses.length > 0) {
          semCourses.forEach(c => {
            const safeTitle = c.title.replace(/'/g, "\\'");
            pillsHtml += `
              <div class="flowchart-course-pill">
                <div onclick="window.showPrereqModal('${c.code}')" style="flex:1; cursor:pointer;">
                  <div class="fc-code">${c.code} (${c.credits} Cr)</div>
                  <div class="fc-title">${c.title}</div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  ${c.prereq && c.prereq !== 'None' ? `<span class="fc-prereq">Pre: ${c.prereq}</span>` : ''}
                  <button class="tbl-act-btn add-gpa-act-btn" title="Add to GPA Calculator" onclick="event.stopPropagation(); window.addCourseToGpaCalculator('${c.code}', '${c.credits}', '${safeTitle}')">➕ GPA</button>
                </div>
              </div>
            `;
          });
        } else {
          pillsHtml = `<div style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">Elective / Major Track Courses</div>`;
        }

        semRowsHtml += `
          <div class="flowchart-sem-card">
            <div class="flowchart-sem-head">${sName}</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${pillsHtml}
            </div>
          </div>
        `;
      });

      yearBlock.innerHTML = `
        <div class="flowchart-year-title">${yName}</div>
        <div class="flowchart-semesters-row">
          ${semRowsHtml}
        </div>
      `;

      flowchartContainer.appendChild(yearBlock);
    });
  }

  // Global Function: Show Prerequisite Modal
  window.showPrereqModal = function (courseCode) {
    const data = getActiveData();
    // Search in current program first, or fall back to other program
    let target = data.courses.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
    if (!target) {
      const otherData = currentProgram === 'CSE' ? ICE_CURRICULUM_DATA : CSE_CURRICULUM_DATA;
      target = otherData.courses.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
    }

    if (!target) {
      alert(`Course details for ${courseCode} not found.`);
      return;
    }

    activeModalCourse = target;

    if (prereqModalCode) prereqModalCode.textContent = target.code;
    if (prereqModalTitle) prereqModalTitle.textContent = target.title;

    // Find courses that require this target course (dependents)
    const dependentCourses = data.courses.filter(c => 
      c.prereq && c.prereq.toLowerCase().includes(target.code.toLowerCase())
    );

    let html = `
      <div class="prereq-tree-box">
        <div class="glass-panel" style="padding: 16px; border-radius: var(--radius-md);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="font-weight:700; color:var(--text-primary);">Credits: ${target.credits}</span>
            <span class="cat-badge cat-core">${target.category}</span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Department: ${target.dept} Program</p>
        </div>

        <div>
          <div class="tree-section-title">⬅ Required Prerequisites Before Taking This Course:</div>
          <div class="tree-list" style="margin-top: 8px;">
    `;

    if (!target.prereq || target.prereq === 'None' || target.prereq === '') {
      html += `<div style="font-style:italic; color:var(--text-muted); font-size:0.88rem;">No prerequisites required. Available for direct registration!</div>`;
    } else {
      const prereqParts = target.prereq.split(/[\s,;&]+/);
      prereqParts.forEach(p => {
        const cleanCode = p.trim();
        if (cleanCode.length >= 4) {
          const reqCourse = data.courses.find(c => c.code.toLowerCase() === cleanCode.toLowerCase());
          html += `
            <div class="tree-item" onclick="window.showPrereqModal('${cleanCode}')" style="cursor:pointer;">
              <span class="t-code">📌 ${cleanCode}</span>
              <span class="t-title">${reqCourse ? reqCourse.title : 'Prerequisite Course'}</span>
            </div>
          `;
        }
      });
    }

    html += `
          </div>
        </div>

        <div>
          <div class="tree-section-title">➡ Courses That Require ${target.code} as Prerequisite:</div>
          <div class="tree-list" style="margin-top: 8px;">
    `;

    if (dependentCourses.length === 0) {
      html += `<div style="font-style:italic; color:var(--text-muted); font-size:0.88rem;">No subsequent courses explicitly require this course.</div>`;
    } else {
      dependentCourses.forEach(dc => {
        html += `
          <div class="tree-item" onclick="window.showPrereqModal('${dc.code}')" style="cursor:pointer;">
            <span class="t-code">🔑 ${dc.code}</span>
            <span class="t-title">${dc.title}</span>
          </div>
        `;
      });
    }

    html += `
          </div>
        </div>
      </div>
    `;

    if (prereqModalContent) prereqModalContent.innerHTML = html;
    if (prereqModal) prereqModal.style.display = 'flex';
  };

  // Global Function: Jump to Search Tab & Find Available Sections
  window.findSectionsInSearchTab = function (courseCode) {
    // Switch to search tab
    const searchTabBtn = document.querySelector('.tab-btn[data-tab="search"]');
    if (searchTabBtn) searchTabBtn.click();

    // Prefill main search input
    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
      mainSearchInput.value = courseCode;
      mainSearchInput.dispatchEvent(new Event('input'));
      mainSearchInput.focus();
    }
  };

  // Export Sheet to CSV
  function exportCurriculumToCsv() {
    const data = getActiveData();
    const courses = getFilteredCourses();

    let csv = `Course Code,Course Title,Credits,Prerequisite,Category,Department\n`;
    courses.forEach(c => {
      const code = `"${c.code.replace(/"/g, '""')}"`;
      const title = `"${c.title.replace(/"/g, '""')}"`;
      const credits = `"${c.credits.replace(/"/g, '""')}"`;
      const prereq = `"${(c.prereq || 'None').replace(/"/g, '""')}"`;
      const cat = `"${c.category.replace(/"/g, '""')}"`;
      const dept = `"${c.dept}"`;
      csv += `${code},${title},${credits},${prereq},${cat},${dept}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentProgram}_Curriculum_Sheet.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();
