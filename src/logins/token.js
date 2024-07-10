import fs from 'node:fs';
import path from 'node:path';
import c from 'ansi-colors';
import axios from 'axios';

export default async (enquirer) => {
    let { cookie } = await enquirer.prompt({
        type: 'input',
        name: 'cookie',
        message: 'what is your duolingo cookie?'
    });

    let { jwt_token: jwtToken } = Object.fromEntries(cookie.split('; ').map(cookie => cookie.split('=').map(decodeURIComponent)));
    if (!jwtToken) return console.log(c.red('😡 invalid cookie.')) && false;

    let { sub: userID } = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString());
    if (!userID) return console.log(c.red('😡 invalid cookie.')) && false;

    try {
        let { data: user } = await axios.get('https://www.duolingo.com/2017-06-30/users/' + userID, {
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });

        let cacheDir = fs.existsSync(path.join(import.meta.dirname, '../../.cache/'));
        if (!cacheDir) fs.mkdirSync(path.join(import.meta.dirname, '../../.cache/'));

        let cacheFile = fs.existsSync(path.join(import.meta.dirname, '../../.cache/tokens.json'), 'utf8');
        if (cacheFile) cacheFile = fs.readFileSync(path.join(import.meta.dirname, '../../.cache/tokens.json'), 'utf8');
        else cacheFile = '{}';

        let accounts = JSON.parse(cacheFile);
        accounts[userID] = {
            username: user.username,
            fromLanguage: user.fromLanguage,
            learningLanguage: user.learningLanguage,
            token: jwtToken
        };

        fs.writeFileSync(path.join(import.meta.dirname, '../../.cache/tokens.json'), JSON.stringify(accounts, null, 4));

        console.log(c.green('🎉 logged in successfully.'));
        return { userID, ...accounts[userID] };
    } catch (e) {
        console.log(e);
        console.log(c.red('😡 invalid user ID in cookie.'));
        return false;
    };
}