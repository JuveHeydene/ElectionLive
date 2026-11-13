"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();



    const isTokenExpired = (): boolean => {
        const token = localStorage.getItem("token");
        const expiry = localStorage.getItem("tokenExpiry");
    
        if (!token || !expiry) {
            return false; //We return false bcs we dont want this to infleunce our logic and it should be there if not parseInt(expiry) triggers a null error
        }
    
        const now = new Date().getTime();
        return now > parseInt(expiry); // Check if the current time exceeds the expiry.
    };


    useEffect(() => {
        const checkToken = () => {
            if (isTokenExpired()) {
                alert("Your session has expired. Please log in again.");
                localStorage.removeItem("token");
                localStorage.removeItem("tokenExpiry");
                localStorage.removeItem('roles')
                router.replace("/Login"); // Redirect to login page.
            }
        };

        // Check token on mount
        checkToken();

        // check periodically ( every minute)
        const interval = setInterval(checkToken, 60000); // Check every 60 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [router]);

    return <>{children}</>;
};

export default AuthWrapper


