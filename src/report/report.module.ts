import { Module, forwardRef } from '@nestjs/common';
import { ReportService } from './report.service';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [forwardRef(() => BotModule)],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
