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
        TableName: 'local-enchanted-brain',
        KeySchema: [
          { AttributeName: 'recordId', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'recordId', AttributeType: 'S' },
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
        'local-enchanted-brain': [
          {
            PutRequest: {
              Item: {
                recordId: 'CHOICE$1',
                colors: {
                  '2019-05-14T21:20:03.000Z': '#FFFF00',
                  '2019-05-14T21:20:23.000Z': '#AB0000',
                },
                emotionType: 'EMOTION_HAPPINESS',
                emotions: {
                  '2019-05-14T21:20:43.000Z': 0.5,
                  '2019-05-14T21:21:03.000Z': 0,
                },
                chills: {
                  '2019-05-14T21:21:23.000Z': 1,
                  '2019-05-14T21:21:43.000Z': 0,
                },
              },
            },
          },
          {
            PutRequest: {
              Item: {
                recordId: 'CHOICE$user id',
                colors: {
                },
                emotions: {
                },
                chills: {
                },
              },
            },
          },
        ],
      },
    })
    .promise();

  const records = await docuClient.scan({ TableName: 'local-enchanted-brain' }).promise();
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
