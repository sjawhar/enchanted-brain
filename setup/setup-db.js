const AWS = require('aws-sdk');

const main = async () => {
  AWS.config.update({
    region: 'us-west-2',
    endpoint: 'http://db:8000',
  });
  const dynamoDb = new AWS.DynamoDB();
  try {
    await dynamoDb
      .createTable({
        TableName: 'local-colors',
        KeySchema: [
          { AttributeName: 'songId', KeyType: 'HASH' },
          { AttributeName: 'listenId', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'songId', AttributeType: 'S' },
          { AttributeName: 'listenId', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
      .promise();
  } catch (error) {
    console.error(error);
  }

  const docuClient = new AWS.DynamoDB.DocumentClient();
  await docuClient
    .batchWrite({
      RequestItems: {
        'local-colors': [
          {
            PutRequest: {
              Item: {
                songId: '1',
                listenId: 'user-1342',
                colors: {
                  1557820765214: 'COLOR_RED',
                  1557820769264: 'COLOR_BLUE',
                },
              },
            },
          },
          {
            PutRequest: {
              Item: {
                songId: '1',
                listenId: 'user-7475',
                colors: {
                  1557820873087: 'COLOR_GREEN',
                  1557820888093: 'COLOR_BLUE',
                },
              },
            },
          },
        ],
      },
    })
    .promise();

  const records = await docuClient.scan({ TableName: 'local-colors' }).promise();
  console.log(JSON.stringify(records.Items, null, 2));
};

main()
  .then(() => {
    console.log('Table created');
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
