// 테스트모드
let testMode = undefined;

// 키보드 입력 객체
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('개발 테스트 모드를 실행하시겠습니까? [y/n]: ', (answer) => {
    if (answer.toLowerCase() === 'n') {
        console.log('테스트 모드를 실행하지 않습니다.');
        testMode = false;
        main();
    } else {
        console.log('테스트 모드를 실행합니다.');
        testMode = true;
        main();
    }
    readline.close(); // readline 인터페이스를 닫습니다.
});

function main() {
    const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
    const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
    const { musicEmbed, musicButtons } = require('./musicMsg');
    const puppeteer = require('puppeteer');
    const cheerio = require('cheerio');
    const ytdl = require('ytdl-core');
    const client = new Client({ intents: Object.values(GatewayIntentBits) });

    // 채널 변수 
    let scheduleChannel;
    let musicChannel;

    // 메시지 변수 
    let scheduleMsg;
    let musicMsg;

    // 음악 재생 변수
    let connection = undefined; // 보이스커넥션
    let musicQueue = [];
    let isPaused = false; // 일시 정지 상태를 저장하는 변수

    const { getWarnEmbed } = require('./warnMsg'); // 경고 임베드
    let feel_logo = './feel_logo_black.png'; // 로고파일

    // 봇 시작
    client.on(Events.ClientReady, async () => {
        // 채널선언
        if (testMode) {
            scheduleChannel = client.channels.cache.get('1226476047155859516'); // 테스트 동방시간표 채널
            musicChannel = client.channels.cache.get('1232664579163558058'); // 테스트 음악채널
        } else {
            scheduleChannel = client.channels.cache.get('1226818915997585408'); // 동방시간표 채널
            musicChannel = client.channels.cache.get('1104009403163746396'); // 음악채널
        }

        // 시작 메시지 설정
        console.log(`[${client.user.tag}] 가동중!`);
        client.user.setActivity("수리 및 테스트");

        //합주시간표 가져오기
        await purgeChannel(scheduleChannel); // 동방시간표 채널 메시지 삭제
        const { getScheduleEmbed } = require('./scheduleMsg');
        scheduleMsg = await scheduleChannel.send({ embeds: [await getScheduleEmbed()], files: [feel_logo] }); // 채널에 메시지 전송

        // 1분마다 업데이트. 날짜 바뀌면 메시지 수정
        let previousDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }).split(',')[0];
        setInterval(async () => {
            const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }).split(',')[0];
            if (previousDate !== currentDate) {
                scheduleMsg.edit({ embeds: [await getScheduleEmbed()], files: [feel_logo] }); // 채널에 메시지 전송
                console.log('날짜가 변경되었습니다!');
                previousDate = currentDate;
            }
        }, 60000);

        // 노래채널 메시지
        await purgeChannel(musicChannel); // 음악채널 메시지 삭제
        musicMsg = await musicChannel.send({ embeds: [musicEmbed], components: [musicButtons], files: [feel_logo] });
    });

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

    // 음악 재생 함수
    async function playMusic(connection) {
        if (musicQueue.length === 0) {
            stopMusic();
            musicEmbed.setTitle('음악을 재생할 수 있습니다')
                .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif');
            musicMsg.edit({ embeds: [musicEmbed] });
            return;
        }; // 큐에 음악이 없으면 종료

        const videoInfo = musicQueue.shift(); // 큐에서 다음 음악 정보 가져오기
        const stream = ytdl(videoInfo.videoDetails.video_url, {
            filter: "audioonly",
            fmt: "mp3",
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0, //disabling chunking is recommended in discord bot
            bitrate: 128,
            quality: 'highestaudio',
        }); // YouTube 오디오 스트림 가져오기

        const player = createAudioPlayer();
        const resource = createAudioResource(stream);
        player.play(resource);
        connection.subscribe(player);

        // 메시지 수정
        const thumbnailUrl = videoInfo.videoDetails.thumbnails[0].url.replace('hqdefault.jpg', 'maxresdefault.jpg');;
        musicEmbed.setImage(thumbnailUrl)
            .setTitle(`현재 재생 중: ${videoInfo.videoDetails.title}`);
        musicMsg.edit({ embeds: [musicEmbed] });

        player.on(AudioPlayerStatus.Idle, () => {
            playMusic(connection);
        });
    }

    // 음악 종료 함수
    async function stopMusic() {
        // 현재 재생 중인 음악이 있으면 중지
        if (connection && connection.state.subscription) {
            connection.state.subscription.player.stop();
        }
        // 보이스 커넥션 종료
        if (connection) {
            connection.destroy();
            connection = undefined;
        }
        // 큐 비우기
        musicQueue = [];
    }

    // 음악 일시 중지 함수
    function pauseMusic() {
        // 현재 재생 중인 음악이 있고, 재생 중이면 일시 중지
        if (connection && connection.state.subscription && connection.state.subscription.player.state.status === AudioPlayerStatus.Playing) {
            connection.state.subscription.player.pause();
        }
    }
    function unpauseMusic() {
        // 현재 재생 중인 음악이 있고, 일시 정지 상태인 경우 다시 재생
        if (connection && connection.state.subscription && connection.state.subscription.player.state.status === AudioPlayerStatus.Paused) {
            connection.state.subscription.player.unpause();
        }
    }

    // 메시지
    client.on(Events.MessageCreate, async msg => {
        // 음악채널 메시지
        if (!msg.author.bot && msg.channel === musicChannel) {
            const voiceChannel = msg.member.voice.channel;
            if (voiceChannel == null) {
                const reply = await msg.reply({ embeds: [getWarnEmbed(`<@${msg.author.id}> 음성채널에 입장해주세요`)] });
                setTimeout(() => {
                    reply.delete();
                }, 3000);
            } else {
                try {
                    // 검색어 가공
                    let url = msg.content;
                    if (!url.startsWith('http')) {
                        console.log('음악 검색 중');
                        const reply = await msg.reply({ embeds: [getWarnEmbed('음악 검색에는 어느정도 시간이 걸립니다.')] });
                        url = await getUrl(url);
                        if (url === null) {
                            reply.delete();
                            throw new Error('유효하지 않은 검색결과');
                        }
                        reply.delete();
                    }
                    // 채널 입장
                    connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });

                    // 큐에 음악 추가
                    const info = await ytdl.getInfo(url); // YouTube 동영상의 정보 가져오기
                    musicQueue.push(info);

                    // 음악이 현재 재생 중이지 않으면 재생 시작
                    if (!(connection.state.subscription && connection.state.subscription.player.state.status === AudioPlayerStatus.Playing)) {
                        playMusic(connection);
                    }

                    const reply = await msg.reply({ embeds: [getWarnEmbed(`음악 "${info.videoDetails.title}"을(를) 큐에 추가했습니다!`)] });
                    setTimeout(() => {
                        reply.delete();
                    }, 3000);
                } catch (error) {
                    console.error("오류발생!: ", error);
                    const reply = await msg.reply({ embeds: [getWarnEmbed(`오류발생!: ${error}`)] });
                    setTimeout(() => {
                        reply.delete();
                    }, 3000);
                }
            }
        }

        // 공지채널 채팅방지
        if (!msg.author.bot && (msg.channel === scheduleChannel || msg.channel === musicChannel)) {
            msg.delete();
        }
    });

    // 버튼 입력
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isButton())
            return;
        if (interaction.customId === 'pause_button') {
            if (isPaused) {
                const reply = await interaction.reply({ embeds: [getWarnEmbed('재생이 다시 시작됩니다!')] });
                setTimeout(() => {
                    reply.delete();
                }, 3000);
                unpauseMusic();
                isPaused = false; // 일시 정지 상태 해제
            } else {
                const reply = await interaction.reply({ embeds: [getWarnEmbed('일시 정지되었습니다!')] });
                setTimeout(() => {
                    reply.delete();
                }, 3000);
                pauseMusic();
                isPaused = true; // 일시 정지 상태로 설정
            }
        }
        if (interaction.customId === 'skip_button') {
            const reply = await interaction.reply({ embeds: [getWarnEmbed('스킵 되었습니다!')] });
            setTimeout(() => {
                reply.delete();
            }, 3000);
            playMusic(connection);
        }
        if (interaction.customId === 'stop_button') {
            const reply = await interaction.reply({ embeds: [getWarnEmbed('종료 되었습니다!')] });
            setTimeout(() => {
                reply.delete();
            }, 3000);
            musicEmbed
                .setTitle('음악을 재생할 수 있습니다')
                .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif');
            musicMsg.edit({ embeds: [musicEmbed] });
            stopMusic();
        }
        if (interaction.customId === 'check_queue') {
            // 재생목록이 없는 경우를 처리하기 위해 musicQueue 배열이 비어 있는지 확인합니다.
            if (musicQueue.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('현재 재생목록이 비어 있습니다.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                // musicQueue 배열에 있는 각 음악 정보의 제목을 가져와서 표시합니다.
                const queueTitles = musicQueue.map((info, index) => `${index + 1}. ${info.videoDetails.title}`).join('\n');
                const embed = new EmbedBuilder()
                    .setColor(0x800080)
                    .setTitle('현재 재생목록')
                    .setDescription(queueTitles);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    });

    // 디스코드 봇 로그인
    // const config = require('./config.json');
    require("dotenv").config();
    let token;
    if (testMode) {
        token = process.env.TESTTOKEN;
    } else {
        token = process.env.TOKEN;
    }
    client.login(token);

    // 채팅 삭제 함수
    async function purgeChannel(channel, limit = 100) {
        try {
            const fetchedMessages = await channel.messages.fetch({ limit: limit });
            channel.bulkDelete(fetchedMessages);
            console.log('채널 메시지 삭제완료');
        } catch (error) {
            console.error('메시지 삭제 중 오류가 발생했습니다:', error);
        }
    }

}