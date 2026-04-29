const fortunes = {
    general: [
        "오늘 당신의 기운은 밤하늘의 북극성처럼 맑고 뚜렷합니다. 망설이던 일을 시작하기에 최고의 날입니다.",
        "오늘은 구름 뒤에 숨은 달과 같습니다. 조용히 내면을 살피며 기회를 기다리는 것이 현명합니다.",
        "별들이 당신의 성공을 축복하고 있습니다. 예상치 못한 곳에서 행운의 소식이 들려올 것입니다.",
        "흐르는 물처럼 자연스러운 흐름에 몸을 맡기세요. 억지로 밀어붙이기보다는 유연한 대처가 필요합니다.",
        "오랫동안 노력해온 일에 대한 결실이 맺히기 시작합니다. 자신감을 가지고 앞으로 나아가세요."
    ],
    wealth: [
        "금전운이 상승하고 있습니다. 뜻밖의 횡재수나 이익이 발생할 수 있는 운수 좋은 날입니다.",
        "지출에 주의가 필요한 날입니다. 큰 투자보다는 현재의 자산을 지키는 데 집중하세요.",
        "작은 씨앗이 거대한 나무가 되듯, 오늘의 작은 절약이 미래의 큰 재산이 될 것입니다.",
        "동쪽에서 귀인이 나타나 재물에 관한 유익한 정보를 가져다줄 것입니다.",
        "재물보다는 사람을 얻는 것에 집중하세요. 결국 그것이 더 큰 이득으로 돌아올 것입니다."
    ],
    love: [
        "새로운 인연이 다가오고 있습니다. 마음의 문을 열어두면 따뜻한 온기가 스며들 것입니다.",
        "이미 곁에 있는 사람의 소중함을 다시 한번 느끼게 되는 날입니다. 진심을 전해보세요.",
        "작은 오해가 생길 수 있으니 대화에 신중을 기하세요. 경청하는 태도가 관계를 회복시킵니다.",
        "사랑의 여신이 당신을 향해 미소 짓고 있습니다. 고백을 계획 중이라면 오늘이 적기입니다.",
        "혼자만의 시간을 즐기며 스스로를 사랑하는 법을 배우는 하루가 될 것입니다."
    ]
};

document.getElementById('fortune-btn').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    const birthdate = document.getElementById('birthdate').value;

    if (!name || !birthdate) {
        alert("이름과 생년월일을 모두 입력해주세요.");
        return;
    }

    showLoading();
    
    // Simulate reading the stars
    setTimeout(() => {
        const fortune = generateFortune(name, birthdate);
        displayFortune(fortune);
    }, 2000);
});

document.getElementById('retry-btn').addEventListener('click', function() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('input-section').classList.remove('hidden');
});

function showLoading() {
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('loading-section').classList.remove('hidden');
}

function generateFortune(name, birthdate) {
    const today = new Date().toISOString().split('T')[0];
    const seed = name + birthdate + today;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    
    const absHash = Math.abs(hash);
    
    return {
        general: fortunes.general[absHash % fortunes.general.length],
        wealth: fortunes.wealth[absHash % fortunes.wealth.length],
        love: fortunes.love[absHash % fortunes.love.length]
    };
}

function displayFortune(fortune) {
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
    
    document.getElementById('general-fortune').innerText = fortune.general;
    document.getElementById('wealth-fortune').innerText = fortune.wealth;
    document.getElementById('love-fortune').innerText = fortune.love;
}
