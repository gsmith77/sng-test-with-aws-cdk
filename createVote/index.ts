const voteModel = require('../models/vote');

module.exports.handler = async event => {
  const body = event.body;
  console.log('BODY', body);
  if (body) {
    const {awardName, category, firstName, fullName, lastName, year} =
      JSON.parse(body);

    const awardNominee = await voteModel.getAwardNominee(awardName, fullName);

    // if (data?.Item?.votes) {
    //   await voteModel.updateAwardNomineeVote(awardName, data?.Item, fullName);
    // } else {
    //   await voteModel.createVote(
    //     awardName,
    //     category,
    //     firstName,
    //     fullName,
    //     lastName,
    //     year
    //   );
    // }
    return {
      body: JSON.stringify(awardNominee),
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
