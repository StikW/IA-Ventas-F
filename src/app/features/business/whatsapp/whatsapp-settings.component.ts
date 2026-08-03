import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WooCommerceService } from '../woocommerce/woocommerce.service';
import { BuilderBotConfigView, BuilderBotService } from './builderbot.service';

@Component({
  selector: 'app-whatsapp-settings',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  templateUrl: './whatsapp-settings.component.html',
  styleUrl: './whatsapp-settings.component.scss',
})
export class WhatsAppSettingsComponent implements OnInit, OnDestroy {
  private readonly builderBotService = inject(BuilderBotService);
  private readonly wooCommerceService = inject(WooCommerceService);
  private readonly snackBar = inject(MatSnackBar);

  readonly config = signal<BuilderBotConfigView | null>(null);
  readonly catalogUrlHint = signal<string | null>(null);
  readonly qrObjectUrl = signal<string | null>(null);
  readonly loading = signal(false);
  readonly loadingQr = signal(false);
  readonly provisioning = signal(false);
  readonly syncingWebhook = signal(false);
  readonly qrError = signal<string | null>(null);
  readonly popupBlocked = signal(false);

  private qrRefreshTimer?: ReturnType<typeof setInterval>;
  private statusPollTimer?: ReturnType<typeof setInterval>;
  private connectPopup?: Window | null;

  ngOnInit(): void {
    this.loadConfig();
    this.loadCatalogUrlHint();
  }

