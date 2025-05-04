import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { ReportService } from 'src/report/report.service';
export declare class BotUpdate {
    private readonly botService;
    private readonly reportService;
    private readonly bot;
    private userSessions;
    private readonly ITEMS_PER_PAGE;
    private readonly MAX_BUTTON_TEXT_LENGTH;
    constructor(botService: BotService, reportService: ReportService, bot: Telegraf<Context>);
    start(ctx: Context): Promise<void>;
    onCallback(ctx: Context): Promise<void>;
    handleDescription(ctx: Context): Promise<void>;
    handleMedia(ctx: Context): Promise<void>;
    private showRegions;
    private showDistricts;
    private showProjects;
    private formatButtonText;
}
