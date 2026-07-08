import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api.models';

export interface WooCommerceConfig {
  storeUrl: string;
  connected: boolean;
  lastSyncAt?: string;
  updatedAt: string;
  hasCredentials: boolean;
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

  saveConfig(payload: { storeUrl: string; consumerKey: string; consumerSecret: string }) {
    return this.http.put<ApiResponse<WooCommerceConfig>>(`${this.baseUrl}/config`, payload);
  }

  testConnection() {
    return this.http.post<ApiResponse<{ connected: boolean }>>(`${this.baseUrl}/test-connection`, {});
  }

  listProducts(page = 1) {
    return this.http.get<ApiResponse<WooCommerceProduct[]>>(`${this.baseUrl}/products`, {
      params: { page },
    });
  }
}
