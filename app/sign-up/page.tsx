import { redirect } from "next/navigation";

export default function SignUpPage() {
  const destination = "https://patient-chicken-5893.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F";
  redirect(destination);
}
