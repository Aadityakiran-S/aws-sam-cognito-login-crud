const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({ region: 'ap-south-1' });
AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

var authParams = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: '7hmno6nbv8pat1sd3ikjfvh7sr',
    AuthParameters: {
        USERNAME: 'aadityakiran.s@inapp.com',
        PASSWORD: 'password'
    }
};

cognitoidentityserviceprovider.initiateAuth(authParams, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log(data);
    }
});
