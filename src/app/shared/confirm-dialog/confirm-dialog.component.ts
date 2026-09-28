import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly dialog = inject(ConfirmDialogService);
  protected readonly defaultCancelLabel = $localize`:@@confirm.cancel:Cancel`;
  protected readonly defaultConfirmLabel = $localize`:@@confirm.confirm:Confirm`;

  confirm(): void {
    this.dialog.close(true);
  }

  cancel(): void {
    this.dialog.close(false);
  }

  extra(): void {
    this.dialog.close('extra');
  }
}
