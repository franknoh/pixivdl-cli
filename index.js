#!/usr/bin/env node
const pixivdl = require('@franknoh/pixivdl');
const chalk = require('chalk');
const figlet = require('figlet');
const { Command } = require('commander');
const { existsSync, writeFileSync, readFileSync } = require('fs');

const client = new pixivdl.PixivClient();
const program = new Command();

if(!existsSync('./config.json')) {
    writeFileSync('./config.json', JSON.stringify({
        username: '',
        password: ''
    }));
}

program
    .name('pixivdl')
    .description(chalk.cyanBright(figlet.textSync('pixivdl', { horizontalLayout: 'full' })))
    .version(pixivdl.version);

program.command('login')
    .description('login to pixiv')
    .option('-u, --username <username>', 'pixiv username')
    .option('-p, --password <password>', 'pixiv password')
    .action((data) => {
        if(!data.username || !data.password) {
            console.log(chalk.red('username and password are required'));
        } else {
            client.login(data.username, data.password).then(()=>{
                console.log(chalk.green('login success'));
                writeFileSync('./config.json', JSON.stringify({
                    username: data.username,
                    password: data.password
                }));
            }).catch(err => {
                console.log(chalk.red('login failed'));
                console.log(chalk.red(err.message));
            });
        }
    });

program.command('logout')
    .description('logout from pixiv')
    .action(() => {
        writeFileSync('./config.json', JSON.stringify({
            username: '',
            password: ''
        }));
    });

program.command('download')
    .description('download images from pixiv')
    .option('-n, --number <number>', 'number of images to download')
    .option('-t, --tags <tags>', 'tags to search')
    .option('-o, --output <output>', 'output directory')
    .option('-b --bookmarks <bookmarks>', 'download bookmarked images', '0')
    .option('-e --extags <extags>', 'tags to exclude', 'R-18')
    .action((data) => {
        if(!data.number){
            console.log(chalk.red('number is required'));
        }else if(!data.tags) {
            console.log(chalk.red('tags are required'));
        }else if(!data.output) {
            console.log(chalk.red('output directory is required'));
        }else{
            const config = JSON.parse(readFileSync('./config.json').toString());
            if(config.username !== '') {
                client.login(config.username, config.password).then();
            }
            data.tags = data.tags.split(' ');
            data.extags = data.extags.split(' ');
            data.number = parseInt(data.number?data.number:'0');
            data.bookmarks = parseInt(data.bookmarks?data.bookmarks:'0');
            const start_time = Date.now();
            client.download(data.tags, data.number, data.output, data.bookmarks, data.extags).then(()=>{
                const end_time = Date.now();
                setTimeout(()=> {
                    console.log(chalk.green('download success'));
                    console.log(chalk.cyanBright(`downloaded ${data.number} images in ${(end_time - start_time)/1000}s`));
                }, 1000);
            }).catch(err=>{
                console.log(chalk.red('download failed'));
                console.log(chalk.red(err.message));
            })
        }
    });

program.parse();