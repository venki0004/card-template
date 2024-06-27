const Validator = require("validatorjs");

export const ValidateFields = (data: any, rules: any, customMessage = {}) => {
  const validation = new Validator(data, rules, customMessage);

  if (validation.fails()) {
    const fieldErrors = {} as any;
    for (let key in validation.errors.errors) {
      fieldErrors[key] = validation.errors.errors[key][0];
    }
    return fieldErrors;
  }

  return true;
};
