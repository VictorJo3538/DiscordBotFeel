// search.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getUrl(searchQuery) {
  let browser;
  try {
    // 새로운 브라우저 인스턴스 생성 (Linux 환경에서 동작하도록 설정)
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Linux에서 필요한 옵션
    });
    const page = await browser.newPage();

    // 유튜브 검색 결과 페이지 열기
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // HTML 가져오기
    const html = await page.content();
    const $ = cheerio.load(html);

    // 첫 번째 비디오 URL 추출
    const firstVideoUrl = $('ytd-video-renderer a.yt-simple-endpoint').attr('href');
    const videoUrl = `https://www.youtube.com${firstVideoUrl}`;

    return videoUrl;
  } catch (error) {
    console.error('유튜브 검색 결과를 가져오는 중 오류 발생:', error);
    return null;
  } finally {
    // 브라우저 인스턴스 종료
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { getUrl };