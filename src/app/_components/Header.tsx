"use client";

import React from "react";
import { Avatar, Button } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const userImage = session?.user?.image;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <header className="flex h-[80px] w-full items-center justify-between border-2 bg-white px-6 shadow-md">
      <Link href="/" className="flex items-center gap-4">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPIyb4xQGybcBzNZSwvengwCW41q7tPSnpPQ&s"
          alt="Logo"
          className="h-10 w-10"
        />
        <h1 className="text-2xl font-semibold text-gray-800">Batele-todo</h1>
      </Link>

      <nav className="hidden gap-6 font-medium text-gray-600 md:flex">
        <a href="#" className="hover:text-blue-600">
          Главная
        </a>
        <a href="#" className="hover:text-blue-600">
          О нас
        </a>
        <a href="#" className="hover:text-blue-600">
          Контакты
        </a>
      </nav>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Avatar
              src={userImage ?? undefined}
              radius="xl"
              size="md"
              className="cursor-pointer"
            />
            <Button variant="light" onClick={handleSignOut}>
              Выйти
            </Button>
          </>
        ) : (
          <Button variant="light" onClick={() => signIn("github")}>
            Войти
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
