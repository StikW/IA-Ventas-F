import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocumentService, DocumentItem } from './document.service';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
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
  readonly uploading = signal(false);

  displayedColumns = ['filename', 'status', 'vectors', 'createdAt', 'actions'];

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.documentService.upload(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.snackBar.open('Documento subido y procesado', 'Cerrar', { duration: 3000 });
        this.load();
        input.value = '';
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al subir', 'Cerrar', { duration: 5000 });
        input.value = '';
        this.load();
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
}
