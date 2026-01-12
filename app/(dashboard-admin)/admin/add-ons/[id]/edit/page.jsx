import prisma from '@/utils/lib/prisma';
import AddOnForm from '../_components/AddOnForm';
import { notFound } from 'next/navigation';

export default async function EditAddOnPage({ params }) {
    const addOn = await prisma.serviceAddOn.findUnique({
        where: { id: params.id }
    });

    if (!addOn) {
        return notFound();
    }

    return <AddOnForm initialData={addOn} isEditing={true} />;
}
