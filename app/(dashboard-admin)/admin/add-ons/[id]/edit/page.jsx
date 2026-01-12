'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import AddOnForm from '../../_components/AddOnForm';
import useAddOns from '@/hooks/useAddOns';

export default function EditAddOnPage() {
    const params = useParams();
    const { addOn, getAddOnById } = useAddOns();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAddOn = async () => {
            setLoading(true);
            await getAddOnById(params.id);
            setLoading(false);
        };

        if (params.id) {
            loadAddOn();
        }
    }, [params.id, getAddOnById]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!addOn) {
        return notFound();
    }

    return <AddOnForm initialData={addOn} isEditing={true} />;
}
