import { MainButtonParams } from './types';

interface Options {
  onClick: (e: MouseEvent) => any;
  updateViewport: () => any;
}

const BACKGROUND_IMAGE =
  "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20viewport%3D%220%200%2048%2048%22%20width%3D%2248px%22%20height%3D%2248px%22%3E%3Ccircle%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222.25%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22%20stroke-dashoffset%3D%22106%22%20r%3D%229%22%20stroke-dasharray%3D%2256.52%22%20rotate%3D%22-90%22%3E%3Canimate%20attributeName%3D%22stroke-dashoffset%22%20attributeType%3D%22XML%22%20dur%3D%22360s%22%20from%3D%220%22%20to%3D%2212500%22%20repeatCount%3D%22indefinite%22%3E%3C%2Fanimate%3E%3CanimateTransform%20attributeName%3D%22transform%22%20attributeType%3D%22XML%22%20type%3D%22rotate%22%20dur%3D%221s%22%20from%3D%22-90%2024%2024%22%20to%3D%22630%2024%2024%22%20repeatCount%3D%22indefinite%22%3E%3C%2FanimateTransform%3E%3C%2Fcircle%3E%3C%2Fsvg%3E')";

export class MainButtonDebug {
  #btn: HTMLButtonElement;
  #height = 0;
  #updateViewport: Options['updateViewport'];

  constructor({ onClick, updateViewport }: Options) {
    this.#updateViewport = updateViewport;
    this.#btn = document.createElement('tg-main-button') as HTMLButtonElement;

    const styles = {
      font: '600 14px/18px sans-serif',
      display: 'none',
      width: '100%',
      height: '48px',
      borderRadius: '0',
      background: 'no-repeat right center',
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      margin: '0',
      padding: '15px 20px',
      textAlign: 'center',
      boxSizing: 'border-box',
      zIndex: '10000',
    };

    for (const [key, value] of Object.entries(styles)) {
      this.#btn.style[key as keyof typeof styles] = value;
    }

    const onDomLoaded = (event: Event) => {
      document.removeEventListener('DOMContentLoaded', onDomLoaded);
      document.body.appendChild(this.#btn);
      this.#btn.addEventListener('click', onClick, false);
    };

    document.addEventListener('DOMContentLoaded', onDomLoaded);
  }

  update = (params: MainButtonParams | { is_visible: false }): void => {
    if (params.is_visible) {
      this.#btn.style.display = 'block';
      this.#height = 48;

      this.#btn.style.opacity = params.is_active ? '1' : '0.8';
      this.#btn.style.cursor = params.is_active ? 'pointer' : 'auto';
      this.#btn.disabled = !params.is_active;
      this.#btn.innerText = params.text;
      this.#btn.style.backgroundImage = params.is_progress_visible ? BACKGROUND_IMAGE : 'none';
      this.#btn.style.backgroundColor = params.color;
      this.#btn.style.color = params.text_color;
    } else {
      this.#btn.style.display = 'none';
      this.#height = 0;
    }

    if (document.documentElement) {
      document.documentElement.style.boxSizing = 'border-box';
      document.documentElement.style.paddingBottom = this.#height + 'px';
    }

    this.#updateViewport();
  };
}
