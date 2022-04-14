const Vote = require('../services/dynamoDBTable.ts');

exports.handler = async event => {
  if (event.pathParameters) {
    // const {awardName, fullName, yearOfAward} = event.pathParameters;
    // const Items = await Vote.find(
    //   {
    //     pk: `AWARD#${event.pathParameters.awardName}`,
    //     sk: `NOMINEE#Grant Smith`,
    //   },
    //   {
    //     where: '${year} === {2020}',
    //   }
    // );

    // TEST OUT WHAT YOU GET FROM voteModel.getAwardNomineesByYear

    // if (!Items?.length)
    //   ctx.throw(400, 'There are no nominees by this award and year.');
    // // map over the nominee and push them into an array
    // const nominees: Array<Nominee> = [];
    // Items.map(({category, firstName, lastName, votes, year: yearOfAward}) => {
    //   if (year === yearOfAward)
    //     nominees.push({category, firstName, lastName, votes});
    // });
    return {
      body: {
        message: 'Get Votes Handler',
      },
      headers: {
        'Content-Type': 'text/html',
      },
      statusCode: 200,
    };
  }
  return {
    body: 'Error, invalid input!',
    headers: {
      'Content-Type': 'text/html',
    },
    statusCode: 400,
  };
};
