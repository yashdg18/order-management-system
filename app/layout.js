import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Order Management System — Multi-Store Order Management",
  description: "Real-time order management across every store you run.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
