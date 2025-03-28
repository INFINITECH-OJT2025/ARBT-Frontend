import Sidebar from '@/components/sidebar';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="">
      <Sidebar />
      <div className="">
        <main>{children}</main>
      </div>
    </div>
  );
}