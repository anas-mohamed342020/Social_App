import jwt from 'jsonwebtoken'


export const verify = (token , signature = "") => {
    return jwt.verify(token,signature);
}