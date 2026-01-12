'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import AcceptanceConditionForm from '../../_components/AcceptanceConditionForm';
import useAcceptanceConditions from '@/hooks/useAcceptanceConditions';

export default function EditAcceptanceConditionPage() {
    const params = useParams();
    const { condition, getConditionById } = useAcceptanceConditions();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCondition = async () => {
            setLoading(true);
            await getConditionById(params.id);
            setLoading(false);
        };

        if (params.id) {
            loadCondition();
        }
    }, [params.id, getConditionById]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!condition) {
        return notFound();
    }

    return <AcceptanceConditionForm initialData={condition} isEditing={true} />;
}
