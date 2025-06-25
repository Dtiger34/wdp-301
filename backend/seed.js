const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

// Import all models
const User = require("./model/user");
const Book = require("./model/book");
const Category = require("./model/categories");
const Bookshelf = require("./model/bookshelf");
const Inventory = require("./model/Inventory");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Bookshelf.deleteMany({});
    await Inventory.deleteMany({});
    console.log("Cleared existing data");

    // 1. Create Admin User
    // const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      studentId: "ADMIN001",
      name: "Admin Dương Đẹp Trai",
      password: "admin123",
      email: "admin@library.com",
      role: "admin",
      phone: "0123456789",
      address: "Admin Office",
      mustChangePassword: false,
    });
    await admin.save();

    console.log("✅ Admin user created: ADMIN001/admin123");

    const staff = new User({
      studentId: "STAFF001",
      name: "Staff Dương Đẹp Trai",
      password: "staff123",
      email: "staff@library.com",
      role: "staff",
      phone: "0123456789",
      address: "Staff Office",
      mustChangePassword: false,
    });
    await staff.save();
    console.log("✅ Staff user created: STAFF001/staff123");

    // 2. Create Sample Students
    const students = [
      {
        studentId: "SV001",
        password: "SV001",
        name: "Nguyen Van A",
        email: "a@student.com",
        phone: "0123456001",
        address: "Ha Noi",
      },
      {
        studentId: "SV002",
        password: "SV002",
        name: "Tran Thi B",
        email: "b@student.com",
        phone: "0123456002",
        address: "Ho Chi Minh",
      },
      {
        studentId: "SV003",
        password: "SV003",
        name: "Le Van C",
        email: "c@student.com",
        phone: "0123456003",
        address: "Da Nang",
      },
    ];

    for (const student of students) {
      const user = new User({
        ...student,
        role: "user",
        mustChangePassword: true,
      });
      await user.save();
    }
    console.log(
      "✅ Student users created: SV001, SV002, SV003 (password = studentId)"
    );

    // 3. Create Categories
    const categories = [
      { name: "Khoa học", description: "Sách khoa học và công nghệ" },
      { name: "Văn học", description: "Sách văn học trong và ngoài nước" },
      { name: "Lịch sử", description: "Sách lịch sử và địa lý" },
      { name: "Kinh tế", description: "Sách kinh tế và quản lý" },
      { name: "Công nghệ", description: "Sách lập trình và IT" },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log("✅ Categories created:", categories.length);

    // 4. Create Bookshelves
    const bookshelves = [
      {
        code: "K-01",
        name: "Kệ Khoa học",
        location: "Tầng 1, Khu A",
        description: "Kệ sách khoa học tự nhiên",
      },
      {
        code: "K-02",
        name: "Kệ Văn học",
        location: "Tầng 2, Khu B",
        description: "Kệ sách văn học",
      },
      {
        code: "K-03",
        name: "Kệ Công nghệ",
        location: "Tầng 1, Khu C",
        description: "Kệ sách IT và lập trình",
      },
      {
        code: "K-04",
        name: "Kệ Kinh tế",
        location: "Tầng 3, Khu A",
        description: "Kệ sách kinh tế",
      },
    ];

    const createdBookshelves = await Bookshelf.insertMany(bookshelves);
    console.log("✅ Bookshelves created:", bookshelves.length);

    // 5. Create Sample Books
    const books = [
      {
        title: "Lập trình JavaScript từ cơ bản đến nâng cao",
        isbn: "978-0-123456-78-9",
        author: "Nguyen Van Dev",
        publisher: "Tech Books Publishing",
        publishYear: 2023,
        description:
          "Sách hướng dẫn lập trình JavaScript hoàn chỉnh với các ví dụ thực tế",
        price: 250000,
        image: "1-5e81d7f66dada42752efb220d7b2956c.jpg",
        categories: [createdCategories.find((c) => c.name === "Công nghệ")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-03")._id,
        quantity: 5,
      },
      {
        title: "Node.js và Express Framework",
        isbn: "978-0-987654-32-1",
        author: "Le Thi Backend",
        publisher: "Web Dev Press",
        publishYear: 2023,
        description: "Xây dựng ứng dụng web với Node.js và Express",
        price: 280000,
        image: "3-931186dd6dcd231da1032c8220332fea.jpg",
        categories: [createdCategories.find((c) => c.name === "Khoa học")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-03")._id,
        quantity: 3,
      },
      {
        title: "Tôi thấy hoa vàng trên cỏ xanh",
        isbn: "978-0-111111-11-1",
        author: "Nguyen Nhat Anh",
        publisher: "Kim Dong",
        publishYear: 2010,
        description: "Tiểu thuyết về tuổi thơ miền quê Việt Nam",
        price: 120000,
        image: "5-c62daefbb240e7fe8c6d96a4b745824f.jpg",
        categories: [createdCategories.find((c) => c.name === "Văn học")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-02")._id,
        quantity: 7,
      },
      {
        title: "Kinh tế học vi mô",
        isbn: "978-0-222222-22-2",
        author: "Tran Van Economy",
        publisher: "Economics Publisher",
        publishYear: 2022,
        description: "Giáo trình kinh tế học vi mô cơ bản",
        price: 180000,
        image: "8-341425768114119392af4e217bbe4db2.jpg",
        categories: [createdCategories.find((c) => c.name === "Kinh tế")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-04")._id,
        quantity: 4,
      },
      {
        title: "Lịch sử Việt Nam thời kỳ đổi mới",
        isbn: "978-0-333333-33-3",
        author: "Pham Van History",
        publisher: "History Books",
        publishYear: 2021,
        description: "Nghiên cứu về thời kỳ đổi mới của Việt Nam",
        price: 160000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 6,
      },
      {
        title: "Chiến tranh và Hòa bình",
        isbn: "978-0-123456-78-1",
        author: "Leo Tolstoy",
        publisher: "Classic Literature",
        publishYear: 2020,
        description:
          "Tác phẩm văn học kinh điển nói về chiến tranh và hòa bình",
        price: 180000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 10,
      },
      {
        title: "Lịch sử văn minh thế giới",
        isbn: "978-0-234567-89-2",
        author: "Will Durant",
        publisher: "World Books",
        publishYear: 2018,
        description: "Khám phá các nền văn minh lớn của nhân loại",
        price: 200000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 7,
      },
      {
        title: "Việt Nam sử lược",
        isbn: "978-0-345678-90-3",
        author: "Trần Trọng Kim",
        publisher: "NXB Giáo Dục",
        publishYear: 2019,
        description:
          "Tổng hợp ngắn gọn về lịch sử Việt Nam từ thời dựng nước đến hiện đại",
        price: 150000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 5,
      },
      {
        title: "Hồ Chí Minh: Tiểu sử và sự nghiệp",
        isbn: "978-0-456789-01-4",
        author: "Nhiều tác giả",
        publisher: "NXB Chính trị Quốc gia",
        publishYear: 2022,
        description: "Tóm lược cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh",
        price: 175000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 8,
      },
      {
        title: "Cội nguồn dân tộc Việt",
        isbn: "978-0-567890-12-5",
        author: "Nguyễn Văn Dân",
        publisher: "NXB Văn hóa",
        publishYear: 2017,
        description: "Phân tích nguồn gốc và quá trình hình thành dân tộc Việt",
        price: 165000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 9,
      },
      {
        title: "Lịch sử thế giới hiện đại",
        isbn: "978-0-678901-23-6",
        author: "Lê Văn Sử",
        publisher: "NXB Tri thức",
        publishYear: 2023,
        description:
          "Khái quát các sự kiện chính trị - xã hội từ thế kỷ 20 đến nay",
        price: 190000,
        image: "15-afa213ab31cefd06d49b977a2f4ab594.jpg",
        categories: [createdCategories.find((c) => c.name === "Lịch sử")._id],
        bookshelf: createdBookshelves.find((b) => b.code === "K-01")._id,
        quantity: 4,
      },
    ];

    // Create books and their inventory
    for (const bookData of books) {
      const { quantity, ...bookInfo } = bookData;
      const book = await Book.create(bookInfo);

      // Create inventory for each book
      await Inventory.create({
        book: book._id,
        total: quantity,
        available: quantity,
        borrowed: 0,
        damaged: 0,
        lost: 0,
      });
    }

    console.log("✅ Books and inventory created:", books.length);

    console.log("\n🎉 Seed data created successfully!");
    console.log("\n📋 Test Accounts:");
    console.log("👨‍💼 Admin: ADMIN001 / admin123");
    console.log("👨‍🎓 Students: SV001, SV002, SV003 / (password = studentId)");
    console.log("\n📚 Sample data includes:");
    console.log("- 5 categories");
    console.log("- 4 bookshelves");
    console.log("- 5 books with inventory");
    console.log("\n🚀 Ready to test APIs!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the seed function
seedData();
