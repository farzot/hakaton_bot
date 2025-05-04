export declare class BotService {
    getRegions(): string[];
    getDistricts(region: string): any;
    getProjects(region: string, district: string): any;
    getProjectById(region: string, district: string, projectId: string): any;
}
