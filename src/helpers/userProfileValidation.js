import Joi from 'joi';

const userProfileSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  mobilePhone: Joi.string(),
  local: {
    email: Joi.string().required()
  },
  picture: {
    link: Joi.string().required()
  },
  administrative: Joi.object().keys({
    driveFolder: Joi.object().keys({
      id: Joi.string()
    }),
    identity: Joi.object().keys({
      nationality: Joi.string().required(),
      birthDate: Joi.string().required(),
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
    }).required(),
    payment: {
      rib: {
        iban: Joi.string().required(),
        bic: Joi.string().required()
      }
    },
    identityDocs: Joi.string().when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    mutualFund: Joi.object().keys({
      has: Joi.boolean().required(),
      driveId: Joi.string().allow(null).when('has', { is: true, then: Joi.required() }),
      link: Joi.string().allow(null)
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    navigoInvoice: {
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    },
    transportInvoice: Joi.object().keys({
      transportType: Joi.string().required(),
      driveId: Joi.string().when('transportType', { is: 'public', then: Joi.required() }),
      link: Joi.string()
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    phoneInvoice: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string()
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    certificates: Joi.array(),
    // certificates: Joi.array().when('administrative.driveFolder', { is: Joi.exist(), then: Joi.array().min(1) }),
    healthAttest: Joi.object().keys({
      driveId: Joi.string().required(),
      link: Joi.string()
    }).when('driveFolder', { is: Joi.exist(), then: Joi.required() }),
    idCardRecto: Joi.object().keys({
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    }).when('identityDocs', { is: Joi.string().valid('cni'), then: Joi.required() }),
    idCardVerso: Joi.object().keys({
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    }),
    passport: Joi.object().keys({
      driveId: Joi.string(),
      link: Joi.string()
    }).when('identityDocs', { is: Joi.string().valid('pp'), then: Joi.required() }),
    residencePermitRecto: Joi.object().keys({
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    }).when('identityDocs', { is: Joi.string().valid('ts'), then: Joi.required() }),
    residencePermitVerso: Joi.object().keys({
      driveId: Joi.string().allow(null),
      link: Joi.string().allow(null)
    }),
  })
});

export const userProfileValidation = (profile, options = {}) => {
  options.allowUnknown = true;
  return Joi.validate(profile, userProfileSchema, options);
}
