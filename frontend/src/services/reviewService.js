import axios from 'axios';
import { getToken } from '../utils/auth';

const API = '/api/review';

export const checkCanReview = async (bookId) => {
    const token = getToken();
    const res = await axios.get(`${API}/can-review/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.canReview;
};

export const submitReview = async (reviewData) => {
    const token = getToken();
    const res = await axios.post(API, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getReviewsByBook = async (bookId) => {
    const res = await axios.get(`${API}/${bookId}`);
    return res.data;
};
