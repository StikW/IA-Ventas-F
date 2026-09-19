import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { DocumentService, DocumentItem } from '../documents/document.service';
import { BuilderBotService, BuilderBotConfigView } from '../whatsapp/builderbot.service';
import { WooCommerceService, WooCommerceConfig } from '../woocommerce/woocommerce.service';

interface HomeState {
  catalog: DocumentItem | null;
  whatsapp: BuilderBotConfigView | null;
  store: WooCommerceConfig | null;
}

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './business-dashboard.component.html',
  styleUrl: './business-dashboard.component.scss',
})
export class BusinessDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly documents = inject(DocumentService);
  private readonly whatsapp = inject(BuilderBotService);
  private readonly store = inject(WooCommerceService);

  readonly firstName = this.auth.currentUser()?.profile.firstName ?? 'ahí';
  readonly state = signal<HomeState | null>(null);

  ngOnInit(): void {
    forkJoin({
      catalog: this.documents.list({ limit: 1 }).pipe(catchError(() => of({ data: [] as DocumentItem[] }))),
      whatsapp: this.whatsapp.getConfig().pipe(catchError(() => of({ data: null }))),
      store: this.store.getConfig().pipe(catchError(() => of({ data: null }))),
    }).subscribe(({ catalog, whatsapp, store }) => {
      this.state.set({
        catalog: catalog.data[0] ?? null,
        whatsapp: whatsapp.data,
        store: store.data,
      });
    });
  }

  catalogLabel(doc: DocumentItem | null): string {
    if (!doc) return 'Sin catálogo';
    if (doc.status === 'READY') return 'Listo';
    if (doc.status === 'FAILED') return 'Error';
    return 'Procesando';
  }

  whatsappLabel(cfg: BuilderBotConfigView | null): string {
    if (!cfg?.enabled) return 'No disponible';
    if (!cfg.configured) return 'Sin activar';
    if (cfg.sessionStatus === 'connected') {
      return cfg.agentEnabled === false ? 'Conectado · agente en pausa' : 'Conectado';
    }
    return 'Sin vincular';
  }

  storeLabel(cfg: WooCommerceConfig | null): string {
    if (!cfg?.hasCredentials) return 'Sin configurar';
    return cfg.connected ? 'Conectada' : 'Sin verificar';
  }

  storeDone(s: HomeState): boolean {
    return !!s.store?.connected;
  }

  catalogDone(s: HomeState): boolean {
    return s.catalog?.status === 'READY';
  }

  whatsappDone(s: HomeState): boolean {
    return s.whatsapp?.sessionStatus === 'connected';
  }

  completedSteps(s: HomeState): number {
    return [this.storeDone(s), this.catalogDone(s), this.whatsappDone(s)].filter(Boolean).length;
  }

  setupProgress(s: HomeState): number {
    return Math.round((this.completedSteps(s) / 3) * 100);
  }
}
