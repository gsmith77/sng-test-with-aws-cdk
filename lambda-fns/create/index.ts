import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB, PutItemInput} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';

interface VoteInput {
  awardName: string;
  category?: string;
  firstName: string;
  fullName: string;
  lastName: string;
  year: string;
}

interface Vote {
  pk: string;
  sk: string;
  awardName: string;
  category?: string;
  firstName: string;
  fullName: string;
  lastName: string;
  votes: Number;
  year: string;
}

export async function createVote(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const {body} = event;

  if (!body) {
    return sendFail('invalid request');
  }

  const {awardName, category, firstName, fullName, lastName, year} = JSON.parse(
    body
  ) as VoteInput;

  const dynamoClient = new DynamoDB({
    region: 'us-west-2',
  });

  const getTodo = {
    Key: marshall({
      pk: `AWARD#${awardName}`,
      sk: `NOMINEE#${fullName}`,
    }),
    TableName: process.env.TABLE_NAME,
  };

  try {
    const {Item} = await dynamoClient.getItem(getTodo);

    const vote = Item ? unmarshall(Item) : null;

    if (vote?.votes) {
      const todoParams = {
        Key: marshall({pk: `AWARD#${awardName}`, sk: `NOMINEE#${fullName}`}),
        UpdateExpression: 'set votes = :votes',
        ExpressionAttributeValues: marshall({
          ':votes': vote?.votes + 1,
        }),
        ReturnValues: 'ALL_NEW',
        TableName: process.env.TABLE_NAME,
      };

      try {
        const {Attributes} = await dynamoClient.updateItem(todoParams);

        const vote = Attributes ? unmarshall(Attributes) : null;

        return {
          statusCode: 200,
          body: JSON.stringify({vote}),
        };
      } catch (err) {
        console.log(err);

        return sendFail('something went wrong');
      }
    } else {
      const newVote: Vote = {
        pk: `AWARD#${awardName}`,
        sk: `NOMINEE#${fullName}`,
        awardName,
        category,
        firstName,
        fullName,
        lastName,
        votes: 1,
        year,
      };

      const todoParams: PutItemInput = {
        Item: marshall(newVote),
        TableName: process.env.TABLE_NAME,
      };

      try {
        await dynamoClient.putItem(todoParams);

        return {
          statusCode: 200,
          body: JSON.stringify({newVote}),
        };
      } catch (err) {
        console.log(err);

        return sendFail('something went wrong');
      }
    }
  } catch (err) {
    console.log(err);

    return sendError('something went wrong');
  }
}

function sendFail(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    body: JSON.stringify({message}),
  };
}

function sendError(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    body: JSON.stringify({message}),
  };
}
