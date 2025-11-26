export const caseRegex = /(?=.*[a-z])(?=.*[A-Z])/;
export const onlyNumberRegex = /^\d+$/;
export const specialCharacterRegex = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const phoneNoRegex = /^[+(\s.\-/\d)]{7,15}$/;
export const usernameRegex = /^[a-zA-Z\d_-]{4,10}$/;

export const usernameOrEmailRegex =
  /^(?:[a-zA-Z\d][a-zA-Z\d_-]{3,10}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i;

export const nameWithSpaceRegex = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 ]*$/;
export const nameWithCommaAndSpaceRegex =
  /^[A-Za-z0-9 _,]*[A-Za-z0-9,][A-Za-z0-9 ,]*$/;

export const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z].*){8,}.+$/;

export const atLeastOneNumberRegex = /^(?=.*\d).+$/;
export const atLeastOneLowercaseRegex = /(?=.*[a-z].*).+$/;
export const atLeastOneUppercaseRegex = /(?=.*[A-Z].*).+$/;
export const min8charsRegex = /^.{8,}$/;
export const numberPercentageRegex = /^(100|[1-9]?\d)$/;

export const dropDownRegex =
  /^[A-Za-z0-9 _\-.'"*]*[A-Za-z0-9][A-Za-z0-9 _\-.'"*]*$/;
export const webLinkRegex = /^(ftp|http|https):\/\/[^ "]+$/;

export const allCharactersRegex = /^[^\s][\w\W]*$/;

export const onlyAlphabetsAndSpaceRegex =
  /^(?=[a-zA-Z])(?=.*[a-z]?[A-Z]?)[a-zA-Z ]{1,30}$/;
export const onlyAlphabetsSpaceAndNumberRegex = /^[A-Za-z0-9 ]{3,15}$/;

export const cardNumberRegex =
  /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/;

export const combinedExpiryMonthRegex =
  /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/;

export const cvvRegex = /^[0-9]{3,4}$/;

export const threeIntegerRegex = /^\d{1,3}$/;
export const durationRegEx = /^(?:[0-5]?[0-9]|60)$/;
export const tagRegex = /@(\w+)/;
export const charactersWithSpaceOrEmptyRegex = /^[A-Za-z0-9 _]*$/;
export const otpRegex = /^\d{6}$/;
