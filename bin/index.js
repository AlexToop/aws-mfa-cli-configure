#!/usr/bin/env node

const yargs = require('yargs')
const { exec } = require('child_process')

const timeout = 900

const options = yargs
  .usage('Usage: -m <mfa> -d <device>')
  .option('m', { alias: 'mfa', describe: 'MFA Code for account', type: 'string', demandOption: true })
  .option('d', { alias: 'device', describe: 'ARN of Auth device', type: 'string', demandOption: true })
  .option('p', { alias: 'profile', describe: 'aws config profile to create mfa auth for', type: 'string', demandOption: false })
  .argv

const getStsCommand = function (mfaCode, device, timeout, profile) {
  let baseCommand = `aws sts get-session-token --serial-number ${device} --token-code ${mfaCode} --duration-seconds ${timeout}`
  if (profile) {
    baseCommand += ` --profile ${profile}`
  }
  return baseCommand
}

const processAwsCredentials = function (stsCommand, callback) {
  exec(stsCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(error ? `error: ${error.message}` : `stderr: ${stderr}`)
      return 
    } 

    try {
      const credentialsObject = JSON.parse(stdout)
      callback(credentialsObject)
    } catch (e) {
      console.log(`error parsing aws response: ${e}`)
      return 
    }
  })
}

const run = async function (mfa, device, timeout, profile) {
  const onCredentialsReturned = function (credentials) {
    console.log(`success!! ${credentials.SessionToken}`)
  }

  const stsCommand = getStsCommand(mfa, device, timeout, profile)
  processAwsCredentials(stsCommand, onCredentialsReturned)
  
}

run(options.mfa, options.device, timeout, options.profile)
