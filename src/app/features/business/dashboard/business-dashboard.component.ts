import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { OrderService, TenantMetrics } from '../orders/order.service';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink, MatCardModule, MatButtonModule, MatTableModule, MatIconModule],
  templateUrl: './business-dashboard.component.html',
  styleUrl: './business-dashboard.component.scss',
})
export class BusinessDashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly metrics = signal<TenantMetrics | null>(null);

  orderColumns = ['createdAt', 'customer', 'total', 'status'];
  auditColumns = ['createdAt', 'action', 'resource'];

  ngOnInit(): void {
    this.orderService.getMetrics().subscribe({
      next: (res) => this.metrics.set(res.data),
    });
  }
}
