// ## https://deploy-preview-20290--ant-design.netlify.com/

// echo "Deploy to netlify..."
// cd _site
// zip -r site.zip *

// sha=

// site_url = "https://api.netlify.com/api/v1/sites/mysite.netlify.com/deploys"

// # curl -H "Content-Type: application/zip" \
// #      -H "Authorization: Bearer my-api-access-token" \
// #      --data-binary "site.zip" \
// #      https://api.netlify.com/api/v1/sites/mysite.netlify.com/deploys

const chalk = require('chalk');
const exec = require('child_process').exec;

const ref = process.argv[process.argv.length - 1];
console.log('Current ref:', chalk.yellow(ref));

const match = ref.match(/pull\/(\d+)\/merge/);
const pullRequestId = match && match[1];

if (pullRequestId) {
  const url = `workflow-preview-${pullRequestId}-ant-design.netlify.com`;

  const deployScript = [
    'curl',
    '-H "Content-Type: application/zip"',
    `-H "Authorization: Bearer ${process.env.token}"`,
    '--data-binary "site.zip"',
    `https://api.netlify.com/api/v1/sites/${url}/deploys`,
  ].join(' ');

  console.log('Current pull request:', pullRequestId);
  console.log(chalk.yellow(`deploy to site: ${url}`));
  console.log(deployScript);
  exec(`cd _site && zip -r site.zip * && ${deployScript}`, function ret(err, stdout, stderr) {
    if (err) {
      process.exit(err);
    }
    console.log(stdout);

    console.log('done...');
  });
} else {
  console.log('Not match pull request...exit');
}
