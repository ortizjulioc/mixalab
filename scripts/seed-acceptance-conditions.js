const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const acceptanceConditions = [
    // MIXING Conditions
    {
        serviceType: 'MIXING',
        fieldName: 'stemsReady',
        label: 'I confirm my stems are properly prepared and exported from the same starting point (0:00)',
        description: 'All stems must start at 0:00 for proper alignment',
        order: 1,
        required: true,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'agreeSchedule',
        label: 'I understand and agree to the delivery schedule based on my selected tier',
        description: 'Delivery times vary by tier selection',
        order: 2,
        required: true,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'understandStemLimit',
        label: 'I understand the stem limit for my tier and will provide accordingly',
        description: 'Each tier has a maximum number of stems allowed',
        order: 3,
        required: true,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'stemsConsolidated',
        label: 'I confirm my stems are consolidated and properly labeled',
        description: 'Proper labeling helps ensure accurate mixing',
        order: 4,
        required: true,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'marketingConsent',
        label: 'I consent to my project being used for marketing purposes (optional)',
        description: 'We may showcase your project in our portfolio',
        order: 5,
        required: false,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'understandQuality',
        label: 'I understand the quality of my mix depends on the quality of my recordings',
        description: 'Better source material yields better results',
        order: 6,
        required: true,
        active: true
    },
    {
        serviceType: 'MIXING',
        fieldName: 'declineFixes',
        label: 'I understand that pitch correction and timing fixes are not included unless specified as an add-on',
        description: 'Additional services require add-on selection',
        order: 7,
        required: true,
        active: true
    },

    // MASTERING Conditions
    {
        serviceType: 'MASTERING',
        fieldName: 'mixReady',
        label: 'I confirm my mix is finalized and ready for mastering',
        description: 'No further changes should be needed to the mix',
        order: 1,
        required: true,
        active: true
    },
    {
        serviceType: 'MASTERING',
        fieldName: 'agreeSchedule',
        label: 'I understand and agree to the delivery schedule based on my selected tier',
        description: 'Delivery times vary by tier selection',
        order: 2,
        required: true,
        active: true
    },
    {
        serviceType: 'MASTERING',
        fieldName: 'agreeRoyaltySplit',
        label: 'I agree to the royalty split terms if applicable',
        description: 'Some tiers may include royalty agreements',
        order: 3,
        required: true,
        active: true
    },
    {
        serviceType: 'MASTERING',
        fieldName: 'understandMixQuality',
        label: 'I understand the quality of mastering depends on the quality of the mix provided',
        description: 'Mastering enhances but cannot fix a poor mix',
        order: 4,
        required: true,
        active: true
    },
    {
        serviceType: 'MASTERING',
        fieldName: 'declineImprovements',
        label: 'I understand that mix improvements are not included in mastering',
        description: 'Mastering is the final step, not mixing',
        order: 5,
        required: true,
        active: true
    },

    // RECORDING Conditions
    {
        serviceType: 'RECORDING',
        fieldName: 'studioReady',
        label: 'I confirm I am prepared for my recording session',
        description: 'Come prepared with rehearsed material',
        order: 1,
        required: true,
        active: true
    },
    {
        serviceType: 'RECORDING',
        fieldName: 'agreeSchedule',
        label: 'I understand and agree to the session schedule',
        description: 'Recording sessions must be scheduled in advance',
        order: 2,
        required: true,
        active: true
    },
    {
        serviceType: 'RECORDING',
        fieldName: 'equipmentAwareness',
        label: 'I understand the studio equipment and setup for my session',
        description: 'Different tiers offer different equipment',
        order: 3,
        required: true,
        active: true
    }
];

async function main() {
    console.log('🌱 Seeding acceptance conditions...');

    for (const condition of acceptanceConditions) {
        await prisma.acceptanceCondition.upsert({
            where: {
                serviceType_fieldName: {
                    serviceType: condition.serviceType,
                    fieldName: condition.fieldName
                }
            },
            update: condition,
            create: condition
        });
        console.log(`✅ Created/Updated: ${condition.serviceType} - ${condition.fieldName}`);
    }

    console.log('✨ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
