import axios from 'axios';
import * as baseView from './baseView';
import * as customAlert from '../view/customAlert';

// TOGGLING INPUT ERRORS
const toggleInputError = (
  el,
  error = true,
  msg = 'Invalid',
  notice = false
) => {
  let temp;

  // IF ITS THE PASSWORD FIELD
  if (Array.from(el.classList).includes('inputPassword')) {
    temp = el.parentElement;
  } else {
    temp = el;
  }
  // FIRST REMOVE, IF ANY NOTICE EXIST
  if (temp.parentElement.querySelector('.form__field__successValidation')) {
    temp.parentElement.removeChild(
      temp.parentElement.querySelector('.form__field__successValidation')
    );
  }

  if (temp.parentElement.querySelector('.form__field__errorValidation')) {
    temp.parentElement.removeChild(
      temp.parentElement.querySelector('.form__field__errorValidation')
    );
  }

  if (error) {
    el.style.borderBottomColor = '#dc3545';

    // IF ITS THE PASSWORD FIELD
    if (Array.from(el.classList).includes('inputPassword')) {
      el = el.parentElement;
    }

    if (!el.parentElement.querySelector('.form__field__errorValidation')) {
      const markUp = `
  <div class = 'form__field__errorValidation'>${msg}</div>`;

      el.insertAdjacentHTML('afterend', markUp);
    }
  }

  // IF VALIDATION SUCCEEDS
  else {
    el.style.borderBottomColor = '#28a745';

    // IF ITS THE PASSWORD FIELD
    if (Array.from(el.classList).includes('inputPassword')) {
      el = el.parentElement;
    }

    if (notice) {
      if (!el.parentElement.querySelector('.form__field__successValidation')) {
        const markUp = `
    <div class = 'form__field__successValidation'>${msg}</div>`;

        el.insertAdjacentHTML('afterend', markUp);
      }
    }
  }
};
//######################################

// VALIDATING LOGIN FORM
export const validateLogin = e => {
  let el = e.target;
  console.log(e.target);
  if (Array.from(el.classList).includes('inputEmail')) {
    // VALIDATE EMAIL
    const indexOfAt = el.value.indexOf('@');
    const lastIndexOfDot = el.value.lastIndexOf('.');
    if (!el.value) {
      toggleInputError(el, true, 'Please enter a email');
      return;
    }
    if (
      el.value &&
      el.value.includes('@') &&
      indexOfAt > 2 &&
      lastIndexOfDot - indexOfAt > 3 &&
      el.value.length - lastIndexOfDot > 2
    ) {
      // EMAIL CONDITIONS :
      // SHOULD BE ATLEAST 3 LETTERS BEFORE AND AFTER @
      // SHOULD BE ATLEAST 2 LETTERS AFTER .
      toggleInputError(el, false);
    } else {
      toggleInputError(el, true, 'Please enter a valid email');
    }
  }

  // VALIDATE PASSWORD
  else if (Array.from(el.classList).includes('inputPassword')) {
    if (
      baseView.DOMElements.inputPassword.value &&
      baseView.DOMElements.inputPassword.value.length >= 6
    ) {
      toggleInputError(el, false);
    } else {
      toggleInputError(el, true, 'Password should be minimum of 6 character');
    }
  }
};

//######################################

// VALIDATING EDIT PROFILE FORM
export const validateEditProfile = async function () {
  let el = this;

  try {
    // BASIC VALIDATION, NAME AND ID SHOULD BE OF ATLEAST 3 LETTERS
    if (el.value.length < 3) {
      toggleInputError(el, true, 'It should contain atleast 3 letters');
    } else {
      // VALIDATING IF USERNAME ALREADY EXIST
      if (Array.from(el.classList).includes('form__field__input--username')) {
        // IF THE USERNAME IS NOT CHANGED, THAN RETURN IT

        if (
          baseView.globalVars.inputUsernameValue &&
          baseView.globalVars.inputUsernameValue === el.value
        ) {
          toggleInputError(el, false);
          return;
        }
        const res = await axios({
          method: 'GET',
          url: `/api/v1/users/${el.value}`
        });

        // SUCCESS MEANS, USERNAME EXIST
        if (res.data.status === 'success') {
          toggleInputError(el, true, 'Sorry!! This Username is already taken');
          return false;
        } else {
          toggleInputError(el, false, 'Congress!!! Username available!!', true);

          return true;
        }
      }
      toggleInputError(el, false);

      return false;
    }
  } catch (err) {
    customAlert.alertPrimary(err.response.data.message);
  }
};

//######################################
