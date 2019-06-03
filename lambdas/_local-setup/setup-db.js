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
        TableName: 'local-choice'
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
        'local-choice': [
          {
            PutRequest: {
              Item: {
                songId: '1',
                listenId: 'user-1342',
                colors: {
                  1557820765214: 'COLOR_RED',
                  1557820769264: 'COLOR_BLUE',
                },
                emotions: {
                  1557820771223: 'Sad',
                  1557820771491: 'Angry',
                },
                chills: {
                  1557820771285: True,
                  1557820775421: False,
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
                imagery: '',
              },
            },
          },
        ],
      },
    })
    .promise();

  const records = await docuClient.scan({ TableName: 'local-choice' }).promise();
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
