import * as yup from "yup"

export const loginFormSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(15).required(),
  isPasswordVisible: yup.boolean().required()
}).required();

export const signUpFormSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(15).required(),
  confirmPassword: yup.string().min(8).max(15).required(),
  termsAndConditionsAccepted: yup.boolean().required()
}).required();

export const addListItemSchema = yup.object({
  itemName: yup.string().required('Item name is required'),
  username: yup.string().required('Username/Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  category: yup.string().required('Category is required'),
}).required();