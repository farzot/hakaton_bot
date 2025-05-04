import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  config(); // .env fayl uchun
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(`Server is running in 3000`)
  console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

}
bootstrap();
