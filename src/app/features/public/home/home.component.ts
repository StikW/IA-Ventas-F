import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginDialogService } from '../../../core/auth/login-dialog.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class PublicHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly loginDialog = inject(LoginDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private revealObserver?: IntersectionObserver;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('login') !== '1') {
      return;
    }

    const returnUrl = params.get('returnUrl') ?? undefined;
    this.loginDialog.open(returnUrl);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { login: null, returnUrl: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngAfterViewInit(): void {
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('nv-revealed');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    document.querySelectorAll('.landing .nv-reveal').forEach((el) => {
      this.revealObserver?.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  openLogin(): void {
    this.loginDialog.open();
  }
}
