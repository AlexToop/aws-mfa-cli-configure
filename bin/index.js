#!/usr/bin/env node

const yargs = require('yargs')
const { exec } = require('child_process')

const { getCredentials, getStsCommand, getObjFromStdout, editAwsCredentials } = require('./utils')

const awsCredentialsDir = process.env.HOME + '/.aws/credentials'
const timeout = 900

const options = yargs
  .usage('Usage: -m <mfa> -d <device>')
  .option('m', { alias: 'mfa', describe: 'MFA Code for account', type: 'string', demandOption: true })
  .option('d', { alias: 'device', describe: 'ARN of Auth device', type: 'string', demandOption: true })
  .option('p', { alias: 'profile', describe: 'aws config profile to create mfa auth for', type: 'string', demandOption: false })
  .argv

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
  const profile = getCredentials(credentials.AccessKeyId, credentials.SecretAccessKey, credentials.SessionToken)
  const output = await editAwsCredentials(awsCredentialsDir, profile, onWritten)
}

const stsCommand = getStsCommand(options.mfa, options.device, timeout, options.profile)
callAwsCredentialsStdout(stsCommand, processReturnedStdout)
