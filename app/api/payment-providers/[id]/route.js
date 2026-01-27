import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const provider = await prisma.paymentProviderFee.findUnique({ where: { id } });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        return NextResponse.json(provider);
    } catch (error) {
        console.error('GET /payment-providers/[id] Error:', error);
        return NextResponse.json({ error: 'Error fetching payment provider' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { name, percentageFee, fixedFee, internationalPercentageFee, internationalFixedFee, description, active } = body;

        // Validation
        if (!name || percentageFee === undefined || fixedFee === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (percentageFee < 0 || percentageFee > 100) {
            return NextResponse.json({ error: 'Percentage fee must be between 0 and 100' }, { status: 400 });
        }

        if (fixedFee < 0) {
            return NextResponse.json({ error: 'Fixed fee must be >= 0' }, { status: 400 });
        }

        const provider = await prisma.paymentProviderFee.update({
            where: { id },
            data: {
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

        return NextResponse.json(provider);
    } catch (error) {
        console.error('PUT /payment-providers/[id] Error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error updating payment provider' }, { status: 500 });
    }
}
