import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {Entity, Table} from 'dynamodb-onetable';
import Dynamo from 'dynamodb-onetable/Dynamo';

const client = new Dynamo({client: new DynamoDBClient({})});

const schema = {
  format: 'onetable:1.1.0',
  version: '0.0.1',
  indexes: {
    primary: {hash: 'pk', sort: 'sk'},
  },
  models: {
    Vote: {
      pk: {type: String, value: 'AWARD#${awardName}'},
      sk: {type: String, value: 'NOMINEE#${fullName}'},
      awardName: {type: String, required: true},
      category: {type: String, required: true},
      fullName: {type: String, required: true},
      firstName: {type: String, required: true},
      lastName: {type: String, required: true},
      votes: {type: Number, required: true},
      year: {type: String, required: true},
    },
  },
  params: {
    isoDates: true,
    timestamps: true,
  },
};

const table = new Table({
  client,
  name: 'SNGTestTableOne',
  schema,
  timestamps: true,
});

export default table.getModel('Vote');
