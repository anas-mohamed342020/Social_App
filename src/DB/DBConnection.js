import mongoose from 'mongoose';

const DBConnection = async () => {
    try {
        await mongoose.connect(process.env.LOCAL_DB_URI)
        console.log('DB connected successfully');

    } catch (error) {
        console.log({ DBError: error });
    }
}

export default DBConnection;