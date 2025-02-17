
export const create = async ({ model, data }) => {
    const result = await model.create(data)
    return result
}

export const find = async ({ model, filter = {}, select = "", populate = [], skip = 0, limit = 20 }) => {
    const result = await model.find(filter).select(select).populate(populate).skip(skip).limit(limit)
    return result
}

export const findOne = async ({ model, filter = {}, select = "", populate = [] }) => {
    const result = await model.findOne(filter).select(select).populate(populate)
    return result
}

export const findById = async ({ model, _id = "", select = "", populate = [] }) => {
    const result = await model.findById(_id).select(select).populate(populate)
    return result
}

export const findByIdAndUpdate = async ({ model, _id = "", select = "", populate = [], data = {}, options = {} }) => {
    const result = await model.findByIdAndUpdate(_id, data, options).select(select).populate(populate)
    return result
}
export const findOneAndUpdate = async ({ model, filter = {}, select = "", populate = [], data = {}, options = {} }) => {
    const result = await model.findOneAndUpdate(filter, data, options).select(select).populate(populate)
    return result
}

export const findOneAndDelete = async ({ model, filter = {}, select = "", populate = [] }) => {
    const result = await model.findOneAndDelete(filter).select(select).populate(populate)
    return result 
}
export const findByIdAndDelete = async ({ model, _id = "", select = "", populate = [] }) => {
    const result = await model.findByIdAndDelete(_id).select(select).populate(populate)
    return result
}

export const deleteOne = async ({ model, filter = {} }) => {
    const result = await model.deleteOne(filter)
    return result
}
export const deleteMany = async ({ model, filter = {} }) => {
    const result = await model.deleteMany(filter)
    return result
}
export const updateOne = async ({ model, filter = {},data = {} }) => {
    const result = await model.updateOne(filter,data)
    return result
}
export const updateMany = async ({ model, filter = {},data = {} }) => {
    const result = await model.updateMany(filter,data = {})
    return result
}