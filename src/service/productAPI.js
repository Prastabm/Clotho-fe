import axios from "axios";

const productUrl='https://clotho-monolithic.onrender.com/products';

export const getTotalProducts = async () => {
    try {
        // Retrieve and parse the stored user session
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }

        // Send the Authorization header with the idToken
        const response = await axios.get(`${productUrl}`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log(response);
        return response.data.length;
    } catch (error) {
        console.log('Error while calling getTotalProducts API:', error.message);
        throw error;
    }
};

export const getAllProducts = async () => {
    try {
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }

        // Send the Authorization header with the idToken
        const response = await axios.get(`${productUrl}`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.error('Error fetching all products:', error.message);
        // Handle errors appropriately (e.g., display error message to user)
        throw error; // Re-throw for potential error handling in caller
    }
};
export const getAllListedProducts = async () => {
    try {
        const response = await axios.get(`${productUrl}/listed`);
        return response.data;
    } catch (error) {
        console.error('Error fetching listed products:', error.message);
        throw error;  // Re-throw for potential error handling in caller
    }
};
export const getProductById = async (id) => {
    try {
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }

        const response = await axios.get(`${productUrl}/${id}`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        throw error;
    }
};

export const getProductBySkuCode = async (skuCode) => {
    try {
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }
        const response = await axios.get(`${productUrl}/sku/${skuCode}`,{
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching product by SKU code:', error.message);
    }
}

export const getproductByListedby = async (listby) => {
    try{
        const response = await axios.get(`${productUrl}/listby/${listby}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching product by lister name:', error.message);
        throw error;
    }
}

export const getTotalListByProducts = async (listby) =>{
    try{
        const response = await axios.get(`${productUrl}/listby/${listby}`);
        return response.data.length;
    }
    catch (error) {
        console.error('Error fetching product by lister name:', error.message);
        throw error;
    }
}


export const createProduct = async (formData) => {
    try {
        const response = await axios.post(`${productUrl}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error.message);
        throw error;
    }
}

// If discount calculation is handled on the server (assuming an endpoint):
export const calculateDiscount = async (data) => {
    try {
        const response = await axios.post(`${productUrl}/calcDiscount`, data);
        return response.data; // Assuming endpoint returns the calculated discount
    } catch (error) {
        console.error('Error calculating discount:', error.message);
        throw error;
    }
};
export const updateProduct = async (id, product, file = null) => {
    try {
        // Get authentication token
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }

        // Create FormData object
        const formData = new FormData();
        
        // Append product data as JSON string under the key 'product'
        formData.append('product', new Blob([JSON.stringify(product)], {
            type: 'application/json'
        }));
        
        // If file is provided, append it to formData
        if (file && file.size > 0) {
            formData.append('file', file);
        }

        const response = await axios.put(`${productUrl}/${id}`, formData, {
            headers: {
                'Authorization': `Bearer ${idToken}`,
                // Let the browser set the Content-Type with boundary for multipart/form-data
                // Remove explicit Content-Type to let browser handle it
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error.message);
        throw error;
    }
};

export const unlistProduct = async (id) =>{
    try{
        return await axios.put(`${productUrl}/unlist/${id}`);
    }catch (error) {
        console.error('Error updating product:', error.message);
        throw error;
    }
};

export const enlistProduct = async (id) =>{
    try{
        return await axios.put(`${productUrl}/enlist/${id}`);
    }catch (error) {
        console.error('Error updating product:', error.message);
        throw error;
    }
}

export const deleteProduct = async (id) => {
    try {
        await axios.delete(`${productUrl}/${id}`); // No data to return on success
    } catch (error) {
        console.error('Error deleting product:', error.message);
        throw error;
    }
};