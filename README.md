# FEEL DISCORD BOT

한국공학대학교 중앙밴드동아리 FEEL에서 사용하기 위해 만든 디스코드봇이다.

제작자: 조승민(24기)

---
## 사용법

로컬에서 실행 => src 폴더를 열자마자 있는 index.js를 사용
서버에서 실행 => git clone으로 옮긴 뒤 폴더에 들어가서 'docker-compose up --build -d' 명령어 사용. 끌때는 docker-compose down

---
### 주의할점
+ .gitignor에 포함되어있는 파일들은 보안을 위해 직접 생성해야 함. 리눅스 서버에서 사용시 편집기는 nano를 쓰지 말고 vi를 쓸 것.(nano로 복붙하면 오류생김)
+ 군대가있는 본인 대신 코드를 유지보수를 할 사람은 디코봇을 직접 생성하는것이 좋다(기존디코봇 추방). 어짜피 github으로 TOKEN공유도 불가능.
+ 디코봇을 2개 생성해서 하나는 실사용용 하나는 개인 서버에 테스트용으로 사용하는것이 좋다. 환경변수로 테스트모드 실행가능.(1: 테스트모드, 0: 실행모드)  
+ discord portal에 있는 bot 섹션에 있는 버튼 다켜야함.
+ 봇의 모든 기능을 활성화 시키기 위해서는 oauth2 인증이 필요함. oauth2-authenciation.js 파일을 로컬에서 실행시킨 후 봇을 추가해야함.
+ 봇 추가시 URL Genrator에서 scopes 설정이 필요. 'identify, email, connections, bot, applications.commands, applications.commands.permissions.update' 옵션 설정. 필요에 따라 조정. BOT PERMISSIONS 는 administrator로.
+ 동방사용시간표를 가져오기 위해선 credentials.json 파일을 schedule 폴더 안에 생성해야함. googleapi 사용법 공부ㄱㄱ 금방함.

---
**파일 작성템플릿**

실제값은 삭제함 직접넣으셈

```
// .env
MODE=// 1 or 0
PORT=1500
    
CLIENT_ID=
CLIENT_SECRET=
TOKEN=
SCHEDULE_CHANNEL=
MUSIC_CHANNEL=

TEST_CLIENT_ID=
TEST_CLIENT_SECRET=
TESTTOKEN=
TEST_SCHEDULE_CHANNEL=
TEST_MUSIC_CHANNEL=
```

```
// docker-compose.yml
version: '3'
services:
  bot:
    build: .
    container_name: feel-test
    image: feel-test
    restart: always
    network_mode: host
```

```
// credentials.json
{
  "type": "",
  "project_id": "",
  "private_key_id": "",
  "private_key": "-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": "",
  "universe_domain": ""
}
```