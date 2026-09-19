import { Component, input } from '@angular/core';

export type NvIconName =
  | 'home'
  | 'catalog'
  | 'store'
  | 'whatsapp'
  | 'settings'
  | 'businesses'
  | 'logout'
  | 'copy'
  | 'delete'
  | 'add'
  | 'close'
  | 'check'
  | 'alert'
  | 'link'
  | 'refresh'
  | 'download'
  | 'spark'
  | 'menu'
  | 'eye'
  | 'eye-off';

@Component({
  selector: 'nv-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('home') {
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        }
        @case ('catalog') {
          <path d="M5 5h14v14H5z" /><path d="M9 5v14M5 9h14M5 15h14" />
        }
        @case ('store') {
          <path d="M4 9h16l-1.2 11H5.2z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" />
        }
        @case ('whatsapp') {
          <path
            d="M12 3a8.5 8.5 0 0 0-7.2 12.9L4 21l5.3-1.4A8.5 8.5 0 1 0 12 3z"
          />
          <path d="M9.5 10.5c.4 1.1 1.4 2.1 2.5 2.5l1-1a1 1 0 0 1 1-.2c1 .3 2 .5 2.1.5a.5.5 0 0 1 .5.5c0 1.6-1.3 2.9-2.9 2.9-.2 0-.4 0-.6-.1-2.4-.6-4.4-2.6-5-5-.1-.2-.1-.4-.1-.6 0-1.6 1.3-2.9 2.9-2.9a.5.5 0 0 1 .5.5c0 .1.2 1.1.5 2.1a1 1 0 0 1-.2 1z"
          />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" /><path
            d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        }
        @case ('businesses') {
          <path d="M3 21h18" /><path d="M6 21V8l6-4 6 4v13" /><path d="M10 21v-6h4v6" />
        }
        @case ('logout') {
          <path d="M10 17l-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4l1 1" /><path
            d="M15 12H8M18 9l3 3-3 3"
          />
        }
        @case ('copy') {
          <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        }
        @case ('delete') {
          <path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path
            d="M9 7V5h6v2M7 7l1 12h8l1-12"
          />
        }
        @case ('add') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('check') {
          <path d="M5 12l4 4L19 6" />
        }
        @case ('alert') {
          <path d="M12 9v4" /><path d="M12 17h.01" /><path
            d="M10.3 4.5 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0z"
          />
        }
        @case ('link') {
          <path d="M10 14a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" /><path
            d="M14 10a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1"
          />
        }
        @case ('refresh') {
          <path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 3v6h-6" />
        }
        @case ('download') {
          <path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M4 21h16" />
        }
        @case ('spark') {
          <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z" /><path
            d="M19 15l.8 2.7L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"
          />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('eye') {
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.5" />
        }
        @case ('eye-off') {
          <path d="M2 12s3.5-6 10-6c2.2 0 4 .6 5.4 1.4M22 12s-3.5 6-10 6c-2.2 0-4-.6-5.4-1.4" /><path d="M4 4l16 16" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }
  `,
})
export class NvIconComponent {
  readonly name = input.required<NvIconName>();
  readonly size = input(20);
}
