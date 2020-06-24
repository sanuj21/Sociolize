// RETURNS TIME FROM NOW
export const fromNowPast = dateMilli => {
  let differTime = Date.now() - dateMilli;
  let ago = '';

  // CONVERTING THE MILLISECONDS INTO DAY, HOUR ETC.
  let weeks, days, hours, minutes, secs;
  weeks = Math.floor(differTime / (1000 * 60 * 60 * 24 * 7));
  differTime -= weeks * 1000 * 60 * 60 * 24 * 7;

  ago = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  //##
  if (!weeks) {
    days = Math.floor(differTime / (1000 * 60 * 60 * 24));
    differTime -= days * 1000 * 60 * 60 * 24;
    ago = `${days} day${days > 1 ? 's' : ''} ago`;

    //##
    if (!days) {
      hours = Math.floor(differTime / (1000 * 60 * 60));
      differTime -= hours * 1000 * 60 * 60;
      ago = `${hours} hour${hours > 1 ? 's' : ''} ago`;

      //##
      if (!hours) {
        minutes = Math.floor(differTime / (1000 * 60));
        differTime -= minutes * 1000 * 60;
        ago = `${minutes} min${minutes > 1 ? 's' : ''} ago`;

        //##
        if (!minutes) {
          secs = Math.floor(differTime / 1000);
          ago = `${secs} sec${secs > 1 ? 's' : ''} ago`;
        }
      }
    }
  }

  return ago;
};
