/* eslint-env jest */
const { getCredentials, getStsCommand, getObjFromStdout, editAwsCredentials } = require('../bin/utils')
const fs = require('fs').promises

const exampleProfile = `
[testProfileMFA]
aws_access_key_id = exampleKeyId
aws_secret_access_key = exampleSecretAccess
aws_session_token = exampleToken`

describe('getCredentials()', () => {
  test('credentials are returned in the correct format', () => {
    const actual = getCredentials('exampleKeyId', 'exampleSecretAccess', 'exampleToken', 'testProfile')
    const expected = exampleProfile

    expect(actual).toEqual(expected)
  })

  test('credentials are returned in the correct format for default profile', () => {
    const actual = getCredentials('exampleKeyId', 'exampleSecretAccess', 'exampleToken')
    const expected = `
[defaultMFA]
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
  const stdout = `{
    "Credentials": {
        "SecretAccessKey": "sadfasdf+exampleklasjdfkasd:", 
        "SessionToken": "sadfasdf+exampleklasjdfkasd:", 
        "Expiration": "1970-01-01T09:00:00Z", 
        "AccessKeyId": "sadfasdf+exampleklasjdfkasd:"
    }
  }`

  test('non json stdout throws an error', () => {
    const badStdout = stdout + '}'

    expect(() => {
      getObjFromStdout(badStdout)
    }).toThrow()
  })

  test('good json stdout returns a valid object', () => {
    const goodStdout = stdout

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
  const testDir = __dirname + '/helpers/fakeCredentials'
  const testFileContent = `aws_access_key_id = test
aws_secret_access_key = test` + exampleProfile

  afterEach(async () => {
    await fs.writeFile(testDir, testFileContent)
  })

  test('generation of new mfa for a pre-existing mfa generated profile should overwrite', async () => {
    let expected = await fs.readFile(testDir, 'utf8')    
    await editAwsCredentials(testDir, exampleProfile)
    let actual = await fs.readFile(testDir, 'utf8')  
    expect(actual).toEqual(expected)
  })

  test('different profile mfa creation should not overwrite any other profiles', async () => {
    let profile = exampleProfile.split(/\r?\n/)
    profile[1] = '[testProfile2MFA]'
    let profile2 = profile.join('\n')
    let expected = await fs.readFile(testDir, 'utf8') 
    expected += profile2
    await editAwsCredentials(testDir, profile2)
    let actual = await fs.readFile(testDir, 'utf8') 
    expect(actual).toEqual(expected)
  })
})
