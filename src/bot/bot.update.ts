// import { Context, Markup, Telegraf } from 'telegraf';
// import { Update, Ctx, Start, Command, InjectBot, On } from 'nestjs-telegraf';
// import { BotService } from './bot.service';
// import { ReportService } from 'src/report/report.service';

// interface SessionData {
//   language?: 'uz' | 'ru';
//   region?: string;
//   district?: string;
//   projectId?: string;
//   description?: string;
//   currentPage?: number; // Pagination uchun yangi maydon
// }

// @Update()
// export class BotUpdate {
//   private userSessions = new Map<number, SessionData>();
//   private readonly ITEMS_PER_PAGE = 8; // Har bir sahifada ko'rsatiladigan elementlar soni

//   constructor(
//     private readonly botService: BotService,
//     private readonly reportService: ReportService,
//     @InjectBot() private readonly bot: Telegraf<Context>,
//   ) {}

//   @Start()
//   async start(@Ctx() ctx: Context) {
//     const userId = ctx.from.id;
//     let session = this.userSessions.get(userId);

//     if (!session || !session.language) {
//       await ctx.reply(
//         '🇺🇿 Loyihalar monitoring botiga xush kelibsiz!\n\nIltimos, tilni tanlang:',
//         {
//           reply_markup: Markup.inlineKeyboard([
//             Markup.button.callback("🇺🇿 O'zbekcha", 'LANG:uz'),
//             Markup.button.callback('🇷🇺 Русский', 'LANG:ru'),
//           ]).reply_markup,
//         },
//       );
//       return;
//     }

//     await this.showRegions(ctx, 0);
//   }

//   @On('callback_query')
//   async onCallback(@Ctx() ctx: Context) {
//     const data = ctx.callbackQuery['data'];
//     const userId = ctx.from.id;
//     let session = this.userSessions.get(userId) || {};

//     if (data.startsWith('LANG:')) {
//       const language = data.split(':')[1] as 'uz' | 'ru';
//       session.language = language;
//       this.userSessions.set(userId, session);
//       await this.showRegions(ctx, 0);
//       return;
//     }

//     if (data.startsWith('REGION:')) {
//       const region = data.split(':')[1];
//       session.region = region;
//       session.currentPage = 0;
//       this.userSessions.set(userId, session);
//       await this.showDistricts(ctx, region, 0);
//     } else if (data.startsWith('DISTRICT:')) {
//       const district = data.split(':')[1];
//       session.district = district;
//       this.userSessions.set(userId, session);

//       const region = session.region;
//       const projects = this.botService.getProjects(region, district);

//       await ctx.editMessageText(
//         session.language === 'uz'
//           ? `Tanlangan tuman: ${district}\n\nLoyihani tanlang:`
//           : `Выбранный район: ${district}\n\nВыберите проект:`,
//         {
//           reply_markup: Markup.inlineKeyboard(
//             projects.map((p) =>
//               Markup.button.callback(p.name, `PROJECT:${p.id}`),
//             ),
//           ).reply_markup,
//         },
//       );
//     } else if (data.startsWith('REGION_PAGE:')) {
//       const page = parseInt(data.split(':')[1]);
//       await this.showRegions(ctx, page);
//     } else if (data.startsWith('DISTRICT_PAGE:')) {
//       const [region, pageStr] = data.split(':').slice(1);
//       const page = parseInt(pageStr);
//       await this.showDistricts(ctx, region, page);
//     } else if (data.startsWith('PROJECT:')) {
//       const projectId = data.split(':')[1];
//       session.projectId = projectId;
//       this.userSessions.set(userId, session);

//       const { region, district } = session;
//       const project = this.botService.getProjectById(
//         region,
//         district,
//         projectId,
//       );

//       let usageStr = project.usage
//         .map((u) => `• ${u.name}: ${u.amount.toLocaleString()} so'm`)
//         .join('\n');

