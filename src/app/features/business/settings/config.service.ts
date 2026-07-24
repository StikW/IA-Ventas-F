import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api.models';

export interface BusinessConfig {
  tenantId: string;
  business: {
    description?: string;
    address?: string;
    businessHours?: string;
    bankAccountInfo?: string;
    checkoutFormUrl?: string;
    checkoutMode?: 'link' | 'whatsapp';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyInfo {
  keyPrefix: string;
  createdAt: string;
}

export interface RegeneratedApiKey {
  apiKey: string;
  keyPrefix: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/config`;

  getConfig() {
    return this.http.get<ApiResponse<BusinessConfig>>(this.baseUrl);
  }

  updateBusiness(business: BusinessConfig['business']) {
    return this.http.put<ApiResponse<BusinessConfig>>(`${this.baseUrl}/business`, business);
  }

  getApiKeyInfo() {
    return this.http.get<ApiResponse<ApiKeyInfo | null>>(`${this.baseUrl}/api-key`);
  }

  regenerateApiKey() {
    return this.http.post<ApiResponse<RegeneratedApiKey>>(`${this.baseUrl}/api-key/regenerate`, {});
  }
}
