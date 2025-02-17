import { hashSync } from "bcrypt"

export const hash = (plaintext) => {
    return hashSync(plaintext,Number(process.env.SALT_ROUNDS))
}