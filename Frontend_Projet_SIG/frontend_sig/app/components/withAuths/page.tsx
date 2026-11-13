"use client"
// components/withAuth.tsx
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ComponentType } from 'react';

interface WithAuthProps {
  requiredRoles: string[];
}

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>, requiredRoles: string[]) => {
    
  const WithAuthComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const isTokenValid = (): boolean => {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("tokenExpiry");
  
      if (!token || !expiry) {
          return false; 
      }
  
      const now = new Date().getTime();
      return now > parseInt(expiry); // Check if the current time exceeds the expiry.
  };


    useEffect(() => {
      // Check if the user has the correct roles
      const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const token = localStorage.getItem('token');

      if (token && requiredRoles.some(role => storedRoles.includes(role))) {
        setIsAuthorized(true);
      } else {
        // Redirect if the user does not have permission
        router.replace('/Login');
      }
    }, [router]);

    if (!isAuthorized) {
      return null; // or return a loading spinner while checking auth
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
