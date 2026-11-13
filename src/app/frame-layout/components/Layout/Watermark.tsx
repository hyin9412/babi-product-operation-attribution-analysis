import {
  i18n,
  //@ts-ignore
} from '@babi/tools';
let params = {};

const commonStyle = `
    position:fixed;
    top:0;
    left:0;
    bottom: 0;
    right: 0;
    width:100%;
    height:100%;
    pointer-events:none;
`;

export const CanvasWM = _params => {
  const {
    container = document.body,
    width = '300px',
    height = '200px',
    textAlign = 'center',
    textBaseline = 'middle',
    font = '16px Microsoft Yahei',
    fillStyle = 'rgba(184, 184, 184, 0.15)',
    content = i18n.t('please_do_not_spread_it_out_', {}, '请勿外传'),
    rotate = '340',
    zIndex = 1000,
    // hiddenWmBgImg,
  } = _params;
  params = _params;

  const canvas = document.createElement('canvas');

  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  const ctx = canvas.getContext('2d');

  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.rotate((Math.PI / 180) * rotate);
  ctx.fillText(content, parseFloat(width) / 2, parseFloat(height) / 2);

  const base64Url = canvas.toDataURL();
  const __wm = document.querySelector('.__wm');

  const watermarkDiv = __wm || document.createElement('div');
  const styleStr = `
         ${commonStyle}
          z-index:${zIndex};
          background-repeat:repeat;
          background-image:url('${base64Url}')`;

  watermarkDiv.setAttribute('style', styleStr);
  watermarkDiv.classList.add('__wm');

  if (!__wm) {
    container.insertBefore(watermarkDiv, container.firstChild);
  }

  //   // 暗水印
  //   const hiddenWMDiv = document.createElement('div');
  //   const hiddenStyleStr = `
  //     ${commonStyle}
  //     z-Index:${zIndex + 1};
  //     background: url(${hiddenWmBgImg}) repeat;
  //   `;

  //   hiddenWMDiv.setAttribute('style', hiddenStyleStr);
  //   hiddenWMDiv.classList.add('__hiddenWm');
  //   container.insertBefore(hiddenWMDiv, container.firstChild);

  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  if (MutationObserver) {
    let mo = new MutationObserver(() => {
      const __wm = document.querySelector('.__wm');
      //   const __hiddenWm = document.querySelector('.__hiddenWm');
      // 只在__wm元素变动才重新调用 __canvasWM
      //   if ((__wm && __wm.getAttribute('style') !== styleStr) || !__wm || (hiddenWmBgImg && !__hiddenWm)) {
      if ((__wm && __wm.getAttribute('style') !== styleStr) || !__wm) {
        // 避免一直触发
        mo.disconnect();
        mo = null;
        CanvasWM(JSON.parse(JSON.stringify(params)));
      }
    });

    mo.observe(container, {
      attributes: true,
      subtree: true,
      childList: true,
    });
  }
};
