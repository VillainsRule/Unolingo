import axios from 'axios';
import c from 'ansi-colors';
import Enquirer from 'enquirer';

let enquirer = new Enquirer();

const completeLesson = async (login, time) => {
    const session = await axios.post('https://www.duolingo.com/2017-06-30/sessions', {
        challengeTypes: [
            'assist',
            'characterIntro',
            'characterMatch',
            'characterPuzzle',
            'characterSelect',
            'characterTrace',
            'characterWrite',
            'completeReverseTranslation',
            'definition',
            'dialogue',
            'extendedMatch',
            'extendedListenMatch',
            'form',
            'freeResponse',
            'gapFill',
            'judge',
            'listen',
            'listenComplete',
            'listenMatch',
            'match',
            'name',
            'listenComprehension',
            'listenIsolation',
            'listenSpeak',
            'listenTap',
            'orderTapComplete',
            'partialListen',
            'partialReverseTranslate',
            'patternTapComplete',
            'radioBinary',
            'radioImageSelect',
            'radioListenMatch',
            'radioListenRecognize',
            'radioSelect',
            'readComprehension',
            'reverseAssist',
            'sameDifferent',
            'select',
            'selectPronunciation',
            'selectTranscription',
            'svgPuzzle',
            'syllableTap',
            'syllableListenTap',
            'speak',
            'tapCloze',
            'tapClozeTable',
            'tapComplete',
            'tapCompleteTable',
            'tapDescribe',
            'translate',
            'transliterate',
            'transliterationAssist',
            'typeCloze',
            'typeClozeTable',
            'typeComplete',
            'typeCompleteTable',
            'writeComprehension'
        ],
        fromLanguage: login.fromLanguage,
        isFinalLevel: false,
        isV2: true,
        juicy: true,
        learningLanguage: login.learningLanguage,
        smartTipsVersion: 2,
        type: 'GLOBAL_PRACTICE'
    }, {
        headers: {
            Authorization: `Bearer ${login.token}`,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    });

    await new Promise(resolve => setTimeout(resolve, time));

    const response = await axios.put(`https://www.duolingo.com/2017-06-30/sessions/${session.data.id}`, {
        ...session.data,
        heartsLeft: 0,
        startTime: (+new Date() - 60000) / 1000,
        enableBonusPoints: false,
        endTime: +new Date() / 1000,
        failed: false,
        maxInLessonStreak: 9,
        shouldLearnThings: true
    }, {
        headers: {
            Authorization: `Bearer ${login.token}`,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    });

    return console.log(c.blue(`🎉 @${login.username} practiced + gained ${response.data.xpGain}x XP.`));
};

const getLessons = async (login) => {
    let { count } = await enquirer.prompt({
        type: 'number',
        name: 'count',
        message: 'how many lessons should be done?'
    });

    count = Math.floor(count);
    if (count < 1) return getLessons();

    let { delay } = await enquirer.prompt({
        type: 'number',
        name: 'delay',
        message: 'what is the lesson delay (seconds)?'
    });

    delay = Math.floor(delay) * 1000;

    let { time } = await enquirer.prompt({
        type: 'number',
        name: 'time',
        message: 'how long should lessons take (seconds)?'
    });

    time = Math.floor(time) * 1000;

    for (let i = 0; i < count; i++) {
        if (i % 9 === 0) {
            let { data: lb } = await axios.get(`https://duolingo-leaderboards-prod.duolingo.com/leaderboards/7d9f5dd1-8423-491a-91f2-2532052038ce/users/${login.userID}`, {
                headers: {
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    Authorization: `Bearer ${login.token}`,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                }
            });

            let user = lb?.active?.cohort?.rankings?.find?.(r => r.user_id === Number(login.userID));

            if (user) console.log(c.cyan(`😏 @${login.username} has ${user.score.toLocaleString()} XP on this board!`));
            else console.log(c.cyan(`😔 @${login.username} isn't on the boards yet.`));
        };

        await completeLesson(login, time);
        await new Promise((resolve) => setTimeout(resolve, delay));
    };
};

const loginSequence = async () => {
    let { loginMethod } = await enquirer.prompt({
        type: 'select',
        name: 'loginMethod',
        message: 'how would you like to login?',
        choices: ['token', 'load existing']
    });

    let login = await (await import(`./logins/${loginMethod.split(' ')[0]}.js`)).default(enquirer);
    if (login) getLessons(login);
    else loginSequence();
};

loginSequence();
