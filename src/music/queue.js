// queue.js
let musicQueue = []; // 음악 재생 큐 배열 (play-dl을 통해 가져온 infoData를 담는다)

/** 큐에 음악 추가하는 함수 */ 
function addToQueue(musicInfo) {
    musicQueue.push(musicInfo);
}

/** 큐 가장 첫번째에 음악 삽입하는 함수 */
function addToFrontOfQueue(musicInfo) {
    musicQueue.unshift(musicInfo);
}

/** 큐에서 다음 음악 정보 가져오는 함수 */
function getNextQueue() {
    return musicQueue.shift();
}

/** 큐에서 곡제목을 가져오는 함수 */
function getQueueTitles() {
    return musicQueue.map((info, index) => `${index + 1}. ${info.video_details.title}`).join('\n');
}

/** 현재 큐에 있는 음악 목록을 반환하는 함수 */
function getQueue() {
    return musicQueue;
}

/** 큐를 비우는 함수 */
function clearQueue() {
    musicQueue = [];
}

module.exports = { addToQueue, addToFrontOfQueue, getNextQueue, getQueueTitles, getQueue, clearQueue };
