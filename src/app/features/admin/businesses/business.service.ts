import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  Business,
  CreateBusinessResult,
  DeleteBusinessResult,
  PaginatedResponse,
} from '../../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/businesses`;

  list(params?: { status?: string; limit?: number; cursor?: string }) {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);

    return this.http.get<PaginatedResponse<Business>>(this.baseUrl, { params: httpParams });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Business>>(`${this.baseUrl}/${id}`);
  }

  create(payload: {
    name: string;
    slug?: string;
    contactEmail: string;
    contactPhone?: string;
    owner: {
      firstName: string;
      lastName: string;
      email?: string;
      password: string;
      phone?: string;
    };
  }) {
    const body: Record<string, unknown> = {
      name: payload.name.trim(),
      contactEmail: payload.contactEmail.trim(),
      owner: {
        firstName: payload.owner.firstName.trim(),
        lastName: payload.owner.lastName.trim(),
        password: payload.owner.password,
      },
    };

    const slug = payload.slug?.trim();
    const phone = payload.contactPhone?.trim();
    const ownerEmail = payload.owner.email?.trim();
    const ownerPhone = payload.owner.phone?.trim();

    if (slug) body['slug'] = slug;
    if (phone) body['contactPhone'] = phone;
    if (ownerEmail) (body['owner'] as Record<string, string>)['email'] = ownerEmail;
    if (ownerPhone) (body['owner'] as Record<string, string>)['phone'] = ownerPhone;

    return this.http.post<ApiResponse<CreateBusinessResult>>(this.baseUrl, body);
  }

  update(id: string, payload: Partial<{ name: string; contactEmail: string; contactPhone: string }>) {
    return this.http.patch<ApiResponse<Business>>(`${this.baseUrl}/${id}`, payload);
  }

  activate(id: string) {
    return this.http.post<ApiResponse<Business>>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: string) {
    return this.http.post<ApiResponse<Business>>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<DeleteBusinessResult>>(`${this.baseUrl}/${id}`);
  }
}
