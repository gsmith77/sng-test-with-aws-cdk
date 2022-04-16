import {CfnOutput, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Runtime} from '@aws-cdk/aws-lambda';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import {AttributeType, BillingMode, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';

const tableName = 'SNGTestTableOne';

export class SngTestWithAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const table = new Table(this, tableName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {name: 'pk', type: AttributeType.STRING},
      removalPolicy: RemovalPolicy.DESTROY,
      sortKey: {name: 'sk', type: AttributeType.STRING},
      tableName,
    });

    const createVoteFn = new lambda.NodejsFunction(this, 'createVoteFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/create/index.ts`,
      handler: 'createVote',
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const getAllVotesFn = new lambda.NodejsFunction(this, 'getAllVotesFn', {
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambda-fns/getAll/index.ts`,
      handler: 'getAll',
      environment: {
        TABLE_NAME: tableName,
      },
    });

    table.grantReadData(getAllVotesFn);

    table.grantReadWriteData(createVoteFn);

    new CfnOutput(this, 'tableName', {
      value: table.tableName,
    });

    // create the API Gateway with one method and path
    const api = new apigateway.RestApi(this, 'votes-api');

    const votes = api.root.addResource('votes');

    votes.addMethod('POST', new apigateway.LambdaIntegration(createVoteFn));

    votes
      .addResource('{awardName}')
      .addMethod('GET', new apigateway.LambdaIntegration(getAllVotesFn));

    new cdk.CfnOutput(this, 'HTTP API URL', {
      value: api.url ?? 'Something went wrong with the deploy',
    });
  }
}
