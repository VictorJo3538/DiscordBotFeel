// scheduleFetcher.js
const path = require('path');
const { getDayOfWeek } = require('../utils');
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, './credentials.json'), // credentials.json 파일 생성 필요, 없으면 만들어야함(동방문서에 접근가능한 구글계정필요)
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getData() {
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
