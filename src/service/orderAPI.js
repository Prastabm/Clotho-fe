import axios from "axios";

const orderUrl = 'https://clotho-monolithic.onrender.com/api/orders';

/**
 * Helper function to get the authorization headers.
 * It retrieves the user's ID token from session storage.
 * @throws {Error} If the user or ID token is not found.
 */
const getAuthHeaders = () => {
    const storedUser = sessionStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const idToken = parsedUser?.idToken;

    if (!idToken) {
        // This prevents API calls from being made without authentication
        throw new Error("Authentication Error: No ID Token found in session storage.");
    }

    return {
        'Authorization': `Bearer ${idToken}`
    };
};

/**
 * Fetches all orders from the database (Admin only).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of all order objects.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${orderUrl}/all`, {
            headers: getAuthHeaders()
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error.response ? error.response.data : error.message);
        throw error; // Re-throw to be handled by the calling component
    }
};

/**
 * Fetches all orders for the currently logged-in user.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of the user's order objects.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getMyOrders = async () => {
    try {
        const response = await axios.get(`${orderUrl}/me`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error.response ? error.response.data : error.message);
        throw error;
    }
};


/**
 * Calculates the total number of orders from a given array.
 * This is a synchronous utility function.
 * @param {Array<Object>} orders - An array of order objects.
 * @returns {number} The total count of orders.
 */
export const getTotalOrders = (orders) => {
    if (!Array.isArray(orders)) {
        return 0;
    }
    return orders.length;
};

/**
 * Calculates the total sales revenue from a given array of orders.
 * This is a synchronous utility function.
 * @param {Array<Object>} orders - An array of order objects.
 * @returns {number} The total sales amount.
 */
export const getTotalSales = (orders) => {
    if (!Array.isArray(orders)) {
        return 0;
    }

    return orders.reduce((totalSales, order) => {
        const orderTotal = order.orderLineItems.reduce((currentOrderTotal, item) => {
            return currentOrderTotal + (item.price * item.quantity);
        }, 0);
        return totalSales + orderTotal;
    }, 0);
};

export const getCategorySalesData = (orders) => {
    if (!Array.isArray(orders)) return [];

    const categorySales = orders.flatMap(order => order.orderLineItems)
        .reduce((acc, item) => {
            const category = item.category.split('-')[0] || 'UNCATEGORIZED';
            const saleAmount = item.price * item.quantity;
            acc[category] = (acc[category] || 0) + saleAmount;
            return acc;
        }, {});

    return Object.entries(categorySales).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
    }));
};

export const getMonthlySalesData = (orders) => {
    if (!Array.isArray(orders)) return [];

    const monthlySales = orders.reduce((acc, order) => {
        const month = new Date(order.orderDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        const orderTotal = order.orderLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        acc[month] = (acc[month] || 0) + orderTotal;
        return acc;
    }, {});

    // To ensure chronological order, we need to sort the months
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
        const dateA = new Date(`01 ${a.replace(" '", " 20")}`);
        const dateB = new Date(`01 ${b.replace(" '", " 20")}`);
        return dateA - dateB;
    });

    return sortedMonths.map(month => ({
        name: month,
        total: parseFloat(monthlySales[month].toFixed(2)),
    }));
};

export const getCountrySalesData = (orders) => {
    if (!Array.isArray(orders)) return [];

    const countrySales = orders.reduce((acc, order) => {
        // Simple parsing, assumes country is the last element after splitting by comma
        const addressParts = order.address.split(', ');
        const country = addressParts[addressParts.length - 1] || 'Unknown';
        const orderTotal = order.orderLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        acc[country] = (acc[country] || 0) + orderTotal;
        return acc;
    }, {});

    return Object.entries(countrySales).map(([name, total]) => ({
        name,
        total: parseFloat(total.toFixed(2)),
    }));
};