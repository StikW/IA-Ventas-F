import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent, LoginDialogData } from '../../features/auth/login/login-dialog.component';

@Injectable({ providedIn: 'root' })
export class LoginDialogService {
  private readonly dialog = inject(MatDialog);
  private openRef: ReturnType<MatDialog['open']> | null = null;

  open(returnUrl?: string): void {
    if (this.openRef) {
      return;
    }

    this.openRef = this.dialog.open(LoginDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      panelClass: 'nv-login-dialog',
      autoFocus: 'first-titled-element',
      restoreFocus: true,
      data: { returnUrl } satisfies LoginDialogData,
    });

    this.openRef.afterClosed().subscribe(() => {
      this.openRef = null;
    });
  }
}
