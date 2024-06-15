import { registerAs } from '@nestjs/config';

export default registerAs(
  'app',
  (): Record<string, any> => ({
    host: process.env.APP_HOST || 'localhost',
    port: Number(process.env.APP_PORT) || 3000,
  }),
);
