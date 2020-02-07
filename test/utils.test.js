/* eslint-env jest */
const { getCredentials, getStsCommand, getObjFromStdout, editAwsCredentials } = require('../bin/utils')

describe('getCredentials()', () => {
  test('credentials are returned in the correct format', () => {
    const actual = getCredentials('exampleKeyId', 'exampleSecretAccess', 'exampleToken')
    const expected = `
  [toop-mfa]
  aws_access_key_id = exampleKeyId
  aws_secret_access_key = exampleSecretAccess
  aws_session_token = exampleToken`

    expect(actual).toEqual(expected)
  })
})

describe('getStsCommand()', () => {
  test('command is generated in correct format without profile', () => {
    const actual = getStsCommand('exampleMfaCode', 'exampleDevice', 'exampleTimeout')
    const expected = 'aws sts get-session-token --serial-number exampleDevice --token-code exampleMfaCode --duration-seconds exampleTimeout'

    expect(actual).toBe(expected)
  })

  test('command is generated in correct format with profile', () => {
    const actual = getStsCommand('exampleMfaCode', 'exampleDevice', 'exampleTimeout', 'exampleProfile')
    const expected = 'aws sts get-session-token --serial-number exampleDevice --token-code exampleMfaCode --duration-seconds exampleTimeout --profile exampleProfile'

    expect(actual).toBe(expected)
  })
})

describe('getObjFromStdout()', () => {
  test('non json stdout throws an error', () => {
    const badStdout = `{
      "Credent
          "SecretAccessKey": "sadfasdf+exampleklasjdfkasd:", 
          "SessionToken": "sadfasdf+exampleklasjdfkasd:", 
          "Expiration": "1970-01-01T09:00:00Z", 
          "AccessKeyId": "sadfasdf+exampleklasjdfkasd:"
      }
    }`

    expect(() => {
      getObjFromStdout(badStdout)
    }).toThrow()
  })

  test('good json stdout returns a valid object', () => {
    const goodStdout = `{
      "Credentials": {
          "SecretAccessKey": "sadfasdf+exampleklasjdfkasd:", 
          "SessionToken": "sadfasdf+exampleklasjdfkasd:", 
          "Expiration": "1970-01-01T09:00:00Z", 
          "AccessKeyId": "sadfasdf+exampleklasjdfkasd:"
      }
    }`

    const actual = getObjFromStdout(goodStdout)
    const expected = {
      SecretAccessKey: 'sadfasdf+exampleklasjdfkasd:',
      SessionToken: 'sadfasdf+exampleklasjdfkasd:',
      Expiration: '1970-01-01T09:00:00Z',
      AccessKeyId: 'sadfasdf+exampleklasjdfkasd:'
    }
    expect(actual).toEqual(expect.objectContaining(expected))
  })
})

describe('editAwsCredentials()', () => {
  test('can write new data correctly', () => {
    const testDir = __dirname + '/helpers/fakeCredentials'
    const exampleMfaProfile = `
[toopMFA]
aws_access_key_id = test
aws_secret_access_key = test
aws_session_token = test`

    const expected = `aws_access_key_id = test
aws_secret_access_key = test

[test]
aws_access_key_id = test
aws_secret_access_key = test
aws_session_token = test

[toopMFA]
aws_access_key_id = test
aws_secret_access_key = test
aws_session_token = test`

    editAwsCredentials(testDir, exampleMfaProfile)

    const checkFile = function () {
      expect(actual).toEqual(expected)
    }

    setTimeout(function(){ checkFile }, 100);
  })
})
