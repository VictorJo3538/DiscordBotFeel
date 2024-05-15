// queue.js
let musicQueue = []; // 음악 재생 큐 배열

// 큐에 음악 추가하는 함수
function addToQueue(musicInfo) {
    musicQueue.push(musicInfo);
}

// 큐에서 다음 음악 정보 가져오는 함수
function getNextQueue() {
    return musicQueue.shift();
}

// 큐에서 곡제목을 가져오는 함수
function getQueueTitles() {
    queueTitles = musicQueue.map((info, index) => `${index + 1}. ${info.videoDetails.title}`).join('\n');
    return queueTitles;
}

// 현재 큐에 있는 음악 목록을 반환하는 함수
function getQueue() {
    return musicQueue;
}

// 큐를 비우는 함수
function clearQueue() {
    musicQueue = [];
}

module.exports = { addToQueue, getNextQueue, getQueueTitles, getQueue, clearQueue };
