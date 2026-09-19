import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NvIconComponent } from '../../shared/components/nv-icon/nv-icon.component';
import { LayoutChrome } from '../layout-chrome';

@Component({
  selector: 'app-business-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NvIconComponent],
  templateUrl: './business-layout.component.html',
  styleUrl: './business-layout.component.scss',
})
export class BusinessLayoutComponent extends LayoutChrome {}
