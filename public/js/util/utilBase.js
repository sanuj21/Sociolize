// AUTOMATIC RESIZING TEXTAREA
export const autoSizeTextarea = el => {
  return () => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };
};

export const showLoader = (el, modalLoader = false) => {
  let classSpinner = 'spinner';
  if (modalLoader) {
    el.classList.add('modal--show');
    classSpinner += ' spinner--white';
  }
  const loaderMarkup = `
    <svg class = "${classSpinner}">
          <use xlink:href="/icons/sprite.svg#icon-spinner9"></use>
    </svg>
  `;

  el.insertAdjacentHTML('afterbegin', loaderMarkup);
};

export const removeLoader = (el, modalLoader = false) => {
  el.querySelector('.spinner').parentNode.removeChild(
    el.querySelector('.spinner')
  );

  if (Array.from(el.classList).includes('modal--show')) {
    el.classList.remove('modal--show');
  }
};
