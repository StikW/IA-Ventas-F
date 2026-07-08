import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BusinessService } from '../businesses/business.service';
import { UserService } from '../users/user.service';
import { Business, User } from '../../../shared/models/api.models';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './business-detail.component.html',
})
export class BusinessDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly businessService = inject(BusinessService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly business = signal<Business | null>(null);
  readonly users = signal<User[]>([]);
  readonly showUserForm = signal(false);

  userColumns = ['email', 'name', 'status', 'actions'];

  userForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.businessService.getById(id).subscribe({
      next: (res) => {
        this.business.set(res.data);
        this.loadUsers(id);
      },
    });
  }

  loadUsers(tenantId: string): void {
    this.userService.list(tenantId).subscribe({
      next: (res) => this.users.set(res.data),
    });
  }

  createUser(): void {
    const business = this.business();
    if (!business || this.userForm.invalid) return;

    const v = this.userForm.getRawValue();
    this.userService
      .create({
        email: v.email,
        password: v.password,
        role: 'NEGOCIO',
        tenantId: business.id,
        profile: { firstName: v.firstName, lastName: v.lastName, phone: v.phone || undefined },
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
          this.userForm.reset();
          this.showUserForm.set(false);
          this.loadUsers(business.id);
        },
        error: (err) =>
          this.snackBar.open(err.error?.error?.message ?? 'Error', 'Cerrar', { duration: 4000 }),
      });
  }

  deactivateUser(user: User): void {
    const business = this.business();
    if (!business) return;
    this.userService.deactivate(user.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario desactivado', 'Cerrar', { duration: 3000 });
        this.loadUsers(business.id);
      },
    });
  }
}
