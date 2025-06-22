import React, { useState } from 'react';

const BorrowModal = ({ open, onClose, onConfirm, maxQuantity }) => {
    const [quantity, setQuantity] = useState(1);
    const [isReadOnSite, setIsReadOnSite] = useState(false);
    const [returnDate, setReturnDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!returnDate) {
            return setError('Vui lòng chọn ngày trả.');
        }
        if (quantity < 1 || quantity > maxQuantity) {
            return setError(`Số lượng mượn phải từ 1 đến ${maxQuantity}`);
        }

        onConfirm({ quantity, isReadOnSite, returnDate });
        setError('');
    };

    if (!open) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>Thông tin mượn sách</h3>

                <label>Số lượng:</label>
                <input type="number" value={quantity} min={1} max={maxQuantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    style={styles.input}
                />

                <label>Hình thức mượn:</label>
                <div>
                    <label>
                        <input
                            type="radio"
                            value={false}
                            checked={!isReadOnSite}
                            onChange={() => setIsReadOnSite(false)}
                        /> Mang về
                    </label>
                    {' '}
                    <label>
                        <input
                            type="radio"
                            value={true}
                            checked={isReadOnSite}
                            onChange={() => setIsReadOnSite(true)}
                        /> Đọc tại chỗ
                    </label>
                </div>

                <label>Ngày trả:</label>
                <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    style={styles.input}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{ marginTop: '16px' }}>
                    <button onClick={handleSubmit} style={styles.button}>Xác nhận</button>
                    <button onClick={onClose} style={{ ...styles.button, backgroundColor: '#ccc' }}>Hủy</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    modal: {
        backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px'
    },
    input: {
        width: '100%', padding: '8px', marginTop: '4px', marginBottom: '10px'
    },
    button: {
        padding: '10px 16px', marginRight: '10px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px'
    }
};

export default BorrowModal;
