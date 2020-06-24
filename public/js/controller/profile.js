import axios from 'axios';
import * as baseView from '../view/baseView';

// FOLLOWING ACCOUNT
export const follow = (userId, el) => {
  return async () => {
    if (!Array.from(el.classList).includes('profile__btn--following')) {
      // ADD THE STYLES AND CHANGE ITS CONTENT TO FOLLOWING
      el.classList.add('profile__btn--following');
      el.textContent = 'Following';

      // UPDATE THE USER DOC
      await axios({
        method: 'PATCH',
        url: '/api/v1/users/updateMe',
        data: {
          followed: userId
        }
      });
    } else {
      el.classList.remove('profile__btn--following');
      el.textContent = 'Follow';

      // UPDATE THE USER DOC
      await axios({
        method: 'PATCH',
        url: '/api/v1/users/updateMe',
        data: {
          unfollowed: userId
        }
      });
    }
  };
};

//#######################################

// ADDING PROFILE PIC TO UI
const addProfilePicUI = user => {
  let imgMarkup = `<img src="/images/users/${user.photo}" class = 
      "profile__pic__img" alt="${user.name}"/>`;

  // REMOVING THE OLD IMG OR ICON, BEFORE ADDING THE NEW IMG
  baseView.DOMElements.profielPicImg.parentNode.removeChild(
    baseView.DOMElements.profielPicImg
  );

  baseView.DOMElements.profielPicWrap.insertAdjacentHTML(
    'afterbegin',
    imgMarkup
  );
};

// UPLOADINNG PROFILE PICTURE
export const uploadPic = () => {
  if (baseView.DOMElements.userPhotoInput.files.length > 0) {
    let reader = new FileReader();
    reader.onload = async e => {
      const form = new FormData();

      if (
        baseView.DOMElements.userPhotoInput &&
        baseView.DOMElements.userPhotoInput.files &&
        baseView.DOMElements.userPhotoInput.files.length > 0
      ) {
        const file = baseView.DOMElements.userPhotoInput.files[0];

        // IF PHOTO IS LESS THAN 500KB, THAN COMPRESS TO 30%, ELSE 10%
        const quality = file.size <= 500 * 1024 ? 0.3 : 0.1;
        new Compressor(file, {
          quality: quality,
          async success(result) {
            form.append('photo', result);
            const res = await axios({
              method: 'PATCH',
              url: '/api/v1/users/uploadPhoto',
              headers: { 'Content-Type': 'multipart/form-data' },
              data: form
            });

            addProfilePicUI(res.data.updatedUser);
          },
          error(err) {
            console.log(err.message);
          }
        });
      }
    };

    reader.readAsDataURL(baseView.DOMElements.userPhotoInput.files[0]);
  }
};
