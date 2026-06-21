import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";

export const metadata: Metadata = {
  title: "ThePeakSMM | Premium SMM Panel for Instant Growth",
  description: "Boost your social media presence with ThePeakSMM. High quality followers, likes, and views for Instagram, TikTok, YouTube and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('peaksender_theme');
                  if (savedTheme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0 }}>
        {children}
        <ToastContainer />
        <a 
          href="https://wa.me/1234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#25d366',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontSize: '30px',
            color: 'white',
            textDecoration: 'none'
          }}
          title="Chat on WhatsApp"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" style={{ width: '35px' }} />
        </a>
      </body>
    </html>
  );
}
