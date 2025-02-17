import jwt from 'jsonwebtoken'


export const sign = (payload = {}, signature = "",expiresIn) => {
    return jwt.sign(payload, signature);
}