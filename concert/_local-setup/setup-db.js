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
        'local-enchanted-brain': [
          {
            PutRequest: {
              Item: {
                songId: '1',
                listenId: 'user-1342',
                colors: {
                  '2019-05-14T21:20:03.000Z': 'COLOR_RED',
                  '2019-05-14T21:20:23.000Z': 'COLOR_BLUE',
                },
                emotions: {
                  '2019-05-14T21:20:43.000Z': 'Sad',
                  '2019-05-14T21:21:03.000Z': 'Angry',
                },
                chills: {
                  '2019-05-14T21:21:23.000Z': 'True',
                  '2019-05-14T21:21:43.000Z': 'False',
                },
                imagery: 'a slice of chocolate cake',
              },
            },
          },
          {
            PutRequest: {
              Item: {
                songId: 'CONCERT_LAUSANNE_2019',
                listenId: 'user id',
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
