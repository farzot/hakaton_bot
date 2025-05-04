import { Injectable } from '@nestjs/common';
import { regions } from '../data/regions';
import { projects } from '../data/projects';

@Injectable()
export class BotService {
  getRegions() {
    return Object.keys(regions);
  }

  getDistricts(region: string) {
    return regions[region] || [];
  }

  getProjects(region: string, district: string) {
    return projects[region]?.[district] || [];
  }

  getProjectById(region: string, district: string, projectId: string) {
    return this.getProjects(region, district).find((p) => p.id === projectId);
  }
}
