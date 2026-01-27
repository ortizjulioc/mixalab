import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const providers = await prisma.paymentProviderFee.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ providers });
    } catch (error) {
        console.error('GET /payment-providers Error:', error);
        return NextResponse.json({ error: 'Error fetching payment providers' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { provider, name, percentageFee, fixedFee, internationalPercentageFee, internationalFixedFee, description, active } = body;

        // Validation
        if (!provider || !name || percentageFee === undefined || fixedFee === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (percentageFee < 0 || percentageFee > 100) {
            return NextResponse.json({ error: 'Percentage fee must be between 0 and 100' }, { status: 400 });
        }

        if (fixedFee < 0) {
            return NextResponse.json({ error: 'Fixed fee must be >= 0' }, { status: 400 });
        }

        // Check if provider already exists
        const existingProvider = await prisma.paymentProviderFee.findUnique({
            where: { provider },
        });

        if (existingProvider) {
            return NextResponse.json({ error: 'Provider already exists' }, { status: 409 });
        }

        const newProvider = await prisma.paymentProviderFee.create({
            data: {
                provider,
                name,
                percentageFee: Number(percentageFee),
                fixedFee: Number(fixedFee),
                internationalPercentageFee: internationalPercentageFee !== null && internationalPercentageFee !== undefined
                    ? Number(internationalPercentageFee)
                    : null,
                internationalFixedFee: internationalFixedFee !== null && internationalFixedFee !== undefined
                    ? Number(internationalFixedFee)
                    : null,
                description: description || null,
                active: active !== undefined ? active : true,
            },
        });

        return NextResponse.json(newProvider, { status: 201 });
    } catch (error) {
        console.error('POST /payment-providers Error:', error);
        return NextResponse.json({ error: 'Error creating payment provider' }, { status: 500 });
    }
}
