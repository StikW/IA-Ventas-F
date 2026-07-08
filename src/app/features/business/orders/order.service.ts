import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../shared/models/api.models';

export interface Order {
  id: string;
  customerPhone: string;
  customerName: string;
  items: Array<{ name: string; sku: string; quantity: number; unitPrice: number }>;
  total: number;
  currency: string;
  status: string;
  woocommerceOrderId?: string;
  woocommerceOrderNumber?: string;
  createdAt: string;
}

export interface TenantMetrics {
  ordersCount: number;
  documentsCount: number;
  documentsReady: number;
  recentOrders: Order[];
  recentAudit: Array<{ action: string; resource: string; createdAt: string }>;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  list(params?: { status?: string; limit?: number }) {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<PaginatedResponse<Order>>(this.baseUrl, { params: httpParams });
  }

  getMetrics() {
    return this.http.get<ApiResponse<TenantMetrics>>(`${this.baseUrl}/metrics/tenant`);
  }
}
