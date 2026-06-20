// Pulls the most useful message out of an axios error: the API's JSON
// { message } if there is one, otherwise the generic network/error text.
export const getMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';