  private loadCatalogUrlHint(): void {
    this.wooCommerceService.getConfig().subscribe({
      next: (res) => {
        const storeUrl = res.data?.storeUrl?.replace(/\/$/, '');
        if (storeUrl) {
          this.catalogUrlHint.set(`${storeUrl}/tienda/`);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.revokeQrUrl();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.builderBotService.getConfig().subscribe({
      next: (res) => {
        this.config.set(res.data);
        this.loading.set(false);
        if (res.data.configured && res.data.sessionStatus !== 'connected') {
          this.startQrFlow(res.data);
        } else {
          this.clearTimers();
          this.revokeQrUrl();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'Error al cargar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private startQrFlow(cfg: BuilderBotConfigView): void {
    this.loadQrImage();
    this.maybeAutoOpenConnectPanel(cfg);
    this.clearTimers();
    this.qrRefreshTimer = setInterval(() => this.loadQrImage(), 45000);
    this.statusPollTimer = setInterval(() => this.pollConnectionStatus(), 10000);
  }

  /** Abre el panel BBC en ventana emergente (no iframe — BBC lo bloquea). */
  openConnectPanel(): void {
    const url = this.config()?.connectUrl;
    if (!url) {
      this.snackBar.open('No hay enlace de vinculación disponible', 'Cerrar', { duration: 4000 });
      return;
    }

    this.popupBlocked.set(false);
    const popup = window.open(
      url,
      'builderbot-whatsapp-connect',
      'noopener,noreferrer,width=520,height=760,scrollbars=yes,resizable=yes'
    );
    this.connectPopup = popup;

    if (!popup) {
      this.popupBlocked.set(true);
      this.snackBar.open('Permite ventanas emergentes o usa el enlace manual de abajo.', 'Cerrar', {
        duration: 8000,
      });
    }
  }

  private maybeAutoOpenConnectPanel(cfg: BuilderBotConfigView): void {
    if (!cfg.connectUrl) return;

    const projectId = cfg.projectId ?? cfg.deviceId ?? 'default';
    const storageKey = `bb-connect-popup:${projectId}`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, '1');
    this.openConnectPanel();
  }

  private clearTimers(): void {
    if (this.qrRefreshTimer) {
      clearInterval(this.qrRefreshTimer);
      this.qrRefreshTimer = undefined;
    }
    if (this.statusPollTimer) {
      clearInterval(this.statusPollTimer);
      this.statusPollTimer = undefined;
    }
  }

  private revokeQrUrl(): void {
    const current = this.qrObjectUrl();
    if (current) URL.revokeObjectURL(current);
    this.qrObjectUrl.set(null);
  }

  loadQrImage(): void {
    this.loadingQr.set(true);
    this.qrError.set(null);
    this.builderBotService.getQrImage().subscribe({
      next: (blob) => {
        void this.applyQrBlob(blob);
      },
      error: (err) => {
        void this.handleQrLoadError(err);
      },
    });
  }

  private async applyQrBlob(blob: Blob): Promise<void> {
    if (blob.type.includes('json')) {
      const text = await blob.text();
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        this.loadingQr.set(false);
        this.qrError.set(parsed.error?.message ?? 'No se pudo obtener el QR');
      } catch {
        this.loadingQr.set(false);
        this.qrError.set('No se pudo obtener el QR');
      }
      return;
    }

    try {
      const scaledUrl = await this.scaleQrBlob(blob);
      this.revokeQrUrl();
      this.qrObjectUrl.set(scaledUrl);
      this.loadingQr.set(false);
    } catch {
      this.loadingQr.set(false);
      this.qrError.set('No se pudo renderizar el QR');
    }
  }

  /** BuilderBot devuelve PNG ~65×65; escalamos sin suavizado para que sea escaneable. */
  private scaleQrBlob(blob: Blob, targetSize = 320): Promise<string> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const scale = Math.max(1, Math.ceil(targetSize / Math.max(img.width, img.height)));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas'));
          return;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((scaled) => {
          if (!scaled) {
            reject(new Error('blob'));
            return;
          }
          resolve(URL.createObjectURL(scaled));
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('image'));
      };

      img.src = objectUrl;
    });
  }

  private async handleQrLoadError(err: { error?: unknown }): Promise<void> {
    this.loadingQr.set(false);

    let code: string | undefined;
    let message = 'No se pudo obtener el QR';

    if (err.error instanceof Blob) {
      try {
        const text = await err.error.text();
        const parsed = JSON.parse(text) as { error?: { code?: string; message?: string } };
        code = parsed.error?.code;
        message = parsed.error?.message ?? message;
      } catch {
        // mantener mensaje genérico
      }
    } else if (err.error && typeof err.error === 'object') {
      const apiErr = err.error as { error?: { code?: string; message?: string } };
      code = apiErr.error?.code;
      message = apiErr.error?.message ?? message;
    }

    if (code === 'BUILDERBOT_ALREADY_CONNECTED') {
      this.refreshStatus();
      return;
    }

    this.qrError.set(message);
  }

  private pollConnectionStatus(): void {
    this.builderBotService.refreshStatus().subscribe({
      next: (res) => {
        if (res.data.sessionStatus === 'connected') {
          this.clearTimers();
          this.revokeQrUrl();
          this.loadConfig();
          this.snackBar.open('WhatsApp conectado correctamente', 'Cerrar', { duration: 5000 });
        }
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
        this.snackBar.open('WhatsApp provisionado. Escanea el QR para vincular.', 'Cerrar', { duration: 5000 });
        this.loadConfig();
      },
      error: (err) => {
        this.provisioning.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'No se pudo provisionar', 'Cerrar', { duration: 5000 });
      },
    });
  }

  syncWebhook(): void {
    this.syncingWebhook.set(true);
    this.builderBotService.syncWebhook().subscribe({
      next: (res) => {
        this.syncingWebhook.set(false);
        this.config.update((current) =>
          current
            ? { ...current, webhookUrl: res.data.webhookUrl, updatedAt: res.data.syncedAt, webhookNeedsSync: false }
            : current
        );
        const isCloudV2 = this.config()?.apiMode === 'cloud-v2';
        this.snackBar.open(
          isCloudV2
            ? 'BuilderBot sincronizado (relay, flows UI y reboot). Revisa los pasos de botones abajo si aún no los configuraste en BBC.'
            : 'Webhook sincronizado con BuilderBot',
          'Cerrar',
          { duration: isCloudV2 ? 9000 : 5000 }
        );
      },
      error: (err) => {
        this.syncingWebhook.set(false);
        this.snackBar.open(err.error?.error?.message ?? 'No se pudo sincronizar BuilderBot', 'Cerrar', {
          duration: 6000,
        });
      },
    });
  }

  copyWebhookUrl(url: string): void {
    void navigator.clipboard.writeText(url).then(
      () => this.snackBar.open('URL copiada al portapapeles', 'Cerrar', { duration: 3000 }),
      () => this.snackBar.open('No se pudo copiar la URL', 'Cerrar', { duration: 3000 })
    );
  }

  isLocalWebhook(url?: string): boolean {
    if (!url) return false;
    return /localhost|127\.0\.0\.1/i.test(url);
  }

  statusLabel(status?: string): string {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Esperando escaneo QR';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Preparando conexión...';
    }
  }
}
