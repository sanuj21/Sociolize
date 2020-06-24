import axios from 'axios';
import * as baseView from './baseView';
import * as customAlert from './customAlert';
import * as profile from '../controller/profile';
import * as utilBase from '../util/utilBase';

// HANDLING SEARCHING OF THE USER
export const handleSearch = async () => {
  const input = baseView.DOMElements.modalSearchInput.value;
  if (input.length <= 0) return;

  baseView.DOMElements.modalSearchResults.innerHTML = '';
  utilBase.showLoader(baseView.DOMElements.modalSearchResults);

  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/search/${input}`
    });

    // REMOVING THE SPINNER
    utilBase.removeLoader(baseView.DOMElements.modalSearchResults);

    baseView.DOMElements.modalSearchResults.innerHTML = '';

    if (res.data.users.length <= 0) {
      const noteMarkup = `<div class = "modal__zero">No result Found!! Try Searching Something else!!
      `;
      baseView.DOMElements.modalSearchResults.insertAdjacentHTML(
        'afterbegin',
        noteMarkup
      );

      return;
    }

    // DISPLAYING RESULTS OF SEARCH
    let resultsMarkup = ``;

    for (let i = 0; i < res.data.users.length; i++) {
      const user = res.data.users[i];

      let imgUser = `
        <svg class = "userInfoBasic__photo userInfoBasic__photo--icon">
          <use xlink:href="/icons/sprite.svg#icon-account_circle"></use>
        </svg>
      `;

      if (user.photo) {
        imgUser = `
      <img
          src="/images/users/${user.photo}"
          class="userInfoBasic__photo"
        />`;
      }

      let actionBtn = `<span
      class="btn btn--primary btn--small userInfoBasic__action__follow"
      data-userid = "${user.id}">Follow</span>`;
      if (res.data.loggedInUser.following.includes(user.id)) {
        actionBtn = `<span
        class="btn btn--primary btn--small userInfoBasic__action__follow profile__btn--following"
        data-userid = "${user.id}">Following</span>`;
      }

      const resultItemMarkup = `<li class="modal-search__results__item">
    <a href="/user/${user.username}" class="modal-search__results__item__link">
      <div class="userInfoBasic">
        ${imgUser}
        <div class="userInfoBasic__info">
          <div class="userInfoBasic__info__username">
            ${user.username}
          </div>
          <div class="userInfoBasic__info__name">
            ${user.name}
          </div>
        </div>
        <div class="userInfoBasic__action">
          ${actionBtn}
          
        </div>
      </div>
    </a>
  </li>`;

      resultsMarkup = resultsMarkup + resultItemMarkup;
    }

    baseView.DOMElements.modalSearchResults.insertAdjacentHTML(
      'afterbegin',
      resultsMarkup
    );

    // REGISTER THE CLICK ON FOLLOW BTN
    Array.from(
      baseView.DOMElements.modalSearchResults.querySelectorAll(
        '.userInfoBasic__action__follow'
      )
    ).forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        profile.follow(el.dataset.userid, el)();
      });
    });
  } catch (err) {
    console.log(err);
  }
};
