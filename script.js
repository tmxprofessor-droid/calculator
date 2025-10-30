// Utility for currency formatting
function formatCurrency(val) {
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.calc-card').forEach(card => card.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
    localStorage.setItem('lastTab', btn.dataset.tab);
  });
});

// Restore last tab
const lastTab = localStorage.getItem('lastTab') || 'home-loan';
document.querySelector(`.tab-btn[data-tab="${lastTab}"]`).click();

// Light/Dark mode toggle
const themeBtn = document.getElementById('theme-toggle');
themeBtn.onclick = function() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

// Save/load input values
function saveInputs(section) {
  let inputs = {};
  document.querySelectorAll('#' + section + ' input').forEach(inp => {
    inputs[inp.id] = inp.value;
  });
  localStorage.setItem(section + '-inputs', JSON.stringify(inputs));
}
function loadInputs(section) {
  let inputs = JSON.parse(localStorage.getItem(section + '-inputs') || '{}');
  Object.entries(inputs).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}
['home-loan','personal-loan','sip','fd'].forEach(loadInputs);

// Home Loan EMI Calculator
document.getElementById('hl-calc').onclick = function() {
  let amount = +document.getElementById('hl-amount').value;
  let rate = +document.getElementById('hl-rate').value;
  let tenure = +document.getElementById('hl-tenure').value;

  saveInputs('home-loan');

  if (!amount || !rate || !tenure || amount < 1 || rate < 0.1 || tenure < 1) {
    showResult('hl-result', 'Please enter valid loan amount, rate and tenure.');
    return;
  }

  let monthlyRate = rate / 12 / 100;
  let n = tenure * 12;
  let emi = amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
  let totalPayment = emi * n;
  let totalInterest = totalPayment - amount;

  showResult('hl-result', `
    <b>Monthly EMI:</b> ${formatCurrency(emi)}
    <br><b>Total Interest:</b> ${formatCurrency(totalInterest)}
    <br><b>Total Payment:</b> ${formatCurrency(totalPayment)}
  `);

  renderPieChart('hl-chart', ['Principal','Interest'], [amount, totalInterest], ['#2176ff', '#ffd700'], 'EMI Breakdown');
};

document.getElementById('hl-reset').onclick = function() {
  ['hl-amount','hl-rate','hl-tenure'].forEach(id => document.getElementById(id).value = '');
  showResult('hl-result', '');
  renderPieChart('hl-chart', [], [], [], '');
  localStorage.removeItem('home-loan-inputs');
};
document.getElementById('hl-pdf').onclick = () => downloadPDF('Home Loan EMI Calculator', 'hl-result');

// Personal Loan EMI Calculator
document.getElementById('pl-calc').onclick = function() {
  let amount = +document.getElementById('pl-amount').value;
  let rate = +document.getElementById('pl-rate').value;
  let tenure = +document.getElementById('pl-tenure').value;

  saveInputs('personal-loan');

  if (!amount || !rate || !tenure || amount < 1 || rate < 0.1 || tenure < 1) {
    showResult('pl-result', 'Please enter valid loan amount, rate and tenure.');
    return;
  }

  let monthlyRate = rate / 12 / 100;
  let n = tenure * 12;
  let emi = amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
  let totalPayment = emi * n;
  let totalInterest = totalPayment - amount;

  showResult('pl-result', `
    <b>Monthly EMI:</b> ${formatCurrency(emi)}
    <br><b>Total Interest:</b> ${formatCurrency(totalInterest)}
    <br><b>Total Payment:</b> ${formatCurrency(totalPayment)}
  `);

  renderPieChart('pl-chart', ['Principal','Interest'], [amount, totalInterest], ['#2176ff', '#f95d6a'], 'EMI Breakdown');
};

document.getElementById('pl-reset').onclick = function() {
  ['pl-amount','pl-rate','pl-tenure'].forEach(id => document.getElementById(id).value = '');
  showResult('pl-result', '');
  renderPieChart('pl-chart', [], [], [], '');
  localStorage.removeItem('personal-loan-inputs');
};
document.getElementById('pl-pdf').onclick = () => downloadPDF('Personal Loan EMI Calculator', 'pl-result');

