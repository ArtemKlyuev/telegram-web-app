export type ClipboardCallback = (text: string | null) => any;

export class WebAppClipboard {
  readonly #requests = new Map<string, ClipboardCallback | null>();

  setRequest(id: string, callback?: ClipboardCallback | null | undefined): void {
    this.#requests.set(id, callback ?? null);
  }

  getRequest(id: string): ClipboardCallback | null {
    return this.#requests.get(id) ?? null;
  }

  removeRequest(id: string): void {
    this.#requests.delete(id);
  }

  hasRequest(id: string): boolean {
    return this.#requests.has(id);
  }
}
