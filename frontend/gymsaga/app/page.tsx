'use client';

import Image from "next/image";
import { LoginForm } from "../components/ui/LoginForm";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleRedirect = () => {
    // Redirect to the findGym page (assuming it's /findGym)
    router.push("/findGym");
  };

  return (
    <div className="w-screen h-screen items-center flex flex-col bg-background p-8">
      <Image
      className="mb-10"
        src="/GymSaga.svg"
        width={200}
        height={200}
        alt="GymSaga Logo"/>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">Welcome to GymSaga</h1>
      <LoginForm />

      <button
        onClick={handleRedirect}
        className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-md"
      >
        Go to Find Gym
      </button>
    </div>
  );
}