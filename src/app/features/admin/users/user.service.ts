import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse, User } from '../../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  list(tenantId: string, params?: { limit?: number; cursor?: string }) {
    let httpParams = new HttpParams().set('tenantId', tenantId);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    return this.http.get<PaginatedResponse<User>>(this.baseUrl, { params: httpParams });
  }

  create(payload: {
    email: string;
    password: string;
    role: 'NEGOCIO';
    tenantId: string;
    profile: { firstName: string; lastName: string; phone?: string };
  }) {
    return this.http.post<ApiResponse<User>>(this.baseUrl, payload);
  }

  deactivate(id: string) {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
