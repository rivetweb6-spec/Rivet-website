import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const PASS = encodeURIComponent('(Superbase)07');
const REF = 'fxrjmhcinojpwbrvoikg';
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'eu-south-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'ap-east-1',
  'sa-east-1', 'ca-central-1', 'af-south-1', 'me-south-1', 'me-central-1',
];

for (const region of regions) {
  for (const prefix of ['aws-0', 'aws-1']) {
    const url = `postgresql://postgres.${REF}:${PASS}@${prefix}-${region}.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=8`;
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      await p.$connect();
      console.log('SUCCESS', `${prefix}-${region}`);
      await p.$disconnect();
      process.exit(0);
    } catch (e) {
      const m = e.message;
      if (!m.includes('ENOTFOUND') && !m.includes('tenant/user')) console.log(prefix, region, m.split('\n')[0]);
      await p.$disconnect();
    }
  }
}
console.log('done');
