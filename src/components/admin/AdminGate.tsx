import { Navigate, useLocation } from 'react-router-dom';
import { adminGateRequired, hasAdminToken } from '../../api/adminAuth';

type Props = {
  children: React.ReactNode;
};

export default function AdminGate({ children }: Props) {
  const location = useLocation();

  if (adminGateRequired() && !hasAdminToken()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
