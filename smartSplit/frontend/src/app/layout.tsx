import "./globals.css";
import { Wallet } from "../../components/wallet";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Wallet>
          {children}
        </Wallet>
      </body>
    </html>
  );
}