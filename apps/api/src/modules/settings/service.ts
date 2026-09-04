import { settingsRepository } from "./repository";
import type { UpdateOrgPreferencesInput } from "./schema";

export class SettingsService {
  async getPreferences(organizationId: string) {
    return settingsRepository.getPreferences(organizationId);
  }

  async updatePreferences(
    organizationId: string,
    data: Partial<UpdateOrgPreferencesInput>,
  ) {
    return settingsRepository.updatePreferences(organizationId, data);
  }
}

export const settingsService = new SettingsService();