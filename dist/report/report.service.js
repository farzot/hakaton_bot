"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let ReportService = class ReportService {
    constructor() {
        this.reportFilePath = path.join(__dirname, 'reports.json');
    }
    async saveReportToFile(report) {
        const reports = await this.getReports();
        reports.push(report);
        fs.writeFileSync(this.reportFilePath, JSON.stringify(reports, null, 2));
    }
    async getReports() {
        if (!fs.existsSync(this.reportFilePath)) {
            return [];
        }
        const fileContent = fs.readFileSync(this.reportFilePath, 'utf-8');
        return JSON.parse(fileContent);
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)()
], ReportService);
//# sourceMappingURL=report.service.js.map