//       await ctx.editMessageText(
//         session.language === 'uz'
//           ? `📌 *${project.name}* haqida ma'lumot:\n\n` +
//               `✅ Bajarilgan: ${project.percent}%\n` +
//               `⏰ Yakunlanish sanasi: ${project.deadline}\n` +
//               `💰 Ajratilgan mablag': ${project.budget.toLocaleString()} so'm\n\n` +
//               `📊 Sarf qilingan:\n${usageStr}`
//           : `📌 *${project.name}* информация:\n\n` +
//               `✅ Завершено: ${project.percent}%\n` +
//               `⏰ Дата окончания: ${project.deadline}\n` +
//               `💰 Бюджет: ${project.budget.toLocaleString()} сум\n\n` +
//               `📊 Потрачено:\n${usageStr}`,
//         {
//           parse_mode: 'Markdown',
//           reply_markup: Markup.inlineKeyboard([
//             Markup.button.callback('📤 Ariza berish', `REPORT`),
//           ]).reply_markup,
//         },
//       );
//     } else if (data === 'REPORT') {
//       await ctx.reply(
//         session.language === 'uz'
//           ? 'Iltimos, muammo yoki shikoyat haqida qisqacha izoh yozing (description).'
//           : 'Пожалуйста, напишите короткое описание проблемы или жалобы (description).',
//       );
//     }
//   }

//   // Qolgan metodlar (handleDescription, handleMedia) o'zgartirilmasdan qoldi
//   @On('text')
//   async handleDescription(@Ctx() ctx: Context) {
//     const session = this.userSessions.get(ctx.from.id);
//     if (!session || !session.projectId) {
//       await ctx.reply(
//         session?.language === 'uz'
//           ? 'Iltimos, loyihani tanlang, so‘ngra izoh yuboring.'
//           : 'Пожалуйста, выберите проект, а затем отправьте описание.',
//       );
//       return;
//     }

//     if ('text' in ctx.message) {
//       session.description = ctx.message.text;
//       this.userSessions.set(ctx.from.id, session);
//       await ctx.reply(
//         session.language === 'uz'
//           ? '✅ Endi rasm yoki video yuboring.'
//           : '✅ Теперь отправьте изображение или видео.',
//       );
//     } else {
//       await ctx.reply(
//         session.language === 'uz'
//           ? 'Iltimos, matnli xabar yuboring.'
//           : 'Пожалуйста, отправьте текстовое сообщение.',
//       );
//     }
//   }

//   @On(['photo', 'video'])
//   async handleMedia(@Ctx() ctx: Context) {
//     const session = this.userSessions.get(ctx.from.id);
//     if (!session || !session.projectId) {
//       await ctx.reply(
//         session.language === 'uz'
//           ? 'Iltimos, loyihani tanlang.'
//           : 'Пожалуйста, выберите проект.',
//       );
//       return;
//     }

//     let fileId: string | undefined;

//     if ('photo' in ctx.message) {
//       fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
//     } else if ('video' in ctx.message) {
//       fileId = ctx.message.video.file_id;
//     }

//     if (!fileId) {
//       await ctx.reply(
//         session.language === 'uz'
//           ? 'Iltimos, rasm yoki video yuboring.'
//           : 'Пожалуйста, отправьте изображение или видео.',
//       );
//       return;
//     }

//     const report = {
//       userId: ctx.from.id,
//       username: ctx.from.username,
//       region: session.region,
//       district: session.district,
//       projectId: session.projectId,
//       description: session.description || '',
//       fileId,
//       createdAt: new Date().toISOString(),
//     };

//     await this.reportService.saveReportToFile(report);
//     this.userSessions.delete(ctx.from.id);

//     await ctx.reply(
//       session.language === 'uz'
//         ? `✅ Rahmat, arizangiz qabul qilindi va tekshiruv bo'limiga yuborildi.`
//         : '✅ Спасибо, Ваша заявка получена и отправлена ​​в отдел рассмотрения.',
//     );
//   }

//   // Yangi metodlar - sahifalash uchun
//   private async showRegions(ctx: Context, page: number) {
//     const userId = ctx.from.id;
//     const session = this.userSessions.get(userId);
//     if (!session || !session.language) return;

//     const allRegions = this.botService.getRegions();
//     const totalPages = Math.ceil(allRegions.length / this.ITEMS_PER_PAGE);
//     const regionsToShow = allRegions.slice(
//       page * this.ITEMS_PER_PAGE,
//       (page + 1) * this.ITEMS_PER_PAGE,
//     );

