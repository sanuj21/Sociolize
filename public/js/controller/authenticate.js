import axios from 'axios';
import * as baseView from '../view/baseView';
import * as validate from '../view/validate';
import * as customAlert from '../view/customAlert';
import * as utilBase from '../util/utilBase';

// LOGIN WITH EMAIL AND PASSWORD
export const login = async (email, password) => {
  email = email.trim();
  password = password.trim();
  baseView.DOMElements.inputs.forEach(el => validate.validateLogin);

  // IF THERE ARE ANY ELEMENT HAVING CALSS ERRORVALIDATION, THAN IT MEANS THE VALIDATION HAS FAILED
  if (
    baseView.DOMElements.formLogin.querySelector(
      '.form__field__errorValidation'
    )
  ) {
    return;
  }

  // HERE MEANS, VALIDATION SUCCEEDED
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      customAlert.showToastNotification('Login Successfully!!');
      location.assign('/');
    } else {
      customAlert.alertPrimary('Login Failed!!');
    }
  } catch (err) {
    customAlert.alertPrimary(err.response.data.message);
  }
};

// SIGNING IN WITH GOOGLE
export const signup = async (gToken, username) => {
  // username = username.trim();
  try {
    let data = {
      username,
      gToken
    };

    if (!username) {
      data = { gToken };
    }

    utilBase.showLoader(baseView.DOMElements.modalForLoader, true);
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/loginWithG',
      data: data
    });

    utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);

    if (res.data.status === 'success') {
      customAlert.showToastNotification('Login Successfully!!');
      location.assign('/');
    } else if (res.data.status === 'notFound') {
      baseView.DOMElements.modalSignUp.classList.add('modal--show');
    } else {
      customAlert.alertPrimary('Login Failed!!');
    }
  } catch (err) {
    customAlert.alertPrimary(err.response.data.message);
  }
};

// EDITING PROFILE OF USER
export const editProfile = async (username, name, bio) => {
  username = username.trim();
  name = name.trim();
  baseView.DOMElements.inputs.forEach(el => validate.validateEditProfile);

  // IF THERE ARE ANY ELEMENT HAVING CLASS ERRORVALIDATION, THAN IT MEANS THE VALIDATION HAS FAILED
  if (
    baseView.DOMElements.formEditProfile.querySelector(
      '.form__field__errorValidation'
    )
  ) {
    return;
  }

  // HERE MEANS, VALIDATION SUCCEEDED
  utilBase.showLoader(baseView.DOMElements.modalForLoader, true);
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data: {
        name,
        username,
        bio
      }
    });

    utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);

    if (res.data.status === 'success') {
      customAlert.showToastNotification('Profile Updated Successfully!!');
    } else {
      customAlert.alertPrimary('Failed to Update!!');
    }
  } catch (err) {
    customAlert.alertPrimary(err.response.data.message);
  }
};

// LOGGING OUT
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      customAlert.showToastNotification('Logout Successfully!!');
      setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    customAlert.alertPrimary(err.response.data.message);
  }
};
