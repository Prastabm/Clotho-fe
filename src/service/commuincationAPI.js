import axios from "axios";

const commUrl = 'https://clotho-monolithic.onrender.com/api/communication';

/**
 * Helper function to get the authorization headers for admin actions.
 * @throws {Error} If the user or ID token is not found.
 */
const getAuthHeaders = () => {
    const storedUser = sessionStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const idToken = parsedUser?.idToken;

    if (!idToken) {
        throw new Error("Authentication Error: No ID Token found in session storage.");
    }

    return {
        'Authorization': `Bearer ${idToken}`
    };
};

/**
 * Sends a message from the contact form. This is a public endpoint.
 * @param {Object} messageData - Contains name, email, and message.
 * @returns {Promise<string>} A promise that resolves to the success message from the server.
 */
export const sendMessage = async (messageData) => {
    try {
        const response = await axios.post(`${commUrl}/send`, messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Fetches all messages for the admin panel.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of all communication objects.
 */
export const getAllMessages = async () => {
    try {
        const response = await axios.get(`${commUrl}/all`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all messages:', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Sends a reply to a specific message (Admin only).
 * @param {number} messageId - The ID of the message to reply to.
 * @param {Object} replyData - Contains the replyMessage string.
 * @returns {Promise<string>} A promise that resolves to the success message from the server.
 */
export const replyToMessage = async (messageId, replyData) => {
    try {
        const response = await axios.post(`${commUrl}/reply/${messageId}`, replyData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error sending reply:', error.response ? error.response.data : error.message);
        throw error;
    }
};
