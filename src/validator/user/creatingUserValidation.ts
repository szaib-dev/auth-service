import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Invalid Email',
        isEmail: true,
        notEmpty: true,
    },
    password: {
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
        notEmpty: true,
        errorMessage: 'Password is required',
    },
    fullname: {
        notEmpty: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'It should be min 3 chars',
        },
    },
});
