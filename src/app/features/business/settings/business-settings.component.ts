import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  readonly ragSearchUrl = `${environment.apiUrl}/knowledge/search`;

  form = this.fb.nonNullable.group({
    description: [''],
    address: [''],
    businessHours: [''],
    bankAccountInfo: [''],
  });

  ngOnInit(): void {
    this.configService.getConfig().subscribe({
      next: (res) => this.form.patchValue(res.data.business),
    });
    this.configService.getApiKeyInfo().subscribe({
      next: (res) => {
        if (res.data) this.apiKeyPrefix.set(res.data.keyPrefix);
      },
    });
  }

  save(): void {
    this.configService.updateBusiness(this.form.getRawValue()).subscribe({
      next: () => this.snackBar.open('Configuración guardada', 'Cerrar', { duration: 3000 }),
      error: (err) =>
        this.snackBar.open(err.error?.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 }),
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
