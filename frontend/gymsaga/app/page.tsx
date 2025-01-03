"use client"

import Image from "next/image";
import Navbar from "@/components/navbar";
import { ModeToggle } from "@/components/modetoggle";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <head>
        <title>GymSaga - Home</title>
        <meta name="description" content="GymSaga Home" />
      </head>
      <div className="w-full h-full items-center flex flex-col bg-background p-8 scrollbar-hide">
        <header className="fixed top-0 z-50 flex items-center justify-between w-full h-16 bg-transparent backdrop-blur-md shadow-md border-solid border-b">
          <div className="flex items-center ml-4 flex-1 justify-start">
            <Link href="/" className="inline-flex">
              <Image
                src={resolvedTheme === "light" ? "/GymSagaDark.svg" : "/GymSagaLight.svg"}
                width={50}
                height={50}
                alt="GymSaga Logo"
              />
            </Link>
            <Link href="/" className="inline-flex m-4">
              <h2 className="text-xl font-extrabold tracking-tight">GymSaga</h2>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <Navbar />
          </div>
          <div className="flex items-center mr-4 flex-1 justify-end">
          <Link href="/settings">
            <Button variant="outline" size="icon" className="mr-4">
                <Settings className="h-[1.2rem] w-[1.2rem}" />
            </Button>
          </Link>
            <ModeToggle />
          </div>
        </header>
        <div className="mt-16">
          <h1 className="text-9xl font-bold text-center text-primary">
            Welcome to GymSaga Welcome to GymSaga Welcome to GymSaga Welcome to GymSaga Welcome to GymSaga Welcome to GymSaga
          </h1>
        </div>
      </div>
    </>
  );
}