import "nextra-theme-docs/style.css";
import "temporal-polyfill/global";

import { Banner, Head } from "nextra/components";
/* eslint-env node */
import { Footer, Layout, Navbar } from "nextra-theme-docs";

import { Analytics } from "@vercel/analytics/next";
import { GlobalStylings } from "./GlobalStylings";
import { getPageMap } from "nextra/page-map";

export const metadata = {
  metadataBase: new URL("https://codablejson.com"),
  title: {
    template: "%s - CodableJSON",
  },
  description: "CodableJSON: JSON serialization for complex types",
  applicationName: "CodableJSON",
  generator: "Next.js",
  appleWebApp: {
    title: "CodableJSON",
  },
  // other: {
  //   "msapplication-TileImage": "/ms-icon-144x144.png",
  //   "msapplication-TileColor": "#fff",
  // },
  twitter: {
    site: "https://codablejson.com",
    card: "summary_large_image",
  },
  openGraph: {
    type: "website",
    url: "https://codablejson.com",
    title: "CodableJSON",
    description: "CodableJSON: JSON serialization for complex types",
    images: [
      {
        url: "https://codablejson.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CodableJSON",
      },
    ],
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>CodableJSON</b>
        </div>
      }
      projectLink="https://github.com/pie6k/codablejson"
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          // banner={<Banner storageKey="Nextra 2">Nextra 2 Alpha</Banner>}
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © CodableJSON.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/pie6k/codablejson/blob/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          <GlobalStylings />
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
