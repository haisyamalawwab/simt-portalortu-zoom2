/**
 * WhatsApp Gateway Service Client Utility
 * Communicates with the external Node.js WA Gateway service (simt-wa-gateway).
 */

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || 'http://localhost:8000';
const WA_SERVICE_SECRET = process.env.WA_SERVICE_SECRET || '';

interface WASendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface WAStatusResponse {
  success: boolean;
  isConnected: boolean;
  phoneNumber?: string;
  error?: string;
}

interface WAQRResponse {
  success: boolean;
  qrCode?: string; // base64 string
  error?: string;
}

/**
 * Helper to make authenticated requests to WA Gateway
 */
async function callWAService<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, any>
): Promise<T> {
  const url = `${WA_SERVICE_URL.replace(/\/$/, '')}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (WA_SERVICE_SECRET) {
    headers['X-Service-Secret'] = WA_SERVICE_SECRET;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    console.error(`Gagal menghubungi WhatsApp Service di ${url}:`, error.message);
    throw new Error(`WhatsApp Service Offline: ${error.message}`);
  }
}

/**
 * Sends a text message to a WhatsApp number via WA Gateway
 * @param phone WhatsApp number (e.g. '08123456789' or '628123456789')
 * @param message Message content
 * @param tenantId Tenant (School) ID associated with the sender session
 */
export async function sendWAMessage(
  phone: string,
  message: string,
  tenantId: string
): Promise<WASendResponse> {
  try {
    // Sanitize phone number (remove non-digits, replace leading 0 with 62)
    let sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.startsWith('0')) {
      sanitizedPhone = '62' + sanitizedPhone.substring(1);
    }

    return await callWAService<WASendResponse>('/send-message', 'POST', {
      phone: sanitizedPhone,
      message,
      tenantId,
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Checks connection status of a tenant's WhatsApp session
 * @param tenantId Tenant (School) ID
 */
export async function getWASessionStatus(tenantId: string): Promise<WAStatusResponse> {
  try {
    return await callWAService<WAStatusResponse>(`/status`, 'POST', { tenantId });
  } catch (error: any) {
    return {
      success: false,
      isConnected: false,
      error: error.message,
    };
  }
}

/**
 * Requests a new QR Code to scan for WhatsApp Web authentication
 * @param tenantId Tenant (School) ID
 */
export async function getWASessionQR(tenantId: string): Promise<WAQRResponse> {
  try {
    return await callWAService<WAQRResponse>(`/qr`, 'POST', { tenantId });
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
