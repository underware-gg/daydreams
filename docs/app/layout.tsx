import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { Metadata } from "next";
import "nextra-theme-docs/style.css";
import "./globals.css";
import { Inter, Open_Sans } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  description:
    "Daydreams is a powerful framework for building generative agents that can execute tasks across any blockchain or API.",
  metadataBase: new URL("https://dreams.fun"),
  keywords: ["Daydreams", "agents"],
  generator: "Next.js",
  applicationName: "Daydreams",
  appleWebApp: {
    title: "Daydreams",
  },
  title: {
    default: "Daydreams | Generative Agents",
    template: "%s | Daydreams",
  },
  openGraph: {
    url: "./",
    siteName: "Daydreams",
    locale: "en_US",
    type: "website",
  },
  other: {
    "msapplication-TileColor": "#fff",
  },
  twitter: {
    site: "https://dreams.fun",
  },
  alternates: {
    canonical: "./",
  },
};

const banner = (
  <Banner storageKey="some-key">Daydreams 0.1.0 is released 🎉</Banner>
);
const navbar = (
  <Navbar
    logo={<img src="/Daydreams.png" alt="Daydreams Logo" width="150" />}
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Daydreams.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      className={openSans.className}
    >
      <Head
        color={{
          hue: 270, // Purple hue
          saturation: 100,
          lightness: {
            light: 50,
            dark: 50,
          },
        }}
      >
        <link rel="icon" href="/Daydreams.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Daydreams.png" />
        {/* favicon */}
        <link rel="icon" href="/favicon-32x32.png" sizes="any" />
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/daydreamsai/daydreams/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
