
export const pagination = ({ page = 1, limit = 2 }) => {
    // implement pagination logic here
    if (page <= 0) page = 1
    if (limit <= 0) limit = 2

    const skip = (page - 1) * limit
    return { skip, limit }
}