//     // Asosiy tugmalar
//     const buttons = regionsToShow.map((r) => [
//       Markup.button.callback(r, `REGION:${r}`),
//     ]);

//     // Pagination tugmalari
//     const paginationButtons = [];
//     if (page > 0) {
//       paginationButtons.push(
//         Markup.button.callback('⬅️ Oldingi', `REGION_PAGE:${page - 1}`),
//       );
//     }
//     if (page < totalPages - 1) {
//       paginationButtons.push(
//         Markup.button.callback('Keyingi ➡️', `REGION_PAGE:${page + 1}`),
//       );
//     }

//     // Agar pagination tugmalari bo'lsa, ularni qo'shamiz
//     if (paginationButtons.length > 0) {
//       buttons.push(paginationButtons);
//     }

//     const messageText =
//       session.language === 'uz'
//         ? `Hududni tanlang (sahifa ${page + 1}/${totalPages}):`
//         : `Выберите регион (страница ${page + 1}/${totalPages}):`;

//     if (ctx.callbackQuery) {
//       await ctx.editMessageText(messageText, {
//         reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
//       });
//     } else {
//       await ctx.reply(messageText, {
//         reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
//       });
//     }
//   }

//   private async showDistricts(ctx: Context, region: string, page: number) {
//     const userId = ctx.from.id;
//     const session = this.userSessions.get(userId);
//     if (!session || !session.language) return;

//     const allDistricts = this.botService.getDistricts(region);
//     const totalPages = Math.ceil(allDistricts.length / this.ITEMS_PER_PAGE);
//     const districtsToShow = allDistricts.slice(
//       page * this.ITEMS_PER_PAGE,
//       (page + 1) * this.ITEMS_PER_PAGE,
//     );

//     // Asosiy tugmalar
//     const buttons = districtsToShow.map((d) => [
//       Markup.button.callback(d, `DISTRICT:${d}`),
//     ]);

//     // Pagination tugmalari
//     const paginationButtons = [];
//     if (page > 0) {
//       paginationButtons.push(
//         Markup.button.callback(
//           '⬅️ Oldingi',
//           `DISTRICT_PAGE:${region}:${page - 1}`,
//         ),
//       );
//     }
//     if (page < totalPages - 1) {
//       paginationButtons.push(
//         Markup.button.callback(
//           'Keyingi ➡️',
//           `DISTRICT_PAGE:${region}:${page + 1}`,
//         ),
//       );
//     }

//     // Agar pagination tugmalari bo'lsa, ularni qo'shamiz
//     if (paginationButtons.length > 0) {
//       buttons.push(paginationButtons);
//     }

//     const messageText =
//       session.language === 'uz'
//         ? `Tanlangan viloyat: ${region}\n\nTuman tanlang (sahifa ${page + 1}/${totalPages}):`
//         : `Выбранный регион: ${region}\n\nВыберите район (страница ${page + 1}/${totalPages}):`;

//     await ctx.editMessageText(messageText, {
//       reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
//     });
//   }
// }

import { Context, Markup, Telegraf } from 'telegraf';
import { Update, Ctx, Start, Command, InjectBot, On } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { ReportService } from 'src/report/report.service';

interface SessionData {
  language?: 'uz' | 'ru';
  region?: string;
  district?: string;
  projectId?: string;
  description?: string;
  currentPage?: number;
}

@Update()
export class BotUpdate {
  private userSessions = new Map<number, SessionData>();
  private readonly ITEMS_PER_PAGE = 8;
  private readonly MAX_BUTTON_TEXT_LENGTH = 20;

