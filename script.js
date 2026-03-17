const primaryInput = document.getElementById('primaryInput');
const primarySlider = document.getElementById('primarySlider');
const rateInput = document.getElementById('rateInput');
const rateSlider = document.getElementById('rateSlider');
const yrInput = document.getElementById('yrInput');
const yrSlider = document.getElementById('yrSlider');
const stepInput = document.getElementById('stepInput');
const stepSlider = document.getElementById('stepSlider');
const dailySpendInput = document.getElementById('dailySpendInput');
const coffeeResult = document.getElementById('coffeeResult');
const themeCheckbox = document.getElementById('themeCheckbox');
const tableBody = document.getElementById('tableBody');
const milestoneList = document.getElementById('milestoneList');
const sipModeBtn = document.getElementById('sipModeBtn');
const goalModeBtn = document.getElementById('goalModeBtn');
const investBtn = document.getElementById('investBtn');

let currentMode = 'SIP';

const ctx = document.getElementById('sipChart').getContext('2d');
let sipChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Invested', 'Returns'],
        datasets: [{ data: [1, 1], backgroundColor: ['#374151', '#00d09c'], borderWidth: 0, cutout: '80%' }]
    },
    options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
});

function calculateCoffeeFactor() {
    const dailySpend = parseFloat(dailySpendInput.value) || 0;
    const monthlyEquivalent = dailySpend * 30;
    const rate = 12 / 100 / 12;
    const months = 30 * 12;
    const fv = monthlyEquivalent * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    coffeeResult.innerText = "₹" + Math.round(fv).toLocaleString('en-IN');
}

function updateMilestones(yearlyData) {
    const targets = [
        { label: '10 Lakhs', value: 1000000 },
        { label: '50 Lakhs', value: 5000000 },
        { label: '1 Crore', value: 10000000 },
        { label: '5 Crores', value: 50000000 }
    ];

    milestoneList.innerHTML = "";
    targets.forEach(t => {
        const hit = yearlyData.find(d => d.wealth >= t.value);
        const item = document.createElement('div');
        item.className = `milestone-item ${hit ? 'reached' : ''}`;
        item.innerHTML = `<span>${t.label}</span><small>${hit ? 'Reached in Year ' + hit.year : 'Not reached yet'}</small>`;
        milestoneList.appendChild(item);
    });
}

function calculate() {
    const rate = parseFloat(rateInput.value) || 0;
    const years = parseFloat(yrInput.value) || 0;
    const stepUp = parseFloat(stepInput.value) || 0;
    const i = (rate / 100) / 12;

    let totalWealth = 0;
    let totalInvested = 0;
    let currentMonthly = parseFloat(primaryInput.value) || 0;
    let yearlyData = [];

    if (currentMode === 'GOAL') {
        const goal = parseFloat(primaryInput.value) || 0;
        const months = years * 12;
        currentMonthly = i === 0 ? goal / months : goal / (((Math.pow(1 + i, months) - 1) / i) * (1 + i));
    }

    tableBody.innerHTML = "";
    for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
            totalInvested += currentMonthly;
            totalWealth = (totalWealth + currentMonthly) * (1 + i);
        }
        yearlyData.push({ year: y, wealth: totalWealth });
        tableBody.innerHTML += `<tr><td>Year ${y}</td><td>₹${Math.round(totalInvested).toLocaleString('en-IN')}</td><td><strong>₹${Math.round(totalWealth).toLocaleString('en-IN')}</strong></td></tr>`;
        
        if (currentMode === 'SIP') {
            currentMonthly *= (1 + (stepUp / 100));
        }
    }

    document.getElementById('totalValueDisplay').innerText = "₹" + Math.round(currentMode === 'SIP' ? totalWealth : currentMonthly).toLocaleString('en-IN');
    document.getElementById('statValueLeft').innerText = "₹" + Math.round(totalInvested).toLocaleString('en-IN');
    document.getElementById('statValueRight').innerText = "₹" + Math.round(totalWealth - totalInvested).toLocaleString('en-IN');

    sipChart.data.datasets[0].data = [totalInvested, Math.max(0, totalWealth - totalInvested)];
    sipChart.update();
    updateMilestones(yearlyData);
}

function sync(el1, el2) {
    el1.oninput = () => { el2.value = el1.value; calculate(); };
    el2.oninput = () => { el1.value = el2.value; calculate(); };
}

sync(primaryInput, primarySlider);
sync(rateInput, rateSlider);
sync(yrInput, yrSlider);
sync(stepInput, stepSlider);
dailySpendInput.oninput = calculateCoffeeFactor;

sipModeBtn.onclick = () => {
    currentMode = 'SIP'; sipModeBtn.classList.add('active'); goalModeBtn.classList.remove('active');
    document.getElementById('primaryLabel').innerText = "Monthly Investment";
    document.getElementById('stepUpContainer').style.display = 'block';
    calculate();
};

goalModeBtn.onclick = () => {
    currentMode = 'GOAL'; goalModeBtn.classList.add('active'); sipModeBtn.classList.remove('active');
    document.getElementById('primaryLabel').innerText = "Target Wealth Goal";
    document.getElementById('stepUpContainer').style.display = 'none';
    calculate();
};

themeCheckbox.onchange = () => {
    document.body.classList.toggle('dark-theme');
    sipChart.data.datasets[0].backgroundColor[0] = document.body.classList.contains('dark-theme') ? '#374151' : '#e2e8f0';
    sipChart.update();
};

// SECRET REDIRECT LOGIC
investBtn.onclick = () => {
    window.open("https://upstox.onelink.me/0H1s/27AMU7", "_blank");
};

calculate();
calculateCoffeeFactor();