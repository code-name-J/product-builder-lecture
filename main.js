let currentCity = null;
let currentLang = localStorage.getItem('lang') || 'ko';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update dynamic elements
    const setNowBtn = document.getElementById('set-now');
    if (setNowBtn) setNowBtn.textContent = translations[lang]['btn-now'];

    const targetLocalSpan = document.querySelector('#section-status .bg-indigo-600 span');
    if (targetLocalSpan) targetLocalSpan.textContent = translations[lang]['label-local'];

    // Update city search placeholder
    const citySearchInput = document.getElementById('city-search');
    if (citySearchInput) citySearchInput.placeholder = translations[lang]['placeholder-city-search'];

    populateCities(citySearchInput ? citySearchInput.value : '');
    updateDisplay();
}

const cities = [
    { 
        names: { ko: "도쿄, 일본 (GMT+9)", en: "Tokyo, Japan (GMT+9)", ja: "東京, 日本 (GMT+9)", zh: "东京, 日本 (GMT+9)" }, 
        tz: "Asia/Tokyo", lat: 35.6895, lon: 139.6917, bestMonths: [3, 4, 10, 11], 
        congestion: [1.8, 1.4, 2.0, 1.9, 1.6, 1.2, 1.5, 1.7, 1.3, 1.6, 1.8, 1.5], 
        highlights: { ko: "벚꽃과 단풍 시즌이 절정입니다.", en: "Cherry blossoms and autumn foliage are at their peak.", ja: "桜と紅葉のシーズンが絶頂です。", zh: "樱花和红叶季节是巅峰期。" }, 
        currency: "JPY" 
    },
    { 
        names: { ko: "뉴욕, 미국 (GMT-5)", en: "New York, USA (GMT-5)", ja: "ニューヨーク, アメリカ (GMT-5)", zh: "纽约, 美国 (GMT-5)" }, 
        tz: "America/New_York", lat: 40.7128, lon: -74.0060, bestMonths: [5, 6, 9, 10], 
        congestion: [1.2, 1.3, 1.5, 1.7, 1.8, 1.9, 2.0, 2.0, 1.8, 1.7, 1.9, 2.0], 
        highlights: { ko: "온화한 날씨에 센트럴 파크를 즐기기 좋습니다.", en: "Perfect weather to enjoy Central Park.", ja: "穏やかな天候でセントラルパークを楽しむのに最適です。", zh: "温和的天气，适合享受中央公园。" }, 
        currency: "USD" 
    },
    { 
        names: { ko: "런던, 영국 (GMT+0)", en: "London, UK (GMT+0)", ja: "ロンドン, イギリス (GMT+0)", zh: "伦敦, 英国 (GMT+0)" }, 
        tz: "Europe/London", lat: 51.5074, lon: -0.1278, bestMonths: [5, 6, 7, 8], 
        congestion: [1.1, 1.2, 1.4, 1.6, 1.8, 1.9, 2.0, 2.0, 1.7, 1.5, 1.4, 1.8], 
        highlights: { ko: "해가 길고 축제가 많은 여름 시즌입니다.", en: "Summer season with long days and many festivals.", ja: "日が長く、お祭りが多い夏シーズンです。", zh: "白天漫长且节日众多的夏季。" }, 
        currency: "GBP" 
    },
    { 
        names: { ko: "파리, 프랑스 (GMT+1)", en: "Paris, France (GMT+1)", ja: "パリ, フランス (GMT+1)", zh: "巴黎, 法国 (GMT+1)" }, 
        tz: "Europe/Paris", lat: 48.8566, lon: 2.3522, bestMonths: [4, 5, 6, 9], 
        congestion: [1.2, 1.3, 1.6, 1.8, 1.9, 2.0, 1.9, 1.7, 2.0, 1.6, 1.4, 1.8], 
        highlights: { ko: "예술과 낭만이 가득한 봄과 가을의 파리입니다.", en: "Paris in spring and autumn, full of art and romance.", ja: "芸術とロマンにあふれる春と秋のパリです。", zh: "充满艺术与浪漫的春秋季节的巴黎。" }, 
        currency: "EUR" 
    },
    { 
        names: { ko: "방콕, 태국 (GMT+7)", en: "Bangkok, Thailand (GMT+7)", ja: "バンコク, タイ (GMT+7)", zh: "曼谷, 泰国 (GMT+7)" }, 
        tz: "Asia/Bangkok", lat: 13.7563, lon: 100.5018, bestMonths: [11, 12, 1, 2], 
        congestion: [1.9, 1.7, 1.5, 1.8, 1.4, 1.2, 1.3, 1.4, 1.3, 1.5, 1.8, 2.0], 
        highlights: { ko: "건기로 여행하기 가장 쾌적한 날씨입니다.", en: "The most pleasant weather for traveling during the dry season.", ja: "乾季で旅行に最も快適な天候です。", zh: "旱季，是旅行最舒适的天气。" }, 
        currency: "THB" 
    }
];

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.body.classList.add('dark');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
    } else {
        document.body.classList.remove('dark');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setLanguage(currentLang);

    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            const themeIcon = document.getElementById('theme-icon');
            if (themeIcon) {
                themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
                lucide.createIcons();
            }
            // Reset Disqus to match the new theme
            if (currentCity) reloadDisqus(currentCity.names[currentLang]);
        });
    }
});

