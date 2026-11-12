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

// Load from LocalStorage or initialize
let beneficiaries = JSON.parse(localStorage.getItem('ww_beneficiaries')) || defaultBeneficiaries;
let assistanceLogs = JSON.parse(localStorage.getItem('ww_assistance')) || defaultAssistance;
let currentRole = 'MSWDO Admin';
let brgyChartInstance = null;
let catChartInstance = null;

function saveData() {
  localStorage.setItem('ww_beneficiaries', JSON.stringify(beneficiaries));
  localStorage.setItem('ww_assistance', JSON.stringify(assistanceLogs));
}

// Role-Based Access Control (RBAC) Toggle
function toggleRole() {
  currentRole = currentRole === 'MSWDO Admin' ? 'Social Worker / Encoder' : 'MSWDO Admin';
  document.getElementById('currentRoleDisplay').innerText = `Role: ${currentRole}`;
  renderBeneficiaryTable();
  renderDocumentsGrid();
}

// Tab Navigation
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
    document.getElementById(`view-${v}`).classList.add('hidden');
    const btn = document.getElementById(`nav-${v}`);
    btn.classList.remove('bg-white/15', 'text-white', 'border-l-4', 'border-dswdYellow');
    btn.classList.add('text-blue-100');
  });

  document.getElementById(`view-${tabName}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`nav-${tabName}`);
  activeBtn.classList.add('bg-white/15', 'text-white', 'border-l-4', 'border-dswdYellow');
  activeBtn.classList.remove('text-blue-100');
  document.getElementById('pageTitle').innerText = titles[tabName];

  refreshAllViews();
}

// Refresh All UI Components
function refreshAllViews() {
  updateStats();
  renderRecentTable();
  renderBeneficiaryTable();
  renderAssistanceTable();
  renderDocumentsGrid();
  renderReportTable();
  renderCharts();
}

function updateStats() {
  const total = beneficiaries.length;
  const active = beneficiaries.filter(b => b.status === 'Active').length;
  const pending = beneficiaries.filter(b => b.status !== 'Active').length;
  const totalAid = assistanceLogs.reduce((sum, item) => sum + Number(item.amount), 0);

  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-active').innerText = active;
  document.getElementById('stat-pending').innerText = pending;
  document.getElementById('stat-aid').innerText = `₱${totalAid.toLocaleString()}`;
}

function getStatusBadge(status) {
  if (status === 'Active') {
    return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>`;
  } else if (status === 'Pending Validation') {
    return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending Validation</span>`;
  }
  return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-dswdRed">For Renewal</span>`;
}

function renderRecentTable() {
  const tbody = document.getElementById('recentTableBody');
  tbody.innerHTML = beneficiaries.slice(0, 5).map(b => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-bold text-dswdNavy">${b.spic}</td>
      <td class="py-3 px-4 font-medium">${b.name}</td>
      <td class="py-3 px-4">${b.barangay}</td>
      <td class="py-3 px-4">${b.dependents} child(ren)</td>
      <td class="py-3 px-4">${getStatusBadge(b.status)}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="openSpicModal(${b.id})" class="text-xs bg-blue-50 text-dswdNavy hover:bg-blue-100 px-2.5 py-1 rounded font-semibold">
          <i class="fa-solid fa-id-card mr-1"></i>SPIC
        </button>
      </td>
    </tr>
  `).join('');
}

function renderBeneficiaryTable() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const brgy = document.getElementById('filterBarangay').value;
  const status = document.getElementById('filterStatus').value;

  const filtered = beneficiaries.filter(b => {
    const matchesText = b.name.toLowerCase().includes(query) || b.spic.toLowerCase().includes(query) || b.contact.includes(query);
    const matchesBrgy = brgy === '' || b.barangay === brgy;
    const matchesStatus = status === '' || b.status === status;
    return matchesText && matchesBrgy && matchesStatus;
  });

  const tbody = document.getElementById('beneficiaryTableBody');
  tbody.innerHTML = filtered.map(b => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-bold text-dswdNavy">${b.spic}</td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800">${b.name}</div>
        <div class="text-xs text-slate-400">${b.contact}</div>
      </td>
      <td class="py-3 px-4">${b.barangay}</td>
      <td class="py-3 px-4 text-xs">${b.category}</td>
      <td class="py-3 px-4 text-center font-semibold">${b.dependents}</td>
      <td class="py-3 px-4">₱${Number(b.income).toLocaleString()}</td>
      <td class="py-3 px-4">${getStatusBadge(b.status)}</td>
      <td class="py-3 px-4 text-right space-x-1">
        <button onclick="openSpicModal(${b.id})" title="View SPIC ID" class="p-1.5 text-dswdNavy hover:bg-blue-50 rounded"><i class="fa-solid fa-id-card"></i></button>
        <button onclick="editBeneficiary(${b.id})" title="Edit Profile" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><i class="fa-solid fa-pen-to-square"></i></button>
        ${currentRole === 'MSWDO Admin' ? `<button onclick="deleteBeneficiary(${b.id})" title="Delete Record" class="p-1.5 text-dswdRed hover:bg-red-50 rounded"><i class="fa-solid fa-trash"></i></button>` : ''}
      </td>
    </tr>
  `).join('');
}

