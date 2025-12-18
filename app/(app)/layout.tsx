import { AppClientShell } from "@/components/AppClientShell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppClientShell>{children}</AppClientShell>;
}


