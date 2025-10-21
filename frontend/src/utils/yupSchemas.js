import * as yup from 'yup';

export const signupSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 characters').max(30).required('Password is required'),
  profilePic: yup
    .mixed()
    .nullable()
    .test(
      'fileSize',
      'File too large (max 5MB)',
      (value) => !value || (value && value.size <= 5 * 1024 * 1024)
    )
    .test(
      'fileType',
      'Only image files are accepted',
      (value) => !value || (value && ['image/jpeg', 'image/png'].includes(value.type)))
});


export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 characters').max(30).required('Password is required'),
});

