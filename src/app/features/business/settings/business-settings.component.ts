import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { ConfigService } from './config.service';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './business-settings.component.html',
  styleUrl: './business-settings.component.scss',
})
export class BusinessSettingsComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly generatedApiKey = signal<string | null>(null);
  readonly apiKeyPrefix = signal<string | null>(null);
  readonly saving = signal(false);
  readonly ragSearchUrl = `${environment.apiUrl}/knowledge/search`;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    contactEmail: ['', [Validators.required, Validators.email]],
    contactPhone: [''],
    description: [''],
    address: [''],
    businessHours: [''],
    bankAccountInfo: [''],
    checkoutFormUrl: [''],
    checkoutMode: ['link' as 'link' | 'whatsapp'],
  });

  ngOnInit(): void {
    this.configService.getConfig().subscribe({
      next: (res) => {
        const data = res.data;
        this.form.patchValue({
          name: data.name,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone ?? '',
          description: data.business.description ?? '',
          address: data.business.address ?? '',
          businessHours: data.business.businessHours ?? '',
          bankAccountInfo: data.business.bankAccountInfo ?? '',
          checkoutFormUrl: data.business.checkoutFormUrl ?? '',
          checkoutMode: data.business.checkoutMode ?? 'link',
        });
      },
    });
    this.configService.getApiKeyInfo().subscribe({
      next: (res) => {
        if (res.data) this.apiKeyPrefix.set(res.data.keyPrefix);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.configService.updateBusiness(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Información guardada. El saludo de WhatsApp ya usa este nombre.', 'Cerrar', {
          duration: 4000,
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  regenerateApiKey(): void {
    this.configService.regenerateApiKey().subscribe({
      next: (res) => {
        this.generatedApiKey.set(res.data.apiKey);
        this.apiKeyPrefix.set(res.data.keyPrefix);
        this.snackBar.open('API Key generada. Cópiala ahora, no se volverá a mostrar.', 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }
}
