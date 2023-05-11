const AWS = require("aws-sdk");
const ENTRY_DB = process.env.ENTRY_DB;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');
require('dotenv').config();

//#region Signup and Login Params
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
var authParams = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: '7hmno6nbv8pat1sd3ikjfvh7sr',
    AuthParameters: {
        USERNAME: 'aadityakiran.s@inapp.com',
        PASSWORD: 'password'
    }
};
//#endregion

//#region AWS credential configuration
AWS.config.update({ region: 'ap-south-1' });
AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
//#endregion

var client = new AWS.CognitoIdentityServiceProvider();

exports.listAllEntries = async (event, context) => {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    let body; let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    const params = {
        TableName: ENTRY_DB,
    };
    try {
        body = await dynamoDb.scan(params).promise();
    } catch (error) {
        statusCode = 400;
        body = error.message;
        console.log(error);
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

exports.createEntry = async (event, context) => {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    let body = {}; let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    const params = {
        TableName: ENTRY_DB,
        Item: {
            id: `${uuid.v1()}`,
            name: data.name,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    try {
        body = await dynamoDb.put((params)).promise();
        body.message = `Successfully created entry with name ${data.name}`;
    } catch (err) {
        statusCode = 400;
        body = err.message;
        console.log(err);
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};

exports.getEntry = async (event, context) => {
    let body = {}; let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    const params = {
        TableName: ENTRY_DB,
        Key: {
            id: `${event.pathParameters.id}`
        }
    };

    try {
        body = await dynamoDb.get(params).promise();
    } catch (err) {
        statusCode = 400;
        body = err.message;
        console.log(err);
    } finally {
        //A log to see if item with given key exists
        if (body.Item == undefined || body.Item == null) {
            body.message = `Item with id ${event.pathParameters.id} DNE`;
        }
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

exports.updateEntry = async (event, context) => {
    const timestamp = new Date().getTime();
    let body = {};
    const data = JSON.parse(event.body);
    console.log({ data });
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    //#region  Error check to see if item with given ID exists
    const getItemParams = {
        TableName: ENTRY_DB,
        Key: {
            id: event.pathParameters.id
        }
    };

    console.log("Hello from Get before update");

    try {
        const getItemResult = await dynamoDb.get(getItemParams).promise();
        if (getItemResult.Item == undefined || getItemResult.Item == null) {
            statusCode = 404;
            body.message = `Item with id ${event.pathParameters.id} not found`;
            return {
                statusCode,
                body: JSON.stringify(body),
                headers,
            };
        }
    } catch (err) {
        statusCode = 400;
        body.message = `Unable to update item with id ${event.pathParameters.id}: ${err.message}`;
        console.log(err);
        return {
            statusCode,
            body: JSON.stringify(body),
            headers,
        };
    }
    //#endregion

    // Update the item
    const updateItemParams = {
        TableName: ENTRY_DB,
        Key: {
            id: event.pathParameters.id
        },
        UpdateExpression: "SET #name = :name, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
            "#name": "name",
            "#updatedAt": ":updatedAt"
        },
        ExpressionAttributeValues: {
            ":name": data.name,
            ":updatedAt": timestamp
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("Hello from update");

    try {
        body = await dynamoDb.update(updateItemParams).promise();
        body.message = `Item with id ${event.pathParameters.id} updated successfully`;
    } catch (err) {
        statusCode = 400;
        body.message = `Unable to update item with id ${event.pathParameters.id}: ${err.message}`;
        console.log(err);
    } finally {
        body = JSON.stringify(body.Attributes);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

exports.deleteEntry = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    //#region  Error check to see if item with given ID exists
    const getItemParams = {
        TableName: ENTRY_DB,
        Key: {
            id: event.pathParameters.id
        }
    };

    try {
        const getItemResult = await dynamoDb.get(getItemParams).promise();
        if (getItemResult.Item == undefined || getItemResult.Item == null) {
            statusCode = 404;
            body.message = `Item with id ${event.pathParameters.id} not found`;
            return {
                statusCode,
                body: JSON.stringify(body),
                headers,
            };
        }
    } catch (err) {
        statusCode = 400;
        body.message = `Unable to update item with id ${event.pathParameters.id}: ${err.message}`;
        console.log(err);
        return {
            statusCode,
            body: JSON.stringify(body),
            headers,
        };
    }
    //#endregion

    const params = {
        TableName: ENTRY_DB,
        Key: {
            id: event.pathParameters.id
        }
    };

    try {
        await dynamoDb.delete(params).promise();
        body.message = `Item with id ${event.pathParameters.id} deleted successfully`;
    } catch (err) {
        statusCode = 400;
        body.message = `Unable to delete item with id ${event.pathParameters.id}: ${err.message}`;
        console.log(err);

    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

exports.logInUser = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    const parsedData = JSON.parse(event.body);

    authParams.AuthParameters.USERNAME = parsedData.username;
    authParams.AuthParameters.PASSWORD = parsedData.password;
    try {
        const loginResult = await new Promise((resolve, reject) => {
            client.initiateAuth(authParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    statusCode = 500;
                    body = JSON.stringify(err);
                    reject(err);
                } else {
                    resolve(data);
                    console.log(data);
                }
            });
        })
        console.log(loginResult);
        body.message = JSON.stringify(loginResult);
        // client.initiateAuth(authParams, function (err, data) {
        //     if (err) {
        //         console.log(err, err.stack);
        //         statusCode = 500;
        //         body = JSON.stringify(err);
        //         return {
        //             statusCode,
        //             body,
        //             headers,
        //         };
        //     } else {
        //         body.message = JSON.stringify(data);
        //         console.log(data);
        //     }
        // });
    } catch (error) {
        console.log(error);
        statusCode = 500;
        return {
            statusCode,
            body,
            headers,
        };
    }

    return {
        statusCode,
        body,
        headers,
    };
}

exports.signUpUser = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    const parsedData = JSON.parse(event.body);

    signupParams.Password = parsedData.password;
    signupParams.Username = parsedData.username;
    signupParams.UserAttributes[0].Value = parsedData.username;

    confirmationParams.Username = parsedData.username;

    try {
        const signUpResult = await new Promise((resolve, reject) => {
            client.signUp(signupParams, function (err, data) {
                if (err) {// an error occurred
                    console.log(err, err.stack);
                    statusCode = 500;
                    reject(err);
                }
                else {// successful response
                    console.log(data);
                    resolve(data);
                }
            });
        })
        console.log(signUpResult);
        body.signUpResult = JSON.stringify(signUpResult);

        const confirmResult = await new Promise((resolve, reject) => {
            client.adminConfirmSignUp(confirmationParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    statusCode = 500;
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
        console.log(confirmResult);
        body.confirmResult = JSON.stringify(confirmResult);
    }
    catch (err) {
        console.log(err, err.stack);
        statusCode = 500;
        body = JSON.stringify(err);
        return {
            statusCode,
            body,
            headers,
        }
    }

    return {
        statusCode,
        body,
        headers,
    };
}