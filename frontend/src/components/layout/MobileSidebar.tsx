'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserSidebar } from './UserSidebar';
import { AdminSidebar } from './AdminSidebar';
import { ReactNode, useState } from 'react';

interface MobileSidebarProps {
  variant: 'user' | 'admin';
  trigger: ReactNode;
}

export function MobileSidebar({ variant, trigger }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        {variant === 'user' ? (
          <UserSidebar />
        ) : (
          <AdminSidebar />
        )}
      </SheetContent>
    </Sheet>
  );
}