// Elements
const kstInput = document.getElementById('kst-input');
const setNowBtn = document.getElementById('set-now');
const citySelect = document.getElementById('city-select');
const citySearch = document.getElementById('city-search');
const resultContainer = document.getElementById('result-container');
const localTimeDisplay = document.getElementById('local-time');
const localDateDisplay = document.getElementById('local-date');
const targetCityLabel = document.getElementById('target-city-label');
const displayCityName = document.getElementById('display-city-name');
const tempDisplay = document.getElementById('temp-display');
const weatherDesc = document.getElementById('weather-desc');
const weatherIconContainer = document.getElementById('weather-icon');
const humidityDisplay = document.getElementById('humidity');
const windspeedDisplay = document.getElementById('windspeed');
const apparentTempDisplay = document.getElementById('apparent-temp');

// Currency Converter Elements
const krwAmountInput = document.getElementById('krw-amount');
const targetAmountInput = document.getElementById('target-amount');
const targetCurrencyLabel = document.getElementById('target-currency-label');
const currencyRateInfo = document.getElementById('currency-rate-info');

// Checklist Elements
const checklistInput = document.getElementById('checklist-input');
const addChecklistItemBtn = document.getElementById('add-checklist-item');
const checklistContainer = document.getElementById('checklist-container');

// Tab Elements
const tabs = {
    status: document.getElementById('tab-status'),
    classifier: document.getElementById('tab-classifier'),
    insights: document.getElementById('tab-insights'),
    planner: document.getElementById('tab-planner'),
    guide: document.getElementById('tab-guide'),
    about: document.getElementById('tab-about'),
    partnership: document.getElementById('tab-partnership')
};
const sections = {
    status: document.getElementById('section-status'),
    classifier: document.getElementById('section-classifier'),
    insights: document.getElementById('section-insights'),
    planner: document.getElementById('section-planner'),
    guide: document.getElementById('section-guide'),
    about: document.getElementById('section-about'),
    partnership: document.getElementById('section-partnership')
};

// Insight Elements
const readinessScore = document.getElementById('readiness-score');
const readinessLabel = document.getElementById('readiness-label');
const timingDesc = document.getElementById('timing-desc');
const congestionLevel = document.getElementById('congestion-level');
const congestionBar = document.getElementById('congestion-bar');

// Initialize Lucide icons
lucide.createIcons();

