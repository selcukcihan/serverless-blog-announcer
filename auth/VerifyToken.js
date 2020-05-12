// https://github.com/adnanrahic/a-crash-course-on-serverless-auth repo'sundan alındı

const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
}

module.exports.auth = (event, context, callback) => {
  console.log('Gelen event: ' + JSON.stringify(event));
  // check header or url parameters or post parameters for token
  const token = event['headers']['x-webhook-signature'];

  if (!token)
    return callback(null, 'Unauthorized');

  // verifies secret and checks exp
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log('Decoded token: ' + JSON.stringify(decoded));
    if (err || decoded.iss !== 'netlify') {
      console.log('Decoding error: ' + JSON.stringify(decoded));
      return callback(null, 'Unauthorized');
    }

    // if everything is good, save to request for use in other routes
    return callback(null, generatePolicy(decoded.id, 'Allow', event.methodArn));
  });

};
