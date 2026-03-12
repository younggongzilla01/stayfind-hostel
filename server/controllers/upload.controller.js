const uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }
        
        // Multer-storage-cloudinary automatically uploads the files to Cloudinary
        // and attaches the Cloudinary secure URLs to req.files[].path
        const imageUrls = req.files.map(file => file.path);
        
        res.status(200).json({ 
            message: 'Images uploaded successfully', 
            urls: imageUrls 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadImages };
