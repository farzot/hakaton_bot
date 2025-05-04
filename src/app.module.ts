import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- muhim
    }),
    BotModule,
  ],
})
export class AppModule {}
