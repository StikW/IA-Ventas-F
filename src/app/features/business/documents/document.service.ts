import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/api.models';

export interface DocumentItem {
  id: string;
  tenantId: string;
  filename: string;
  mimeType: string;
  size: number;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  chunkCount: number;
  vectorCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface CatalogRefreshStats {
  productCount: number;
  skuCount: number;
  packCount: number;
  issues: Array<{ kind: string; count: number }>;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/documents`;

  list(params?: { limit?: number; cursor?: string }) {
    let httpParams = new HttpParams();
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.cursor) httpParams = httpParams.set('cursor', params.cursor);
    return this.http.get<PaginatedResponse<DocumentItem>>(this.baseUrl, { params: httpParams });
  }

  refreshCatalog() {
    return this.http.post<{ data: DocumentItem; catalog: CatalogRefreshStats }>(
      `${this.baseUrl}/refresh-catalog`,
      {}
    );
  }

  download(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  reprocess(id: string) {
    return this.http.post<{ data: DocumentItem }>(`${this.baseUrl}/${id}/reprocess`, {});
  }
}
