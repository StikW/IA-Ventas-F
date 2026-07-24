import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api.models';

export interface WooCommerceConfig {
  storeUrl: string;
  connected: boolean;
  botApiConnected: boolean;
  lastSyncAt?: string;
  updatedAt: string;
  hasCredentials: boolean;
  hasBotApiCredentials: boolean;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  stockQuantity: number | null;
  stockStatus: string;
}

@Injectable({ providedIn: 'root' })
export class WooCommerceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/woocommerce`;

  getConfig() {
    return this.http.get<ApiResponse<WooCommerceConfig | null>>(`${this.baseUrl}/config`);
  }

  saveConfig(payload: {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
    botApiUser?: string;
    botApiPassword?: string;
  }) {
    return this.http.put<ApiResponse<WooCommerceConfig>>(`${this.baseUrl}/config`, payload);
  }

  testConnection(payload?: { botApiUser?: string; botApiPassword?: string }) {
    return this.http.post<
      ApiResponse<{ connected: boolean; botApiConnected: boolean; botApiStatus?: string }>
    >(`${this.baseUrl}/test-connection`, payload ?? {});
  }

  listProducts(page = 1) {
    return this.http.get<ApiResponse<WooCommerceProduct[]>>(`${this.baseUrl}/products`, {
      params: { page },
    });
  }
}
