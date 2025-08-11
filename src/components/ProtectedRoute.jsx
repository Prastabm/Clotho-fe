import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, role, ...rest }) => {
    const user = JSON.parse(sessionStorage.getItem('user'));

    // If the user is not logged in, redirect them to the login page.
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Get the user's role from the session and normalize it.
    // This changes "ROLE_ADMIN" to "admin" to match the logic in your Login component.
    const userRole = user.role.replace('ROLE_', '').toLowerCase();

    // Normalize the expected role from the component's props (e.g., "Admin" -> "admin").
    const expectedRole = role.toLowerCase();

    // If the user's role does not match the required role for the route,
    // redirect them to the login page.
    if (userRole !== expectedRole) {
        return <Navigate to="/" replace />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;