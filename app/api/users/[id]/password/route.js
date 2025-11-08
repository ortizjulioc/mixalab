// app/api/users/[id]/password/route.js
import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// 🧠 PATCH: Change password
export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword)
      return NextResponse.json({ error: 'Both password fields are required' }, { status: 400 });

    if (newPassword !== confirmPassword)
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('PATCH /users/[id]/password error:', error);
    return NextResponse.json({ error: 'Error changing password' }, { status: 500 });
  }
}
