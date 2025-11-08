// app/api/users/[id]/route.js
import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

// 🧠 PUT: Update user info
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, email, role, status } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role, status },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /users error:', error);
    if (error.code === 'P2025')
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

// 🧠 DELETE: Remove user
export async function DELETE(request, { params }) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE /users error:', error);
    if (error.code === 'P2025')
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
