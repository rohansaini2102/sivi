// This file MUST be imported first in server.ts to load environment variables
// before any other modules that depend on process.env
import dotenv from 'dotenv';

dotenv.config();

export default process.env;
