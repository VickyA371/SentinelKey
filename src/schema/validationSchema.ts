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