const Bookmark = require("../models/Bookmark");



module.exports = {

    createBookmark: async (req, res) => {
        const newBookmark = new Bookmark(req.body);
        try {
            await newBookmark.save();
            res.status(200).json("Bookmark Successfully Created");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    deleteBookmark: async (req, res) => {
        try {
            await Bookmark.findByIdAndDelete(req.params.id);
            res.status(200).json("Bookmark Successfully Deleted");
        } catch (err) {
            res.status(500).json(err);
        }
    },


    getBookmarks: async (req, res) => {
        try {

            const bookmarks = await Bookmark.find({ userId: req.params.userId });
            res.status(200).json(bookmarks);

        } catch (err) {
            res.status(500).json(err);
        }
    }


}