// Tab Logic
function switchTab(activeTab) {
    Object.keys(sections).forEach(key => {
        if (key === activeTab) {
            sections[key].classList.remove('hidden');
            tabs[key].classList.add('bg-white', 'shadow-sm', 'text-indigo-600');
            tabs[key].classList.remove('text-gray-500');
            
            // Special handling for classifier tab
            if (activeTab === 'classifier') {
                initClassifier();
            } else {
                stopWebcam();
            }
        } else {
            sections[key].classList.add('hidden');
            tabs[key].classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            tabs[key].classList.add('text-gray-500');
        }
    });
}

tabs.status.addEventListener('click', () => switchTab('status'));
tabs.classifier.addEventListener('click', () => switchTab('classifier'));
tabs.insights.addEventListener('click', () => switchTab('insights'));
tabs.planner.addEventListener('click', () => switchTab('planner'));
tabs.guide.addEventListener('click', () => switchTab('guide'));
tabs.about.addEventListener('click', () => switchTab('about'));
tabs.partnership.addEventListener('click', () => switchTab('partnership'));

// Populate city dropdown
function populateCities(filter = '') {
    citySelect.innerHTML = '';
    const filtered = cities.filter(c => c.names[currentLang].includes(filter));
    filtered.forEach((city) => {
        const originalIndex = cities.indexOf(city);
        const option = document.createElement('option');
        option.value = originalIndex;
        option.textContent = city.names[currentLang];
        citySelect.appendChild(option);
    });
    if (filtered.length > 0) updateDisplay();
}

citySearch.addEventListener('input', (e) => populateCities(e.target.value));

function setCurrentTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    kstInput.value = localISOTime;
    updateDisplay();
}

setNowBtn.addEventListener('click', setCurrentTime);

function getWeatherIcon(code) {
    if (code === 0) return 'sun';
    if (code <= 3) return 'cloud-sun';
    if (code <= 48) return 'cloud';
    if (code <= 67) return 'cloud-rain';
    if (code <= 77) return 'cloud-snow';
    if (code <= 82) return 'cloud-showers-heavy';
    if (code <= 99) return 'cloud-lightning';
    return 'cloud';
}

