import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss',
})
export class RatingStarsComponent {
  rating = input(0);
  size = input<'sm' | 'md'>('md');

  protected readonly stars = computed(() =>
    Array.from({ length: 5 }, (_, i) => i < Math.round(this.rating())),
  );

  protected readonly sizeClass = computed(() =>
    this.size() === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
  );
}
