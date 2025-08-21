import authService from "../services/authService";


const getAuthHeaders = async () => {
    const token = await authService.getJWT();
    return { Authorization: `Bearer ${token}` };
};

export default getAuthHeaders;