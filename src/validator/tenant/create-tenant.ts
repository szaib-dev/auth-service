import { checkSchema } from "express-validator";

const tenantRegisterValidation = checkSchema({
    name: {
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 3,
            },
            errorMessage: 'Min length for name is 3'
        }
    },
    address: {
        isLength: {
            options: {
                min: 6
            },
             errorMessage: 'Min length for name is 3'
        },
        trim: true
    }
})


export default tenantRegisterValidation