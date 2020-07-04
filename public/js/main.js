import '@babel/polyfill';
import * as baseView from './view/baseView';
import * as commentView from './view/commentView';
import * as searchView from './view/searchView';
import * as postView from './view/postView';
import * as validate from './view/validate';
import * as authenticate from './controller/authenticate';
import * as profile from './controller/profile';
import * as posts from './controller/posts';
import { fromNowPast } from './util/dateUtil';
import { autoSizeTextarea } from './util/utilBase';

(function () {
  // HANDLING LOGIN FORM
  if (baseView.DOMElements.formLogin) {
    baseView.DOMElements.inputs.forEach(el => {
      el.addEventListener('keyup', validate.validateLogin);
    });

    baseView.DOMElements.formLogin.addEventListener('submit', e => {
      e.preventDefault();
      authenticate.login(
        baseView.DOMElements.inputEmail.value,
        baseView.DOMElements.inputPassword.value
      );
    });
  }

  // HANDLING EDITPROFILE FORM
  if (baseView.DOMElements.formEditProfile) {
    baseView.DOMElements.inputs.forEach(el => {
      el.addEventListener('keyup', validate.validateEditProfile);
    });

    baseView.DOMElements.formEditProfile.addEventListener('submit', e => {
      e.preventDefault();
      authenticate.editProfile(
        baseView.DOMElements.inputUsername.value,
        baseView.DOMElements.inputName.value,
        baseView.DOMElements.inputBio.value
      );
    });
  }

  // HANDLING PASSWORD TOGGLE BTN
  if (baseView.DOMElements.passwordToggleBtn) {
    baseView.DOMElements.passwordToggleBtn.addEventListener(
      'click',
      baseView.togglePasswordText
    );
  }

  // HANDLING CLICK ON POST
  if (baseView.DOMElements.post.length > 0) {
    baseView.DOMElements.post.forEach(el => {
      el.addEventListener('dblclick', postView.handleDblClickPost);
    });

    baseView.DOMElements.post.forEach(el => {
      el.addEventListener('click', postView.handleClickPost);
    });
  }

  // HANDLE CLICK ON COMMENT MODAL
  if (baseView.DOMElements.modalComments) {
    baseView.DOMElements.modalComments.addEventListener(
      'click',
      commentView.handleClickCommentModal
    );
  }

  // HANDLE CLICK ON CONFIRMATION MODAL
  if (baseView.DOMElements.modalConfirmation) {
    baseView.DOMElements.modalConfirmation.addEventListener(
      'click',
      commentView.handleClickConfirmationModal
    );
  }

  // MODIFYING THE TIME IN POST COMMENT (WHICH WILL BE SHOWING DOWN EACH POSTS)
  window.addEventListener('load', () => {
    const commentTimeObjArr = Array.from(
      document.querySelectorAll('.post__comment__time')
    );
    commentTimeObjArr.forEach(el => {
      el.textContent = fromNowPast(Date.parse(el.dataset.timeadded));
    });
  });

  // HANDLING SELECTION OF IMG ON ADD_POST
  if (baseView.DOMElements.postPhotoInput) {
    baseView.DOMElements.postPhotoInput.addEventListener(
      'change',
      postView.addPostImg
    );
  }

  // MAKING TEXTAREA FLEXIBLE (AUTOSIZE)
  if (baseView.DOMElements.textareaFlexibleArr.length > 0) {
    baseView.DOMElements.textareaFlexibleArr.forEach(el => {
      el.addEventListener('input', autoSizeTextarea);
    });
  }

  // CREATING POST INFO (SUBMITTING)
  if (baseView.DOMElements.addPostSubmitInfo) {
    baseView.DOMElements.addPostSubmitInfo.addEventListener(
      'click',
      posts.addPost
    );
  }

  // CREATING POST INFO (SUBMITTING)
  if (baseView.DOMElements.addPostSubmitImg) {
    baseView.DOMElements.addPostSubmitImg.addEventListener(
      'click',
      posts.addPost
    );
  }

  // HANDLING CLICK ON FOLLOW BTN
  if (baseView.DOMElements.profileFollowBtn) {
    baseView.DOMElements.profileFollowBtn.addEventListener(
      'click',
      profile.follow(
        baseView.DOMElements.profile.dataset.userid,
        baseView.DOMElements.profileFollowBtn
      )
    );
  }

  // HANDLING CLICK ON SEARCH BTN (NAV)
  if (baseView.DOMElements.navSearchBtn) {
    baseView.DOMElements.navSearchBtn.addEventListener('click', () => {
      baseView.DOMElements.modalSearch.classList.add('modal--show');
      baseView.DOMElements.modalSearchInput.focus();
    });
  }

  // HANDLING CLICK ON MODALS BACK BtN
  if (baseView.DOMElements.modalBackBtnArr.length > 0) {
    baseView.DOMElements.modalBackBtnArr.forEach(el => {
      el.addEventListener('click', () => {
        el.parentNode.parentNode.parentNode.classList.remove('modal--show');
        baseView.DOMElements.body.classList.remove('modal--show__body');
      });
    });
  }

  // SEARCHING USERS ON KEYUP
  if (baseView.DOMElements.modalSearchInput) {
    baseView.DOMElements.modalSearchInput.addEventListener(
      'keyup',
      searchView.handleSearch
    );
  }

  // UPLOADING PROFILE PIC
  if (baseView.DOMElements.userPhotoInput) {
    baseView.DOMElements.userPhotoInput.addEventListener(
      'change',
      profile.uploadPic
    );
  }

  // GOOGLE SIGN IN BUTTON
  let googleUser = {};
  let gToken;
  let auth2;

  function attachSignin(element) {
    auth2.attachClickHandler(
      element,
      {},
      async function (googleUser) {
        if (auth2.isSignedIn.get()) {
          let profile = auth2.currentUser.get().getBasicProfile();
          gToken = googleUser.getAuthResponse().id_token;
          // baseView.DOMElements.modalSignUp.classList.add('modal--show');
          await authenticate.signup(gToken);
        }
      },
      function (error) {
        alert(JSON.stringify(error, undefined, 2));
      }
    );
  }

  const signupG = function () {
    gapi.load('auth2', function () {
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id:
          '571304503104-d6h3eq23f1hqc3sjnhj2vscidh7qrlb7.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      attachSignin(document.getElementById('customBtn'));
    });
  };

  if (baseView.DOMElements.formSignup) {
    signupG();
  }
  // END OF GOOGLE SIGN

  // HANDLING FORM SIGNUP
  if (baseView.DOMElements.formSignup) {
    baseView.DOMElements.inputUsername.addEventListener(
      'keyup',
      validate.validateEditProfile
    );

    baseView.DOMElements.formSignup.addEventListener('submit', async e => {
      e.preventDefault();
      const st = validate.validateEditProfile.call(
        baseView.DOMElements.inputUsername.value
      );
      if (st) {
        await authenticate.signup(
          gToken,
          baseView.DOMElements.inputUsername.value
        );
      }
    });
  }

  // HANDLING CLICK ON SIGNOUT BTN
  if (baseView.DOMElements.signOutBtn) {
    baseView.DOMElements.signOutBtn.addEventListener(
      'click',
      authenticate.logout
    );
  }

  // SHOW WELCOME IF ITS FIRST TIME
  if (baseView.DOMElements.modalWelcome) {
    if (!localStorage.getItem('welcome')) {
      baseView.DOMElements.modalWelcome.classList.add('modal--show');
      baseView.DOMElements.body.classList.add('modal--show__body');
    }

    // CLOSE WELCOME, IF CLICKED ON OK
    baseView.DOMElements.modalWelcomeClose.addEventListener('click', () => {
      baseView.DOMElements.modalWelcome.classList.remove('modal--show');
      baseView.DOMElements.body.classList.remove('modal--show__body');
      localStorage.setItem('welcome', 'true');
    });
  }
})();
