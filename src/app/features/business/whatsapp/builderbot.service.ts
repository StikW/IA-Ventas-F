import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api.models';

export interface BuilderBotConfigView {
  configured: boolean;
  enabled: boolean;
  message?: string;
  deviceId?: string;
  deviceName?: string;
  phone?: string;
  sessionStatus?: 'disconnected' | 'connecting' | 'connected' | 'unknown';
  platformApiKeyPrefix?: string;
  webhookUrl?: string;
  appPublicUrl?: string;
  webhookNeedsSync?: boolean;
  /** Modo BuilderBot resuelto en servidor (`cloud-v2` = relay MCP + flows UI). */
  apiMode?: 'cloud-v2' | 'wa-api';
  projectId?: string;
  connectUrl?: string;
  updatedAt?: string;
}

export interface BuilderBotQrView {
  qrImageUrl?: string;
  qrBase64?: string;
  pairingCode?: string;
}

@Injectable({ providedIn: 'root' })
export class BuilderBotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/builderbot`;

  getConfig() {
    return this.http.get<ApiResponse<BuilderBotConfigView>>(`${this.baseUrl}/config`);
  }

  getQr() {
    return this.http.get<ApiResponse<BuilderBotQrView>>(`${this.baseUrl}/qr`);
  }

  getQrImage() {
    return this.http.get(`${this.baseUrl}/qr/image`, { responseType: 'blob' });
  }

  connectPhone(phone: string) {
    return this.http.post<ApiResponse<{ pairingCode?: string }>>(`${this.baseUrl}/connect-phone`, { phone });
  }

  refreshStatus() {
    return this.http.post<ApiResponse<{ sessionStatus: string; phone?: string }>>(`${this.baseUrl}/refresh-status`, {});
  }

  linkBot(botId: string) {
    return this.http.post<ApiResponse<BuilderBotConfigView>>(`${this.baseUrl}/link-bot`, { botId });
  }

  provision() {
    return this.http.post<ApiResponse<BuilderBotConfigView | null>>(`${this.baseUrl}/provision`, {});
  }

  syncWebhook() {
    return this.http.post<ApiResponse<{ webhookUrl: string; syncedAt: string }>>(`${this.baseUrl}/sync-webhook`, {});
  }
}
