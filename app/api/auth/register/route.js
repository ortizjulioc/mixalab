import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request) {

    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
  try {
    const data = await request.json();

    if (!isEmailValid(data.email)) {
      return NextResponse.json({ message: "Correo electrónico no válido" }, { status: 400 });
    }

    const userFound = await prisma.user.findUnique({
      where: { email: data.email }
    });
  
    if (userFound) {
      return NextResponse.json({ message: "Correo ya registrado" }, { status: 409 });
    }
  
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  
    const { password, ...userWithoutPassword } = newUser;
  
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
