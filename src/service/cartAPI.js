// cartApi.js
import axios from "axios";

const cartUrl = 'http://localhost:8080/api/cart'; // Update to match your CartController's base URL

// Helper to get auth headers
const getAuthHeaders = () => {
    const storedUser = sessionStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const idToken = parsedUser?.idToken;

    if (!idToken) {
        throw new Error("No ID Token found in session storage.");
    }

    return {
        'Authorization': `Bearer ${idToken}`
    };
};

// Add a product to the cart
export const addToCart = async (skuCode,category, quantity, price) => {
    try {
        const response = await axios.post(cartUrl, {
            skuCode,
            category,
            quantity,
            price
        }, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        throw error;
    }
};

// Get all cart items for the current user
export const getCartItems = async () => {
    try {
        const response = await axios.get(cartUrl, {
            headers: getAuthHeaders()
        });
        return response.data; // Array of CartItem objects
    } catch (error) {
        console.error('Error fetching cart items:', error.message);
        throw error;
    }
};

// Clear all cart items for the current user
export const clearCart = async () => {
    try {
        const response = await axios.delete(cartUrl, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error.message);
        throw error;
    }
};

// Optional: Remove a single item from cart (only if backend supports it)
export const removeCartItem = async (itemId) => {
    try {
        const response = await axios.delete(`${cartUrl}/${itemId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error removing cart item:', error.message);
        throw error;
    }
};

// Optional: Update quantity of a cart item (only if backend supports it)
export const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await axios.put(`${cartUrl}/${itemId}`, { quantity }, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error.message);
        throw error;
    }
};
