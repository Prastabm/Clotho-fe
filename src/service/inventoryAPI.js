import axios from "axios";

const inventoryUrl = 'https://clotho-monolithic.onrender.com/inventory';

// Helper function to get auth token
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

// Create or update inventory
export const createInventory = async (inventory) => {
    try {
        const response = await axios.post(inventoryUrl, inventory, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating inventory:', error.message);
        throw error;
    }
};
export const updateInventory = async (id, inventory) => {
    try {
        const response = await axios.put(`${inventoryUrl}/${id}`, inventory, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating inventory:', error.message);
        throw error;
    }
};


// Get inventory by SKU code
export const getInventoryBySkuCode = async (skuCode) => {
    try {
        const response = await axios.get(`${inventoryUrl}/sku/${skuCode}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory by SKU:', error.message);
        throw error;
    }
};

// Delete inventory
export const deleteInventory = async (id) => {
    try {
        await axios.delete(`${inventoryUrl}/${id}`, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Error deleting inventory:', error.message);
        throw error;
    }
};

// Calculate total inventory value for all products
export const calculateTotalInventoryValue = async () => {
    try {
        // First get all products
        const products = await axios.get('https://clotho-monolithic.onrender.com/products', {
            headers: getAuthHeaders()
        });

        // Then get inventory for each product and calculate total value
        const inventoryPromises = products.data.map(async (product) => {
            try {
                const inventory = await getInventoryBySkuCode(product.skuCode);
                return inventory ? (inventory.quantity * product.price) : 0;
            } catch (error) {
                console.warn(`Could not fetch inventory for SKU ${product.skuCode}:`, error.message);
                return 0;
            }
        });

        const inventoryValues = await Promise.all(inventoryPromises);
        const totalValue = inventoryValues.reduce((sum, value) => sum + value, 0);

        return {
            totalValue,
            currency: 'INR' // Assuming Indian Rupees based on your previous code
        };
    } catch (error) {
        console.error('Error calculating total inventory value:', error.message);
        throw error;
    }
};

export const getTotalInventoryItems = async () => {
    try {
        const inventoryLevels = await getAllInventoryLevels();
        const totalItems = inventoryLevels.reduce((sum, item) => sum + item.quantity, 0);
        console.log("Total items:",totalItems);
        return totalItems;
    } catch (error) {
        console.error('Error getting total inventory count:', error);
        throw error;
    }
};
// Get all inventory levels (useful for dashboard)
export const getAllInventoryLevels = async () => {
    try {
        const products = await axios.get('https://clotho-monolithic.onrender.com/products', {
            headers: getAuthHeaders()
        });

        const inventoryPromises = products.data.map(async (product) => {
            try {
                const inventory = await getInventoryBySkuCode(product.skuCode);
                return {

                        id: inventory?.id ?? null,
                        productName: product.name,
                        skuCode: product.skuCode,
                        quantity: inventory ? inventory.quantity : 0,
                        value: inventory ? (inventory.quantity * product.price) : 0

                };
            } catch (error) {
                console.warn(`Could not fetch inventory for SKU ${product.skuCode}:`, error.message);
                return {
                    productName: product.name,
                    skuCode: product.skuCode,
                    quantity: 0,
                    value: 0
                };
            }
        });

        return await Promise.all(inventoryPromises);
    } catch (error) {
        console.error('Error fetching all inventory levels:', error.message);
        throw error;
    }
};