// node ./scripts/preview-deploy.js refs/pull/1/merge

const util = require('util');
const chalk = require('chalk');
const fs = require('fs-extra');
const { exec } = require('child_process');

const execP = util.promisify(exec);

const PREVIEW_REPO = 'git@github.com:zombieJ/antd-preview.git';

const ref = process.argv[process.argv.length - 1];
console.log('Current ref:', chalk.yellow(ref));

const match = ref.match(/pull\/(\d+)\/merge/);
const pullRequestId = match && match[1];

async function run() {
  if (pullRequestId) {
    const pullRequestPath = `./_tmp/${pullRequestId}`;

    fs.removeSync('./_tmp');
    console.log('Build site...');
    const previewRepo = PREVIEW_REPO.match(/\/([^/.]*)\.git/)[1];
    const buildSpawn = exec('npm run site', {
      env: {
        ...process.env,
        ROOT_PATH: `/${previewRepo}/${pullRequestId}/`,
      },
    });

    buildSpawn.stdout.pipe(process.stdout);
    buildSpawn.stderr.pipe(process.stderr);

    buildSpawn.on('exit', async function buildExit(code) {
      console.log('Build with code:', code);
      console.log('Clone preview repo...');
      const cloneExec = await execP(`git clone ${PREVIEW_REPO} _tmp`);
      console.log(cloneExec.stdout || cloneExec.stderr);

      // Create content
      console.log('Copy site...');
      fs.removeSync(pullRequestPath);
      fs.copySync('./_site', pullRequestPath);

      // Config git account
      /* eslint-disable no-template-curly-in-string */
      console.log('Login git...');
      const gitExec = await execP(
        [
          'git config user.name "${GITHUB_ACTOR}"',
          'git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"',
        ].join('  &&  '),
      );
      /* eslint-enable */
      console.log(gitExec.stdout || gitExec.stderr);

      // Clean up git history
      console.log('Reset preview repo...');
      fs.removeSync('./_tmp/.git');
      const pagesExec = await execP(
        [
          'cd _tmp',
          'git init',
          'git commit --allow-empty -m "Update"',
          'git checkout -b gh-pages',
          'git add .',
          'git commit -am "Update"',
          `git push ${PREVIEW_REPO} gh-pages --force`,
        ].join(' && '),
      );
      console.log(pagesExec.stdout || pagesExec.stderr);

      console.log('Update done...exit');
    });
  } else {
    console.log('Not match pull request...exit');
  }
}

run();
