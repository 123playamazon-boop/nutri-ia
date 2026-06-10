import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Nutri IA — Sua dieta personalizada com IA",
  description: "Plano alimentar personalizado, diário nutricional e nutricionista IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2060375741236309');fbq('track','PageView');`}
        </Script>
        <Script id="utmify-utms" strategy="afterInteractive">
          {`(function(){var u=document.createElement("script");u.setAttribute("src","https://cdn.utmify.com.br/scripts/utms/latest.js");u.setAttribute("data-utmify-prevent-xcod-sck","");u.setAttribute("data-utmify-prevent-subids","");u.async=true;u.defer=true;document.head.appendChild(u);})();`}
        </Script>
        <Script id="utmify-pixel" strategy="afterInteractive">
          {`window.pixelId="6a28b28f84fac4cd8ad90547";(function(){var a=document.createElement("script");a.setAttribute("async","");a.setAttribute("defer","");a.setAttribute("src","https://cdn.utmify.com.br/scripts/pixel/pixel.js");document.head.appendChild(a);})();`}
        </Script>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  );
}
