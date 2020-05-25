# aws-mfa-cli-configure
A command line tool to assist people obtaining and storing multi-factor authentication AWS CLI credentials.

## Prerequisites 

* AWS CLI version 1. 
* Node.js 12+

## Installation

For a global installation:

```
npm install -g git://github.com/AlexToop/aws-mfa-cli-configure.git#v1.0.1
```

MacOS may require the following permissions for global NPM installations:

```
sudo chown -R $USER /usr/local/lib/node_modules
```

Note: If preferred, you can also install this tool within your project itself without the global flag.
    
## Usage

#### Required

NPM will install this script under the alias of `mfa`. 

This command with basic functionality using the following arguments: 

mfa -d `arn-of-mfa-device` -m `mfa code from device`

* It will default to using the default base aws credentials installed (`--profile default`). 
* It will default to a credentials expiration time of 43200 seconds (12 hours).
* Your MFA device arn can be found in your AWS IAM page. It will look similar the following if virtual: `arn:aws:iam::123123123123:mfa/username`.

#### Optional

The following arguments can be added to further specify how to generate the credentials.

-t `timeout in milliseconds` -p `credentials profile to base mfa request from`

#### Outcome

Once this tool has successully run, you will have a authenticated profile added/updated for use with AWS CLI commands. The profile is the name of the base profile with the suffix 'MFA'. If using the default profile, you can use `--profile defaultMFA` at the end of AWS CLI commands for example. 
