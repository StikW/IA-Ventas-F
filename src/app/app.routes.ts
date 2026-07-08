import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard, businessGuard } from './core/auth/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { BusinessLayoutComponent } from './layout/business-layout/business-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'businesses',
        loadComponent: () =>
          import('./features/admin/businesses/businesses-list.component').then((m) => m.BusinessesListComponent),
      },
      {
        path: 'businesses/:id',
        loadComponent: () =>
          import('./features/admin/businesses/business-detail.component').then((m) => m.BusinessDetailComponent),
      },
    ],
  },
  {
    path: 'business',
    component: BusinessLayoutComponent,
    canActivate: [authGuard, businessGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/business/dashboard/business-dashboard.component').then((m) => m.BusinessDashboardComponent),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/business/documents/documents-list.component').then((m) => m.DocumentsListComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/business/settings/business-settings.component').then((m) => m.BusinessSettingsComponent),
      },
      {
        path: 'woocommerce',
        loadComponent: () =>
          import('./features/business/woocommerce/woocommerce-settings.component').then(
            (m) => m.WooCommerceSettingsComponent
          ),
      },
      {
        path: 'whatsapp',
        loadComponent: () =>
          import('./features/business/whatsapp/whatsapp-settings.component').then((m) => m.WhatsAppSettingsComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/business/orders/orders-list.component').then((m) => m.OrdersListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
