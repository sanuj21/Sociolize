import * as baseView from './../view/baseView';

const removePrimaryAlert = (resolve, url) => {
  return () => {
    document
      .querySelector('.modalAlert')
      .parentElement.removeChild(document.querySelector('.modalAlert'));
    if (url) {
      location.assign(url);
    }
  };
};

// BASIC ALERT
export const alertPrimary = (msg, url) => {
  const alertMarkup = `
        <div class = "modalAlert">
            <div class = "modalAlert__content">
                <div class = "modalAlert__para">
                    ${msg}
                </div>
                <a class = "modalAlert__btn--ok">Ok</a>
            </div>
        </div>
          `;

  document.querySelector('body').insertAdjacentHTML('beforeend', alertMarkup);

  return new Promise((resolve, reject) => {
    document
      .querySelector('.modalAlert__btn--ok')
      .addEventListener('click', removePrimaryAlert(resolve, url));
  });
};

// SIMPLE FADED BOTTOM NOTIFICATION
export const showToastNotification = note => {
  baseView.DOMElements.notifyFade.textContent = note;
  baseView.DOMElements.notifyFade.classList.add('showNotify');

  setTimeout(() => {
    baseView.DOMElements.notifyFade.classList.add('showNotify');
  }, baseView.globalVars.animateInToast + 500);
};
