import Joi from 'joi';

const customerProfileSchema = Joi.object().keys({
  identity: {
    lastname: Joi.string().required()
  },
  contact: {
    address: {
      fullAddress: Joi.string().required()
    }
  },
  payment: {
    iban: Joi.string().required(),
    bic: Joi.string().required()
  }
});

export const customerProfileValidation = (profile, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(profile, customerProfileSchema, options);
};
