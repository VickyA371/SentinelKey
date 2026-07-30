import * as yup from "yup"

export const loginFormSchema = yup.object({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password must be at most 15 characters')
    .required('Password is required'),
  isPasswordVisible: yup.boolean().required()
}).required();

export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
}).required();

export const signUpFormSchema = yup.object({
  fullName: yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phoneNumber: yup.string()
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password must be at most 15 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password must be at most 15 characters')
    .required('Confirm password is required'),
  termsAndConditionsAccepted: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
}).required();

export const addListItemSchema = yup.object({
  itemName: yup.string().required('Item name is required'),
  username: yup.string().required('Username/Email is required'),
  password: yup.string().required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  category: yup.string().required('Category is required'),
}).required();

export const createMasterPasswordSchema = yup.object({
  masterPassword: yup.string()
    .min(10, 'Master password must be at least 10 characters')
    .required('Master password is required'),
  confirmMasterPassword: yup.string()
    .oneOf([yup.ref('masterPassword')], 'Passwords must match')
    .required('Please confirm your master password'),
}).required();

export const unlockVaultSchema = yup.object({
  masterPassword: yup.string().required('Master password is required'),
}).required();

export const profileDetailsSchema = yup.object({
  fullName: yup.string().required('Full Name is required'),
  phoneNumber: yup.string().required('Phone Number is required'),
}).required();