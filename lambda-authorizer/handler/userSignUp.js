const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({ region: 'ap-south-1' });
AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

var signupParams = {
    ClientId: '7hmno6nbv8pat1sd3ikjfvh7sr', /* required */
    Password: 'password', /* required */
    Username: 'aadityakiran.s@inapp.com', /* required */
    UserAttributes: [
        {
            Name: 'email', /* required */
            Value: 'aadityakiran.s@inapp.com'
        },
    ]
};
var confirmationParams = {
    UserPoolId: 'ap-south-1_LqLoBIsNc', /* required */
    Username: 'aadityakiran.s@inapp.com', /* required */
};

async function signUpAndConfirm(signUpParams, confirmParams) {
    try {
        const signUpResult = await new Promise((resolve, reject) => {
            cognitoidentityserviceprovider.signUp(signUpParams, function (err, data) {
                if (err) {// an error occurred
                    console.log(err, err.stack);
                    reject(err);
                }
                else {// successful response
                    console.log(data);
                    resolve(data);
                }
            });
        })
        console.log(signUpResult);

        const confirmResult = await new Promise((resolve, reject) => {
            cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
        console.log(confirmResult);
    }
    catch (err) {
        console.log(err, err.stack);
    }
}

signUpAndConfirm(signupParams, confirmationParams);