const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(422).json({ success: false, error: messages });
  }
  next();
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required(),
    full_name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).allow('', null).optional(),
    avatar_url: Joi.string().uri().allow('', null).optional(),
  }),

  adminUpdateUser: Joi.object({
    full_name:  Joi.string().trim().min(2).max(100).optional(),
    phone:      Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).allow('', null).optional(),
    role:       Joi.string().valid('user', 'admin').optional(),
    is_active:  Joi.boolean().optional(),
    avatar_url: Joi.string().uri().allow('', null).optional(),
  }),
};

module.exports = { validate, schemas };
