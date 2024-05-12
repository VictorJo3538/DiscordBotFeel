const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 검색어 설정
  const searchQuery = '누디스코';

  // YouTube 검색 페이지로 이동
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // HTML 가져오기
  const html = await page.content();
  const $ = cheerio.load(html);

  // 첫 번째 비디오 URL 추출
  const firstVideoUrl = $('ytd-video-renderer a.yt-simple-endpoint').attr('href');
  const videoUrl = `https://www.youtube.com${firstVideoUrl}`;

  console.log(`첫 번째 비디오 URL: ${videoUrl}`);

  await browser.close();
})();