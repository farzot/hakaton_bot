import { forwardRef, Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { ReportModule } from '../report/report.module';
import { ConfigService } from '@nestjs/config'; // <-- Import qilamiz

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN'), // <-- .env faylidan tokenni olish
      }),
      inject: [ConfigService], // <-- ConfigService dependency injection
    }),
    forwardRef(() => ReportModule),
  ],
  providers: [BotUpdate, BotService],
})
export class BotModule {}
