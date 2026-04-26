export const isJWT = (token: string | null) => {
    if (!token) {
        return false;
    }

    const tokens = token.split('.');

    if (tokens.length !== 3) {
        return false;
    }
    try {
        tokens.forEach((token) => {
            Buffer.from(token, 'base64').toString('utf-8');
        });
        return true;
    } catch (error) {
        return false;
    }
};
