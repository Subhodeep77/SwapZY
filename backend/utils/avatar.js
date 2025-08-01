// utils/avatar.js
import md5 from "md5";

export const getGravatarUrl = (email, size = 200) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};