async function updateDisplay() {
    const cityIndex = citySelect.value;
    const city = cities[cityIndex];
    currentCity = city;
    const inputVal = kstInput.value;
    
    if (!city || !inputVal) return;

    resultContainer.classList.remove('hidden');
    targetCityLabel.textContent = city.names[currentLang].split(',')[0];
    displayCityName.textContent = city.names[currentLang];

    const date = new Date(inputVal);
    const month = date.getMonth() + 1; // 1-12

    // 1. Time Conversion
    const timeOptions = { timeZone: city.tz, hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { timeZone: city.tz, month: 'long', day: 'numeric', weekday: 'short' };
    
    const localeMap = { 'ko': 'ko-KR', 'en': 'en-US', 'ja': 'ja-JP', 'zh': 'zh-CN' };
    const currentLocale = localeMap[currentLang] || 'en-US';

    localTimeDisplay.textContent = new Intl.DateTimeFormat(currentLocale, timeOptions).format(date);
    localDateDisplay.textContent = new Intl.DateTimeFormat(currentLocale, dateOptions).format(date);

    // 2. Weather Fetch
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature`);
        const data = await res.json();
        const current = data.current_weather;
        tempDisplay.textContent = `${Math.round(current.temperature)}°C`;
        windspeedDisplay.textContent = `${current.windspeed}km/h`;
        humidityDisplay.textContent = `${data.hourly.relative_humidity_2m[0]}%`;
        apparentTempDisplay.textContent = `${Math.round(data.hourly.apparent_temperature[0])}°C`;
        
        const weatherCodes = { 
            0: { ko: "맑음", en: "Clear", ja: "快晴", zh: "晴朗" },
            1: { ko: "대체로 맑음", en: "Mainly Clear", ja: "晴れ", zh: "大部晴朗" },
            2: { ko: "흐림", en: "Partly Cloudy", ja: "曇り", zh: "多云" },
            3: { ko: "매우 흐림", en: "Overcast", ja: "本曇り", zh: "阴天" },
            45: { ko: "안개", en: "Fog", ja: "霧", zh: "有雾" },
            48: { ko: "서리 안개", en: "Depositing Rime Fog", ja: "着氷性の霧", zh: "雾凇" },
            51: { ko: "가랑비", en: "Light Drizzle", ja: "霧雨", zh: "毛毛雨" },
            61: { ko: "비", en: "Rain", ja: "雨", zh: "有雨" },
            71: { ko: "눈", en: "Snow", ja: "雪", zh: "有雪" },
            80: { ko: "소나기", en: "Rain Showers", ja: "にわか雨", zh: "阵雨" },
            95: { ko: "뇌우", en: "Thunderstorm", ja: "雷雨", zh: "雷阵雨" }
        };
        
        const weatherInfo = weatherCodes[current.weathercode] || { ko: "정보 없음", en: "No Info", ja: "情報なし", zh: "无信息" };
        weatherDesc.textContent = weatherInfo[currentLang];
        
        weatherIconContainer.innerHTML = `<i data-lucide="${getWeatherIcon(current.weathercode)}" size="48"></i>`;
        lucide.createIcons();
    } catch (error) {
        console.error("Weather fetch failed:", error);
    }

    // 3. Travel Insights Logic
    updateInsights(city, month);

    // 4. Currency Logic
    updateCurrency(city.currency);

    // 5. Reload Disqus for specific city
    reloadDisqus(city.names[currentLang]);
}

// Currency Logic
let exchangeRates = {};

async function updateCurrency(targetCurrency) {
    if (!targetCurrency) return;
    
    targetCurrencyLabel.textContent = `${targetCurrency} (${getCurrencySymbol(targetCurrency)})`;
    currencyRateInfo.textContent = translations[currentLang]['currency-updating'];
    
    try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/KRW`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        if (data && data.rates && data.rates[targetCurrency]) {
            const rate = data.rates[targetCurrency];
            const krw = parseFloat(krwAmountInput.value);
            
            if (isNaN(krw)) {
                targetAmountInput.value = "0.00";
                currencyRateInfo.textContent = `1 KRW = ${rate.toFixed(4)} ${targetCurrency} (${data.date})`;
                return;
            }

            const result = (krw * rate).toFixed(2);
            targetAmountInput.value = result;
            currencyRateInfo.textContent = `1 KRW = ${rate.toFixed(4)} ${targetCurrency} (${data.date})`;
        } else {
            throw new Error("Currency info not found.");
        }
    } catch (error) {
        console.error("Currency fetch failed:", error);
        currencyRateInfo.textContent = translations[currentLang]['currency-failed'];
        targetAmountInput.value = "0.00";
    }
}

function getCurrencySymbol(code) {
    const symbols = { JPY: "¥", USD: "$", GBP: "£", EUR: "€", THB: "฿" };
    return symbols[code] || "";
}

let debounceTimer;
krwAmountInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const cityIndex = citySelect.value;
        const city = cities[cityIndex];
        if (city && city.currency) {
            updateCurrency(city.currency);
        }
    }, 500);
});

// Checklist Logic
let checklistItems = JSON.parse(localStorage.getItem('travelChecklist')) || [
    { id: 1, text: translations[currentLang]['checklist-default-1'], completed: false },
    { id: 2, text: translations[currentLang]['checklist-default-2'], completed: false },
    { id: 3, text: translations[currentLang]['checklist-default-3'], completed: false }
];

function saveChecklist() {
    localStorage.setItem('travelChecklist', JSON.stringify(checklistItems));
}

