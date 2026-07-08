import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WooCommerceService, WooCommerceProduct } from './woocommerce.service';

@Component({
  selector: 'app-woocommerce-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './woocommerce-settings.component.html',
  styleUrl: './woocommerce-settings.component.scss',
})
export class WooCommerceSettingsComponent implements OnInit {
  private readonly wooService = inject(WooCommerceService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly products = signal<WooCommerceProduct[]>([]);
  readonly loadingProducts = signal(false);
  readonly testing = signal(false);
  readonly connected = signal(false);
  readonly hasCredentials = signal(false);

  productColumns = ['name', 'sku', 'price', 'stock'];

  form = this.fb.nonNullable.group({
    storeUrl: ['', [Validators.required]],
    consumerKey: ['', Validators.required],
    consumerSecret: ['', Validators.required],
  });

  ngOnInit(): void {
    this.wooService.getConfig().subscribe({
      next: (res) => {
        const config = res.data;
        if (config) {
          this.form.patchValue({ storeUrl: config.storeUrl });
          this.connected.set(config.connected);
          this.hasCredentials.set(config.hasCredentials);
        }
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.wooService.saveConfig(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.connected.set(res.data.connected);
        this.hasCredentials.set(res.data.hasCredentials);
        this.snackBar.open('Configuración WooCommerce guardada', 'Cerrar', { duration: 3000 });
        this.form.patchValue({ consumerKey: '', consumerSecret: '' });
      },
      error: (err) =>
        this.snackBar.open(err.error?.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 }),
    });
  }

  testConnection(): void {
    this.testing.set(true);
    this.wooService.testConnection().subscribe({
      next: (res) => {
        this.testing.set(false);
        this.connected.set(res.data.connected);
        this.snackBar.open(
          res.data.connected ? 'Conexión exitosa' : 'No se pudo conectar',
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (err) => {
        this.testing.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error de conexión', 'Cerrar', { duration: 4000 });
      },
    });
  }

  loadProducts(): void {
    this.loadingProducts.set(true);
    this.wooService.listProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loadingProducts.set(false);
      },
      error: (err) => {
        this.loadingProducts.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al cargar productos', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
