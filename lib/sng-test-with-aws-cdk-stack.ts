import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {AttributeType, BillingMode, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';

export class SngTestWithAwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'SNGTestTableOne', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {name: 'pk', type: AttributeType.STRING},
      removalPolicy: RemovalPolicy.DESTROY,
      sortKey: {name: 'sk', type: AttributeType.STRING},
      tableName: 'SNGTestTableOne',
    });

    const createVotesHandler = new lambda.Function(
      this,
      'CreateVoteHandlerOne',
      {
        runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
        code: lambda.Code.fromAsset('createVote'),
        handler: 'index.handler',
      }
    );
    const getVotesHandler = new lambda.Function(this, 'GetVotesHandlerOne', {
      runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset('getVotes'),
      handler: 'index.handler',
    });

    table.grantReadData(getVotesHandler);

    table.grantWriteData(createVotesHandler);

    const api = new apigateway.RestApi(this, 'votes-api-one', {
      restApiName: 'SNG Voting',
      description: 'SNG Test Backend Voting Application.',
      cloudWatchRole: true,
    });

    const createVotesIntegration = new apigateway.LambdaIntegration(
      createVotesHandler
    );
    const getVotesIntegration = new apigateway.LambdaIntegration(
      getVotesHandler
    );
    const votes = api.root.addResource('votes');
    const vote = votes.addResource('{awardName}');
    vote.addMethod('GET', getVotesIntegration);
    votes.addMethod('POST', createVotesIntegration);

    new cdk.CfnOutput(this, 'RestApiUrl', {value: api.url});
  }
}
