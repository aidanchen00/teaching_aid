import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : 'http://localhost:3001';

/**
 * Service for talent migration forecast data
 */
export class MigrationService {
  /**
   * Get talent migration forecast
   */
  static async getTalentMigrationForecast() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/talent-migration-forecast`);
      return response.data;
    } catch (error) {
      console.error('Migration service error:', error);
      throw error;
    }
  }
}