  constructor(
    private readonly botService: BotService,
    private readonly reportService: ReportService,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    const userId = ctx.from.id;
    let session = this.userSessions.get(userId);

    if (!session || !session.language) {
      await ctx.reply(
        '🇺🇿 Loyihalar monitoring botiga xush kelibsiz!\n\nIltimos, tilni tanlang:',
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback("🇺🇿 O'zbekcha", 'LANG:uz')],
            [Markup.button.callback('🇷🇺 Русский', 'LANG:ru')],
          ]).reply_markup,
        },
      );
      return;
    }

    await this.showRegions(ctx, 0);
  }

  @On('callback_query')
  async onCallback(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery['data'];
    const userId = ctx.from.id;
    let session = this.userSessions.get(userId) || {};

    if (data.startsWith('LANG:')) {
      const language = data.split(':')[1] as 'uz' | 'ru';
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
    } else if (data.startsWith('DISTRICT:')) {
      const district = data.split(':')[1];
      session.district = district;
      this.userSessions.set(userId, session);
      await this.showProjects(ctx, session.region, district);
    } else if (data.startsWith('REGION_PAGE:')) {
      const page = parseInt(data.split(':')[1]);
      await this.showRegions(ctx, page);
    } else if (data.startsWith('DISTRICT_PAGE:')) {
      const [region, pageStr] = data.split(':').slice(1);
      const page = parseInt(pageStr);
      await this.showDistricts(ctx, region, page);
    } else if (data.startsWith('PROJECT:')) {
      const projectId = data.split(':')[1];
      session.projectId = projectId;
      this.userSessions.set(userId, session);

      const { region, district } = session;
      const project = this.botService.getProjectById(
        region,
        district,
        projectId,
      );

      let usageStr = project.usage
        .map((u) => `• ${u.name}: ${u.amount.toLocaleString()} so'm`)
        .join('\n');

      await ctx.editMessageText(
        session.language === 'uz'
          ? `📌 *${project.name}* haqida ma'lumot:\n\n` +
              `✅ Bajarilgan: ${project.percent}%\n` +
              `⏰ Yakunlanish sanasi: ${project.deadline}\n` +
              `💰 Ajratilgan mablag': ${project.budget.toLocaleString()} so'm\n\n` +
              `📊 Sarf qilingan:\n${usageStr}`
          : `📌 *${project.name}* информация:\n\n` +
              `✅ Завершено: ${project.percent}%\n` +
              `⏰ Дата окончания: ${project.deadline}\n` +
              `💰 Бюджет: ${project.budget.toLocaleString()} сум\n\n` +
              `📊 Потрачено:\n${usageStr}`,
        {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('📤 Ariza berish', 'REPORT')],
            [Markup.button.callback('🔙 Orqaga', `DISTRICT_PAGE:${region}:0`)],
          ]).reply_markup,
        },
      );
    } else if (data === 'REPORT') {
      await ctx.reply(
        session.language === 'uz'
          ? 'Iltimos, muammo yoki shikoyat haqida qisqacha izoh yozing (description).'
          : 'Пожалуйста, напишите короткое описание проблемы или жалобы (description).',
      );
    }
  }

  @On('text')
  async handleDescription(@Ctx() ctx: Context) {
    const session = this.userSessions.get(ctx.from.id);
    if (!session || !session.projectId) {
      await ctx.reply(
        session?.language === 'uz'
          ? `Iltimos, loyihani tanlang, so'ngra izoh yuboring.`
          : `Пожалуйста, выберите проект, а затем отправьте описание.`,
      );
      return;
    }

    if ('text' in ctx.message) {
      session.description = ctx.message.text;
      this.userSessions.set(ctx.from.id, session);
      await ctx.reply(
        session.language === 'uz'
          ? '✅ Endi rasm yoki video yuboring.'
          : '✅ Теперь отправьте изображение или видео.',
      );
    } else {
      await ctx.reply(
        session.language === 'uz'
          ? 'Iltimos, matnli xabar yuboring.'
          : 'Пожалуйста, отправьте текстовое сообщение.',
      );
    }
  }

  @On(['photo', 'video'])
  async handleMedia(@Ctx() ctx: Context) {
    const session = this.userSessions.get(ctx.from.id);
    if (!session || !session.projectId) {
      await ctx.reply(
        session.language === 'uz'
          ? 'Iltimos, loyihani tanlang.'
          : 'Пожалуйста, выберите проект.',
      );
      return;
    }

    let fileId: string | undefined;

    if ('photo' in ctx.message) {
      fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    } else if ('video' in ctx.message) {
      fileId = ctx.message.video.file_id;
    }

    if (!fileId) {
      await ctx.reply(
        session.language === 'uz'
          ? 'Iltimos, rasm yoki video yuboring.'
          : 'Пожалуйста, отправьте изображение или видео.',
      );
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

    await ctx.reply(
      session.language === 'uz'
        ? "✅ Rahmat, arizangiz qabul qilindi va tekshiruv bo'limiga yuborildi."
        : '✅ Спасибо, Ваша заявка получена и отправлена ​​в отдел рассмотрения.',
    );
  }

  private async showRegions(ctx: Context, page: number) {
    const userId = ctx.from.id;
    const session = this.userSessions.get(userId);
    if (!session || !session.language) return;

    const allRegions = this.botService.getRegions();
    const totalPages = Math.ceil(allRegions.length / this.ITEMS_PER_PAGE);
    const regionsToShow = allRegions.slice(
      page * this.ITEMS_PER_PAGE,
      (page + 1) * this.ITEMS_PER_PAGE,
    );

    const buttons = regionsToShow.map((r) => [
      Markup.button.callback(r, `REGION:${r}`),
    ]);

    const paginationButtons = [];

    if (page > 0) {
      paginationButtons.push(
        Markup.button.callback('⬅️ Oldingi', `REGION_PAGE:${page - 1}`),
      );
    }
    if (page < totalPages - 1) {
      paginationButtons.push(
        Markup.button.callback('Keyingi ➡️', `REGION_PAGE:${page + 1}`),
      );
    }

    if (paginationButtons.length > 0) {
      buttons.push(paginationButtons);
    }

    const messageText =
      session.language === 'uz'
        ? `Hududni tanlang (sahifa ${page + 1}/${totalPages}):`
        : `Выберите регион (страница ${page + 1}/${totalPages}):`;

    if (ctx.callbackQuery) {
      await ctx.editMessageText(messageText, {
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
      });
    } else {
      await ctx.reply(messageText, {
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
      });
    }
  }

  private async showDistricts(ctx: Context, region: string, page: number) {
    const userId = ctx.from.id;
    const session = this.userSessions.get(userId);
    if (!session || !session.language) return;

    const allDistricts = this.botService.getDistricts(region);
    const totalPages = Math.ceil(allDistricts.length / this.ITEMS_PER_PAGE);
    const districtsToShow = allDistricts.slice(
      page * this.ITEMS_PER_PAGE,
      (page + 1) * this.ITEMS_PER_PAGE,
    );

    const buttons = districtsToShow.map((d) => [
      Markup.button.callback(d, `DISTRICT:${d}`),
    ]);

    const paginationButtons = [];
    if (page > 0) {
      paginationButtons.push(
        Markup.button.callback(
          '⬅️ Oldingi',
          `DISTRICT_PAGE:${region}:${page - 1}`,
        ),
      );
    }
    if (page < totalPages - 1) {
      paginationButtons.push(
        Markup.button.callback(
          'Keyingi ➡️',
          `DISTRICT_PAGE:${region}:${page + 1}`,
        ),
      );
    }

    if (paginationButtons.length > 0) {
      buttons.push(paginationButtons);
    }

    const messageText =
      session.language === 'uz'
        ? `Tanlangan viloyat: ${region}\n\nTuman tanlang (sahifa ${page + 1}/${totalPages}):`
        : `Выбранный регион: ${region}\n\nВыберите район (страница ${page + 1}/${totalPages}):`;

    await ctx.editMessageText(messageText, {
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
    });
  }

  private async showProjects(ctx: Context, region: string, district: string) {
    const session = this.userSessions.get(ctx.from.id);
    if (!session) return;

    const projects = this.botService.getProjects(region, district);
    const buttons = [];

    // Loyihalarni faqat bitta ustunda chiqaramiz
    for (let i = 0; i < projects.length; i++) {
      buttons.push([
        Markup.button.callback(
          this.formatButtonText(projects[i].name),
          `PROJECT:${projects[i].id}`,
        ),
      ]);
    }

    await ctx.editMessageText(
      session.language === 'uz'
        ? `Tanlangan tuman: ${district}\n\nLoyihani tanlang:`
        : `Выбранный район: ${district}\n\nВыберите проект:`,
      {
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
      },
    );
  }

  private formatButtonText(text: string): string {
    // Agar matn juda uzun bo'lsa, qisqartirib ko'rsatamiz
    // if (text.length > this.MAX_BUTTON_TEXT_LENGTH) {
    //   return text.substring(0, this.MAX_BUTTON_TEXT_LENGTH - 3) + '...';
    // }
    return text;
  }
}