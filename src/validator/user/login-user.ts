import { checkSchema } from "express-validator";

const schema = checkSchema({
    email: {
        isEmail: true,
        trim: true,
        errorMessage: 'Invalid Email Format',
        notEmpty: true
    },

    password: {
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 5
            }
        }
    }
})


export default schema