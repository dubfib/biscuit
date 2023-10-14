const { exec } = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');

const readDir = require('fs-readdir-recursive');

const checkPath = async (path) => fs.pathExists(path);

const delFolder = async (path) => {
    if (await fs.pathExists(path)) {
        await fs.remove(path);
    };
};

(async () => {
    try {
        if (!process.argv[2] || !(await checkPath(process.argv[2]))) {
            throw new Error('Invalid given file!');
        } else if (!(await checkPath(path.join(__dirname, 'config.json')))) {
            throw new Error('Invalid config file!');
        } else {
            console.log(`${chalk.yellow('B')}i${chalk.yellow('s')}c${chalk.yellow('u')}i${chalk.yellow('t')} v${chalk.yellow('1')}.${chalk.yellow('0')} b${chalk.yellow('y')} d${chalk.yellow('u')}b${chalk.yellow('f')}i${chalk.yellow('b')}`);

            const spinner = ora(`Deleting ${chalk.yellow('/output')}`);
            spinner.color = 'yellow';
            spinner.start();

            await delFolder(path.join(__dirname, '/output'));

            const file = path.basename(process.argv[2]);
            spinner.text = `Decompiling ${chalk.yellow(file)}`;

            const procyon = path.join(__dirname, 'procyon.jar');
            const command = `java -jar "${procyon}" -o output "${process.argv[2]}"`;

            exec(command, { silent: true }, async (code) => {
                if (code === 0) {
                    spinner.text = `Analyzing ${chalk.yellow(file)}`;

                    spinner.stop();
                    console.clear();
                    console.log(`- | ${chalk.yellow('Name(s)')} | ${chalk.yellow('File(s)')} | -`);

                    const output = path.join(__dirname, '/output');
                    const files = readDir(output);

                    files.forEach(async (name) => {
                        const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
                        const file = await fs.readFile(path.join(output, name), 'utf8');
                        
                        config.forEach(async (value) => {
                            const found = value.keywords.some(keyword => file.toLowerCase().includes(keyword.toLowerCase()));

                            if (found) {
                                console.log(`- ${chalk.yellow(value.name)} | ${chalk.yellow(name)} -`);
                            };
                        });
                    });
                };
            });
        }
    } catch (error) {
        console.error(error);
    };
})();