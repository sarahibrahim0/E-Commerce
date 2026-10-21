import { ErrorHandler, Injectable } from '@angular/core';

// Matches the different shapes browsers/Chrome give when a lazily-loaded route
// chunk no longer exists (typical after a redeploy: the old hashed chunks are
// gone, and the SPA rewrite answers the missing file with index.html).
const CHUNK_ERROR_PATTERN =
  /loading chunk|failed to fetch dynamically imported module|importing a module script failed|dynamically imported module|chunkloaderror/i;

const RELOAD_FLAG = 'ecom.chunkReload';

// When the app hits a stale chunk we reload once (guarded by a session flag) so
// the browser picks up the current build's chunks instead of staying broken.
// The flag is cleared by `clearChunkReloadFlag` once the new build boots.
@Injectable()
export class ChunkReloadErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const message = String((error as { message?: string } | null)?.message ?? error ?? '');
    if (CHUNK_ERROR_PATTERN.test(message)) {
      if (!this.alreadyReloaded()) {
        this.markReloaded();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        return;
      }
    }
    console.error(error);
  }

  private alreadyReloaded(): boolean {
    try {
      return sessionStorage.getItem(RELOAD_FLAG) !== null;
    } catch {
      return true;
    }
  }

  private markReloaded(): void {
    try {
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }
}
