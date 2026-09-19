import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginDialogService } from '../../../core/auth/login-dialog.service';

@Component({
  selector: 'app-login-redirect',
  standalone: true,
  template: '',
})
export class LoginRedirectComponent implements OnInit {
  private readonly loginDialog = inject(LoginDialogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;
    this.loginDialog.open(returnUrl);
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
