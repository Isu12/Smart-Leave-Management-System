const axios = require('axios');

const getBaseUrl = () => process.env.AUTH_SERVICE_URL;

exports.assignUserToDepartment = async (userId, departmentId, token) => {
    const baseUrl = getBaseUrl();
    const response = await axios.put(`${baseUrl}/users/${userId}/department`, 
    { departmentId },
    {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

exports.getUsersByDepartment = async (departmentId, token) => {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/users/department/${departmentId}`,
    {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
