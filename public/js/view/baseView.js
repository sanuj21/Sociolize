// DOM ELEMENTS OBJECTS
export const DOMElements = {
  body: document.querySelector('body'),
  container: document.querySelector('.container'),
  modals: document.querySelector('.modals'),
  modalSearch: document.querySelector('.modal-search'),
  modalComments: document.querySelector('.modal-comments'),
  modalWelcome: document.querySelector('.modal-welcome'),
  modalWelcomeClose: document.querySelector('.modal-welcome__close'),
  modalForLoader: document.querySelector('.modal--forLoader'),
  modalConfirmation: document.querySelector('.modal-confirmation'),
  modalCommentsBody: document.querySelector('.modal-comments__content__body'),
  modalCommentsContent: document.querySelector('.modal-comments__content'),
  commentInput: document.querySelector('.comment__inputBox'),

  modalSearchResults: document.querySelector('.modal-search__results'),
  modalBackBtnArr: Array.from(
    document.querySelectorAll('.modal__header__backBtn')
  ),
  modalSearchInput: document.querySelector(
    '.modal-search__header__search__input'
  ),
  formLogin: document.querySelector('.form--login'),
  formEditProfile: document.querySelector('.form--editProfile'),
  formSignup: document.querySelector('.form--signup'),
  modalSignUp: document.querySelector('.modal-signup'),
  inputEmail: document.querySelector('.inputEmail'),
  inputPassword: document.querySelector('.inputPassword'),
  inputUsername: document.querySelector('.form__field__input--username'),
  inputName: document.querySelector('.form__field__input--name'),
  inputBio: document.querySelector('.form__field__input--bio'),
  passwordToggleBtn: document.querySelector(
    '.form__field__password__toggleBtn'
  ),
  inputs: Array.from(document.querySelectorAll(`.form__field input`)),
  btnSubmit: document.querySelector('.form__field__submit'),
  btnSignup: document.querySelector('.form__field__signup'),
  signOutBtn: document.querySelector('.btn--signOut'),
  post: Array.from(document.querySelectorAll('.post')),
  postPhotoInput: document.querySelector('.postPhotoInput'),
  userPhotoInput: document.querySelector('.profile__pic__upload__input'),
  uploadPostPhotoBtn: document.querySelector('.add-post__btns__img'),
  uploadPostPhotoLabel: document.querySelector('.add-post__btns__label'),
  addPost: document.querySelector('.add-post'),
  textareaFlexibleArr: Array.from(
    document.querySelectorAll('.textarea--flexible')
  ),

  navSearchBtn: document.querySelector('.nav-bottom__list__item__link--search'),

  sectonPosts: document.querySelector('.section-posts'),
  notifyFade: document.querySelector('.notifyFade'),
  previousPageBtn: document.querySelector('.navBtn__previousPage'),
  profile: document.querySelector('.profile'),
  profileFollowBtn: document.querySelector('.profile__btn--follow'),
  profielPicWrap: document.querySelector('.profile__pic'),
  profielPicImg: document.querySelector('.profile__pic__img'),
  profilePicUploadBtn: document.querySelector('.profile__pic__upload__label'),

  addPostTextarea: Array.from(document.querySelectorAll('.add-post__textarea')),
  addPostSubmitInfo: document.querySelector('.add-post__submit'),
  addPostSubmitImg: document.querySelector('.add-post__submit--img'),
  // ADD POST MODAL
  addPostModal: document.querySelector('.add-post__modal'),
  addPostImg: document.querySelector('.add-post__modal__imgSelected'),
  addPostUserAvatar: document.querySelector('.add-post__user__avatar')
};
//#######################################

// GLOBAL VARIALBLES
export const globalVars = {
  loggedInUserId: DOMElements.body.dataset.userid || null, // IF EXIST
  inputUsernameValue: DOMElements.inputUsername
    ? DOMElements.inputUsername.value
    : null,

  animateInToast:
    getComputedStyle(DOMElements.notifyFade).animationDuration.split('s')[0] *
    1000
};
// ########################

// TOGGELING PASSWORD TEXT AND ICON
export const togglePasswordText = () => {
  if (DOMElements.inputPassword.type === 'password') {
    DOMElements.inputPassword.type = 'text';

    DOMElements.formLogin
      .querySelector(`.form__field__password__toggleBtn__svg use`)
      .setAttribute('xlink:href', '/icons/sprite.svg#icon-visibility_on');
  } else {
    DOMElements.inputPassword.type = 'password';
    DOMElements.formLogin
      .querySelector(`.form__field__password__toggleBtn__svg use`)
      .setAttribute('xlink:href', '/icons/sprite.svg#icon-visibility_off');
  }
};
// ########################
