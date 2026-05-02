const cities = [
    { name: "도쿄, 일본 (GMT+9)", tz: "Asia/Tokyo", lat: 35.6895, lon: 139.6917 },
    { name: "뉴욕, 미국 (GMT-5)", tz: "America/New_York", lat: 40.7128, lon: -74.0060 },
    { name: "덴버, 미국 (GMT-7)", tz: "America/Denver", lat: 39.7392, lon: -104.9903 },
    { name: "런던, 영국 (GMT+0)", tz: "Europe/London", lat: 51.5074, lon: -0.1278 },
    { name: "파리, 프랑스 (GMT+1)", tz: "Europe/Paris", lat: 48.8566, lon: 2.3522 },
    { name: "시드니, 호주 (GMT+11)", tz: "Australia/Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "두바이, UAE (GMT+4)", tz: "Asia/Dubai", lat: 25.2048, lon: 55.2708 },
    { name: "방콕, 태국 (GMT+7)", tz: "Asia/Bangkok", lat: 13.7563, lon: 100.5018 },
    { name: "싱가포르 (GMT+8)", tz: "Asia/Singapore", lat: 1.3521, lon: 103.8198 },
    { name: "로스앤젤레스, 미국 (GMT-8)", tz: "America/Los_Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "베를린, 독일 (GMT+1)", tz: "Europe/Berlin", lat: 52.5200, lon: 13.4050 },
    { name: "모스크바, 러시아 (GMT+3)", tz: "Europe/Moscow", lat: 55.7558, lon: 37.6173 },
    { name: "상파울루, 브라질 (GMT-3)", tz: "America/Sao_Paulo", lat: -23.5505, lon: -46.6333 },
    { name: "홍콩, 중국 (GMT+8)", tz: "Asia/Hong_Kong", lat: 22.3193, lon: 114.1694 },
    { name: "베이징, 중국 (GMT+8)", tz: "Asia/Shanghai", lat: 39.9042, lon: 116.4074 },
    { name: "로마, 이탈리아 (GMT+1)", tz: "Europe/Rome", lat: 41.9028, lon: 12.4964 },
    { name: "마드리드, 스페인 (GMT+1)", tz: "Europe/Madrid", lat: 40.4168, lon: -3.7038 }
];

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

// Initialize Lucide icons
lucide.createIcons();

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

    // 1. Convert Time
    const date = new Date(inputVal);
    
    const timeOptions = {
        timeZone: city.tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const dateOptions = {
        timeZone: city.tz,
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    };

    localTimeDisplay.textContent = new Intl.DateTimeFormat('ko-KR', timeOptions).format(date);
    localDateDisplay.textContent = new Intl.DateTimeFormat('ko-KR', dateOptions).format(date);

    // 2. Fetch Weather
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=relative_humidity_2m,apparent_temperature`);
        const data = await res.json();
        
        const current = data.current_weather;
        tempDisplay.textContent = `${Math.round(current.temperature)}°C`;
        windspeedDisplay.textContent = `${current.windspeed}km/h`;
        
        // Get additional metrics from hourly (first index as proxy for current)
        humidityDisplay.textContent = `${data.hourly.relative_humidity_2m[0]}%`;
        apparentTempDisplay.textContent = `${Math.round(data.hourly.apparent_temperature[0])}°C`;
        
        const weatherCodes = {
            0: "맑음", 1: "대체로 맑음", 2: "흐림", 3: "매우 흐림",
            45: "안개", 48: "서리 안개", 51: "가랑비", 61: "비", 71: "눈",
            80: "소나기", 95: "뇌우"
        };
        weatherDesc.textContent = weatherCodes[current.weathercode] || "정보 없음";
        
        const iconName = getWeatherIcon(current.weathercode);
        weatherIconContainer.innerHTML = `<i data-lucide="${iconName}" size="48"></i>`;
        lucide.createIcons();
        
    } catch (error) {
        console.error("Weather fetch failed:", error);
        weatherDesc.textContent = "날씨 정보 오류";
    }
}

kstInput.addEventListener('change', updateDisplay);
citySelect.addEventListener('change', updateDisplay);

// Initial setup
populateCities();
setCurrentTime();
