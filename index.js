#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const shell = require('shelljs');

program
  .version(packageJson.version)
  .arguments('<name>')
  .action(function(name) {
    shell.exec(`npx create-react-app ${name}`, function() {
      shell.cd(name);

      const projectPackageJson = {
        ...JSON.parse(shell.cat('package.json')),
        'lint-staged': {
          'src/**/*.js': ['eslint --fix', 'git add'],
        },
        husky: {
          hooks: {
            'pre-commit': 'lint-staged',
          },
        },
      };

      shell
        .ShellString(JSON.stringify(projectPackageJson, null, 2))
        .to('package.json');

      shell.rm('-rf', '.git');
      shell.cp('-rf', __dirname + '/template/root/*', '.');
      shell.cp('-rf', __dirname + '/template/root/.*', '.');
      shell.rm('-r', 'src/*');
      shell.cp('-rf', __dirname + '/template/src/*', 'src/');

      const devDependencies = [
        'dotenv',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'husky',
        'lint-staged',
        'prettier',
        'prop-types',
      ].join(' ');
      const useYarn = shell.ls().includes('yarn.lock');
      shell.exec(
        `${useYarn ? 'yarn add' : 'npm install'} -D ${devDependencies}`
      );
    });
  })
  .parse(process.argv);
