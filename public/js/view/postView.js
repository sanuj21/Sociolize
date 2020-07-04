import axios from 'axios';
import * as baseView from './baseView';
import { showComments } from './commentView';
import { globalVars } from './baseView';
import * as customAlert from '../view/customAlert';
import * as utilBase from '../util/utilBase';

// CHANGING THE HEART SVG STYLE, AND CREATING LIKE OBJ
const likePost = async (el, post, fn) => {
  // FOR ANIMATION, HEART ON POSTS
  if (el.querySelector('.fadedHeart')) {
    el.querySelector('.fadedHeart').parentNode.removeChild(
      el.querySelector('.fadedHeart')
    );
  }

  const heartMarkup = `
        <svg class = "fadedHeart">
          <use xlink:href = "/icons/sprite.svg#icon-favorite"></use>
        </svg>
        `;

  if (fn) {
    fn(heartMarkup);
  }

  if (!Array.from(post.likeBtn.classList).includes('likedHeart')) {
    post.likeBtnIcon.setAttribute(
      'xlink:href',
      '/icons/sprite.svg#icon-favorite'
    );
    post.likeBtn.classList.add('likingHeart');
    post.likeBtn.classList.add('likedHeart');

    // CREATING A LIKE OBJECT

    // GET THE POSTID FROM BODY(DATA ATTRIBUTE)
    const postId = el.dataset.postid || null;

    try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}/likes`
      });
      post.likeBtn.dataset.likeid = res.data.doc.id; // ADDING THE LIKE ID TO DATA ATTRIBUTE
    } catch (err) {
      console.log(err.response.data.message);
    }
  }
};
// ########################

// CHANGING THE HEART SVG STYLE, DELETING THE LIKE OBJ
const unlikePost = async (el, post) => {
  if (Array.from(post.likeBtn.classList).includes('likedHeart')) {
    post.likeBtnIcon.setAttribute(
      'xlink:href',
      '/icons/sprite.svg#icon-favorite_outline'
    );
    post.likeBtn.classList.remove('likingHeart');
    post.likeBtn.classList.remove('likedHeart');
    // DELETING THE LIKED OBJ
    // GET THE POSTID FROM BODY(DATA ATTRIBUTE)
    const postId = el.dataset.postid || null;
    const likeId = post.likeBtn.dataset.likeid || null;
    try {
      const res = await axios({
        method: 'DELETE',
        url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}/likes/${likeId}`
      });
    } catch (err) {
      console.log(err.response.data.message);
    }
  }
};
// ########################

// TOGGLING HEART SVG STYLE, AND OBJ
const toggleLike = (el, post) => {
  if (!Array.from(post.likeBtn.classList).includes('likedHeart')) {
    likePost(el, post);
  } else {
    unlikePost(el, post);
  }
};
// ########################

// CREATING POST OBJ WHICH INCLUDES ITS CORRESPONDING ELEMENTS
const createPostDom = el => {
  const post = {
    img: el.querySelector('.post__img'),
    infoMain: el.querySelector('.post__info--main'),
    likeBtn: el.querySelector('.post__actions__icon--like'),
    likeBtnIcon: el.querySelector('.post__actions__icon--like use')
  };

  return post;
};
// ########################

// HANDLING CLICK ON POST MORE
const handleClickPostMore = async e => {
  let el = e.target.parentNode;
  let postId = el.dataset.postid || null;
  if (
    e.target.matches('.post__more__list__item--delete') ||
    e.target.matches('.post__more__list__item--delete *')
  ) {
    utilBase.showLoader(baseView.DOMElements.modalForLoader, true);
    await axios({
      method: 'DELETE',
      url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}`
    });
    utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);

    // DELETE THE POST FROM UI
    const post = document.querySelector(`.post[data-postid='${postId}'`);
    post.parentNode.removeChild(post);
    customAlert.showToastNotification('Post Deleted');
  } else if (
    e.target.matches('.post__more__list__item--copy') ||
    e.target.matches('.post__more__list__item--copy *')
  ) {
    // WRITING TO CLIPBOARD
    const result = await navigator.permissions.query({
      name: 'clipboard-write'
    });

    if (result.state == 'granted' || result.state == 'prompt') {
      const text = await navigator.clipboard.writeText(location.href);
      el.classList.remove('post__more__list--show');
      customAlert.showToastNotification('Link Copied');
    }
  }
};
//######################################

// HANDLE CLICK ON POST
export const handleClickPost = async function (e) {
  let el = this;
  let postId = el.dataset.postid || null;
  const post = createPostDom(el);
  // WHEN CLICKED ON HEART ICON

  if (
    e.target.matches('.post__actions__icon--like') ||
    e.target.matches('.post__actions__icon--like *')
  ) {
    toggleLike(el, post);
  }
  // WHEN CLICKED ON COMMENT ICON
  else if (
    e.target.matches('.post__actions__icon--comment') ||
    e.target.matches('.post__actions__icon--comment *') ||
    e.target.matches('.post__comments__link')
  ) {
    await showComments(el, e);
  }
  // WHEN CLICK ON 3 DOTS ON POST
  else if (
    e.target.matches('.post__more__btn') ||
    e.target.matches('.post__more__btn *')
  ) {
    el.querySelector('.post__more__list').classList.toggle(
      'post__more__list--show'
    );
    // el.querySelector('.post__more').insertAdjacentHTML(
    //   'beforeend',
    //   markupMore
    // );
  } else if (
    e.target.matches('.post__more__list') ||
    e.target.matches('.post__more__list *')
  ) {
    await handleClickPostMore(e);
  }
};

// ########################

// HANDLE DOUBLE CLICK ON POST
export const handleDblClickPost = function (e) {
  let el = this;
  const post = createPostDom(el);
  // FOR IMAGE
  if (
    e.target.matches('.post__img') ||
    e.target.matches('.post__img *') // FOR HEART
  ) {
    likePost(el, post, markup => {
      post.img.insertAdjacentHTML('beforeend', markup);
    });
  }

  // FOR POST TEXT
  else if (
    e.target.matches('.post__info--main') ||
    e.target.matches('.post__info--main *')
  ) {
    likePost(el, post, markup => {
      post.infoMain.insertAdjacentHTML('beforeend', markup);
    });
  }
};

// ########################

// FETCHING IMAGE FROM USER'S DEVICE, WHILE ADDING POSTS
export const addPostImg = () => {
  // IF USER SELECTS IMG AFTER TYPING IN THE FIELD
  baseView.DOMElements.addPostModal.classList.add('modal--show');
  if (baseView.DOMElements.addPostTextarea[0].value != '') {
    baseView.DOMElements.addPostTextarea[1].value =
      baseView.DOMElements.addPostTextarea[0].value;
    baseView.DOMElements.addPostTextarea[0].value = '';
    document.querySelector('.add-post__textarea--withImg').focus();
    autoSizeTextarea.call(baseView.DOMElements.addPostTextarea[0]);
    autoSizeTextarea.call(baseView.DOMElements.addPostTextarea[1]);
  }

  if (baseView.DOMElements.postPhotoInput.files.length > 0) {
    let reader = new FileReader();
    reader.onload = e => {
      baseView.DOMElements.addPostImg.setAttribute('src', e.target.result);
    };

    reader.readAsDataURL(baseView.DOMElements.postPhotoInput.files[0]);
  }
};

//######################################
