import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BuilderBotConfigView,
  BuilderBotQrView,
  BuilderBotService,
} from './builderbot.service';

@Component({
  selector: 'app-whatsapp-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './whatsapp-settings.component.html',
  styleUrl: './whatsapp-settings.component.scss',
})
export class WhatsAppSettingsComponent implements OnInit {
  private readonly builderBotService = inject(BuilderBotService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly config = signal<BuilderBotConfigView | null>(null);
  readonly qr = signal<BuilderBotQrView | null>(null);
  readonly loading = signal(false);
  readonly loadingQr = signal(false);
  readonly connecting = signal(false);
  readonly pairingCode = signal<string | null>(null);
  readonly provisioning = signal(false);

  phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,20}$/)]],
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.builderBotService.getConfig().subscribe({
      next: (res) => {
        this.config.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al cargar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  loadQr(): void {
    this.loadingQr.set(true);
    this.builderBotService.getQr().subscribe({
      next: (res) => {
        this.qr.set(res.data);
        this.loadingQr.set(false);
      },
      error: (err) => {
        this.loadingQr.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'No se pudo obtener el QR', 'Cerrar', { duration: 5000 });
      },
    });
  }

  connectByPhone(): void {
    if (this.phoneForm.invalid) return;
    this.connecting.set(true);
    this.builderBotService.connectPhone(this.phoneForm.getRawValue().phone).subscribe({
      next: (res) => {
        this.connecting.set(false);
        if (res.data.pairingCode) this.pairingCode.set(res.data.pairingCode);
        this.snackBar.open('Código solicitado. Revisa WhatsApp en tu teléfono.', 'Cerrar', { duration: 5000 });
        this.refreshStatus();
      },
      error: (err) => {
        this.connecting.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al conectar', 'Cerrar', { duration: 5000 });
      },
    });
  }

  refreshStatus(): void {
    this.loading.set(true);
    this.builderBotService.refreshStatus().subscribe({
      next: () => this.loadConfig(),
      error: () => {
        this.loading.set(false);
        this.loadConfig();
      },
    });
  }

  provisionWhatsApp(): void {
    this.provisioning.set(true);
    this.builderBotService.provision().subscribe({
      next: () => {
        this.provisioning.set(false);
        this.snackBar.open('WhatsApp provisionado', 'Cerrar', { duration: 4000 });
        this.loadConfig();
      },
      error: (err) => {
        this.provisioning.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'No se pudo provisionar', 'Cerrar', { duration: 5000 });
      },
    });
  }

  statusLabel(status?: string): string {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  }
}
