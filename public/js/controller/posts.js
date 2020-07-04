import Compressor from 'compressorjs';
import * as baseView from './../view/baseView';
import * as postView from './../view/postView';
import axios from 'axios';
import { globalVars } from './../view/baseView';
import * as utilBase from '../util/utilBase';

// ADDING POST TO UI, DYNAMICALLY
const addPostUI = post => {
  const userPhoto = post.user.photo
    ? `<img
      src="images/users/${post.user.photo}"
      alt="post.user.userId"
      class="post__user__photo"
    />`
    : `<svg class = "post__user__icon">
    <use xlink:href='icons/sprite.svg#icon-account_circle'></use>
    </svg>`;

  // IF POST IMAGE EXIST
  let postImg = ``;
  let postDescImg = ``;
  if (post.photo) {
    postImg = `<div class="post__img">
    <img
      src="images/posts/${post.photo}"
      alt="${post.photo}"
      class="post__img__src"
    />
  </div>`;
    postDescImg = `<div class="post__info">
  <div class="post__description">
    <span class="post__description__user">${post.user.username}</span>: ${post.description}
  </div>
  </div>`;
  } else {
    postImg = `<div class="post__info post__info--main">
    <div class="post__description--main">${post.description}</div>
    </div>`;
  }

  let comments = `<div class = "post__comments__notExist"> No Comments!!</div>`;

  if (post.comments.length > 0) {
    comments = `<a href="#" class="post__comments__link">View All Comments</a>
    <!-- ONE COMMENT BOX-->
    <div class="post__comment">
      <div class="post__comment__description">
        <span class="post__comment__user">${
          post.comments[0].user.username
        }: </span>${post.comments[0].comments}
      </div>
      <div class="post__comment__footer">
        <div class="post__comment__time">${fromNowPast(
          Date.parse(post.comments[0].commentedOn)
        )}</div>
        <div class="post__comment__reply">Reply</div>
        <svg class="post__comment__icon post__comment__icon--like">
          <use xlink:href="icons/sprite.svg#icon-favorite_outline"></use>
        </svg>
      </div>
    </div>
    <!-- ############################# -->`;
  }

  const markupPost = `
  <!-- POST BOX -->
  <div class="post row addingBox postAdding" data-postid="${post.id}">
    <div class="post__header">
      <div class="post__user">
        <!-- IF ELSE -->
        ${userPhoto}
        <!-- #### -->
        <span class="post__user__name">${post.user.username}</span>
      </div>

      <div class="post__time">
        <div class="post__time__date">${new Date(
          Date.parse(post.postedOn)
        ).toLocaleString('en', {
          day: 'numeric',
          month: 'long'
        })}</div>
        <div class="post__time__clock">${new Date(
          Date.parse(post.postedOn)
        ).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
      <div class="post__more">
        <svg class="post__more__btn">
          <use
            xlink:href="icons/sprite.svg#icon-keyboard_control
           "
          ></use>
        </svg>
        <div class="post__more__list" data-postid = "${post.id}">
                <div class="post__more__list__item post__more__list__item--copy">Copy Link</div>
                <div class="post__more__list__item post__more__list__item--delete">Delete</div>
              </div>
      </div>
    </div>
    <div class="post__body">
      <!-- IF PHOTO EXIST -->
      ${postImg}
      <!-- ### -->
      <div class="post__actions">
        <svg class="post__actions__icon post__actions__icon--like">
          <use xlink:href="icons/sprite.svg#icon-favorite_outline"></use>
        </svg>
        <svg class="post__actions__icon post__actions__icon--comment">
          <use xlink:href="icons/sprite.svg#icon-forum"></use>
        </svg>
        <svg class="post__actions__icon post__actions__icon--message">
          <use xlink:href="icons/sprite.svg#icon-paper-plane"></use>
        </svg>
      </div>
      <!-- IF PHOTO EXIST -->
     ${postDescImg}
    </div>
    <div class="post__footer">
      <div class="post__comments">
        ${comments}
      </div>
    </div>
  </div>
  <!-- ############################# -->
  `;

  baseView.DOMElements.sectonPosts.insertAdjacentHTML('afterbegin', markupPost);

  // CLOSE THE MODAL IF EXIST
  if (baseView.DOMElements.addPostModal)
    baseView.DOMElements.addPostModal.classList.remove('modal--show');

  baseView.DOMElements.addPostTextarea[0].value = '';

  // SELECTING THE POST AND ATTACHING EVENTS
  const curPost = document.querySelector('.postAdding');
  curPost.addEventListener('dblclick', postView.handleDblClickPost);
  curPost.addEventListener('click', postView.handleClickPost);
};

//#######################################

// CREATING POST
export const addPost = async () => {
  const form = new FormData();
  const postDesc = baseView.DOMElements.addPostTextarea[0].value
    ? baseView.DOMElements.addPostTextarea[0].value
    : baseView.DOMElements.addPostTextarea[1].value;

  form.append('description', postDesc);

  let file, res;

  utilBase.showLoader(baseView.DOMElements.modalForLoader, true);

  if (
    baseView.DOMElements.postPhotoInput &&
    baseView.DOMElements.postPhotoInput.files &&
    baseView.DOMElements.postPhotoInput.files.length > 0
  ) {
    file = baseView.DOMElements.postPhotoInput.files[0];
    // IF PHOTO IS LESS THAN 500KB, THAN COMPRESS TO 30%, ELSE 10%
    const quality = file.size <= 500 * 1024 ? 0.3 : 0.1;
    new Compressor(file, {
      quality: quality,
      async success(result) {
        form.append('photo', result);
        res = await axios({
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          url: `/api/v1/users/${globalVars.loggedInUserId}/posts`,
          data: form
        });

        utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);
        addPostUI(res.data.doc);
      },
      error(err) {
        console.log(err.message);
      }
    });

    // EMPTY THE SELECT INPUT AFTER UPLOADING
    baseView.DOMElements.postPhotoInput.value = '';
  } else {
    res = await axios({
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      url: `/api/v1/users/${globalVars.loggedInUserId}/posts`,
      data: form
    });

    utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);
    addPostUI(res.data.doc);
  }
};
