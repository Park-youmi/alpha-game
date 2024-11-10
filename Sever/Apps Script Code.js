function doGet(e) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    // CORS preflight 요청 처리
    if (e.requestMethod === "OPTIONS") {
        return ContentService.createTextOutput("OK")
                             .setMimeType(ContentService.MimeType.TEXT)
                             .setHeaders(headers);
    }

    try {
        const action = e.parameter.action; // URL 쿼리 파라미터에서 action 가져오기
        const studentId = e.parameter.studentId; // URL 쿼리 파라미터에서 studentId 가져오기
        const studentName = e.parameter.studentName; // URL 쿼리 파라미터에서 studentName 가져오기
        const additionalInfo = e.parameter.additionalInfo || ""; // 추가 정보 가져오기

        // 요청 데이터 확인
        if (action === 'login') {
            return checkLogin(studentId, studentName); // 로그인 처리
        } else if (action === 'logEvent') {
            const eventId = e.parameter.eventId; // 이벤트 ID 가져오기
            logEvent(eventId, studentId, studentName, additionalInfo); // 이벤트 기록 처리
            return ContentService.createTextOutput(JSON.stringify({ success: true }))
                                 .setMimeType(ContentService.MimeType.JSON);
        } else if (action === 'logAccess') {
            logAccess(studentId); // 접속 기록 처리
            return ContentService.createTextOutput(JSON.stringify({ success: true }))
                                 .setMimeType(ContentService.MimeType.JSON);
        }

        // 잘못된 액션 처리
        return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
                             .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
                             .setMimeType(ContentService.MimeType.JSON);
    }
}

// 로그인 처리 함수
function checkLogin(studentId, studentName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("아이디");
    const data = sheet.getDataRange().getValues();
    let isValid = false;

    for (let i = 1; i < data.length; i++) {
        if (data[i][0].toString().trim() === studentId.trim() && data[i][1].trim() === studentName.trim()) {
            isValid = true;
            break;
        }
    }

    // 로그인 결과에 따라 이벤트 로그 기록
    if (isValid) {
        logEvent(1, studentId, studentName, "로그인 성공"); // 로그인 성공 로그
        return ContentService.createTextOutput(JSON.stringify({ isValid: true }))
                             .setMimeType(ContentService.MimeType.JSON);
    } else {
        logEvent(0, studentId, studentName, "로그인 실패"); // 로그인 실패 로그
        return ContentService.createTextOutput(JSON.stringify({ isValid: false }))
                             .setMimeType(ContentService.MimeType.JSON);
    }
}



// 이벤트 기록 함수
function logEvent(eventId, studentId, studentName, additionalInfo) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("이벤트"); // "이벤트" 시트
    const timestamp = new Date();
    const eventTypeMap = {
        0: "로그인 실패",
        1: "로그인 성공",
        3: "동물 선택",
        4: "먹이 주기",
        5: "성장",
        6: "게임 종료",
        7: "오류 발생"
    };
    const eventType = eventTypeMap[eventId] || "알 수 없는 이벤트";

    // 시트에 로그 기록 추가
    sheet.appendRow([timestamp, eventId, studentId, studentName, eventType, additionalInfo]); // 학생 ID와 이름 포함
}