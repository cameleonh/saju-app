import { createIngestionServer } from './http.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createSqliteStorage } from './storage/sqlite.mjs';

const port = Number(process.env.PORT || 4174);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storagePath = process.env.SAJU_DB_PATH || path.join(projectRoot, 'data', 'saju.sqlite');
const storage = createSqliteStorage(storagePath);
const server = createIngestionServer({ staticRoot: projectRoot, storage });
server.listen(port, '127.0.0.1', () => console.log(`saju ingestion adapter listening on http://127.0.0.1:${port}`));
