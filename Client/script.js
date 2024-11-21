const scriptUrl = 'https://script.google.com/macros/s/AKfycbz22eacPLQ3-UeaQ64GCptCSza3PyXUXiOlvMcoBndVIzOeNbP6uWC-aN7EbHvbr0jB/exec'; // Google Apps Script URL

class Animal {
    constructor(name, food, growthStages, buffs, images) {
        this.name = name;
        this.food = food; // 각 동물의 먹이
        this.happiness = 11; // 초기 행복도를 11로 설정
        this.growthStages = growthStages;
        this.currentStage = 0;
        this.buffs = buffs;
        this.foodOptions = [];
        this.images = images; // 동물 이미지 배열
    }

    setFoodOptions() {
        this.foodOptions = [this.food, this.food, this.food]; // 각 동물의 먹이를 3개로 설정
    }

    feed(index) {
        const selectedFood = this.foodOptions[index];
        if (selectedFood === this.food) {
            this.feedCorrectFood();
        } else if (selectedFood === "보통 먹이") {
            this.feedNeutralFood();
        } else {
            this.feedWrongFood();
        }
    }

    feedCorrectFood() {
        let happinessChange = 0;
        const probability = Math.random();

        if (this.buffs.difficulty === "쉬움") {
            if (probability < 0.7) {
                happinessChange = 20;
                alert(`${this.name}가 행복해합니다!`);
            } else {
                happinessChange = -5;
                alert(`${this.name}가 이 음식을 좋아하지 않습니다.`);
            }
        } else if (this.buffs.difficulty === "보통") {
            if (probability < 0.6) {
                happinessChange = 15;
                alert(`${this.name}가 행복해합니다!`);
            } else {
                happinessChange = -5;
                alert(`${this.name}가 이 음식을 좋아하지 않습니다.`);
            }
        } else {
            if (probability < 0.2) {
                happinessChange = 15;
                alert(`${this.name}가 행복해합니다!`);
            } else {
                happinessChange = -5;
                alert(`${this.name}가 이 음식을 좋아하지 않습니다.`);
            }
        }


        this.happiness += happinessChange;
        this.showCurrentHappiness();
    }

  feedWrongFood() {
    let happinessDecrease = 10;

    if (this.buffs.difficulty === "어려움") {
        happinessDecrease = 15;
    }

    this.happiness -= happinessDecrease;
    alert(`${this.name}가 이 음식을 좋아하지 않습니다.`);
    this.showCurrentHappiness();
}


    showCurrentHappiness() {
        const statusDiv = document.getElementById("status");
        const imageDiv = document.getElementById("animal-image");
        if (this.happiness <= 0) {
            statusDiv.innerText = `${this.name}의 행복도가 0이 되어 죽었습니다.`;
            imageDiv.src = this.images[0]; // 기본 이미지로 설정
        } else if (this.happiness >= 100) {
            statusDiv.innerText = `${this.name}의 행복도가 100이 되어 성장이 끝났습니다!`;
            imageDiv.src = this.images[3]; // 3차 성장 이미지로 설정
        } else {
            statusDiv.innerText = `${this.name}의 행복도: ${this.happiness}`;
            imageDiv.src = this.images[this.currentStage]; // 현재 성장 단계에 따른 이미지
        }
    }

checkGrowth() {
    if (this.currentStage < this.growthStages.length && this.happiness >= this.growthStages[this.currentStage]) {
        this.currentStage++;
        alert(`${this.name}가 성장했습니다!`);
        this.showCurrentHappiness(); // 성장 후 상태 업데이트
    }

    // 행복도가 100이 되었을 때의 처리
    if (this.happiness >= 100 && this.currentStage === this.growthStages.length) {
        const studentId = document.getElementById("student-id").value;
        const studentName = document.getElementById("student-name").value;
        logEvent(8, '최종 성장', this.name, studentId, studentName); // 최종 성장 로그 기록
    }
}


    isGameOver() {
        return this.happiness <= 0 || this.happiness >= 100; // 게임 종료 조건 수정
    }
}

class Buffs {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
}

