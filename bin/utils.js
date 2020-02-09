const fs = require('fs').promises

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

const editAwsCredentials = async function (awsCredentialsDir, credentials, callback) {
  await fs.appendFile(awsCredentialsDir, credentials)
  return fs.readFile(awsCredentialsDir, 'utf8')
}

module.exports = {
  getCredentials,
  getStsCommand,
  getObjFromStdout,
  editAwsCredentials
}
