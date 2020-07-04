import axios from 'axios';
import * as baseView from './baseView';
import { globalVars } from './baseView';
import * as utilBase from '../util/utilBase';
import { fromNowPast } from '../util/dateUtil';

// GENERATING MARKUP FOR ONE COMMENT
const singleCommentMarkup = el => {
  const agoComment = fromNowPast(Date.parse(el.commentedOn));
  const userId = baseView.DOMElements.body.dataset.userid || null;

  // SHOW A DELETE BUTTON ON COMMENT, THAT THE LOGGED USER HAS POSTED
  const deleteComment =
    userId === el.commentedBy.id
      ? `<div class="post__comment__delete">Delete</div>`
      : '';

  const likes =
    el.likes && el.likes.length > 0 ? `${el.likes.length} Likes` : '';
  const markUp = `<!-- ONE COMMENT BOX-->
        <div class="post__comment post__comment--modal" data-commentid='${el.id}'>
          <div class="post__comment__description post__comment__description--modal">
            <a class="post__comment__user" href = "/user/${el.commentedBy.username}">${el.commentedBy.username} : </a>${el.comment}
          </div>
          <div class="post__comment__footer">
            <div class="post__comment__time">${agoComment}</div>
            ${deleteComment}
            <div class="post__comment__likesTotal">${likes}</div>
            <div class="post__comment__reply">Reply</div>
            <svg class="post__comment__icon post__comment__icon--like">
              <use xlink:href="icons/sprite.svg#icon-favorite_outline"></use>
            </svg>
          </div>
        </div>
        <!-- ############################# -->`;

  return markUp;
};
//#######################################

// FETCHING COMMENTS FROM DB
export const getComments = async postId => {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}/comments`
  });
  return res.data.docs;
};
//######################################

// MODAL FOR CONFORMATION WHEN DELETING COMMENTS
const askForConfirmation = () => {
  baseView.DOMElements.modalConfirmation.classList.add('modal--showTop');
};
//######################################

// POSTING COMMENT
const submitComment = async () => {
  const comment = baseView.DOMElements.commentInput.value;
  if (!comment) {
    return;
  }

  // IF COMMENT IS NOT EMPTY
  const postId = baseView.DOMElements.modalComments.dataset.postid || null;
  utilBase.showLoader(baseView.DOMElements.modalForLoader, true);
  const res = await axios({
    method: 'POST',
    url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}/comments`,
    data: {
      comment
    }
  });

  utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);

  const commentObj = res.data.doc;
  const commentMarkup = singleCommentMarkup(commentObj);
  baseView.DOMElements.modalCommentsBody.insertAdjacentHTML(
    'afterbegin',
    commentMarkup
  );

  // EMPTY THE INPUT AFTER POSTING
  baseView.DOMElements.commentInput.value = '';
};
//######################################

// HANDLING CLICK OF MODAL
let commentElToDelete;
export const handleClickCommentModal = async e => {
  const postId = baseView.DOMElements.modalComments.dataset.postid || null;

  // HANDLING THE CLICK ON POST BTN
  if (
    e.target.matches('.submit__comment') ||
    e.target.matches('.submit__comment *')
  ) {
    await submitComment();
  }

  // HANDLING CLICK ON DELETE BTN
  else if (
    e.target.matches('.post__comment__delete') ||
    e.target.matches('.post__comment__delete *')
  ) {
    commentElToDelete = e.target.parentNode.parentNode;
    askForConfirmation();
  }
};
//######################################

// HANDLING CLICK ON CONFIRMATION MODAL
export const handleClickConfirmationModal = async e => {
  if (!e.target.matches('.modal-confirmation__btns__btn')) return;
  // CLOSE THE MODAL
  baseView.DOMElements.modalConfirmation.classList.remove('modal--showTop');

  // IF CLICK ON YES, DELETE THE COMMENT
  if (e.target.matches('.modal-confirmation__btns__btn--yes')) {
    if (commentElToDelete) {
      const postId = baseView.DOMElements.modalComments.dataset.postid || null;
      const commentId = commentElToDelete.dataset.commentid;

      utilBase.showLoader(baseView.DOMElements.modalForLoader, true);
      // DELETING THE COMMENT FROM DB
      const res = await axios({
        method: 'DELETE',
        url: `/api/v1/users/${globalVars.loggedInUserId}/posts/${postId}/comments/${commentId}`
      });
      utilBase.removeLoader(baseView.DOMElements.modalForLoader, true);
      // UPDATING THE UI
      commentElToDelete.parentNode.removeChild(commentElToDelete);
    }
  }
};
//######################################

// SHOWING COMMENTS MODAL
export const showComments = async (el, e) => {
  const postId = el.dataset.postid || null;

  baseView.DOMElements.modalComments.dataset.postid = postId;
  baseView.DOMElements.modalComments.classList.add('modal--show');
  baseView.DOMElements.body.classList.add('modal--show__body');
  baseView.DOMElements.modalCommentsBody.innerHTML = '';
  utilBase.showLoader(baseView.DOMElements.modalCommentsBody);

  const comments = await getComments(el.dataset.postid || null);
  utilBase.removeLoader(baseView.DOMElements.modalCommentsBody);
  baseView.DOMElements.modalCommentsBody.innerHTML = '';
  let commentsMarkup = ``;

  comments.forEach(el => {
    commentsMarkup = commentsMarkup + singleCommentMarkup(el);
  });

  baseView.DOMElements.modalCommentsBody.insertAdjacentHTML(
    'beforeend',
    commentsMarkup
  );

  // FOCUS THE INPUT WHEN CLICKED ON COMMENT ICON

  baseView.DOMElements.commentInput.scrollIntoView();

  if (
    e.target.matches('.post__actions__icon--comment') ||
    e.target.matches('.post__actions__icon--comment *')
  ) {
    baseView.DOMElements.commentInput.focus();
  }
};
//######################################
