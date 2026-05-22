import '../env.js';
import { migrate, migrationsFolder } from './migrate.js';

await migrate();

console.log(`Migraciones aplicadas desde ${migrationsFolder()}`);
