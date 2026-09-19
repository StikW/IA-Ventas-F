import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../../environments/environment';
import { NvIconComponent } from '../../../shared/components/nv-icon/nv-icon.component';
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
    NvIconComponent,
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
  readonly botApiConnected = signal(false);
  readonly hasCredentials = signal(false);
  readonly hasBotApiCredentials = signal(false);
  readonly hideConsumerSecret = signal(true);
  readonly hideBotPassword = signal(true);

  productColumns = ['name', 'sku', 'price', 'stock'];
  readonly apiBaseHint = environment.apiUrl;

  form = this.fb.nonNullable.group({
    storeUrl: ['', [Validators.required]],
    consumerKey: [''],
    consumerSecret: [''],
    botApiUser: [''],
    botApiPassword: [''],
  });

  ngOnInit(): void {
    this.wooService.getConfig().subscribe({
      next: (res) => {
        const config = res.data;
        if (config) {
          this.form.patchValue({ storeUrl: config.storeUrl });
          this.connected.set(config.connected);
          this.botApiConnected.set(config.botApiConnected);
          this.hasCredentials.set(config.hasCredentials);
          this.hasBotApiCredentials.set(config.hasBotApiCredentials);
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
        this.botApiConnected.set(res.data.botApiConnected);
        this.hasCredentials.set(res.data.hasCredentials);
        this.hasBotApiCredentials.set(res.data.hasBotApiCredentials);
        this.snackBar.open('Configuración WooCommerce guardada', 'Cerrar', { duration: 3000 });
        this.form.patchValue({ consumerKey: '', consumerSecret: '' });
      },
      error: (err) =>
        this.snackBar.open(err.error?.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 }),
    });
  }

  testConnection(): void {
    this.testing.set(true);
    const { botApiUser, botApiPassword } = this.form.getRawValue();
    this.wooService.testConnection({ botApiUser, botApiPassword }).subscribe({
      next: (res) => {
        this.testing.set(false);
        this.connected.set(res.data.connected);
        this.botApiConnected.set(res.data.botApiConnected ?? false);
        if (res.data.botApiConnected) {
          this.hasBotApiCredentials.set(true);
        }
        const status = res.data.botApiStatus;
        let msg = 'No se pudo conectar';
        if (res.data.connected && res.data.botApiConnected) {
          msg = 'WooCommerce y MASSI Bot API conectados';
        } else if (res.data.connected && status === 'forbidden') {
          msg =
            'WooCommerce OK. MASSI Bot API: el servidor WordPress no recibió Authorization (revisa hosting o actualiza el plugin massi-bot-api).';
        } else if (res.data.connected && status === 'auth_failed') {
          msg =
            'WooCommerce OK. MASSI Bot API: usuario o Application Password incorrectos. Crea la App Password en el perfil de iaventas-bot y pulsa Guardar antes de Probar.';
        } else if (res.data.connected) {
          msg =
            'WooCommerce OK. Falta Usuario WP + Application Password del bot (guárdalos y vuelve a probar).';
        }
        this.snackBar.open(msg, 'Cerrar', { duration: 6000 });
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
