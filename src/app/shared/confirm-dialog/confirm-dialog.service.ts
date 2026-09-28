import { Injectable, signal } from '@angular/core';

export type ConfirmResult = boolean | 'extra';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  extraLabel?: string;
}

interface DialogState {
  options: ConfirmOptions;
  resolve: (value: ConfirmResult) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<DialogState | null>(null);

  confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    return new Promise((resolve) => this.state.set({ options, resolve }));
  }

  close(result: ConfirmResult): void {
    const current = this.state();
    if (!current) return;
    this.state.set(null);
    current.resolve(result);
  }
}
