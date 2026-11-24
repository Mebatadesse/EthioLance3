
const supabase = require("../config/supabase");

const uploadFile = async (bucketName, filePath, file) => {
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        const uploadError = new Error(error.message);
        uploadError.statusCode = 500;
        throw uploadError;
    }

    return data.path;
};

const deleteFile = async (bucketName, filePath) => {
    const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

    if (error) {
        const deleteError = new Error(error.message);
        deleteError.statusCode = 500;
        throw deleteError;
    }
};

const getSignedUrl = async (bucketName, filePath, expiresIn = 3600) => {
    const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        const signedUrlError = new Error(error.message);
        signedUrlError.statusCode = 500;
        throw signedUrlError;
    }

    return data.signedUrl;
};

const getPublicUrl = (bucketName, filePath) => {
    const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return data.publicUrl;
};

module.exports = {
    uploadFile,
    deleteFile,
    getSignedUrl,
    getPublicUrl,
};