// 각 동물별로 먹이와 이미지 지정합니다.
const animals = {
    "플라밍고 드래곤": new Animal(
        "플라밍고 드래곤",
        "물",
        [30, 60],
        new Buffs("쉬움"),
        [
            "images/flamingo_dragon.png", // 기본 모습
            "images/flamingo_dragon_stage1.png", // 1차 성장 후 모습
            "images/flamingo_dragon_stage2.png", // 2차 성장 후 모습
            "images/flamingo_dragon_stage3.png" // 3차 성장 후 모습
        ]
    ),
    "구름 사슴": new Animal(
        "구름 사슴",
        "구름 젤리",
        [40, 60],
        new Buffs("보통"),
        [
            "images/cloud_deer.png", // 기본 모습
            "images/cloud_deer_stage1.png", // 1차 성장 후 모습
            "images/cloud_deer_stage2.png", // 2차 성장 후 모습
            "images/cloud_deer_stage3.png" // 3차 성장 후 모습
        ]
    ),
    "기계 토끼": new Animal(
        "기계 토끼",
        "전기 과자",
        [50, 70],
        new Buffs("어려움"),
        [
            "images/mechanical_rabbit.png", // 기본 모습
            "images/mechanical_rabbit_stage1.png", // 1차 성장 후 모습
            "images/mechanical_rabbit_stage2.png", // 2차 성장 후 모습
            "images/mechanical_rabbit_stage3.png" // 3차 성장 후 모습
        ]
    )
};

let selectedAnimal;
let startTime; // 게임 시작 시각 변수

// 간식 이미지 배열
const snacks = {
    "물": "images/water.png",
    "구름 젤리": "images/cloud_jelly.png",
    "전기 과자": "images/electric_snack.png"
};

// 이벤트 로그를 기록하는 함수
function logEvent(eventId, eventType, additionalInfo = "", studentId, studentName) {
    const eventLogUrl = scriptUrl; // 단일 이벤트 로그 URL

    fetch(`${eventLogUrl}?action=logEvent&eventId=${eventId}&eventType=${encodeURIComponent(eventType)}&additionalInfo=${encodeURIComponent(additionalInfo)}&studentId=${encodeURIComponent(studentId)}&studentName=${encodeURIComponent(studentName)}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            console.error('로그 기록 실패:', response);
        }
    })
    .catch(error => {
        console.error('로그 기록 중 오류 발생:', error);
    });
}


// 로그인 함수
function login() {
    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;

    // Google Apps Script로 요청 보내기
    fetch(`${scriptUrl}?action=login&studentId=${encodeURIComponent(studentId)}&studentName=${encodeURIComponent(studentName)}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('네트워크 응답이 좋지 않습니다.');
        }
        return response.json();
    })
    .then(data => {
        // 응답 처리
        if (data.isValid) {
            document.getElementById("login-form").style.display = "none"; // 로그인 폼 숨기기
            document.getElementById("animal-selection").style.display = "flex"; // 동물 선택 화면 표시
            document.getElementById("login-status").innerText = ""; // 로그인 상태 초기화
            logAccess(studentId); // 접속 기록
        } else {
            document.getElementById("login-status").innerText = "로그인 실패! 학번과 이름을 확인하세요.";
        }
    })
    .catch(error => {
        console.error('Error:', error); // 오류 처리
        document.getElementById("login-status").innerText = "로그인 요청 중 오류가 발생했습니다.";
    });
}


function startGame(animalName) {
    selectedAnimal = animals[animalName];
    if (!selectedAnimal) {
        alert("동물이 선택되지 않았습니다.");
        return;
    }
    startTime = new Date(); // 게임 시작 시각 기록
    document.getElementById("animal-name").innerText = selectedAnimal.name;
    document.getElementById("animal-image").src = selectedAnimal.images[0]; // 기본 이미지 설정
    document.getElementById("animal-selection").style.display = "none";
    document.getElementById("game-play").style.display = "block";

    selectedAnimal.setFoodOptions(); // 고정된 먹이 설정
    selectedAnimal.showCurrentHappiness(); // 초기 행복도 표시
    showFoodOptions();

    // 학생 ID와 이름을 가져옵니다.
    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;
    logEvent(3, '동물 선택', animalName, studentId, studentName); // 동물 선택 로그 기록
}


