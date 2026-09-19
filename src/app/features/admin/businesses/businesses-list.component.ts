import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NvIconComponent } from '../../../shared/components/nv-icon/nv-icon.component';
import { BusinessService } from './business.service';
import { Business } from '../../../shared/models/api.models';

function passwordMatch(group: AbstractControl) {
  const password = group.get('ownerPassword')?.value;
  const confirm = group.get('ownerPasswordConfirm')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-businesses-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    NvIconComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './businesses-list.component.html',
  styleUrl: './businesses-list.component.scss',
})
export class BusinessesListComponent implements OnInit {
  private readonly businessService = inject(BusinessService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly businesses = signal<Business[]>([]);
  readonly loading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly hideOwnerPassword = signal(true);
  readonly hideOwnerConfirm = signal(true);

  displayedColumns = ['name', 'slug', 'status', 'contactEmail', 'actions'];

  form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      slug: [''],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: [''],
      ownerFirstName: ['', Validators.required],
      ownerLastName: ['', Validators.required],
      ownerEmail: ['', Validators.email],
      ownerPassword: ['', [Validators.required, Validators.minLength(8)]],
      ownerPasswordConfirm: ['', Validators.required],
    },
    { validators: passwordMatch }
  );

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.loading.set(true);
    this.businessService.list().subscribe({
      next: (res) => {
        this.businesses.set([...res.data]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Error al cargar negocios', 'Cerrar', { duration: 3000 });
      },
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  createBusiness(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('passwordMismatch')) {
        this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      }
      return;
    }

    const v = this.form.getRawValue();
    this.businessService
      .create({
        name: v.name,
        slug: v.slug || undefined,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone || undefined,
        owner: {
          firstName: v.ownerFirstName,
          lastName: v.ownerLastName,
          email: v.ownerEmail || undefined,
          password: v.ownerPassword,
          phone: v.contactPhone || undefined,
        },
      })
      .subscribe({
        next: (res) => {
          const loginEmail = res.data.owner.email;
          let msg = `Negocio creado. Login: ${loginEmail}`;
          if (res.data.platformApiKey) {
            msg += `. API Key (cópiala ahora): ${res.data.platformApiKey}`;
          }
          if (res.data.builderBotWarning) {
            msg += `. WhatsApp: ${res.data.builderBotWarning}`;
          }
          this.snackBar.open(msg, 'Cerrar', { duration: res.data.builderBotWarning ? 15000 : 10000 });
          this.form.reset();
          this.showForm.set(false);
          this.loadBusinesses();
        },
        error: (err) => {
          const details = err.error?.error?.details as Record<string, string[]> | undefined;
          const detailMsg = details
            ? Object.entries(details)
                .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                .join(' · ')
            : null;
          this.snackBar.open(detailMsg ?? err.error?.error?.message ?? 'Error al crear', 'Cerrar', {
            duration: 5000,
          });
        },
      });
  }

  activate(business: Business): void {
    this.businessService.activate(business.id).subscribe({
      next: () => this.loadBusinesses(),
    });
  }

  deactivate(business: Business): void {
    this.businessService.deactivate(business.id).subscribe({
      next: () => this.loadBusinesses(),
    });
  }

  deleteBusiness(business: Business): void {
    const confirmed = confirm(
      `¿Eliminar "${business.name}" permanentemente?\n\nSe borrarán usuarios, documentos, pedidos, WhatsApp (BuilderBot), archivos S3, vectores y toda la configuración.\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    this.deletingId.set(business.id);
    this.businessService.delete(business.id).subscribe({
      next: (res) => {
        this.deletingId.set(null);
        let msg = `Negocio "${res.data.businessName}" eliminado`;
        if (res.data.warnings.length) {
          msg += `. Advertencias: ${res.data.warnings.join(' · ')}`;
        }
        this.snackBar.open(msg, 'Cerrar', { duration: res.data.warnings.length ? 12000 : 5000 });
        this.loadBusinesses();
      },
      error: (err) => {
        this.deletingId.set(null);
        this.snackBar.open(err.error?.error?.message ?? 'Error al eliminar negocio', 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }
}
