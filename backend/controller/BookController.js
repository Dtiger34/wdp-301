const Book = require("../model/book"); // Import model Book để thao tác với MongoDB

// Hàm lấy danh sách tất cả sách trong hệ thống
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find(); // Truy vấn tất cả tài liệu trong collection 'books'
        res.status(200).json(books); // Trả về danh sách sách với mã thành công 200
    } catch (error) {
        res.status(500).json({ message: error.message }); // Trả lỗi nếu có vấn đề trong quá trình truy vấn
    }
}

// Hàm lấy thông tin 1 sách dựa vào ID truyền trong URL
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); // Tìm sách theo _id
        if (!book) {
            return res.status(404).json({ message: "Book not found" }); // Nếu không tìm thấy thì trả mã lỗi 404
        }
        res.status(200).json(book); // Nếu tìm thấy thì trả thông tin sách
    } catch (error) {
        res.status(500).json({ message: error.message }); // Trả lỗi nếu có lỗi hệ thống
    }
}

// Hàm tạo mới một cuốn sách từ dữ liệu gửi lên (POST request)
exports.createBook = async (req, res) => {
    try {
        const book = await Book.create(req.body); // Tạo sách mới với dữ liệu từ client (đảm bảo req.body đúng định dạng)
        res.status(201).json(book); // Trả về sách mới tạo với mã 201 (Created)
    } catch (error) {
        res.status(500).json({ message: error.message }); // Trả lỗi nếu việc tạo sách thất bại
    }
}
