const util = require('util');
const chalk = require('chalk');
const fs = require('fs-extra');
const { exec } = require('child_process');

const execP = util.promisify(exec);

const PREVIEW_REPO = 'https://github.com/zombieJ/antd-preview.git';

const ref = process.argv[process.argv.length - 1];
console.log('Current ref:', chalk.yellow(ref));

const match = ref.match(/pull\/(\d+)\/merge/);
const pullRequestId = match && match[1];

async function run() {
  if (pullRequestId) {
    const pullRequestPath = `./_tmp/${pullRequestId}`;

    fs.removeSync('./_tmp');
    console.log('Build site...');
    const buildSpawn = exec('npm run site', {
      env: {
        ...process.env,
        ROOT_PATH: `/_tmp/${pullRequestId}/`,
      },
    });

    buildSpawn.stdout.pipe(process.stdout);
    buildSpawn.stderr.pipe(process.stderr);

    buildSpawn.on('exit', async function buildExit(code) {
      console.log('Build with code:', code);
      console.log('Clone preview repo...');
      const cloneExec = await execP(`git clone ${PREVIEW_REPO} _tmp`);
      console.log(cloneExec.stdout || cloneExec.stderr);

      fs.removeSync(pullRequestPath);
      fs.copySync('./_site', pullRequestPath);
    });
  } else {
    console.log('Not match pull request...exit');
  }
}

run();
