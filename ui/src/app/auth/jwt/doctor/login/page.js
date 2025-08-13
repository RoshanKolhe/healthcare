// sections

import { JwtDoctorLoginView } from "src/sections/auth/jwt";

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Jwt: Login',
};

export default function DoctorLoginPage() {
  return <JwtDoctorLoginView />;
}
