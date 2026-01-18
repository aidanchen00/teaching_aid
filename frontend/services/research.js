import axios from 'axios';

// Next.js API routes are served from the same origin
const API_BASE_URL = typeof window !== 'undefined'
  ? '' // Empty string means same origin
  : '';

/**
 * Frontend service for curriculum research using Woodwide AI
 */
export class ResearchService {
  /**
   * Analyze curriculum and get Woodwide AI insights
   */
  static async analyzeCurriculum(curriculum, city, country) {
    try {
      console.log('Calling API:', `${API_BASE_URL}/api/curriculum-research`);
      console.log('Payload:', { curriculum: curriculum.title, city, country });
      
      const response = await axios.post(`${API_BASE_URL}/api/curriculum-research`, {
        curriculum,
        city,
        country
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      console.log('API Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Research service error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more helpful error message
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to backend server. Make sure the server is running on port 3001.');
      } else if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.error || 'Server error occurred');
      } else {
        throw new Error(error.message || 'Failed to load research data');
      }
    }
  }

  /**
   * Fetch educational data for a city
   */
  static async fetchEducationalData(city, country) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/educational-data/${encodeURIComponent(city)}/${encodeURIComponent(country)}`
      );
      return response.data;
    } catch (error) {
      console.error('Educational data fetch error:', error);
      throw error;
    }
  }
}

