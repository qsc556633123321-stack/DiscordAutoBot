const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const source = (file) => fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const app = source('src/application/community/createCommunityMigrationReadinessUseCase.js'); const domain = source('src/domain/community/communityDataSourceReconciliation.js'); const adapter = source('src/infrastructure/storage/supabaseCommunityReadRepositories.js');
assert.doesNotMatch(app, /require\([^)]*supabase|require\([^)]*discord\.js|writeFile|\.insert\(|\.update\(|\.delete\(/i); assert.doesNotMatch(domain, /require\(|discord\.js|readFile|writeFile/); assert.doesNotMatch(adapter, /insert\(|update\(|delete\(|SUPABASE_SERVICE_ROLE_KEY/);
console.log('KU HUB Repository Integration boundary tests passed.');
