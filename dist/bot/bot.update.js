"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUpdate = void 0;
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const bot_service_1 = require("./bot.service");
const report_service_1 = require("../report/report.service");
let BotUpdate = class BotUpdate {
    constructor(botService, reportService, bot) {
        this.botService = botService;
        this.reportService = reportService;
        this.bot = bot;
        this.userSessions = new Map();
        this.ITEMS_PER_PAGE = 8;
        this.MAX_BUTTON_TEXT_LENGTH = 20;
    }
    async start(ctx) {
        const userId = ctx.from.id;
        let session = this.userSessions.get(userId);
        if (!session || !session.language) {
            await ctx.reply('🇺🇿 Loyihalar monitoring botiga xush kelibsiz!\n\nIltimos, tilni tanlang:', {
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback("🇺🇿 O'zbekcha", 'LANG:uz')],
                    [telegraf_1.Markup.button.callback('🇷🇺 Русский', 'LANG:ru')],
                ]).reply_markup,
            });
            return;
        }
        await this.showRegions(ctx, 0);
    }
    async onCallback(ctx) {
        const data = ctx.callbackQuery['data'];
        const userId = ctx.from.id;
        let session = this.userSessions.get(userId) || {};
        if (data.startsWith('LANG:')) {
            const language = data.split(':')[1];
            session.language = language;
            this.userSessions.set(userId, session);
            await this.showRegions(ctx, 0);
            return;
        }
        if (data.startsWith('REGION:')) {
            const region = data.split(':')[1];
            session.region = region;
            session.currentPage = 0;
            this.userSessions.set(userId, session);
            await this.showDistricts(ctx, region, 0);
        }
        else if (data.startsWith('DISTRICT:')) {
            const district = data.split(':')[1];
            session.district = district;
            this.userSessions.set(userId, session);
            await this.showProjects(ctx, session.region, district);
        }
        else if (data.startsWith('REGION_PAGE:')) {
            const page = parseInt(data.split(':')[1]);
            await this.showRegions(ctx, page);
        }
        else if (data.startsWith('DISTRICT_PAGE:')) {
            const [region, pageStr] = data.split(':').slice(1);
            const page = parseInt(pageStr);
            await this.showDistricts(ctx, region, page);
        }
        else if (data.startsWith('PROJECT:')) {
            const projectId = data.split(':')[1];
            session.projectId = projectId;
            this.userSessions.set(userId, session);
            const { region, district } = session;
            const project = this.botService.getProjectById(region, district, projectId);
            let usageStr = project.usage
                .map((u) => `• ${u.name}: ${u.amount.toLocaleString()} so'm`)
                .join('\n');
            await ctx.editMessageText(session.language === 'uz'
                ? `📌 *${project.name}* haqida ma'lumot:\n\n` +
                    `✅ Bajarilgan: ${project.percent}%\n` +
                    `⏰ Yakunlanish sanasi: ${project.deadline}\n` +
                    `💰 Ajratilgan mablag': ${project.budget.toLocaleString()} so'm\n\n` +
                    `📊 Sarf qilingan:\n${usageStr}`
                : `📌 *${project.name}* информация:\n\n` +
                    `✅ Завершено: ${project.percent}%\n` +
                    `⏰ Дата окончания: ${project.deadline}\n` +
                    `💰 Бюджет: ${project.budget.toLocaleString()} сум\n\n` +
                    `📊 Потрачено:\n${usageStr}`, {
                parse_mode: 'Markdown',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('📤 Ariza berish', 'REPORT')],
                    [telegraf_1.Markup.button.callback('🔙 Orqaga', `DISTRICT_PAGE:${region}:0`)],
                ]).reply_markup,
            });
        }
        else if (data === 'REPORT') {
            await ctx.reply(session.language === 'uz'
                ? 'Iltimos, muammo yoki shikoyat haqida qisqacha izoh yozing (description).'
                : 'Пожалуйста, напишите короткое описание проблемы или жалобы (description).');
        }
    }
    async handleDescription(ctx) {
        const session = this.userSessions.get(ctx.from.id);
        if (!session || !session.projectId) {
            await ctx.reply(session?.language === 'uz'
                ? `Iltimos, loyihani tanlang, so'ngra izoh yuboring.`
                : `Пожалуйста, выберите проект, а затем отправьте описание.`);
            return;
        }
        if ('text' in ctx.message) {
            session.description = ctx.message.text;
            this.userSessions.set(ctx.from.id, session);
            await ctx.reply(session.language === 'uz'
                ? '✅ Endi rasm yoki video yuboring.'
                : '✅ Теперь отправьте изображение или видео.');
        }
        else {
            await ctx.reply(session.language === 'uz'
                ? 'Iltimos, matnli xabar yuboring.'
                : 'Пожалуйста, отправьте текстовое сообщение.');
        }
    }
    async handleMedia(ctx) {
        const session = this.userSessions.get(ctx.from.id);
        if (!session || !session.projectId) {
            await ctx.reply(session.language === 'uz'
                ? 'Iltimos, loyihani tanlang.'
                : 'Пожалуйста, выберите проект.');
            return;
        }
        let fileId;
        if ('photo' in ctx.message) {
            fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        }
        else if ('video' in ctx.message) {
            fileId = ctx.message.video.file_id;
        }
        if (!fileId) {
            await ctx.reply(session.language === 'uz'
                ? 'Iltimos, rasm yoki video yuboring.'
                : 'Пожалуйста, отправьте изображение или видео.');
            return;
        }
        const report = {
            userId: ctx.from.id,
            username: ctx.from.username,
            region: session.region,
            district: session.district,
            projectId: session.projectId,
            description: session.description || '',
            fileId,
            createdAt: new Date().toISOString(),
        };
        await this.reportService.saveReportToFile(report);
        this.userSessions.delete(ctx.from.id);
        await ctx.reply(session.language === 'uz'
            ? "✅ Rahmat, arizangiz qabul qilindi va tekshiruv bo'limiga yuborildi."
            : '✅ Спасибо, Ваша заявка получена и отправлена ​​в отдел рассмотрения.');
    }
    async showRegions(ctx, page) {
        const userId = ctx.from.id;
        const session = this.userSessions.get(userId);
        if (!session || !session.language)
            return;
        const allRegions = this.botService.getRegions();
        const totalPages = Math.ceil(allRegions.length / this.ITEMS_PER_PAGE);
        const regionsToShow = allRegions.slice(page * this.ITEMS_PER_PAGE, (page + 1) * this.ITEMS_PER_PAGE);
        const buttons = regionsToShow.map((r) => [
            telegraf_1.Markup.button.callback(r, `REGION:${r}`),
        ]);
        const paginationButtons = [];
        if (page > 0) {
            paginationButtons.push(telegraf_1.Markup.button.callback('⬅️ Oldingi', `REGION_PAGE:${page - 1}`));
        }
        if (page < totalPages - 1) {
            paginationButtons.push(telegraf_1.Markup.button.callback('Keyingi ➡️', `REGION_PAGE:${page + 1}`));
        }
        if (paginationButtons.length > 0) {
            buttons.push(paginationButtons);
        }
        const messageText = session.language === 'uz'
            ? `Hududni tanlang (sahifa ${page + 1}/${totalPages}):`
            : `Выберите регион (страница ${page + 1}/${totalPages}):`;
        if (ctx.callbackQuery) {
            await ctx.editMessageText(messageText, {
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup,
            });
        }
        else {
            await ctx.reply(messageText, {
                reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup,
            });
        }
    }
    async showDistricts(ctx, region, page) {
        const userId = ctx.from.id;
        const session = this.userSessions.get(userId);
        if (!session || !session.language)
            return;
        const allDistricts = this.botService.getDistricts(region);
        const totalPages = Math.ceil(allDistricts.length / this.ITEMS_PER_PAGE);
        const districtsToShow = allDistricts.slice(page * this.ITEMS_PER_PAGE, (page + 1) * this.ITEMS_PER_PAGE);
        const buttons = districtsToShow.map((d) => [
            telegraf_1.Markup.button.callback(d, `DISTRICT:${d}`),
        ]);
        const paginationButtons = [];
        if (page > 0) {
            paginationButtons.push(telegraf_1.Markup.button.callback('⬅️ Oldingi', `DISTRICT_PAGE:${region}:${page - 1}`));
        }
        if (page < totalPages - 1) {
            paginationButtons.push(telegraf_1.Markup.button.callback('Keyingi ➡️', `DISTRICT_PAGE:${region}:${page + 1}`));
        }
        if (paginationButtons.length > 0) {
            buttons.push(paginationButtons);
        }
        const messageText = session.language === 'uz'
            ? `Tanlangan viloyat: ${region}\n\nTuman tanlang (sahifa ${page + 1}/${totalPages}):`
            : `Выбранный регион: ${region}\n\nВыберите район (страница ${page + 1}/${totalPages}):`;
        await ctx.editMessageText(messageText, {
            reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup,
        });
    }
    async showProjects(ctx, region, district) {
        const session = this.userSessions.get(ctx.from.id);
        if (!session)
            return;
        const projects = this.botService.getProjects(region, district);
        const buttons = [];
        for (let i = 0; i < projects.length; i++) {
            buttons.push([
                telegraf_1.Markup.button.callback(this.formatButtonText(projects[i].name), `PROJECT:${projects[i].id}`),
            ]);
        }
        await ctx.editMessageText(session.language === 'uz'
            ? `Tanlangan tuman: ${district}\n\nLoyihani tanlang:`
            : `Выбранный район: ${district}\n\nВыберите проект:`, {
            reply_markup: telegraf_1.Markup.inlineKeyboard(buttons).reply_markup,
        });
    }
    formatButtonText(text) {
        return text;
    }
};
exports.BotUpdate = BotUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "start", null);
__decorate([
    (0, nestjs_telegraf_1.On)('callback_query'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCallback", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "handleDescription", null);
__decorate([
    (0, nestjs_telegraf_1.On)(['photo', 'video']),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "handleMedia", null);
exports.BotUpdate = BotUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __param(2, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [bot_service_1.BotService,
        report_service_1.ReportService,
        telegraf_1.Telegraf])
], BotUpdate);
//# sourceMappingURL=bot.update.js.map