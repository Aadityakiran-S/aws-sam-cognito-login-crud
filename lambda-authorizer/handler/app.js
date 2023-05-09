const AWS = require("aws-sdk");
const ENTRY_DB = process.env.ENTRY_DB;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

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

exports.cognitoLogin = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };

    body.message = JSON.stringify("Login successfull");

    return {
        statusCode,
        body,
        headers,
    };
}
