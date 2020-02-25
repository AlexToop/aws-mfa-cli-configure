#!/usr/bin/env node

const yargs = require('yargs')
const { exec } = require('child_process')
const os = require('os')

const { getCredentials, getStsCommand, getObjFromStdout, editAwsCredentials } = require('./utils')

const awsCredentialsDir = os.homedir() + '/.aws/credentials'

const options = yargs
  .usage('Usage: -m <mfa> -d <device>')
  .option('m', { alias: 'mfa', describe: 'MFA Code for account', type: 'string', demandOption: true })
  .option('d', { alias: 'device', describe: 'ARN of Auth device', type: 'string', demandOption: true })
  .option('t', { alias: 'timeout', describe: 'Timeout time for mfa, min 900 seconds, max 360000', type: 'number', demandOption: false })
  .option('p', { alias: 'profile', describe: 'aws config profile to create mfa auth for', type: 'string', demandOption: false })
  .argv

const timeout = options.timeout || 43200

const callAwsCredentialsStdout = function (stsCommand, callback) {
  exec(stsCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(error ? `error: ${error.message}` : `stderr: ${stderr}`)
      return
    }
    callback(stdout)
  })
}

const processReturnedStdout = async function (awsStdout) {
  const credentials = getObjFromStdout(awsStdout)
  const profile = getCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken, options.profile)
  const output = await editAwsCredentials(awsCredentialsDir, profile)
  console.log(`Success! Use the following profile: ${output}`)
}

const stsCommand = getStsCommand(options.mfa, options.device, timeout, options.profile)
callAwsCredentialsStdout(stsCommand, processReturnedStdout)
