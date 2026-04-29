import bcrypt from 'bcryptjs';

const hashMatchPass = async (
    userpassword: string,
    hashedpassword: string
): Promise<boolean> => {
    return await bcrypt.compare(userpassword, hashedpassword);
};

export default hashMatchPass;
