const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getData() {
    // 데이터 변수 선언
    let data;

    // 데이터 가져오기
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1s0EC3aoV0TvcAiqOgJHaWDnqt1CwWcOlV8q2tKfIIzU'; // 동방시간표 id
    const range = '합주시간표!A16:H41';
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    const rows = response.data.values;
    if (rows.length) {
        data = rows;
    } else {
        console.log('데이터가 없습니다.');
    }

    // 요일 데이터 가져오는 함수
    async function getDayOfWeek() {
        const today = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }); // 한국 시간대로 설정
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = weekdays[new Date(today).getDay()];
        return dayOfWeek;
    }

    // 요일별 데이터 가져오기
    const dayOfWeek = await getDayOfWeek();
    let firstrow = data[0];
    let column = firstrow.indexOf(dayOfWeek);
    let todayData = []
    for (let i = 0; i < data.length; i++) {
        if (i === 0) continue;
        let preData = data[i][column];
        if (preData != undefined && preData != '') {
            todayData.push(`${data[i][0]}: ${preData}`);
        }
    }
    return todayData;
}
module.exports = { getData };
