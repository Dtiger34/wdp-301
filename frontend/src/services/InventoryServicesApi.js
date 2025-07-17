import api from './api';

export const getAllInventory = async () => {
    try {
        const response = await api.get('/inventory/getallinventoryitems', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}

export const getInventoryItemById = async (id) => {
    try {
        const response = await api.get(`/inventory/getinventoryitembyid/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        throw error;
    }
};
