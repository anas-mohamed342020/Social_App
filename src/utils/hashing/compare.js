import { compareSync } from "bcrypt"

export const compare = ({data,encrypted}) => {
    return compareSync(data,encrypted)
}