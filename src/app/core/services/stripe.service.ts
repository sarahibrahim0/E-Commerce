import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly stripe = loadStripe(environment.stripePublicKey);

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripe;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }
    const result = await stripe.redirectToCheckout({ sessionId });
    if (result.error) {
      throw new Error(result.error.message ?? 'Redirect to checkout failed');
    }
  }
}