function renderChecklist() {
    checklistContainer.innerHTML = '';
    checklistItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `flex items-center justify-between p-3 rounded-xl border ${item.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'} transition-all`;
        itemDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleChecklistItem(${item.id})" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'} font-medium">${item.text}</span>
            </div>
            <button onclick="deleteChecklistItem(${item.id})" class="text-gray-300 hover:text-red-500 transition-colors">
                <i data-lucide="trash-2" size="14"></i>
            </button>
        `;
        checklistContainer.appendChild(itemDiv);
    });
    lucide.createIcons();
}

function addChecklistItem() {
    const text = checklistInput.value.trim();
    if (!text) return;

    const newItem = {
        id: Date.now(),
        text: text,
        completed: false
    };

    checklistItems.push(newItem);
    checklistInput.value = '';
    saveChecklist();
    renderChecklist();
}

function toggleChecklistItem(id) {
    checklistItems = checklistItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist();
    renderChecklist();
}

function deleteChecklistItem(id) {
    checklistItems = checklistItems.filter(item => item.id !== id);
    saveChecklist();
    renderChecklist();
}

addChecklistItemBtn.addEventListener('click', addChecklistItem);
checklistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addChecklistItem();
});

// Make global for onclick
window.toggleChecklistItem = toggleChecklistItem;
window.deleteChecklistItem = deleteChecklistItem;

// Initial Checklist Render
renderChecklist();

function updateInsights(city, month) {
    // Readiness Score
    const isBestMonth = city.bestMonths.includes(month);
    let score = isBestMonth ? 90 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 30);
    
    readinessScore.textContent = `${score}%`;
    
    let labelKey = score >= 80 ? "status-very-recommend" : (score >= 60 ? "status-recommend" : "status-normal");
    readinessLabel.textContent = translations[currentLang][labelKey];
    readinessLabel.className = `text-sm font-bold mb-2 ${score >= 80 ? 'text-green-600' : (score >= 60 ? 'text-amber-600' : 'text-gray-600')}`;
    
    if (isBestMonth) {
        timingDesc.innerHTML = translations[currentLang]['insight-best'].replace('{highlights}', city.highlights[currentLang]);
    } else {
        timingDesc.innerHTML = translations[currentLang]['insight-not-best'].replace('{months}', city.bestMonths.join(', '));
    }

    // Congestion Logic
    const congestionVal = city.congestion[month - 1]; // 1.0 to 2.0
    const percent = ((congestionVal - 1) / 1) * 100;
    
    congestionBar.style.width = `${percent}%`;
    if (percent < 30) {
        congestionLevel.textContent = translations[currentLang]['congestion-low'];
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-600";
        congestionBar.className = "h-full bg-green-500 transition-all duration-1000";
    } else if (percent < 70) {
        congestionLevel.textContent = translations[currentLang]['congestion-medium'];
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-600";
        congestionBar.className = "h-full bg-amber-500 transition-all duration-1000";
    } else {
        congestionLevel.textContent = translations[currentLang]['congestion-high'];
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600";
        congestionBar.className = "h-full bg-red-500 transition-all duration-1000";
    }
}

// Disqus Integration
function reloadDisqus(cityName) {
    const pageUrl = window.location.href.split('?')[0] + '?city=' + encodeURIComponent(cityName);
    const pageIdentifier = 'city_' + cityName;

    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = pageIdentifier;
                this.page.url = pageUrl;
            }
        });
    } else {
        // Initial load
        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = pageIdentifier;
        };
        (function() {
            var d = document, s = d.createElement('script');
            s.src = 'https://productbuilder-lqdabenmjt.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();
    }
}

// Planner Logic
const planStartDateInput = document.getElementById('plan-start-date');
const planEndDateInput = document.getElementById('plan-end-date');
const plannerDaysContainer = document.getElementById('planner-days-container');

let travelPlans = JSON.parse(localStorage.getItem('travelPlans')) || {};

function savePlans() {
    localStorage.setItem('travelPlans', JSON.stringify(travelPlans));
}

function generatePlanner() {
    const start = planStartDateInput.value;
    const end = planEndDateInput.value;

    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
        alert(translations[currentLang]['planner-alert-date']);
        return;
    }

    plannerDaysContainer.innerHTML = '';
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        const dateStr = currentDay.toISOString().split('T')[0];
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'bg-white/70 p-4 rounded-xl border border-indigo-50 shadow-sm space-y-3';
        dayDiv.innerHTML = `
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <h4 class="font-bold text-gray-800">${i + 1}${translations[currentLang]['planner-day']} (${dateStr})</h4>
                <button onclick="addTask('${dateStr}')" class="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1">
                    <i data-lucide="plus" size="12"></i> ${translations[currentLang]['planner-add-task']}
                </button>
            </div>
            <div id="tasks-${dateStr}" class="space-y-2">
                <!-- Tasks for this day -->
            </div>
        `;
        plannerDaysContainer.appendChild(dayDiv);
        renderTasks(dateStr);
    }
    lucide.createIcons();
}

function addTask(dateStr) {
    const time = prompt(translations[currentLang]['planner-prompt-time'], "09:00");
    if (!time) return;
    const activity = prompt(translations[currentLang]['planner-prompt-activity'], "");
    if (!activity) return;

    if (!travelPlans[dateStr]) travelPlans[dateStr] = [];
    travelPlans[dateStr].push({ time, activity, id: Date.now() });
    travelPlans[dateStr].sort((a, b) => a.time.localeCompare(b.time));
    
    savePlans();
    renderTasks(dateStr);
}

function deleteTask(dateStr, taskId) {
    travelPlans[dateStr] = travelPlans[dateStr].filter(task => task.id !== taskId);
    savePlans();
    renderTasks(dateStr);
}

function renderTasks(dateStr) {
    const container = document.getElementById(`tasks-${dateStr}`);
    if (!container) return;
    
    container.innerHTML = '';
    const tasks = travelPlans[dateStr] || [];
    
    if (tasks.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-2">${translations[currentLang]['planner-no-tasks']}</p>`;
        return;
    }

    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-gray-50 shadow-sm animate-in fade-in slide-in-from-left-2';
        taskDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">${task.time}</span>
                <span class="text-sm text-gray-700">${task.activity}</span>
            </div>
            <button onclick="deleteTask('${dateStr}', ${task.id})" class="text-gray-300 hover:text-red-500 transition-colors">
                <i data-lucide="x" size="14"></i>
            </button>
        `;
        container.appendChild(taskDiv);
    });
    lucide.createIcons();
}

// Make functions global for inline onclick
window.addTask = addTask;
window.deleteTask = deleteTask;

planStartDateInput.addEventListener('change', generatePlanner);
planEndDateInput.addEventListener('change', generatePlanner);

kstInput.addEventListener('change', updateDisplay);
citySelect.addEventListener('change', updateDisplay);

// Initial setup
populateCities();
setCurrentTime();

// --- Classifier Logic ---
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/kWbXU9-1R/";
let model, webcam, maxPredictions;
let isModelLoading = false;

async function initClassifier() {
    if (model || isModelLoading) return;
    
    isModelLoading = true;
    const modelStatus = document.getElementById('model-status');
    
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        modelStatus.innerHTML = `<div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>${translations[currentLang]['classifier-ready']}`;
        modelStatus.className = "flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded";
    } catch (error) {
        console.error("Model load failed:", error);
        modelStatus.innerHTML = `<div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>${translations[currentLang]['classifier-failed']}`;
        modelStatus.className = "flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded";
    } finally {
        isModelLoading = false;
    }
}

// File Upload Logic
const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const predictionContainer = document.getElementById('prediction-container');
const loadingSpinner = document.getElementById('loading-spinner');

uploadArea.addEventListener('click', () => imageUpload.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-indigo-500', 'bg-indigo-50/50');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-indigo-500', 'bg-indigo-50/50');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-indigo-500', 'bg-indigo-50/50');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
});

async function handleImageUpload(file) {
    stopWebcam();
    predictionContainer.classList.remove('hidden');
    imagePreview.classList.remove('hidden');
    document.getElementById('webcam-wrapper').classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        imagePreview.onload = async () => {
            if (!model) await initClassifier();
            await predictImage(imagePreview);
            loadingSpinner.classList.add('hidden');
        };
    };
    reader.readAsDataURL(file);
}

async function predictImage(imageElement) {
    const prediction = await model.predict(imageElement);
    updatePredictionUI(prediction);
}

// Webcam Logic
const webcamBtn = document.getElementById('webcam-btn');
const webcamWrapper = document.getElementById('webcam-wrapper');
let isWebcamRunning = false;

webcamBtn.addEventListener('click', async () => {
    if (isWebcamRunning) {
        stopWebcam();
        return;
    }
    
    predictionContainer.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    webcamWrapper.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    
    if (!model) await initClassifier();
    
    try {
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);
        await webcam.setup();
        await webcam.play();
        
        webcamWrapper.innerHTML = '';
        webcamWrapper.appendChild(webcam.canvas);
        webcam.canvas.className = "w-full h-full object-cover";
        
        isWebcamRunning = true;
        webcamBtn.innerHTML = `<i data-lucide="stop-circle" size="16"></i> ${translations[currentLang]['webcam-stop']}`;
        webcamBtn.classList.replace('text-indigo-600', 'text-red-600');
        webcamBtn.classList.replace('bg-indigo-50', 'bg-red-50');
        lucide.createIcons();
        
        loadingSpinner.classList.add('hidden');
        window.requestAnimationFrame(webcamLoop);
    } catch (error) {
        console.error("Webcam setup failed:", error);
        alert(translations[currentLang]['webcam-error']);
        loadingSpinner.classList.add('hidden');
    }
});

function stopWebcam() {
    if (webcam) {
        webcam.stop();
        webcam = null;
    }
    isWebcamRunning = false;
    webcamBtn.innerHTML = `<i data-lucide="webcam" size="16"></i> ${translations[currentLang]['btn-webcam']}`;
    webcamBtn.classList.replace('text-red-600', 'text-indigo-600');
    webcamBtn.classList.replace('bg-red-50', 'bg-indigo-50');
    lucide.createIcons();
}

async function webcamLoop() {
    if (!isWebcamRunning) return;
    webcam.update();
    await predictImage(webcam.canvas);
    window.requestAnimationFrame(webcamLoop);
}

// UI Update Logic
function updatePredictionUI(predictions) {
    const topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);
    
    const classMap = {
        "일본": { ko: "일본", en: "Japan", ja: "日本", zh: "日本" },
        "미국": { ko: "미국", en: "USA", ja: "アメリカ", zh: "美国" },
        "영국": { ko: "영국", en: "UK", ja: "イギリス", zh: "英国" },
        "프랑스": { ko: "프랑스", en: "France", ja: "フランス", zh: "法国" },
        "태국": { ko: "태국", en: "Thailand", ja: "タイ", zh: "泰国" }
    };

    const localizedClassName = classMap[topPrediction.className] ? classMap[topPrediction.className][currentLang] : topPrediction.className;

    document.getElementById('top-prediction').textContent = localizedClassName;
    document.getElementById('confidence-badge').textContent = `${translations[currentLang]['confidence']} ${Math.round(topPrediction.probability * 100)}%`;
    
    const labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = '';
    
    predictions.forEach(p => {
        const percentage = Math.round(p.probability * 100);
        const localizedName = classMap[p.className] ? classMap[p.className][currentLang] : p.className;
        const barDiv = document.createElement('div');
        barDiv.className = 'space-y-1';
        barDiv.innerHTML = `
            <div class="flex justify-between text-[10px] font-bold text-indigo-100 uppercase">
                <span>${localizedName}</span>
                <span>${percentage}%</span>
            </div>
            <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-white transition-all duration-500" style="width: ${percentage}%"></div>
            </div>
        `;
        labelContainer.appendChild(barDiv);
    });

    const descriptions = {
        "일본": translations[currentLang]['prediction-japan'],
        "미국": translations[currentLang]['prediction-usa'],
        "영국": translations[currentLang]['prediction-uk'],
        "프랑스": translations[currentLang]['prediction-france'],
        "태국": translations[currentLang]['prediction-thailand']
    };
    document.getElementById('prediction-desc').textContent = descriptions[topPrediction.className] || translations[currentLang]['prediction-default'];
}
