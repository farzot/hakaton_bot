"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const bot_update_1 = require("./bot.update");
const bot_service_1 = require("./bot.service");
const report_module_1 = require("../report/report.module");
const config_1 = require("@nestjs/config");
let BotModule = class BotModule {
};
exports.BotModule = BotModule;
exports.BotModule = BotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                useFactory: async (configService) => ({
                    token: configService.get('BOT_TOKEN'),
                }),
                inject: [config_1.ConfigService],
            }),
            (0, common_1.forwardRef)(() => report_module_1.ReportModule),
        ],
        providers: [bot_update_1.BotUpdate, bot_service_1.BotService],
    })
], BotModule);
//# sourceMappingURL=bot.module.js.map