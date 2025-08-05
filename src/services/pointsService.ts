import { API_URL } from './auth';

export interface PointsResponse {
  userId: string;
  points: number;
}

export const pointsService = {
  // Fetch current points for a user
  async getCurrentPoints(userId: string = 'test@example.com'): Promise<number> {
    try {
      console.log('🔍 Fetching points for user:', userId);
      console.log('🔍 API URL:', `${API_URL}/user-points/${userId}`);
      
      const response = await fetch(`${API_URL}/user-points/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ Failed to fetch points:', response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        return 0;
      }

      const data: PointsResponse = await response.json();
      console.log('✅ Fetched points successfully:', data);
      return data.points;
    } catch (error) {
      console.error('❌ Error fetching points:', error);
      return 0;
    }
  },

  // Push points to backend
  async pushPoints(points: number, userId: string = 'test@example.com'): Promise<{ success: boolean; points?: number; error?: string }> {
    try {
      console.log('🚀 Pushing points:', points, 'for user:', userId);
      
      const response = await fetch(`${API_URL}/push-points`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points, userId }),
      });

      const data = await response.json();
      console.log('📡 Push points response:', data);

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to push points' };
      }

      return { success: true, points: data.points };
    } catch (error) {
      console.error('❌ Error pushing points:', error);
      return { success: false, error: 'Network error' };
    }
  }
}; 