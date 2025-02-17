export const globalErrorHandler = (error, req, res, next) => {
    res.status(error.cause || 500).json({ Error: error + "" });
}