function showFoodOptions() {
    const foodOptionsDiv = document.getElementById("food-options");
    foodOptionsDiv.innerHTML = '';
    selectedAnimal.foodOptions.forEach((food, index) => {
        const snackImage = snacks[food];
        foodOptionsDiv.innerHTML += `
            <div class="food-card" onclick="feedAnimal(${index})">
                <img src="${snackImage}" alt="${food}" class="food-image"/> <!-- 간식 이미지 -->
                <span class="food-name">${food}</span> <!-- 간식 이름 -->
            </div>
        `;
    });
}

function feedAnimal(index) {
    // 게임이 종료되었는지 확인
    if (selectedAnimal.isGameOver()) {
        alert("게임이 종료되었습니다. 간식을 줄 수 없습니다.");
        return;
    }

    selectedAnimal.feed(index); // 먹이 주기
    
    // 학생 ID와 이름을 가져옵니다.
    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;
    logEvent(4, '먹이 주기', selectedAnimal.name, studentId, studentName); // 먹이 주기 로그 기록
    const previousStage = selectedAnimal.currentStage; // 이전 성장 단계 저장
    selectedAnimal.checkGrowth(); // 성장 체크

    // 성장 체크 후 현재 성장 단계와 이전 단계 비교
    if (selectedAnimal.currentStage > previousStage) {
        logEvent(5, '성장', selectedAnimal.name, studentId, studentName); // 성장 로그 기록
    }

    // 게임 종료 여부 체크
    if (selectedAnimal.happiness <= 0) {
        logEvent(9, '게임 오버', selectedAnimal.name, studentId, studentName); // 게임 오버 로그 기록
        disableFoodOptions(); // 간식 옵션 비활성화
    } else if (selectedAnimal.happiness >= 100) {
        alert(`${selectedAnimal.name}의 행복도가 100이 되어 성장이 끝났습니다!`);
        disableFoodOptions(); // 간식 옵션 비활성화
    }
}




function disableFoodOptions() {
    const foodOptionsDiv = document.getElementById("food-options");
    foodOptionsDiv.innerHTML = ''; // 간식 옵션을 초기화하여 더 이상 선택할 수 없게 함
    const statusDiv = document.getElementById("status");
    statusDiv.innerText += "\n더 이상 간식을 줄 수 없습니다."; // 상태 메시지 추가
}

// 게임 종료 버튼 클릭 시 호출되는 함수
function endGame() {
    const playTime = Math.floor((new Date() - startTime) / 1000); // 게임 시작 시각과 현재 시각의 차이를 초로 변환
    const minutes = Math.floor(playTime / 60); // 분으로 변환
    const seconds = playTime % 60; // 초로 변환
    const formattedTime = `${minutes}분 ${seconds}초`; // 포맷팅

    // 학생 ID와 이름을 가져옵니다.
    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;
    logEvent(6, '게임 종료', formattedTime, studentId, studentName); // 게임 종료 로그 기록

    selectedAnimal.happiness = 11; // 행복도 초기화
    selectedAnimal.currentStage = 0; // 성장 단계 초기화
    document.getElementById("game-play").style.display = "none"; // 게임 진행 화면 숨기기
    const animalSelection = document.getElementById("animal-selection");
    animalSelection.style.display = "block"; // 동물 선택 화면 재표시

    // CSS 초기화
    animalSelection.style.alignItems = "center"; // 중앙 정렬로 설정
    animalSelection.style.justifyContent = "center"; // 중앙 정렬로 설정

    const selectionBox = document.querySelector('.selection-box');
    selectionBox.style.margin = "0 auto"; // 중앙 정렬을 위한 마진 설정
    selectionBox.style.width = "700px"; // 너비를 고정
}


// 접속 로그 기록 함수
function logAccess(studentId) {
    const accessLogUrl = scriptUrl; // 단일 접속 로그 URL

    fetch(`${accessLogUrl}?action=logAccess&studentId=${encodeURIComponent(studentId)}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            console.error('접속 기록 실패:', response);
        }
    })
    .catch(error => {
        console.error('접속 기록 중 오류 발생:', error);
    });
}
