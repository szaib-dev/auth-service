import { checkSchema } from "express-validator";

const tenantUpdateValidation = checkSchema({
    name: {
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
    }
})


export default tenantUpdateValidation