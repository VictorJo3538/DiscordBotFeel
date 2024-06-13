const express = require('express');
const axios = require('axios');
const url = require('url');
const path = require('path');
const dotenv = require("dotenv");
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath }); // 환경변수 로드

/**
 * oauth2 redirection 인증을 위한 함수. 로컬에서 실행시에만 동작함.
 * @param {*} clientId 
 * @param {*} clientSecret 
 */
function runAuthServer(clientId, clientSecret) { 
    const port = process.env.PORT;
    const app = express();
    app.get('/api/auth/discord/redirect', async (req, res) => {
        const { code } = req.query;

        if (code) {
            try {
                const formData = new url.URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'authorization_code',
                    code: code.toString(),
                    redirect_uri: 'http://localhost:1500/api/auth/discord/redirect', // discord portal에 있는 redirects uri과 동일해야함
                });

                const output = await axios.post('https://discord.com/api/v10/oauth2/token',
                    formData, {
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                    }
                });

                if (output.data) {
                    const access = output.data.access_token;
                    const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
                        headers: {
                            'Authorization': `Bearer ${access}`,
                        }
                    });

                    // refresh token
                    const formData1 = new url.URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        grant_type: 'refresh_token',
                        refresh_token: output.data.refresh_token,
                    });

                    const refresh = await axios.post('https://discord.com/api/v10/oauth2/token',
                        formData1, {
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded',
                        }
                    });

                    console.log(output.data, userInfo.data, refresh.data);

                    // 성공 메시지 전송
                    res.send(`<h1>인증 성공!</h1><p>환영합니다, ${userInfo.data.username}#${userInfo.data.discriminator}!</p>`);
                }
            } catch (error) {
                console.error('인증 중 오류 발생:', error);
                res.send('<h1>인증 실패</h1><p>오류가 발생했습니다. 다시 시도해 주세요.</p>');
            }
        } else {
            res.send('<h1>인증 코드 없음</h1><p>Discord 인증 코드가 제공되지 않았습니다.</p>');
        }
    });

    app.listen(port, () => { console.log(`다음 포트에서 서버 실행중: ${port}`); });
}

module.exports = {
    runAuthServer
}