// SIP Calculator
document.getElementById('sip-calc').onclick = function() {
  let amount = +document.getElementById('sip-amount').value;
  let rate = +document.getElementById('sip-rate').value;
  let tenure = +document.getElementById('sip-tenure').value;

  saveInputs('sip');

  if (!amount || !rate || !tenure || amount < 1 || rate < 0.1 || tenure < 1) {
    showResult('sip-result', 'Please enter valid monthly investment, rate and duration.');
    return;
  }

  let n = tenure * 12;
  let i = rate / 12 / 100;

  let totalInvested = amount * n;
  let totalValue = amount * (Math.pow(1 + i, n) - 1) * (1 + i) / i;
  let estimatedReturn = totalValue - totalInvested;

  showResult('sip-result', `
    <b>Total Invested:</b> ${formatCurrency(totalInvested)}
    <br><b>Estimated Return:</b> ${formatCurrency(estimatedReturn)}
    <br><b>Total Value:</b> ${formatCurrency(totalValue)}
  `);

  renderBarChart('sip-chart', ['Invested', 'Growth'], [totalInvested, estimatedReturn], ['#2176ff', '#43aa8b'], 'SIP Growth');
};

document.getElementById('sip-reset').onclick = function() {
  ['sip-amount','sip-rate','sip-tenure'].forEach(id => document.getElementById(id).value = '');
  showResult('sip-result', '');
  renderBarChart('sip-chart', [], [], [], '');
  localStorage.removeItem('sip-inputs');
};
document.getElementById('sip-pdf').onclick = () => downloadPDF('SIP Calculator', 'sip-result');

// FD Calculator
document.getElementById('fd-calc').onclick = function() {
  let amount = +document.getElementById('fd-amount').value;
  let rate = +document.getElementById('fd-rate').value;
  let tenure = +document.getElementById('fd-tenure').value;

  saveInputs('fd');

  if (!amount || !rate || !tenure || amount < 1 || rate < 0.1 || tenure < 1) {
    showResult('fd-result', 'Please enter valid principal, rate and time period.');
    return;
  }

  let maturity = amount * Math.pow(1 + rate / 100, tenure);
  let interest = maturity - amount;

  showResult('fd-result', `
    <b>Maturity Amount:</b> ${formatCurrency(maturity)}
    <br><b>Interest Earned:</b> ${formatCurrency(interest)}
  `);

  renderPieChart('fd-chart', ['Principal','Interest'], [amount, interest], ['#2176ff', '#ffd700'], 'FD Breakdown');
};

document.getElementById('fd-reset').onclick = function() {
  ['fd-amount','fd-rate','fd-tenure'].forEach(id => document.getElementById(id).value = '');
  showResult('fd-result', '');
  renderPieChart('fd-chart', [], [], [], '');
  localStorage.removeItem('fd-inputs');
};
document.getElementById('fd-pdf').onclick = () => downloadPDF('FD Calculator', 'fd-result');

// Result rendering
function showResult(id, html) {
  document.getElementById(id).innerHTML = html;
}

// Chart.js visualizations
let charts = {};
function renderPieChart(canvasId, labels, data, colors, title) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (charts[canvasId]) charts[canvasId].destroy();
  if (!labels.length) {
    ctx.clearRect(0,0,300,200);
    return;
  }
  charts[canvasId] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels, datasets: [{
        data, backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: !!title, text: title }
      }
    }
  });
}
function renderBarChart(canvasId, labels, data, colors, title) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (charts[canvasId]) charts[canvasId].destroy();
  if (!labels.length) {
    ctx.clearRect(0,0,300,200);
    return;
  }
  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels, datasets: [{
        data, backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: false },
        title: { display: !!title, text: title }
      }
    }
  });
}

// Download as PDF (basic)
function downloadPDF(title, resultId) {
  // For demo: download as text file (since PDF generation needs libs)
  let content = title + '\n' + document.getElementById(resultId).innerText;
  let blob = new Blob([content], {type: 'text/plain'});
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/ /g,'_')+'.txt';
  a.click();
}