// import type { Metadata } from 'next';
// import 'bootstrap/dist/css/bootstrap.min.css';

// export const metadata: Metadata = {
//   title: 'Messenger & Friends App',
//   description: 'A real-time messaging and friends management application',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Facebook Clone',
  description: 'A social media platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link href="/friends" className="navbar-brand">Facebook Clone</Link>
            <div className="navbar-nav">
              <Link href="/friends" className="nav-link">Friends</Link>
              <Link href="/posts" className="nav-link">Posts</Link>
              <Link href="/testMess" className="nav-link">Messenger</Link>
              <Link href="/login" className="nav-link">Logout</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}