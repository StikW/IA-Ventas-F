import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocumentService, DocumentItem } from './document.service';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './documents-list.component.html',
  styleUrl: './documents-list.component.scss',
})
export class DocumentsListComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly documents = signal<DocumentItem[]>([]);
  readonly refreshing = signal(false);
  readonly downloading = signal(false);
  readonly latestDocument = computed(() => this.documents()[0] ?? null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.documentService.list().subscribe({
      next: (res) => this.documents.set(res.data),
      error: (err) =>
        this.snackBar.open(err.error?.error?.message ?? 'Error al cargar', 'Cerrar', { duration: 4000 }),
    });
  }

  refreshCatalog(): void {
    this.refreshing.set(true);
    this.documentService.refreshCatalog().subscribe({
      next: (res) => {
        this.refreshing.set(false);
        if (res.data.status === 'FAILED') {
          this.snackBar.open(
            res.data.errorMessage ?? 'El catálogo se generó pero falló la vectorización',
            'Cerrar',
            { duration: 8000 }
          );
        } else {
          const { productCount, skuCount, packCount } = res.catalog;
          this.snackBar.open(
            `Catálogo actualizado: ${productCount} productos, ${skuCount} SKU` +
              (packCount ? `, ${packCount} a granel` : ''),
            'Cerrar',
            { duration: 5000 }
          );
        }
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.refreshing.set(false);
        this.snackBar.open(this.errorMessage(err, 'Error al actualizar el catálogo'), 'Cerrar', {
          duration: 6000,
        });
        this.load();
      },
    });
  }

  downloadLatest(): void {
    const doc = this.latestDocument();
    if (!doc) return;
    this.downloadDoc(doc);
  }

  downloadDoc(doc: DocumentItem): void {
    this.downloading.set(true);
    this.documentService.download(doc.id).subscribe({
      next: (response) => {
        this.downloading.set(false);
        const blob = response.body;
        if (!blob) {
          this.snackBar.open('No se pudo descargar el documento', 'Cerrar', { duration: 4000 });
          return;
        }
        const filename = this.filenameFromHeader(response.headers.get('content-disposition')) ?? doc.filename;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.downloading.set(false);
        void this.blobError(err).then((message) =>
          this.snackBar.open(message, 'Cerrar', { duration: 5000 })
        );
      },
    });
  }

  reprocess(doc: DocumentItem): void {
    this.documentService.reprocess(doc.id).subscribe({
      next: () => {
        this.snackBar.open('Documento reprocesado', 'Cerrar', { duration: 3000 });
        this.load();
      },
      error: (err) =>
        this.snackBar.open(err.error?.error?.message ?? 'Error', 'Cerrar', { duration: 4000 }),
    });
  }

  deleteDoc(doc: DocumentItem): void {
    if (!confirm(`¿Eliminar ${doc.filename}?`)) return;
    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.snackBar.open('Documento eliminado', 'Cerrar', { duration: 3000 });
        this.load();
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    const fromBody = err.error?.error?.message;
    if (typeof fromBody === 'string' && fromBody.trim()) return fromBody;
    return fallback;
  }

  private filenameFromHeader(header: string | null): string | null {
    if (!header) return null;
    const match = /filename="([^"]+)"/i.exec(header);
    return match?.[1] ?? null;
  }

  private async blobError(err: HttpErrorResponse): Promise<string> {
    const fallback = 'Error al descargar';
    if (!(err.error instanceof Blob)) return this.errorMessage(err, fallback);
    try {
      const parsed = JSON.parse(await err.error.text()) as { error?: { message?: string } };
      return parsed.error?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
}
