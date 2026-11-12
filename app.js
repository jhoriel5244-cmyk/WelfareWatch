document.addEventListener('DOMContentLoaded', () => {
  // Initial Seed Data for MSWDO Boac, Marinduque
  const defaultBeneficiaries = [
    {
      id: 1,
      spic: 'SPIC-2026-001',
      name: 'Elena M. Magtibay',
      barangay: 'Tabi',
      category: 'Widowed',
      dependents: 3,
      income: 6500,
      contact: '0917-442-8190',
      status: 'Active',
      docs: { brgy: true, affidavit: true, birth: true, income: true }
    },
    {
      id: 2,
      spic: 'SPIC-2026-002',
      name: 'Rowena L. Malapad',
      barangay: 'Murallon',
      category: 'Unmarried Parent',
      dependents: 1,
      income: 9000,
      contact: '0928-310-5541',
      status: 'Active',
      docs: { brgy: true, affidavit: true, birth: true, income: true }
    },
    {
      id: 3,
      spic: 'SPIC-2026-003',
      name: 'Marites R. De Guzman',
      barangay: 'Mercado',
      category: 'Abandoned',
      dependents: 2,
      income: 5000,
      contact: '0950-891-2234',
      status: 'Pending Validation',
      docs: { brgy: true, affidavit: true, birth: true, income: false }
    },
    {
      id: 4,
      spic: 'SPIC-2026-004',
      name: 'Jocelyn P. Reynoso',
      barangay: 'Isok I',
      category: 'Separated / Annulled',
      dependents: 2,
      income: 11000,
      contact: '0963-774-9012',
      status: 'Active',
      docs: { brgy: true, affidavit: true, birth: true, income: true }
    },
    {
      id: 5,
      spic: 'SPIC-2026-005',
      name: 'Clarissa V. Ocampo',
      barangay: 'Laylay',
      category: 'Widowed',
      dependents: 4,
      income: 4500,
      contact: '0919-605-3381',
      status: 'For Renewal',
      docs: { brgy: true, affidavit: false, birth: true, income: true }
    }
  ];

  const defaultAssistance = [
    { date: '2026-10-15', name: 'Elena M. Magtibay', spic: 'SPIC-2026-001', type: 'Monthly Cash Subsidy (RA 11861)', amount: 1000, remarks: 'LGU Boac Q4 Allocation' },
    { date: '2026-10-18', name: 'Rowena L. Malapad', spic: 'SPIC-2026-002', type: 'Educational Assistance', amount: 3000, remarks: 'MSWDO Back-to-School Aid' },
    { date: '2026-11-02', name: 'Jocelyn P. Reynoso', spic: 'SPIC-2026-004', type: 'Medical / Hospitalization Aid', amount: 5000, remarks: 'DSWD AICS Referral' }
  ];

  let beneficiaries = [];
  let assistanceLogs = [];
  try {
    beneficiaries = JSON.parse(localStorage.getItem('ww_beneficiaries')) || defaultBeneficiaries;
    assistanceLogs = JSON.parse(localStorage.getItem('ww_assistance')) || defaultAssistance;
  } catch (err) {
    beneficiaries = defaultBeneficiaries;
    assistanceLogs = defaultAssistance;
  }

  let currentRole = 'MSWDO Admin';
  let brgyChartInstance = null;
  let catChartInstance = null;

  function saveData() {
    try {
      localStorage.setItem('ww_beneficiaries', JSON.stringify(beneficiaries));
      localStorage.setItem('ww_assistance', JSON.stringify(assistanceLogs));
    } catch (e) {}
  }

  // Animated Number Count-Up
  function animateCounter(id, targetValue, prefix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    const duration = 550;
    const startTime = performance.now();

    function step(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * targetValue);
      el.innerText = `${prefix}${currentVal.toLocaleString()}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.innerText = `${prefix}${targetValue.toLocaleString()}`;
      }
    }
    requestAnimationFrame(step);
  }

  function updateStats() {
    const total = beneficiaries.length;
    const active = beneficiaries.filter(b => b.status === 'Active').length;
    const pending = beneficiaries.filter(b => b.status !== 'Active').length;
    const totalAid = assistanceLogs.reduce((sum, item) => sum + Number(item.amount), 0);

    animateCounter('stat-total', total);
    animateCounter('stat-active', active);
    animateCounter('stat-pending', pending);
    animateCounter('stat-aid', totalAid, '₱');
  }

  function getStatusBadge(status) {
    if (status === 'Active') {
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Active</span>`;
    } else if (status === 'Pending Validation') {
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Pending Validation</span>`;
    }
    return `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-dswdRed border border-red-300">For Renewal</span>`;
  }

  function renderRecentTable() {
    const tbody = document.getElementById('recentTableBody');
    if (!tbody) return;
    tbody.innerHTML = beneficiaries.slice(0, 5).map(b => `
      <tr>
        <td class="py-3 px-4 font-extrabold text-dswdNavy">${b.spic}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${b.name}</td>
        <td class="py-3 px-4 font-medium text-slate-700">${b.barangay}</td>
        <td class="py-3 px-4 font-medium text-slate-700">${b.dependents} child(ren)</td>
        <td class="py-3 px-4">${getStatusBadge(b.status)}</td>
        <td class="py-3 px-4 text-right">
          <button data-action="spic" data-id="${b.id}" class="btn-press text-xs bg-dswdNavy text-white hover:bg-dswdDarkNavy px-3 py-1.5 rounded-md font-bold transition-all">
            <i class="fa-solid fa-id-card mr-1 text-dswdYellow pointer-events-none"></i>SPIC
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderBeneficiaryTable() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const brgy = document.getElementById('filterBarangay')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const filtered = beneficiaries.filter(b => {
      const matchesText = b.name.toLowerCase().includes(query) || b.spic.toLowerCase().includes(query) || b.contact.includes(query);
      const matchesBrgy = brgy === '' || b.barangay === brgy;
      const matchesStatus = status === '' || b.status === status;
      return matchesText && matchesBrgy && matchesStatus;
    });

    const tbody = document.getElementById('beneficiaryTableBody');
    if (!tbody) return;
    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td class="py-3 px-4 font-extrabold text-dswdNavy">${b.spic}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${b.name}</div>
          <div class="text-xs font-medium text-slate-500">${b.contact}</div>
        </td>
        <td class="py-3 px-4 font-medium text-slate-800">${b.barangay}</td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-700">${b.category}</td>
        <td class="py-3 px-4 text-center font-bold text-slate-900">${b.dependents}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">₱${Number(b.income).toLocaleString()}</td>
        <td class="py-3 px-4">${getStatusBadge(b.status)}</td>
        <td class="py-3 px-4 text-right space-x-1">
          <button data-action="spic" data-id="${b.id}" title="View SPIC ID" class="p-2 text-dswdNavy hover:bg-dswdNavy hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-id-card pointer-events-none"></i></button>
          <button data-action="edit" data-id="${b.id}" title="Edit Profile" class="p-2 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-pen-to-square pointer-events-none"></i></button>
          ${currentRole === 'MSWDO Admin' ? `<button data-action="delete" data-id="${b.id}" title="Delete Record" class="p-2 text-dswdRed hover:bg-dswdRed hover:text-white rounded-lg transition-colors"><i class="fa-solid fa-trash pointer-events-none"></i></button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  function renderAssistanceTable() {
    const tbody = document.getElementById('assistanceTableBody');
    if (!tbody) return;
    tbody.innerHTML = assistanceLogs.map(a => `
      <tr>
        <td class="py-3 px-4 font-medium text-slate-600">${a.date}</td>
        <td class="py-3 px-4 font-bold text-slate-900">${a.name}</td>
        <td class="py-3 px-4 font-extrabold text-dswdNavy">${a.spic}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${a.type}</td>
        <td class="py-3 px-4 font-extrabold text-emerald-700">₱${Number(a.amount).toLocaleString()}</td>
        <td class="py-3 px-4 text-xs font-medium text-slate-600">${a.remarks}</td>
      </tr>
    `).join('');
  }

  function renderDocumentsGrid() {
    const grid = document.getElementById('documentsGrid');
    if (!grid) return;
    grid.innerHTML = beneficiaries.map(b => {
      const allComplete = b.docs.brgy && b.docs.affidavit && b.docs.birth && b.docs.income;
      return `
        <div class="doc-card bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-extrabold text-dswdNavy">${b.spic}</span>
              ${getStatusBadge(b.status)}
            </div>
            <h4 class="font-extrabold text-slate-900">${b.name}</h4>
            <p class="text-xs font-medium text-slate-600 mb-4">Brgy. ${b.barangay} • ${b.category}</p>
            <ul class="space-y-2 text-xs font-medium text-slate-800 mb-4">
              <li class="flex items-center gap-2">${b.docs.brgy ? '<i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed text-sm"></i>'} Barangay Solo Parent Cert.</li>
              <li class="flex items-center gap-2">${b.docs.affidavit ? '<i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed text-sm"></i>'} Sworn Affidavit</li>
              <li class="flex items-center gap-2">${b.docs.birth ? '<i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed text-sm"></i>'} PSA Birth Certificates</li>
              <li class="flex items-center gap-2">${b.docs.income ? '<i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed text-sm"></i>'} Indigency / Income Proof</li>
            </ul>
          </div>
          ${b.status !== 'Active' ? `
            <button data-action="approve" data-id="${b.id}" class="btn-press w-full py-2.5 bg-dswdNavy hover:bg-dswdDarkNavy text-white text-xs font-bold rounded-lg transition-all">
              <i class="fa-solid fa-check-double mr-1 text-dswdYellow pointer-events-none"></i> Validate & Activate SPIC
            </button>
          ` : `
            <div class="text-center py-2 bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg">
              <i class="fa-solid fa-shield-check mr-1"></i> ${allComplete ? 'Complete & Verified' : 'Verified by Admin'}
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  function renderReportTable() {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    tbody.innerHTML = beneficiaries.map((b, i) => `
      <tr>
        <td class="p-2 border border-slate-400 font-medium">${i + 1}</td>
        <td class="p-2 border border-slate-400 font-extrabold text-dswdNavy">${b.spic}</td>
        <td class="p-2 border border-slate-400 font-semibold">${b.name}</td>
        <td class="p-2 border border-slate-400">${b.barangay}</td>
        <td class="p-2 border border-slate-400">${b.category}</td>
        <td class="p-2 border border-slate-400 text-center font-bold">${b.dependents}</td>
        <td class="p-2 border border-slate-400 font-semibold">${b.status}</td>
      </tr>
    `).join('');
  }

  function renderCharts() {
    if (typeof Chart === 'undefined') return;
    const brgyCounts = {};
    const catCounts = {};

    beneficiaries.forEach(b => {
      brgyCounts[b.barangay] = (brgyCounts[b.barangay] || 0) + 1;
      catCounts[b.category] = (catCounts[b.category] || 0) + 1;
    });

    if (brgyChartInstance) brgyChartInstance.destroy();
    if (catChartInstance) catChartInstance.destroy();

    const canvas1 = document.getElementById('barangayChart');
    if (canvas1) {
      brgyChartInstance = new Chart(canvas1.getContext('2d'), {
        type: 'bar',
        data: {
          labels: Object.keys(brgyCounts),
          datasets: [{
            label: 'Registered Solo Parents',
            data: Object.values(brgyCounts),
            backgroundColor: '#282B84',
            hoverBackgroundColor: '#E31820',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#1e293b', font: { weight: 'bold' } } },
            x: { ticks: { color: '#1e293b', font: { weight: 'bold' } } }
          }
        }
      });
    }

    const canvas2 = document.getElementById('categoryChart');
    if (canvas2) {
      catChartInstance = new Chart(canvas2.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(catCounts),
          datasets: [{
            data: Object.values(catCounts),
            backgroundColor: ['#282B84', '#E31820', '#D99B06', '#059669', '#161852'],
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, color: '#0f172a', font: { size: 11, weight: 'bold' } } } }
        }
      });
    }
  }

  function refreshAllViews() {
    updateStats();
    renderRecentTable();
    renderBeneficiaryTable();
    renderAssistanceTable();
    renderDocumentsGrid();
    renderReportTable();
    renderCharts();
  }

  function switchTab(tabName) {
    const views = ['dashboard', 'beneficiaries', 'assistance', 'documents', 'reports'];
    const titles = {
      dashboard: 'Executive Dashboard',
      beneficiaries: 'Solo Parent Beneficiary Profiling',
      assistance: 'Assistance & Municipal Aid Monitoring',
      documents: 'RA 11861 Document Validation',
      reports: 'Quarterly Masterlist & Report Generator'
    };

    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('view-animate');
      }
      const btn = document.getElementById(`nav-${v}`);
      if (btn) {
        btn.classList.remove('bg-white/15', 'text-white', 'border-l-4', 'border-dswdYellow');
        btn.classList.add('text-blue-100');
      }
    });

    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      void targetView.offsetWidth;
      targetView.classList.add('view-animate');
    }

    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) {
      activeBtn.classList.add('bg-white/15', 'text-white', 'border-l-4', 'border-dswdYellow');
      activeBtn.classList.remove('text-blue-100');
    }
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.innerText = titles[tabName] || 'WelfareWatch';

    refreshAllViews();
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  }

  // Event Listeners
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', () => switchTab(el.getAttribute('data-tab')));
  });

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.getAttribute('data-close')));
  });

  document.getElementById('btnToggleRole')?.addEventListener('click', () => {
    currentRole = currentRole === 'MSWDO Admin' ? 'Social Worker / Encoder' : 'MSWDO Admin';
    document.getElementById('currentRoleDisplay').innerText = `Role: ${currentRole}`;
    renderBeneficiaryTable();
  });

  document.getElementById('btnMobileMenu')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('hidden');
  });

  document.getElementById('btnOpenRegister')?.addEventListener('click', () => {
    document.getElementById('editId').value = '';
    document.getElementById('modalTitle').innerText = 'Register New Solo Parent Beneficiary';
    document.getElementById('soloParentForm').reset();
    openModal('registerModal');
  });

  document.getElementById('btnOpenAid')?.addEventListener('click', () => {
    const select = document.getElementById('aidBeneficiary');
    select.innerHTML = beneficiaries.map(b => `<option value="${b.id}">${b.spic} - ${b.name}</option>`).join('');
    openModal('aidModal');
  });

  document.getElementById('searchInput')?.addEventListener('input', renderBeneficiaryTable);
  document.getElementById('filterBarangay')?.addEventListener('change', renderBeneficiaryTable);
  document.getElementById('filterStatus')?.addEventListener('change', renderBeneficiaryTable);

  // Delegated Row & Card Actions
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    const b = beneficiaries.find(item => item.id === id);
    if (!b) return;

    if (action === 'spic') {
      document.getElementById('cardSpicId').innerText = b.spic;
      document.getElementById('cardName').innerText = b.name;
      document.getElementById('cardBrgy').innerText = b.barangay;
      document.getElementById('cardCat').innerText = b.category;
      document.getElementById('cardDep').innerText = b.dependents;
      openModal('spicModal');
    } else if (action === 'edit') {
      document.getElementById('editId').value = b.id;
      document.getElementById('modalTitle').innerText = `Edit Profile: ${b.spic}`;
      document.getElementById('spName').value = b.name;
      document.getElementById('spBarangay').value = b.barangay;
      document.getElementById('spCategory').value = b.category;
      document.getElementById('spDependents').value = b.dependents;
      document.getElementById('spIncome').value = b.income;
      document.getElementById('spContact').value = b.contact;
      document.getElementById('docBrgy').checked = b.docs.brgy;
      document.getElementById('docAffidavit').checked = b.docs.affidavit;
      document.getElementById('docBirth').checked = b.docs.birth;
      document.getElementById('docIncome').checked = b.docs.income;
      openModal('registerModal');
    } else if (action === 'delete') {
      beneficiaries = beneficiaries.filter(item => item.id !== id);
      saveData();
      refreshAllViews();
    } else if (action === 'approve') {
      b.status = 'Active';
      b.docs = { brgy: true, affidavit: true, birth: true, income: true };
      saveData();
      refreshAllViews();
    }
  });

  // Form Submissions
  document.getElementById('soloParentForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('editId').value;
    const docs = {
      brgy: document.getElementById('docBrgy').checked,
      affidavit: document.getElementById('docAffidavit').checked,
      birth: document.getElementById('docBirth').checked,
      income: document.getElementById('docIncome').checked
    };
    const isComplete = docs.brgy && docs.affidavit && docs.birth && docs.income;

    const payload = {
      name: document.getElementById('spName').value,
      barangay: document.getElementById('spBarangay').value,
      category: document.getElementById('spCategory').value,
      dependents: Number(document.getElementById('spDependents').value),
      income: Number(document.getElementById('spIncome').value),
      contact: document.getElementById('spContact').value,
      status: isComplete ? 'Active' : 'Pending Validation',
      docs
    };

    if (editId) {
      const idx = beneficiaries.findIndex(b => b.id === Number(editId));
      if (idx !== -1) beneficiaries[idx] = { ...beneficiaries[idx], ...payload };
    } else {
      const nextNum = String(beneficiaries.length + 1).padStart(3, '0');
      beneficiaries.unshift({
        id: Date.now(),
        spic: `SPIC-2026-${nextNum}`,
        ...payload
      });
    }

    saveData();
    closeModal('registerModal');
    refreshAllViews();
  });

  document.getElementById('aidForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const bId = Number(document.getElementById('aidBeneficiary').value);
    const b = beneficiaries.find(item => item.id === bId);
    if (!b) return;
    const today = new Date().toISOString().split('T')[0];

    assistanceLogs.unshift({
      date: today,
      name: b.name,
      spic: b.spic,
      type: document.getElementById('aidType').value,
      amount: Number(document.getElementById('aidAmount').value),
      remarks: document.getElementById('aidRemarks').value
    });

    saveData();
    closeModal('aidModal');
    refreshAllViews();
  });

  // Export & Print
  document.getElementById('btnExportCSV')?.addEventListener('click', () => {
    let csv = 'SPIC ID,Full Name,Barangay,Category,Dependents,Monthly Income,Contact,Status\n';
    beneficiaries.forEach(b => {
      csv += `"${b.spic}","${b.name}","${b.barangay}","${b.category}",${b.dependents},${b.income},"${b.contact}","${b.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MSWDO_Boac_SoloParent_Masterlist.csv';
    a.click();
  });

  document.getElementById('btnPrintReport')?.addEventListener('click', () => window.print());
  document.getElementById('btnPrintSpic')?.addEventListener('click', () => window.print());

  // Initialize App
  refreshAllViews();
});
