export const POST_KB_CREDENTIALS_USER_FAILURE = 'POST_KB_CREDENTIALS_USER_FAILURE';

export const postHBCredentialsUserFailure = ({ errors }) => ({
  type: POST_KB_CREDENTIALS_USER_FAILURE,
  payload: errors,
});
