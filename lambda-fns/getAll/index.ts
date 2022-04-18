import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB, QueryInput} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';

export async function getAll(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const {pathParameters, queryStringParameters} = event;
  if (!pathParameters || !queryStringParameters)
    return sendError('invalid request');
  const {awardName} = pathParameters;

  const {year} = queryStringParameters;

  const dynamoClient = new DynamoDB({
    region: 'us-west-2',
  });

  const queryTodo: QueryInput = {
    KeyConditionExpression: 'pk = :hkey and begins_with(sk, :skey)',
    ExpressionAttributeValues: marshall({
      ':hkey': `AWARD#${awardName}`,
      ':skey': `NOMINEE#`,
    }),
    TableName: process.env.TABLE_NAME,
  };
  try {
    const {Items} = await dynamoClient.query(queryTodo);
    const listOfVotes = Items ? Items.map(item => unmarshall(item)) : [];

    const votesForThisYear = listOfVotes.filter(
      ({year: yearOfAward}) => yearOfAward === Number(JSON.parse(year))
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        awardName,
        year,
        nominees: votesForThisYear,
      }),
    };
  } catch (err) {
    console.log(err);
    return sendError('something went wrong');
  }
}

function sendError(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    body: JSON.stringify({message}),
  };
}
