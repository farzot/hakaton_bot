"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
async function bootstrap() {
    (0, dotenv_1.config)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3000);
    console.log(`Server is running in 3000`);
    console.log('BOT_TOKEN:', process.env.BOT_TOKEN);
}
bootstrap();
//# sourceMappingURL=main.js.map