import iFrameResize from 'iframe-resizer/js/iframeResizer';

export const resize = (el) => {
  iFrameResize({ log: true, scrolling: true }, '#' + el.id);
}
