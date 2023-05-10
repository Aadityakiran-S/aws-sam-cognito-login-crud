const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { config } = require('chai');

const client = new CognitoIdentityProviderClient(config);

const params = {
    UserPoolId: 'ap-south-1_LqLoBIsNc',
    Username: 'aadityakiran.s@gmail.com',
    DesiredDeliveryMediums: ['EMAIL'],
    TemporaryPassword: 'password',
    UserAttributes: [
        { Name: 'email', Value: 'aadityakiran.s@inapp.com' }
    ]
};

const command = new AdminCreateUserCommand(params);
let response;
try {
    response = client.send(command);
} catch (error) {
    console.log(error);
    console.log(JSON.stringify(response));
}

