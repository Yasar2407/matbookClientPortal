import React from 'react'
import {useSelector} from "react-redux"
import {Navigate, useLocation} from "react-router-dom"

const ProtectedRoute = ({children}) => {
    const { user } = useSelector((state) => state.auth);
    let location = useLocation();

    if(!user?.token) {
        return <Navigate to="/login" state={{ from: location}} replace />
    }
    
 return children

};

export default ProtectedRoute;