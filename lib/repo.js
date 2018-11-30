const fs = require('fs')
const touch = require('touch')
const {Spinner} = require('clui')
const git = require('simple-git')()

const {without, getCurrentDirectoryBase} = require('./utils')

const {getInstance} = require('./auth')
const {askRepoDetails, askIgnoreFiles} = require('./inquirer')

exports.createReomteRepository = async () => {
  const github = getInstance()
  const res = await askRepoDetails()

  const data = {
    name: res.name || getCurrentDirectoryBase(),
    description: res.description,
    private: res.visibility === 'private'
  }

  const spinner = new Spinner('Remote repository creating...')
  spinner.start()

  try {
    const response = await github.repos.create(data)

    return response.data.ssh_url
  } catch (error) {
    throw error
  } finally {
    spinner.stop()
  }
}

exports.createGitIgnore = async () => {
  const filelist = await without(fs.readdirSync('.'), '.git', '.gitignore')

  if (filelist.length) {
    const answers = await askIgnoreFiles(filelist)

    if (answers.ignores.length) {
      fs.writeFileSync('.gitignore', answers.ignores.join('\n'))
    } else {
      touch('.gitignore')
    }
  } else {
    touch('.gitignore')
  }
}

exports.setupRepository = async (url) => {
  const spinner = new Spinner('Initializing local repository and pushing to remote...')
  spinner.start()

  try {
    await git
      .exec()
      .init()
      .add('.gitignore')
      .add('./*')
      .commit('Initial commit')
      .addRemote('origin', url)
      .push(['-u', 'origin', 'master'])

    return true
  } catch (error) {
    throw error
  } finally {
    spinner.stop()
  }
}
