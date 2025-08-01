// sections

import { JwtForgotPasswordView } from "src/sections/auth/jwt";

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Jwt: Forgot Password',
};

export default function ForgotPasswordPage() {
  return <JwtForgotPasswordView />;
}
