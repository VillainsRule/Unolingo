import fs from 'node:fs';
import path from 'node:path';
import c from 'ansi-colors';

export default async (enquirer) => {
    let cacheDir = fs.readdirSync(path.join(import.meta.dirname, '../../.cache/'));
    if (!cacheDir) {
        console.log(c.red('😡 no cookies found.'));
        return false;
    };

    let cacheFile = fs.readFileSync(path.join(import.meta.dirname, '../../.cache/tokens.json'), 'utf8');
    if (!cacheFile) {
        console.log(c.red('😡 no cookies found.'));
        return false;
    };

    let accounts = JSON.parse(cacheFile);

    let { name } = await enquirer.prompt({
        type: 'select',
        name: 'name',
        message: 'select your account',
        choices: Object.values(accounts).map(a => a.username)
    });

    let accountInfo = Object.entries(accounts).find(a => a[1].username === name);
    return { ...accountInfo[1], userID: accountInfo[0] };
}