// Google Analytics Service - Privacy-First Implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const analyticsService = {
  // Track unique profile interactions (anonymous)
  trackProfileInteraction(profileType: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'profile_interaction', {
        event_category: 'engagement',
        event_label: profileType,
        // No personal data, just profile type
      });
    }
  },

  // Track usage frequency (anonymous session-based)
  trackSessionStart() {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'session_start', {
        event_category: 'engagement',
        // Session-based tracking, no user identification
      });
    }
  },

  // Track time of day usage
  trackTimeOfDayUsage() {
    if (typeof window !== 'undefined' && window.gtag) {
      const hour = new Date().getHours();
      const timeSlot = this.getTimeSlot(hour);
      
      window.gtag('event', 'time_of_day_usage', {
        event_category: 'engagement',
        event_label: timeSlot,
        value: hour,
      });
    }
  },

  // Track usage trends over time
  trackUsageEvent(eventType: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'usage_event', {
        event_category: 'engagement',
        event_label: eventType,
        // Date/time automatically included by GA
      });
    }
  },

  // Track location (country/region level only)
  trackLocationUsage() {
    if (typeof window !== 'undefined' && window.gtag) {
      // GA automatically tracks country/region level location
      // No specific address or personal location data
      window.gtag('event', 'location_usage', {
        event_category: 'engagement',
        // GA handles location automatically and anonymously
      });
    }
  },

  // Helper function to categorize time slots
  getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  },

  // Track page views (for usage trends)
  trackPageView(page: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: page,
        page_location: window.location.href,
      });
    }
  },

  // Track game interactions (for usage frequency)
  trackGameInteraction(action: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'game_interaction', {
        event_category: 'game',
        event_label: action,
      });
    }
  },
}; 