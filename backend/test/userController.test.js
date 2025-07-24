const express = require('express');
const request = require('supertest');
const app = require('../app');
const User = require('../model/user');
const jwtConfig = require('../config/jwtconfig');
const BorrowRecord = require('../model/borrowHistory');
const XLSX = require('xlsx');
const authController = require('../controller/authController');
jest.mock('../model/user');
jest.mock('../model/borrowHistory');

const API = '/api/v1/auth';


const customApp = express();
customApp.use(express.json());
customApp.patch('/custom-update/:id', (req, res, next) => {
    req.user = { role: 'student', id: 'u1' };
    next();
}, authController.updateUser);

jest.mock('../config/jwtconfig', () => ({
    requireAuth: (req, res, next) => {
        req.user = { role: 'student', id: 'u1' };
        next();
    },
    requireAdmin: (req, res, next) => {
        req.user = { role: 'admin', id: 'admin1' };
        next();
    },
    generateToken: jest.fn(() => 'token')
}));

jest.mock('../middlewares/Upload', () => ({
    single: () => (req, res, next) => {
        req.file = {
            buffer: Buffer.from([]),
            originalname: 'test.xlsx',
            mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        next();
    }
}));

describe('User Controller', () => {
    afterEach(() => jest.clearAllMocks());

    describe('login', () => {
        it('should return 404 if user not found', async () => {
            User.findOne.mockResolvedValue(null);
            const res = await request(app).post(`${API}/login`).send({ studentId: '123', password: '123' });
            expect(res.statusCode).toBe(404);
        });

        it('should return 401 if password incorrect', async () => {
            const mockUser = {
                comparePassword: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post(`${API}/login`)
                .send({ studentId: '123', password: 'wrong' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Incorrect password');
        });


        it('should require password change if flag is set', async () => {
            const mockUser = {
                _id: 'u1',
                studentId: '123',
                name: 'A',
                comparePassword: jest.fn().mockResolvedValue(true),
                mustChangePassword: true,
                role: 'student'
            };
            User.findOne.mockResolvedValue(mockUser);
            const res = await request(app).post(`${API}/login`).send({ studentId: '123', password: '123' });
            expect(res.statusCode).toBe(200);
            expect(res.body.mustChangePassword).toBe(true);
        });

        it('should login successfully if credentials valid', async () => {
            const mockUser = {
                _id: 'u1',
                studentId: '123',
                name: 'A',
                role: 'student',
                comparePassword: jest.fn().mockResolvedValue(true),
                mustChangePassword: false
            };
            User.findOne.mockResolvedValue(mockUser);
            const res = await request(app).post(`${API}/login`).send({ studentId: '123', password: '123' });
            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBe('token');
        });

        it('should handle server error', async () => {
            User.findOne.mockRejectedValue(new Error('error'));
            const res = await request(app).post(`${API}/login`).send({ studentId: '123', password: '123' });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('importUsersFromExcel', () => {
        it('should import users from excel, skip duplicates', async () => {
            // ✅ Tạo dữ liệu và sheet hợp lệ
            const data = [{ studentId: 's1', name: 'User 1' }];
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            // ✅ Mock lại đọc sheet
            const readMock = jest.spyOn(XLSX, 'read').mockReturnValue({
                Sheets: { Sheet1: worksheet },
                SheetNames: ['Sheet1']
            });

            jest.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue(data);

            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue();

            const res = await request(app)
                .post(`${API}/import`)
                .attach('file', Buffer.from(buffer), 'test.xlsx');

            expect(res.statusCode).toBe(200);
            readMock.mockRestore();
        });

        it('should skip existing users when importing from Excel', async () => {
            const buffer = XLSX.write(
                {
                    SheetNames: ['Sheet1'],
                    Sheets: {
                        Sheet1: XLSX.utils.json_to_sheet([{ studentId: 's1', name: 'User 1' }])
                    }
                },
                { bookType: 'xlsx', type: 'buffer' }
            );

            jest.spyOn(XLSX, 'read').mockReturnValue({
                SheetNames: ['Sheet1'],
                Sheets: {
                    Sheet1: XLSX.utils.json_to_sheet([{ studentId: 's1', name: 'User 1' }])
                }
            });

            jest.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue([{ studentId: 's1', name: 'User 1' }]);

            User.findOne.mockResolvedValue({ studentId: 's1' }); // Mô phỏng user đã tồn tại

            const res = await request(app)
                .post(`${API}/import`)
                .attach('file', Buffer.from(buffer), 'test.xlsx');

            expect(res.statusCode).toBe(200);
        });

        it('should return error if duplicate email', async () => {
            const userId = 'u1';
            const existingUser = {
                _id: userId,
                name: 'User',
                email: 'old@example.com'
            };

            User.findById.mockResolvedValue(existingUser);
            User.findOne.mockResolvedValue({ _id: 'u2', email: 'new@example.com' }); // Trùng email khác ID

            const res = await request(app)
                .patch(`${API}/updateuser/${userId}`)
                .send({ email: 'new@example.com' });

            expect(res.statusCode).toBe(400);
        });

        it('should handle import error', async () => {
            jest.spyOn(XLSX, 'read').mockImplementation(() => {
                throw new Error('Failed to read file');
            });

            const res = await request(app)
                .post(`${API}/import`)
                .attach('file', Buffer.from([]), 'test.xlsx');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Import failed');
        });

    });


    describe('changePassword', () => {
        it('should update and remove mustChangePassword', async () => {
            const mockUser = {
                _id: 'u1',
                role: 'student',
                studentId: 's1',
                name: 'Test',
                mustChangePassword: true,
                save: jest.fn()
            };
            User.findByIdAndUpdate.mockResolvedValue(mockUser);
            const res = await request(app).patch(`${API}/changepassword/u1`).send({ newPassword: 'new' });
            expect(res.statusCode).toBe(200);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            User.findByIdAndUpdate.mockResolvedValue(null);
            const res = await request(app).patch(`${API}/changepassword/u1`).send({ newPassword: 'new' });
            expect(res.statusCode).toBe(404);
        });

        it('should handle error', async () => {
            User.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
            const res = await request(app).patch(`${API}/changepassword/u1`).send({ newPassword: 'new' });
            expect(res.statusCode).toBe(500);
        });
        it('should change password without updating mustChangePassword if not required', async () => {
            const mockUser = {
                _id: 'u1',
                role: 'student',
                studentId: 's1',
                name: 'Test',
                mustChangePassword: false,
                save: jest.fn() // Sẽ không được gọi
            };

            User.findByIdAndUpdate.mockResolvedValue(mockUser);

            const res = await request(app)
                .patch(`${API}/changepassword/u1`)
                .send({ newPassword: 'newpass' });

            expect(res.statusCode).toBe(200);
            expect(mockUser.save).not.toHaveBeenCalled(); // 👈 mustChangePassword = false
        });

    });

    describe('getUserById', () => {
        it('should return user', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    _id: 'u1',
                    studentId: 's1',
                    name: 'User',
                    email: 'user@example.com',
                    phone: '123',
                    address: 'abc',
                    role: 'student',
                    mustChangePassword: false
                })
            });
            const res = await request(app).get(`${API}/getuserbyid/u1`);
            expect(res.statusCode).toBe(200);
        });

        it('should return 404 if not found', async () => {
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            const res = await request(app).get(`${API}/getuserbyid/u1`);
            expect(res.statusCode).toBe(404);
        });

        it('should handle error', async () => {
            User.findById.mockImplementation(() => ({
                select: () => Promise.reject(new Error('fail'))
            }));
            const res = await request(app).get(`${API}/getuserbyid/u1`);
            expect(res.statusCode).toBe(500);
        });
    });

    describe('getAllUsers', () => {
        it('should return paginated users', async () => {
            User.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            });
            User.countDocuments.mockResolvedValue(0);
            const res = await request(app).get(`${API}/getallusers`);
            expect(res.statusCode).toBe(200);
        });

        it('should handle error', async () => {
            User.find.mockImplementation(() => {
                throw new Error('fail');
            });
            const res = await request(app).get(`${API}/getallusers`);
            expect(res.statusCode).toBe(500);
        });
    });

    describe('createAccount', () => {
        it('should create new user', async () => {
            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue();
            const res = await request(app).post(`${API}/admin/addaccount`).send({
                studentId: 's1',
                name: 'User',
                password: '123',
                email: 'e@example.com',
                phone: '123',
                address: 'abc',
                role: 'student'
            });
            expect(res.statusCode).toBe(201);
        });

        it('should return error if user exists', async () => {
            User.findOne.mockResolvedValue({ studentId: 's1' });
            const res = await request(app).post(`${API}/admin/addaccount`).send({ studentId: 's1' });
            expect(res.statusCode).toBe(400);
        });

        it('should handle server error', async () => {
            User.findOne.mockRejectedValue(new Error('fail'));
            const res = await request(app).post(`${API}/admin/addaccount`).send({ studentId: 's1' });
            expect(res.statusCode).toBe(500);
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            User.findById.mockResolvedValue({ _id: 'u1' });
            BorrowRecord.countDocuments.mockResolvedValue(0);
            User.findByIdAndDelete.mockResolvedValue();

            const res = await request(app).delete(`${API}/deleteuser/u1`);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('User deleted successfully');
        });


        it('should not delete user with active borrow', async () => {
            User.findById.mockResolvedValue({ _id: 'u1' });
            BorrowRecord.countDocuments.mockResolvedValue(1);
            const res = await request(app).delete(`${API}/deleteuser/u1`);
            expect(res.statusCode).toBe(400);
        });

        it('should handle error', async () => {
            User.findById.mockRejectedValue(new Error('fail'));
            const res = await request(app).delete(`${API}/deleteuser/u1`);
            expect(res.statusCode).toBe(500);
        });

        it('should return 404 if user not found when deleting', async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(app).delete(`${API}/deleteuser/u1`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('User not found');
        });

    });
});

describe('updateUser', () => {
    it('should update user successfully (admin)', async () => {
        const mockUser = {
            _id: 'u1',
            name: 'Old Name',
            email: 'old@example.com',
            phone: '123',
            address: 'abc',
            role: 'student',
            isActive: true
        };

        User.findById.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);

        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                ...mockUser,
                name: 'Updated User',
                email: 'new@example.com'
            })
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ name: 'Updated User', email: 'new@example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('Updated User');
    });


    it('should return 404 if user not found', async () => {
        User.findById.mockResolvedValue(null);
        const res = await request(app).patch(`${API}/updateuser/u1`).send({ name: 'Updated' });
        expect(res.statusCode).toBe(404);
    });

    it('should return error if duplicate email', async () => {
        User.findById.mockResolvedValue({ _id: 'u1', email: 'old@example.com' });
        User.findOne.mockResolvedValue({ _id: 'u2', email: 'new@example.com' });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ email: 'new@example.com' });

        expect(res.statusCode).toBe(400);
    });

    it('should handle error', async () => {
        User.findById.mockImplementation(() => {
            throw new Error('fail');
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ name: 'fail test' });

        expect(res.statusCode).toBe(500);
    });
    it('should update user when email is unchanged', async () => {
        const mockUser = {
            _id: 'u1',
            name: 'Old Name',
            email: 'same@example.com',
            phone: '123',
            address: 'abc',
            role: 'student',
            isActive: true
        };

        User.findById.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);

        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                ...mockUser,
                name: 'Updated User'
            })
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ name: 'Updated User', email: 'same@example.com' }); // 👈 Không đổi email

        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('Updated User');
    });
    it('should update all fields (admin)', async () => {
        const mockUser = {
            _id: 'u1',
            name: 'Old Name',
            email: 'old@example.com',
            phone: '123',
            address: 'abc',
            role: 'student',
            isActive: true
        };

        User.findById.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);

        const updatedUser = {
            ...mockUser,
            name: 'New Name',
            email: 'new@example.com',
            phone: '456',
            address: 'new address',
            role: 'admin',
            isActive: false
        };

        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue(updatedUser)
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({
                name: 'New Name',
                email: 'new@example.com',
                phone: '456',
                address: 'new address',
                role: 'admin',
                isActive: false
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('New Name');
        expect(res.body.user.email).toBe('new@example.com');
        expect(res.body.user.phone).toBe('456');
        expect(res.body.user.address).toBe('new address');
        expect(res.body.user.role).toBe('admin');
        expect(res.body.user.isActive).toBe(false);
    });

    it('should return 403 if non-admin tries to update role or isActive', async () => {
        User.findById.mockResolvedValue({
            _id: 'u1',
            email: 'user@example.com',
            role: 'student',
        });

        const res = await request(customApp)
            .patch('/custom-update/u1')
            .send({ role: 'admin' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Only admin can update role and active status');
    });
    it('should update only name field', async () => {
        const mockUser = {
            _id: 'u1',
            name: 'Old Name',
            email: 'same@example.com'
        };

        User.findById.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);

        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                ...mockUser,
                name: 'Only Name Updated'
            })
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ name: 'Only Name Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.name).toBe('Only Name Updated');
    });
    it('should update only email field', async () => {
        const mockUser = {
            _id: 'u1',
            name: 'User',
            email: 'old@example.com'
        };

        User.findById.mockResolvedValue(mockUser);
        User.findOne.mockResolvedValue(null);

        User.findByIdAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                ...mockUser,
                email: 'updated@example.com'
            })
        });

        const res = await request(app)
            .patch(`${API}/updateuser/u1`)
            .send({ email: 'updated@example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe('updated@example.com');
    });


});
