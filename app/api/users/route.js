// app/api/users/route.js
import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// 🧠 GET: List users (with pagination and search)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
      where.deleted = false;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          deleted: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /users error:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// 🧠 POST: Create new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: role || 'ARTIST',
        status: status || 'UNVERIFIED',
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /users error:', error);
    if (error.code === 'P2002')
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
