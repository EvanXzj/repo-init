const inquirer = require('inquirer')
const {isEmpty, getCurrentDirectoryBase} = require('../utils')

exports.askGithubCredentials = () => {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your GitHub username or email:',
      validate: (value) => {
        if (!isEmpty(value.trim())) {
          return true
        } else {
          return 'Please enter your GitHub username or email'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: (value) => {
        if (!isEmpty(value.trim())) {
          return true
        } else {
          return 'Please enter your password'
        }
      }
    }
  ]

  return inquirer.prompt(questions)
}

exports.askRepoDetails = () => {
  const argv = require('minimist')(process.argv.slice(2))

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for your repository(defauts to current folder name):',
      default: argv._[0] || getCurrentDirectoryBase()
    },
    {
      type: 'input',
      name: 'description',
      default: argv._[1] || null,
      message: 'Optionally enter a description of the repository:'
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Public or private',
      choices: ['public', 'private'],
      defafult: 'public'
    }
  ]

  return inquirer.prompt(questions)
}

exports.askTokenNote = () => {
  const questions = [
    {
      name: 'note',
      type: 'input',
      message: 'Optionly enter your new token note:'
    }
  ]

  return inquirer.prompt(questions)
}

exports.askIgnoreFiles = (filelist) => {
  const questions = [
    {
      type: 'checkbox',
      name: 'ignores',
      message: 'Select the files and/or folders you wish to ignore:',
      choices: filelist,
      defafult: ['node_modules', 'bower_components']
    }
  ]

  return inquirer.prompt(questions)
}
