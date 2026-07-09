import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Order, OrderService } from './order.service';

const REFRESH_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly snackBar = inject(MatSnackBar);

  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  readonly orders = signal<Order[]>([]);
  readonly statusFilter = signal<string>('');
  readonly loading = signal(false);

  displayedColumns = ['createdAt', 'customer', 'items', 'total', 'status', 'wc', 'actions'];

  ngOnInit(): void {
    this.load();
    this.refreshTimer = setInterval(() => this.load({ silent: true }), REFRESH_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
    }
  }

  refresh(): void {
    this.load();
  }

  load(options?: { silent?: boolean }): void {
    const silent = options?.silent ?? false;
    if (!silent) this.loading.set(true);

    const status = this.statusFilter();
    this.orderService.list(status ? { status } : undefined).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        if (!silent) this.loading.set(false);
      },
      error: (err) => {
        if (!silent) {
          this.loading.set(false);
          this.snackBar.open(err.error?.error?.message ?? 'Error al cargar pedidos', 'Cerrar', { duration: 4000 });
        }
      },
    });
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.load();
  }

  itemSummary(order: Order): string {
    return order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  }

  markAsPaid(order: Order): void {
    this.orderService.updateStatus(order.id, 'PAID').subscribe({
      next: () => {
        this.snackBar.open('Pedido marcado como pagado. El cliente será notificado por WhatsApp.', 'Cerrar', {
          duration: 5000,
        });
        this.load();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error?.message ?? 'No se pudo actualizar el pedido', 'Cerrar', { duration: 5000 });
      },
    });
  }
}
