import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly auth = inject(AuthStore);

  readonly email = signal('');
  readonly password = signal('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async submit(): Promise<void> {
    if (!this.email().trim() || !this.password()) return;
    try {
      await this.auth.login(this.email().trim(), this.password());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
      await this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      if (err?.status === 403) {
        this.router.navigate(['/verify-email']);
      }
    }
  }
}
