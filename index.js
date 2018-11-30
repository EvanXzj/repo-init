#!/usr/bin/env node

const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')

const {checkDirctroyExists} = require('./lib/utils')
const {createReomteRepository, createGitIgnore, setupRepository} = require('./lib/repo')
const {
  getStoredGithubToken,
  setGithubCredentials,
  createNewToken,
  githubAuthenticate,
  getAccessToken
} = require('./lib/auth')

// clear terminal screen
clear()

// print cli name
console.log()
console.log(chalk.yellow(figlet.textSync('Repo Init CLI', {horizontalLayout: 'full'})))

// Check the current folder isn’t already a Git repository
if (checkDirctroyExists('.git')) {
  console.log()
  console.log(chalk.red('The current directory already was git repository!'))
  process.exit(0)
}

// get github token
const getGithubToken = async () => {
  // Fetch token from config store
  let token = getStoredGithubToken()

  if (token) return token

  // No token found, use credentials to access GitHub account
  await setGithubCredentials()

  const accessToken = await getAccessToken()
  if (accessToken) {
    return accessToken
  }

  // No access token found, register a new one
  token = await createNewToken()

  return token
}

const main = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken()
    githubAuthenticate(token)

    // Create remote repository
    const url = await createReomteRepository()

    // Create .gitignore file
    await createGitIgnore()

    // Set up local repository and push to remote
    const done = await setupRepository(url)

    if (done) {
      console.log(chalk.green('All done!'))
    }
  } catch (error) {
    if (error) {
      switch (error.code) {
        case 401:
          console.log(chalk.red("Couldn't log you in. Please provide correct credentials/token."))
          break
        case 422:
          console.log(chalk.red('There already exists a remote repository with the same name'))
          break
        default:
          console.log(error.message)
      }
    }
  }
}

main()
