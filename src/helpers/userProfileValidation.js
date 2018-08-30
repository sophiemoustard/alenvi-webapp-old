import Joi from 'joi';

const userProfileSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  mobilePhone: Joi.string(),
  local: {
    email: Joi.string().required()
  },
  administrative: Joi.object().keys({
    identity: Joi.object().keys({
      nationality: Joi.string().required(),
      dateOfBirth: Joi.string().required(),
      birthCountry: Joi.string().required(),
      birthState: Joi.string().required(),
      birthCity: Joi.string().required(),
      socialSecurityNumber: Joi.number().required()
    }),
    contact: Joi.object().keys({
      address: Joi.string().required(),
      additionalAddress: Joi.string().allow('', null),
      zipCode: Joi.string().required(),
      city: Joi.string().required()
    }),
    emergencyContact: Joi.object().keys({
      name: Joi.string().required(),
      phoneNumber: Joi.string().required()
    }),
    payment: {
      rib: {
        iban: Joi.string().required(),
        bic: Joi.string().required()
      }
    },
    mutualFund: {
      has: Joi.boolean().required(),
      driveId: Joi.string().allow(null).when('has', { is: true, then: Joi.required() }),
      link: Joi.string().allow(null)
    },
    navigoInvoice: {
      driveId: Joi.string().required(),
      link: Joi.string()
    },
    transportInvoice: {
      type: Joi.string().required(),
      driveId: Joi.string().when('type', { is: 'public', then: Joi.required() }),
      link: Joi.string()
    },
    phoneInvoice: {
      driveId: Joi.string().required(),
      link: Joi.string()
    },
    certificates: Joi.array().min(1).required(),
    healthAttest: {
      driveId: Joi.string().required(),
      link: Joi.string()
    },
    idCardRecto: {
      driveId: Joi.string().required(),
      link: Joi.string()
    },
    idCardVerso: {
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    }
  })
});

const options = {
  abortEarly: false,
  allowUnknown: true
};

export const userProfileValidation = (profile) => Joi.validate(profile, userProfileSchema, options);
