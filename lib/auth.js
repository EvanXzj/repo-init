/**
 * Module dependencies
 */
const {Spinner} = require('clui')
const pkg = require('../package.json')
const octokit = require('@octokit/rest')()
const ConfigStore = require('configstore')
const {askGithubCredentials, askTokenNote} = require('./inquirer')

const config = new ConfigStore(pkg.name)

module.exports = {
  getInstance: () => octokit,

  githubAuthenticate: (token) => {
    octokit.authenticate({
      type: 'oauth',
      token
    })
  },

  // get exist github auth token(filePath please check configStore package)
  getStoredGithubToken: () => config.get('github.token'),

  setGithubCredentials: async () => {
    const credentials = await askGithubCredentials()

    octokit.authenticate({type: 'basic', ...credentials})
  },

  getAccessToken: async () => {
    const spinner = new Spinner('Getting token locally , please wait...')
    spinner.start()

    const id = config.get('token.id')

    try {
      let response
      if (id) {
        response = await octokit.authorization.get({authorization_id: id})

        return response.data.token
      } else {
        response = await octokit.authorization.getAll()

        if (response.data && Array.isArray(response.data)) {
          const note = config.get('token.note') || 'repo-init'
          response = response.data.find((obj) => obj.token.startsWith(note))

          return response ? response[0].token : undefined
        } else {
          return
        }
      }
    } catch (error) {
      throw error
    } finally {
      spinner.stop()
    }
  },

  // fetch a new token
  createNewToken: async () => {
    const answer = await askTokenNote()

    // start spinner
    const spinner = new Spinner('Token creating, please wait...')
    // spinner.start()

    let note = 'repo-init, the command-line tool for initalizing Git repos'

    if (answer && answer.note) {
      note = answer.note
    }

    try {
      const res = await octokit.authorization.create({
        scopes: ['user', 'public_repo', 'repo', 'repo:status'],
        note
      })

      if (res.data.token) {
        config.set('github.token', res.data.token)
        config.set('token.id', res.data.id)
        config.set('token.note', note.substring(0, 5))

        return res.data.token
      } else {
        throw new Error('Missing Token, GitHub token was not found in the res')
      }
    } catch (error) {
      throw error
    } finally {
      spinner.stop()
    }
  }
}
