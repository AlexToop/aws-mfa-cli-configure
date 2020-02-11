# aws-mfa-cli-configure
A command line tool to assist people obtaining and storing multi-factor authentication AWS CLI credentials.

## Prerequisites 

* AWS CLI version 1. 
* Node.js 12+

## Getting started

Assuming you wish to install this tool for global use:

```
npm install git://github.com/AlexToop/aws-mfa-cli-configure.git#v1.0.0
```

If you have any issues installing node modules globally on MacOS the following command can be used to give your user permission:

```
sudo chown -R $USER /usr/local/lib/node_modules
```
    
### General use

NPM will install this script under the alias of `mfa`. 

This command with basic functionality using the following arguments: 

mfa -d `arn-of-mfa-device` -m `mfa code from device`

That will default to a credentials expiration time of 43200 seconds (12 hours) and to use the default base aws credentials installed. 

The following arguments can be added to further specify how to generate the credentials.

-t `timeout in milliseconds` -p `credentials profile to base mfa request from`
