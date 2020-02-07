const fs = require('fs')

const getCredentials = function (keyId, secretAccess, token) {
  return `
  [toopMFA]
  aws_access_key_id = ${keyId}
  aws_secret_access_key = ${secretAccess}
  aws_session_token = ${token}`
}

const getStsCommand = function (mfaCode, device, timeout, profile) {
  let baseCommand = `aws sts get-session-token --serial-number ${device} --token-code ${mfaCode} --duration-seconds ${timeout}`
  if (profile) {
    baseCommand += ` --profile ${profile}`
  }
  return baseCommand
}

const getObjFromStdout = function (stdout) {
  const credentialsObject = JSON.parse(stdout).Credentials
  return credentialsObject
}

const editAwsCredentials = function (awsCredentialsDir, credentials) {
  console.log(awsCredentialsDir)
  fs.readFile(awsCredentialsDir, 'utf-8', (err, data) => {
    if (err) { console.log(err) }
    console.log(data)
  })
  fs.appendFile(awsCredentialsDir, credentials, function (err) {
    if (err) throw err
    console.log('written...')
  })
}

module.exports = {
  getCredentials,
  getStsCommand,
  getObjFromStdout,
  editAwsCredentials
}