function renderAssistanceTable() {
  const tbody = document.getElementById('assistanceTableBody');
  tbody.innerHTML = assistanceLogs.map(a => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 text-slate-500">${a.date}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${a.name}</td>
      <td class="py-3 px-4 font-bold text-dswdNavy">${a.spic}</td>
      <td class="py-3 px-4">${a.type}</td>
      <td class="py-3 px-4 font-bold text-emerald-600">₱${Number(a.amount).toLocaleString()}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${a.remarks}</td>
    </tr>
  `).join('');
}

function renderDocumentsGrid() {
  const grid = document.getElementById('documentsGrid');
  grid.innerHTML = beneficiaries.map(b => {
    const allComplete = b.docs.brgy && b.docs.affidavit && b.docs.birth && b.docs.income;
    return `
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold text-dswdNavy">${b.spic}</span>
            ${getStatusBadge(b.status)}
          </div>
          <h4 class="font-bold text-slate-800">${b.name}</h4>
          <p class="text-xs text-slate-500 mb-4">Brgy. ${b.barangay} • ${b.category}</p>
          <ul class="space-y-1.5 text-xs mb-4">
            <li class="flex items-center gap-2">${b.docs.brgy ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed"></i>'} Barangay Solo Parent Cert.</li>
            <li class="flex items-center gap-2">${b.docs.affidavit ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed"></i>'} Sworn Affidavit</li>
            <li class="flex items-center gap-2">${b.docs.birth ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed"></i>'} PSA Birth Certificates</li>
            <li class="flex items-center gap-2">${b.docs.income ? '<i class="fa-solid fa-circle-check text-emerald-500"></i>' : '<i class="fa-solid fa-circle-xmark text-dswdRed"></i>'} Indigency / Income Proof</li>
          </ul>
        </div>
        ${b.status !== 'Active' ? `
          <button onclick="approveBeneficiary(${b.id})" class="w-full py-2 bg-dswdNavy hover:bg-dswdDarkNavy text-white text-xs font-semibold rounded-lg transition">
            <i class="fa-solid fa-check-double mr-1"></i> Validate & Activate SPIC
          </button>
        ` : `
          <div class="text-center py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
            <i class="fa-solid fa-shield-check mr-1"></i> ${allComplete ? 'Complete & Verified' : 'Verified by Admin'}
          </div>
        `}
      </div>
    `;
  }).join('');
}

function renderReportTable() {
  const tbody = document.getElementById('reportTableBody');
  tbody.innerHTML = beneficiaries.map((b, i) => `
    <tr>
      <td class="p-2 border border-slate-300">${i + 1}</td>
      <td class="p-2 border border-slate-300 font-bold">${b.spic}</td>
      <td class="p-2 border border-slate-300">${b.name}</td>
      <td class="p-2 border border-slate-300">${b.barangay}</td>
      <td class="p-2 border border-slate-300">${b.category}</td>
      <td class="p-2 border border-slate-300 text-center">${b.dependents}</td>
      <td class="p-2 border border-slate-300">${b.status}</td>
    </tr>
  `).join('');
}

// Charts Rendering
function renderCharts() {
  const brgyCounts = {};
  const catCounts = {};

  beneficiaries.forEach(b => {
    brgyCounts[b.barangay] = (brgyCounts[b.barangay] || 0) + 1;
    catCounts[b.category] = (catCounts[b.category] || 0) + 1;
  });

  if (brgyChartInstance) brgyChartInstance.destroy();
  if (catChartInstance) catChartInstance.destroy();

  const ctx1 = document.getElementById('barangayChart').getContext('2d');
  brgyChartInstance = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(brgyCounts),
      datasets: [{
        label: 'Registered Solo Parents',
        data: Object.values(brgyCounts),
        backgroundColor: '#2E3192',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  const ctx2 = document.getElementById('categoryChart').getContext('2d');
  catChartInstance = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(catCounts),
      datasets: [{
        data: Object.values(catCounts),
        backgroundColor: ['#2E3192', '#EE1C25', '#EAB308', '#10B981', '#6366F1']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

// Modal & CRUD Operations
function openRegisterModal() {
  document.getElementById('editId').value = '';
  document.getElementById('modalTitle').innerText = 'Register New Solo Parent Beneficiary';
  document.getElementById('soloParentForm').reset();
  document.getElementById('registerModal').classList.remove('hidden');
  document.getElementById('registerModal').classList.add('flex');
}

function editBeneficiary(id) {
  const b = beneficiaries.find(item => item.id === id);
  if (!b) return;
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

  document.getElementById('registerModal').classList.remove('hidden');
  document.getElementById('registerModal').classList.add('flex');
}

function saveBeneficiary(e) {
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
    beneficiaries[idx] = { ...beneficiaries[idx], ...payload };
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
}

function deleteBeneficiary(id) {
  if (confirm('Are you sure you want to remove this solo parent record?')) {
    beneficiaries = beneficiaries.filter(b => b.id !== id);
    saveData();
    refreshAllViews();
  }
}

function approveBeneficiary(id) {
  const b = beneficiaries.find(item => item.id === id);
  if (b) {
    b.status = 'Active';
    b.docs = { brgy: true, affidavit: true, birth: true, income: true };
    saveData();
    refreshAllViews();
  }
}

function openAidModal() {
  const select = document.getElementById('aidBeneficiary');
  select.innerHTML = beneficiaries.map(b => `<option value="${b.id}">${b.spic} - ${b.name}</option>`).join('');
  document.getElementById('aidModal').classList.remove('hidden');
  document.getElementById('aidModal').classList.add('flex');
}

function saveAssistance(e) {
  e.preventDefault();
  const bId = Number(document.getElementById('aidBeneficiary').value);
  const b = beneficiaries.find(item => item.id === bId);
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
}

function openSpicModal(id) {
  const b = beneficiaries.find(item => item.id === id);
  if (!b) return;
  document.getElementById('cardSpicId').innerText = b.spic;
  document.getElementById('cardName').innerText = b.name;
  document.getElementById('cardBrgy').innerText = b.barangay;
  document.getElementById('cardCat').innerText = b.category;
  document.getElementById('cardDep').innerText = b.dependents;

  document.getElementById('spicModal').classList.remove('hidden');
  document.getElementById('spicModal').classList.add('flex');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById(modalId).classList.remove('flex');
}

function exportCSV() {
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
}

// Initialize App on Load
document.addEventListener('DOMContentLoaded', refreshAllViews);
