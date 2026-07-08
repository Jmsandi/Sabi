import 'dotenv/config';
import { OpenAlexClient } from './openAlexClient.js';

export { OpenAlexClient };

if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv.slice(2).join(' ');
  const client = new OpenAlexClient();
  const records = await client.searchStudies(query);
  console.log(JSON.stringify(records, null, 2));
}
