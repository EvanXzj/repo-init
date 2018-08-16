const {statSync} = require('fs')
const {basename} = require('path')

const utils = exports

utils.isEmpty = (str) => {
  return (typeof str === 'string' || str instanceof String) && str.length === 0
}

utils.without = (arr, ...values) => arr.reduce((acc, val) => {
  if (!values.includes(val)) {
    acc.push(val)
  }

  return acc
}, [])

utils.getCurrentDirectoryBase = () => basename(process.cwd())

utils.checkDirctroyExists = (filePath) => {
  try {
    return statSync(filePath).isDirectory()
  } catch (error) {
    return false
  }
}
