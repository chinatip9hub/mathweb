import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const contactEmail = process.env.CONTACT_EMAIL?.trim() ?? "";

  return <ForgotPasswordForm contactEmail={contactEmail} />;
}
