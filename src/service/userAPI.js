import axios from "axios";

// The base URL for the new authentication service
const authUrl = 'https://clotho-monolithic.onrender.com/auth';
const userUrl = 'https://clotho-monolithic.onrender.com/api/users'; // Kept for other functions if needed

export const login = async (email, password) => {
    try {
        // Step 1: Hit the /login endpoint to get the idToken
        const loginResponse = await axios.post(`${authUrl}/login`, {
            email: email,
            password: password
        });

        const { idToken } = loginResponse.data;

        if (!idToken) {
            throw new Error("Login failed, no ID Token received.");
        }

        // Step 2: Use the idToken to get user details from the /me endpoint
        const userDetailsResponse = await axios.get(`${authUrl}/me`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });

        const combinedData = {
            ...userDetailsResponse.data,
            idToken
        };

        return {
            status: 200,
            data: combinedData
        };

    } catch (error) {
        console.log('Error during login process:', error.message);
        throw error;
    }
};

// --- Other existing functions can remain below ---

export const addUser = async (user) => {
    try {
        const response = await axios.post(`${authUrl}/signup`, {
            email: user.email,
            password: user.password
        });

        if (response.data.error) {
            throw new Error(response.data.error);
        }

        // Return the response in a format consistent with the rest of the application
        return {
            status: 200,
            data: {
                email: response.data.email,
                id: response.data.localId,
                idToken: response.data.idToken,
                refreshToken: response.data.refreshToken
            }
        };
    } catch (error) {
        // Handle axios errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(error.response.data.error || 'Registration failed');
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error during registration: ' + error.message);
        }
    }
};

export const getTotalUsers = async () => {
    try {
        const storedUser = sessionStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        const idToken = parsedUser?.idToken;

        if (!idToken) {
            throw new Error("No ID Token found in session storage.");
        }
        const response = await axios.get(`${authUrl}/user-count`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log(response);
        return response.data.userCount;
    } catch (error) {
        console.log('Error while calling getUsers api', error.message);
    }
};

// export const editUser = async (id, user) => {
//     try {
//         return await axios.put(`${userUrl}/${id}`, user, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//     } catch (error) {
//         console.log("Error while calling update api", error.message);
//         throw error;
//     }
// };
//
// export const getUsers = async () => {
//     try {
//         return await axios.get(`${userUrl}/users`);
//     } catch (error) {
//         console.log('Error while calling getUsers api', error.message);
//     }
// };
//
// export const getUserByEmail = async (email) => {
//     try{
//         const response = await axios.get(`${userUrl}/email/${email}`);
//         return response.data;
//     }catch(error){
//         console.log('error while finding user',error.message);
//         throw error;
//     }
// }
//
// export const getUser = async (id) => {
//     id = id || '';
//     try {
//         return await axios.get(`${userUrl}/${id}`);
//     } catch (error) {
//         console.log('Error while calling getUsers api', error.message);
//     }
// };
