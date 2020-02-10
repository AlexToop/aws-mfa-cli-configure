const fs = require('fs').promises

const getCredentials = function (keyId, secretAccess, token, profile) {
  return `
[${profile ? profile : 'default'}MFA]
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

const editAwsCredentials = async function (awsCredentialsDir, credentials) {
  let currentFileContents = await fs.readFile(awsCredentialsDir, 'utf8')
  const linesOfFile = currentFileContents.split(/\r?\n/)
  const linesOfCredentials = credentials.split(/\r?\n/)
  const profile = linesOfCredentials[1]

  let found = false
  for (let i = 0; i < linesOfFile.length; i++) {
    if (linesOfFile[i] === profile) {
      found = true
      linesOfFile[i + 1] = linesOfCredentials[2]
      linesOfFile[i + 2] = linesOfCredentials[3]
      linesOfFile[i + 3] = linesOfCredentials[4]
    }
    if (found) {
      break;
    }
  }
  currentFileContents = linesOfFile.join('\n')
  const toWrite = (found) ? currentFileContents : currentFileContents + credentials
  await fs.writeFile(awsCredentialsDir, toWrite)
  return profile
}

module.exports = {
  getCredentials,
  getStsCommand,
  getObjFromStdout,
  editAwsCredentials
}
