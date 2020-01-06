const apiGateway = require('@aws-cdk/aws-apigateway');
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const iam = require('@aws-cdk/aws-iam');
const lambda = require('@aws-cdk/aws-lambda');
const logs = require('@aws-cdk/aws-logs');
const s3 = require('@aws-cdk/aws-s3');
const secretsManager = require('@aws-cdk/aws-secretsmanager');

const APP_NAME = 'enchanted-brain';
const APP_COMPONENT = 'mturk';

const AWS_REGION = cdk.Aws.REGION;

const EXPO_TASK_COUNT = 1;
const EXPO_TASK_CPU = 1024;
const EXPO_TASK_MEMORY = 2048;
const EXPO_TASK_PORT = 19000;

/* eslint-disable no-new */

class AppStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props = {}) {
    super(scope, id, props);
    const { environment, validChoiceTypes, validSongIds } = props;

    const getResourceName = params => {
      let name = params;
      let delimiter;
      if (typeof params === 'object') {
        ({ name, delimiter } = params);
      }

      const parts = [environment, APP_NAME, APP_COMPONENT];
      if (name) {
        parts.push(name);
      }
      return parts.join(delimiter || '-');
    };

    const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName: getResourceName(),
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const appSecret = new secretsManager.Secret(this, 'AppSecret', {
      secretName: getResourceName({ name: 'app-secret', delimiter: '/' }),
      generateSecretString: { passwordLength: 32 },
    });

    const choiceWriter = new lambda.Function(this, 'ChoiceWriter', {
      functionName: getResourceName('choice-writer'),
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode('src/functions/choice-writer'),
      handler: 'index.handler',
      environment: {
        ENCHANTED_BRAIN_APP_SECRET_ARN: appSecret.secretArn,
        ENCHANTED_BRAIN_S3_BUCKET_NAME: s3Bucket.bucketName,
        ENCHANTED_BRAIN_VALID_CHOICE_TYPES: validChoiceTypes,
        ENCHANTED_BRAIN_VALID_SONG_IDS: validSongIds,
      },
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
    });
    appSecret.grantRead(choiceWriter);
    s3Bucket.grantPut(choiceWriter);

    new apiGateway.LambdaRestApi(this, 'ChoiceWriterApi', {
      restApiName: getResourceName(),
      handler: choiceWriter,
    });

    const expoVpc = new ec2.Vpc(this, 'ExpoVpc', {
      subnetConfiguration: [
        {
          name: getResourceName('public-1'),
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: getResourceName('public-2'),
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });
    const expoLogGroup = new logs.LogGroup(this, 'ExpoLogGroup', {
      logGroupName: getResourceName('expo'),
    });

    const rolePath = `/${AWS_REGION}/${getResourceName({ delimiter: '/' })}/`;
    new iam.Role(this, 'ExpoServiceRole', {
      roleName: `${AWS_REGION}-${getResourceName('ecs-v1')}`,
      path: rolePath,
      assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
      inlinePolicies: {
        [getResourceName('ecs')]: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ec2:AttachNetworkInterface',
                'ec2:CreateNetworkInterface',
                'ec2:CreateNetworkInterfacePermission',
                'ec2:DeleteNetworkInterface',
                'ec2:DeleteNetworkInterfacePermission',
                'ec2:Describe*',
                'ec2:DetachNetworkInterface',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    const expoExecutionRole = new iam.Role(this, 'ExpoExecutionRole', {
      roleName: `${AWS_REGION}-${getResourceName('ecs-execution-v1')}`,
      path: rolePath,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: {
        [getResourceName('expo-execution')]: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ecr:BatchCheckLayerAvailability',
                'ecr:BatchGetImage',
                'ecr:GetAuthorizationToken',
                'ecr:GetDownloadUrlForLayer',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // TODO
    const expoImage = ecs.ContainerImage.fromAsset('../../client');

    const expoSecurityGroup = new ec2.SecurityGroup(this, 'ExpoSecurityGroup', {
      securityGroupName: getResourceName('expo'),
      vpc: expoVpc,
      allowAllOutbound: true,
    });
    expoSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(EXPO_TASK_PORT));

    const expoTaskDefinition = new ecs.FargateTaskDefinition(this, 'ExpoTaskDefinition', {
      family: getResourceName('expo-v1'),
      cpu: EXPO_TASK_CPU,
      memoryLimitMiB: EXPO_TASK_MEMORY,
      executionRole: expoExecutionRole,
    });
    validChoiceTypes.split(',').forEach(choiceType => validSongIds.split(',').forEach(songId => expoTaskDefinition
      .addContainer(`${choiceType}_${songId}`, {
        image: expoImage,
        cpu: EXPO_TASK_CPU,
        memoryLimitMiB: EXPO_TASK_MEMORY,
        environment: {
          AWS_REGION,
          MTURK_SONG_ID: songId,
          MTURK_CHOICE_TYPE: choiceType,
        },
        logging: ecs.LogDriver.awsLogs({
          logGroup: expoLogGroup,
          streamPrefix: `${APP_COMPONENT}-expo-${songId}-${choiceType}`,
        }),
      })
      .addPortMappings({ containerPort: EXPO_TASK_PORT })));

    new ecs.FargateService(this, 'EcsService', {
      serviceName: getResourceName('expo-v1'),
      cluster: new ecs.Cluster(this, 'EcsCluster', {
        clusterName: getResourceName('expo'),
        vpc: expoVpc,
      }),
      taskDefinition: expoTaskDefinition,
      desiredCount: EXPO_TASK_COUNT,
      securityGroup: expoSecurityGroup,
      assignPublicIp: true,
      vpcSubnets: expoVpc.selectSubnets({ onePerAz: true, subnetType: ec2.SubnetType.PUBLIC }),
    });
  }
}

Object.assign(exports, { AppStack });

if (require.main === module) {
  const app = new cdk.App();
  const { ENCHANTED_BRAIN_ENVIRONMENT: environment = 'test' } = process.env;

  new AppStack(app, 'AppStack', {
    stackName: [environment, APP_NAME, APP_COMPONENT].join('-'),
    tags: {
      environment,
      system: APP_NAME,
    },
    environment,
    validChoiceTypes: process.env.ENCHANTED_BRAIN_VALID_CHOICE_TYPES,
    validSongIds: process.env.ENCHANTED_BRAIN_VALID_SONG_IDS,
  });
}
