import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { NvIconComponent } from '../../../shared/components/nv-icon/nv-icon.component';

export interface LoginDialogData {
  returnUrl?: string;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NvIconComponent,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  readonly data = inject<LoginDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  close(): void {
    this.dialogRef.close();
  }

  togglePassword(): void {
    this.hidePassword.update((value) => !value);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
        const target = this.resolveTargetUrl();
        void this.router.navigateByUrl(target, { replaceUrl: true });
      },
      error: (err: { error?: { error?: { message?: string } } }) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error?.message ?? 'Error al iniciar sesión');
      },
    });
  }

  private resolveTargetUrl(): string {
    const returnUrl = this.data?.returnUrl;
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return this.auth.getHomeRoute();
  }
}
