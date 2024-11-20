"use client";

import React, { useState } from 'react'
import Logo, { LogoMobile } from '@/components/Logo'
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ModeToggle } from './ThemeSwitcherBtn';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { VisuallyHidden } from '@nextui-org/react';
// import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';


function Navbar() {
  return <>
    <DesktopNavbar />
    <MobileNavbar />
  </>;
}

const items = [
  {label : "Dashboard" , link: "/"},
  {label : "Transactions" , link: "/transactions"},
  {label : "Manage" , link: "/manage"},
  {label : "Family" , link: "/family"},
]

function MobileNavbar(){
  const [isOpen, setIsOpen] = useState(false);

   return (
    <div className="block border-separate bg-background  px-8 md:hidden">
      <nav className="container flex items-center justify-between">
        <Sheet open={isOpen} onOpenChange={setIsOpen}> 
          <SheetTrigger asChild>
            <Button  variant={"ghost"} size={"icon"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className='w-[400px] sm:w-[540px]' side={"left"}>
            <VisuallyHidden>
              <SheetTitle>Navigation</SheetTitle>
            </VisuallyHidden>
            <Logo />
            <div className="flex flex-col gap-1 pt-4">
              {items.map(item => (
                <NavbarItem 
                  key={item.label}
                  link={item.link}
                  label={item.label}
                  clickCallback={() => setIsOpen((prev) => !prev)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <LogoMobile />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        
        </div>
      </nav>
    </div>
   )
}

function DesktopNavbar() {
  return (
    <div className="hidden border-separate border-b bg-background px-8 justify-between md:block">
      <nav className="relative flex items-center justify-between">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-5">
          <Logo />
          <div className="flex h-full">
            {items.map((item) => (
              <NavbarItem 
                key={item.label}
                link={item.link}
                label={item.label}
              />
            ))}
          </div>
        </div>
        {/* This div represents the elements to the right (nav ends here) */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        </div>
      </nav>
    </div>
  
  );
}

function NavbarItem({label, link, clickCallback}: {label: string, link: string, clickCallback?: () => void}) {
  const pathName = usePathname();
  const isActive = pathName === link;

  return (
    <div className={'relative flex items-center'}>
      <Link
       href={link} 
       className={cn(
        buttonVariants({ variant: "ghost"}),
        "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
        isActive && "text-foreground"
       )}
        onClick = {() => {if(clickCallback) clickCallback();}}
      >
       {label}
      </Link>
      {
        isActive && (
          <div className="absolute bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"></div>
        )
      }
    </div>
  );
}

export default Navbar;


