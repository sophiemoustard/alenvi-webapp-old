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
    bic: Joi.string().required(),
    mandates: Joi.array().items(Joi.object().keys({
      signedAt: Joi.date().required()
    }))
  },
  subscriptions: Joi.array().min(1),
  subscriptionsAccepted: Joi.boolean().when('quotes', { is: Joi.array().length(0), then: Joi.valid(true) }),
  quotes: Joi.array().items(Joi.object({
    drive: Joi.object().keys({
      id: Joi.string(),
      link: Joi.string()
    }).when('quotes', { is: Joi.array().min(1), then: Joi.required() })
  }))
});

export const customerProfileValidation = (profile, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(profile, customerProfileSchema, options);
};
