import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');

  readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-5 w-5 border-2';
      case 'lg':
        return 'h-12 w-12 border-4';
      default:
        return 'h-9 w-9 border-[3px]';
    }
  });
}