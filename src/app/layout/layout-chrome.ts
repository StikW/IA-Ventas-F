import { Directive, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { NvIconName } from '../shared/components/nv-icon/nv-icon.component';

@Directive()
export abstract class LayoutChrome {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly isMobile = signal(false);
  readonly menuOpen = signal(false);

  constructor() {
    this.breakpoint.observe('(max-width: 960px)').subscribe((state) => {
      this.isMobile.set(state.matches);
      if (!state.matches) {
        this.menuOpen.set(false);
      }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  menuToggleIcon(): NvIconName {
    return this.menuOpen() ? 'close' : 'menu';
  }

  logout(): void {
    this.auth.logout();
  }

  userInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return '?';
    const first = user.profile.firstName?.charAt(0) ?? '';
    const last = user.profile.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || first.toUpperCase() || '?';
  }

  userLabel(): string {
    const user = this.auth.currentUser();
    if (!user) return '';
    return `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`.trim();
  }
}
