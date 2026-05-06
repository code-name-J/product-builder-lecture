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

    // 4. Reload Disqus for specific city
    reloadDisqus(city.name);
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
        alert("종료일은 시작일보다 빠를 수 없습니다.");
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
                <h4 class="font-bold text-gray-800">${i + 1}일차 (${dateStr})</h4>
                <button onclick="addTask('${dateStr}')" class="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1">
                    <i data-lucide="plus" size="12"></i> 일정 추가
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
    const time = prompt("시간을 입력하세요 (예: 09:00)", "09:00");
    if (!time) return;
    const activity = prompt("활동 내용을 입력하세요", "아침 식사");
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
        container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-2">아직 일정이 없습니다.</p>`;
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
        
        modelStatus.innerHTML = `<div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>모델 준비됨`;
        modelStatus.className = "flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded";
    } catch (error) {
        console.error("Model load failed:", error);
        modelStatus.innerHTML = `<div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>로딩 실패`;
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
        webcamBtn.innerHTML = `<i data-lucide="stop-circle" size="16"></i> 웹캠 중지하기`;
        webcamBtn.classList.replace('text-indigo-600', 'text-red-600');
        webcamBtn.classList.replace('bg-indigo-50', 'bg-red-50');
        lucide.createIcons();
        
        loadingSpinner.classList.add('hidden');
        window.requestAnimationFrame(webcamLoop);
    } catch (error) {
        console.error("Webcam setup failed:", error);
        alert("웹캠을 시작할 수 없습니다. 권한을 확인해주세요.");
        loadingSpinner.classList.add('hidden');
    }
});

function stopWebcam() {
    if (webcam) {
        webcam.stop();
        webcam = null;
    }
    isWebcamRunning = false;
    webcamBtn.innerHTML = `<i data-lucide="webcam" size="16"></i> 실시간 웹캠 사용하기`;
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
    
    document.getElementById('top-prediction').textContent = topPrediction.className;
    document.getElementById('confidence-badge').textContent = `확신도 ${Math.round(topPrediction.probability * 100)}%`;
    
    const labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = '';
    
    predictions.forEach(p => {
        const percentage = Math.round(p.probability * 100);
        const barDiv = document.createElement('div');
        barDiv.className = 'space-y-1';
        barDiv.innerHTML = `
            <div class="flex justify-between text-[10px] font-bold text-indigo-100 uppercase">
                <span>${p.className}</span>
                <span>${percentage}%</span>
            </div>
            <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-white transition-all duration-500" style="width: ${percentage}%"></div>
            </div>
        `;
        labelContainer.appendChild(barDiv);
    });

    // Provide description based on country
    const descriptions = {
        "일본": "전통과 현대가 공존하는 섬나라, 일본입니다.",
        "미국": "다양한 문화의 중심지, 미국입니다.",
        "영국": "전통과 역사가 깊은 신사의 나라, 영국입니다.",
        "프랑스": "예술과 낭만의 도시가 가득한 프랑스입니다.",
        "태국": "미소와 열정의 나라, 태국입니다."
    };
    document.getElementById('prediction-desc').textContent = descriptions[topPrediction.className] || "이미지를 분석하여 국가를 식별했습니다.";
}
