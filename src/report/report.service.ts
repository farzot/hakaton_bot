// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class ReportService {
//   private readonly reportsDir = path.join(__dirname, '..', '..', 'reports');

//   constructor() {
//     if (!fs.existsSync(this.reportsDir)) {
//       fs.mkdirSync(this.reportsDir);
//     }
//   }

//   async saveReportToFile(report: any): Promise<void> {
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const fileName = `${report.userId}_${timestamp}.json`;
//     const filePath = path.join(this.reportsDir, fileName);

//     fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
//   }
// }

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportService {
  private reportFilePath = path.join(__dirname, 'reports.json');

  async saveReportToFile(report: any): Promise<void> {
    const reports = await this.getReports();
    reports.push(report);

    fs.writeFileSync(this.reportFilePath, JSON.stringify(reports, null, 2));
  }

  private async getReports(): Promise<any[]> {
    if (!fs.existsSync(this.reportFilePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(this.reportFilePath, 'utf-8');
    return JSON.parse(fileContent);
  }
}

