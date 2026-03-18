export interface GoogleAuthStatus {
  isAuthenticated: boolean;
}

export interface ScheduleEventData {
  title: string;
  description: string;
  start: string;
  end: string;
  timeZone: string;
}

export class GoogleService {
  static async getAuthUrl(): Promise<string> {
    const response = await fetch('/api/auth/google/url');
    const data = await response.json();
    return data.url;
  }

  static async getStatus(): Promise<GoogleAuthStatus> {
    const response = await fetch('/api/auth/google/status');
    return await response.json();
  }

  static async logout(): Promise<void> {
    await fetch('/api/auth/google/logout', { method: 'POST' });
  }

  static async scheduleEvent(
    eventData: ScheduleEventData, 
    pdfBase64: string, 
    fileName: string
  ): Promise<{ success: boolean; eventUrl?: string; driveUrl?: string; error?: string }> {
    const response = await fetch('/api/google/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventData, pdfBase64, fileName }),
    });
    return await response.json();
  }

  static openAuthPopup(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const url = await this.getAuthUrl();
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          url,
          'google_auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          reject(new Error('Popup bloqueado pelo navegador. Por favor, permita popups para este site.'));
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            resolve();
          }
        };

        window.addEventListener('message', handleMessage);
      } catch (error) {
        reject(error);
      }
    });
  }
}
