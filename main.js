const cities = [
    { name: "도쿄, 일본 (GMT+9)", tz: "Asia/Tokyo", lat: 35.6895, lon: 139.6917, bestMonths: [3, 4, 10, 11], congestion: [1.8, 1.4, 2.0, 1.9, 1.6, 1.2, 1.5, 1.7, 1.3, 1.6, 1.8, 1.5], highlights: "벚꽃과 단풍 시즌이 절정입니다." },
    { name: "뉴욕, 미국 (GMT-5)", tz: "America/New_York", lat: 40.7128, lon: -74.0060, bestMonths: [5, 6, 9, 10], congestion: [1.2, 1.3, 1.5, 1.7, 1.8, 1.9, 2.0, 2.0, 1.8, 1.7, 1.9, 2.0], highlights: "온화한 날씨에 센트럴 파크를 즐기기 좋습니다." },
    { name: "런던, 영국 (GMT+0)", tz: "Europe/London", lat: 51.5074, lon: -0.1278, bestMonths: [5, 6, 7, 8], congestion: [1.1, 1.2, 1.4, 1.6, 1.8, 1.9, 2.0, 2.0, 1.7, 1.5, 1.4, 1.8], highlights: "해가 길고 축제가 많은 여름 시즌입니다." },
    { name: "파리, 프랑스 (GMT+1)", tz: "Europe/Paris", lat: 48.8566, lon: 2.3522, bestMonths: [4, 5, 6, 9], congestion: [1.2, 1.3, 1.6, 1.8, 1.9, 2.0, 1.9, 1.7, 2.0, 1.6, 1.4, 1.8], highlights: "예술과 낭만이 가득한 봄과 가을의 파리입니다." },
    { name: "방콕, 태국 (GMT+7)", tz: "Asia/Bangkok", lat: 13.7563, lon: 100.5018, bestMonths: [11, 12, 1, 2], congestion: [1.9, 1.7, 1.5, 1.8, 1.4, 1.2, 1.3, 1.4, 1.3, 1.5, 1.8, 2.0], highlights: "건기로 여행하기 가장 쾌적한 날씨입니다." }
];

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

// Tab Elements
const tabs = {
    status: document.getElementById('tab-status'),
    insights: document.getElementById('tab-insights'),
    partnership: document.getElementById('tab-partnership')
};
const sections = {
    status: document.getElementById('section-status'),
    insights: document.getElementById('section-insights'),
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
        } else {
            sections[key].classList.add('hidden');
            tabs[key].classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            tabs[key].classList.add('text-gray-500');
        }
    });
}

tabs.status.addEventListener('click', () => switchTab('status'));
tabs.insights.addEventListener('click', () => switchTab('insights'));
tabs.partnership.addEventListener('click', () => switchTab('partnership'));

// Populate city dropdown
function populateCities(filter = '') {
    citySelect.innerHTML = '';
    const filtered = cities.filter(c => c.name.includes(filter));
    filtered.forEach((city) => {
        const originalIndex = cities.indexOf(city);
        const option = document.createElement('option');
        option.value = originalIndex;
        option.textContent = city.name;
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
    const inputVal = kstInput.value;
    
    if (!city || !inputVal) return;

    resultContainer.classList.remove('hidden');
    targetCityLabel.textContent = city.name.split(',')[0];
    displayCityName.textContent = city.name;

    const date = new Date(inputVal);
    const month = date.getMonth() + 1; // 1-12

    // 1. Time Conversion
    const timeOptions = { timeZone: city.tz, hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { timeZone: city.tz, month: 'long', day: 'numeric', weekday: 'short' };
    localTimeDisplay.textContent = new Intl.DateTimeFormat('ko-KR', timeOptions).format(date);
    localDateDisplay.textContent = new Intl.DateTimeFormat('ko-KR', dateOptions).format(date);

    // 2. Weather Fetch
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature`);
        const data = await res.json();
        const current = data.current_weather;
        tempDisplay.textContent = `${Math.round(current.temperature)}°C`;
        windspeedDisplay.textContent = `${current.windspeed}km/h`;
        humidityDisplay.textContent = `${data.hourly.relative_humidity_2m[0]}%`;
        apparentTempDisplay.textContent = `${Math.round(data.hourly.apparent_temperature[0])}°C`;
        
        const weatherCodes = { 0: "맑음", 1: "대체로 맑음", 2: "흐림", 3: "매우 흐림", 45: "안개", 48: "서리 안개", 51: "가랑비", 61: "비", 71: "눈", 80: "소나기", 95: "뇌우" };
        weatherDesc.textContent = weatherCodes[current.weathercode] || "정보 없음";
        
        weatherIconContainer.innerHTML = `<i data-lucide="${getWeatherIcon(current.weathercode)}" size="48"></i>`;
        lucide.createIcons();
    } catch (error) {
        console.error("Weather fetch failed:", error);
    }

    // 3. Travel Insights Logic
    updateInsights(city, month);
}

function updateInsights(city, month) {
    // Readiness Score
    const isBestMonth = city.bestMonths.includes(month);
    let score = isBestMonth ? 90 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 30);
    
    readinessScore.textContent = `${score}%`;
    readinessLabel.textContent = score >= 80 ? "매우 추천" : (score >= 60 ? "추천" : "보통");
    readinessLabel.className = `text-sm font-bold mb-2 ${score >= 80 ? 'text-green-600' : (score >= 60 ? 'text-amber-600' : 'text-gray-600')}`;
    
    timingDesc.innerHTML = isBestMonth 
        ? `지금이 여행 최적기입니다! <strong>${city.highlights}</strong>`
        : `여행하기에 나쁘지 않지만, 최고의 시기는 아닙니다. ${city.bestMonths.join(', ')}월을 추천드려요.`;

    // Congestion Logic
    const congestionVal = city.congestion[month - 1]; // 1.0 to 2.0
    const percent = ((congestionVal - 1) / 1) * 100;
    
    congestionBar.style.width = `${percent}%`;
    if (percent < 30) {
        congestionLevel.textContent = "쾌적";
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-600";
        congestionBar.className = "h-full bg-green-500 transition-all duration-1000";
    } else if (percent < 70) {
        congestionLevel.textContent = "보통";
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-600";
        congestionBar.className = "h-full bg-amber-500 transition-all duration-1000";
    } else {
        congestionLevel.textContent = "매우 혼잡";
        congestionLevel.className = "text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600";
        congestionBar.className = "h-full bg-red-500 transition-all duration-1000";
    }
}

kstInput.addEventListener('change', updateDisplay);
citySelect.addEventListener('change', updateDisplay);

// Initial setup
populateCities();
setCurrentTime();
