/*
  Warnings:

  - Added the required column `user_id` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `access_token` TEXT NULL,
    MODIFY `refresh_token` TEXT NULL;

-- AlterTable
ALTER TABLE `files` ADD COLUMN `message_id` VARCHAR(191) NULL,
    ADD COLUMN `serviceRequestId` VARCHAR(191) NULL,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `service_add_ons` (
    `id` VARCHAR(191) NOT NULL,
    `service_type` ENUM('mixing', 'mastering', 'recording') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `price_per_unit` DOUBLE NULL,
    `is_quantity_based` BOOLEAN NOT NULL DEFAULT false,
    `is_multi_select` BOOLEAN NOT NULL DEFAULT false,
    `options` JSON NULL,
    `icon` VARCHAR(191) NULL,
    `badge` VARCHAR(191) NULL,
    `tier_restriction` JSON NULL,
    `adds_days` INTEGER NULL,
    `commission_percentage` DOUBLE NOT NULL DEFAULT 10,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_add_ons_service_type_name_key`(`service_type`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `artistName` VARCHAR(191) NOT NULL,
    `projectType` ENUM('single', 'ep', 'album') NOT NULL,
    `tier` ENUM('bronze', 'silver', 'gold', 'platinum') NOT NULL,
    `genre` VARCHAR(191) NULL,
    `bpm` INTEGER NULL,
    `references` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_services` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `type` ENUM('mixing', 'mastering', 'production') NOT NULL,
    `creator_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_files` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `fileType` ENUM('demo', 'stems') NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creators_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `brand_name` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `portfolio` VARCHAR(191) NULL,
    `socials` JSON NULL,
    `years_of_experience` INTEGER NOT NULL,
    `main_daw` VARCHAR(191) NOT NULL,
    `gear_list` VARCHAR(191) NOT NULL,
    `availability` ENUM('full_time', 'part_time', 'on_demand') NOT NULL,
    `plugin_chains` JSON NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
    `stripe_connect_account_id` VARCHAR(191) NULL,
    `stripe_onboarding_complete` BOOLEAN NOT NULL DEFAULT false,
    `stripe_payouts_enabled` BOOLEAN NOT NULL DEFAULT false,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `creators_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `creators_profiles_stripe_connect_account_id_key`(`stripe_connect_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mixing_engineer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `years_mixing` INTEGER NOT NULL,
    `average_turnaround_time_days` INTEGER NOT NULL,
    `notable_artists` VARCHAR(191) NULL,
    `do_you_tune_vocals` BOOLEAN NOT NULL,
    `upload_example_tuned_vocals_id` VARCHAR(191) NULL,
    `upload_before_mix_id` VARCHAR(191) NULL,
    `upload_after_mix_id` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mixing_engineer_profiles_creator_id_key`(`creator_id`),
    UNIQUE INDEX `mixing_engineer_profiles_upload_example_tuned_vocals_id_key`(`upload_example_tuned_vocals_id`),
    UNIQUE INDEX `mixing_engineer_profiles_upload_before_mix_id_key`(`upload_before_mix_id`),
    UNIQUE INDEX `mixing_engineer_profiles_upload_after_mix_id_key`(`upload_after_mix_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mixing_genres` (
    `id` VARCHAR(191) NOT NULL,
    `mixingId` VARCHAR(191) NOT NULL,
    `genreId` VARCHAR(191) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mastering_engineer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `years_mastering` INTEGER NOT NULL,
    `average_turnaround_time_days` INTEGER NOT NULL,
    `preferred_loudness_range` VARCHAR(191) NULL,
    `upload_before_master_id` VARCHAR(191) NULL,
    `upload_after_master_id` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mastering_engineer_profiles_creator_id_key`(`creator_id`),
    UNIQUE INDEX `mastering_engineer_profiles_upload_before_master_id_key`(`upload_before_master_id`),
    UNIQUE INDEX `mastering_engineer_profiles_upload_after_master_id_key`(`upload_after_master_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mastering_genres` (
    `id` VARCHAR(191) NOT NULL,
    `masteringId` VARCHAR(191) NOT NULL,
    `genreId` VARCHAR(191) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mastering_genres_masteringId_genreId_key`(`masteringId`, `genreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrumentalist_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `years_recording_or_playing` INTEGER NOT NULL,
    `studio_setup_description` VARCHAR(191) NOT NULL,
    `instruments` JSON NOT NULL,
    `upload_example_file_id` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instrumentalist_profiles_creator_id_key`(`creator_id`),
    UNIQUE INDEX `instrumentalist_profiles_upload_example_file_id_key`(`upload_example_file_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrumentalist_genres` (
    `id` VARCHAR(191) NOT NULL,
    `instrumentalist_id` VARCHAR(191) NOT NULL,
    `genre_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `instrumentalist_genres_instrumentalist_id_genre_id_key`(`instrumentalist_id`, `genre_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artists_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `stage_name` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `socials` JSON NULL,
    `mixa_points` INTEGER NOT NULL DEFAULT 0,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artists_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_genres` (
    `id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `genre_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `creator_genres_creator_id_genre_id_key`(`creator_id`, `genre_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artist_genres` (
    `id` VARCHAR(191) NOT NULL,
    `artist_id` VARCHAR(191) NOT NULL,
    `genre_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artist_genres_artist_id_genre_id_key`(`artist_id`, `genre_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genres` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `genres_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiers` (
    `id` VARCHAR(191) NOT NULL,
    `name` ENUM('bronze', 'silver', 'gold', 'platinum') NOT NULL,
    `order` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `prices` JSON NULL,
    `serviceDescriptions` JSON NULL,
    `number_of_revisions` INTEGER NOT NULL DEFAULT 0,
    `stems` INTEGER NULL,
    `delivery_days` INTEGER NOT NULL DEFAULT 0,
    `commission_percentage` DOUBLE NOT NULL DEFAULT 10,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tiers_name_key`(`name`),
    UNIQUE INDEX `tiers_order_key`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_tiers` (
    `id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `tier_id` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `upgradedAt` DATETIME(3) NULL,
    `downgradedAt` DATETIME(3) NULL,

    UNIQUE INDEX `creator_tiers_creator_id_tier_id_key`(`creator_id`, `tier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UpgradeRequirements` (
    `id` VARCHAR(191) NOT NULL,
    `tierId` VARCHAR(191) NOT NULL,
    `minProjects` INTEGER NOT NULL,
    `minRating` DOUBLE NOT NULL,
    `minOnTimeRate` DOUBLE NOT NULL,
    `minReturningClients` INTEGER NULL,
    `minFeedbackScore` DOUBLE NULL,

    UNIQUE INDEX `UpgradeRequirements_tierId_key`(`tierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DowngradeTriggers` (
    `id` VARCHAR(191) NOT NULL,
    `tierId` VARCHAR(191) NOT NULL,
    `minRatingThreshold` DOUBLE NOT NULL,
    `lateDeliveriesLimit` INTEGER NOT NULL,
    `unresolvedDisputesLimit` INTEGER NULL,
    `refundRateLimit` DOUBLE NULL,
    `inactivityDays` INTEGER NULL,

    UNIQUE INDEX `DowngradeTriggers_tierId_key`(`tierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintainRequirements` (
    `id` VARCHAR(191) NOT NULL,
    `tierId` VARCHAR(191) NOT NULL,
    `minRating` DOUBLE NOT NULL,
    `minOnTimeRate` DOUBLE NOT NULL,
    `requireRetentionFeedback` BOOLEAN NOT NULL,

    UNIQUE INDEX `MaintainRequirements_tierId_key`(`tierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `artistName` VARCHAR(191) NOT NULL,
    `projectType` ENUM('single', 'ep', 'album') NOT NULL,
    `tier` ENUM('bronze', 'silver', 'gold', 'platinum') NOT NULL,
    `services` ENUM('mixing', 'mastering', 'recording') NOT NULL,
    `mixingType` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` ENUM('pending', 'in_review', 'accepted', 'awaiting_payment', 'paid', 'in_progress', 'under_review', 'revision_requested', 'delivered', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
    `addOns` JSON NULL,
    `acceptance` JSON NULL,
    `status_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `cancellation_reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_request_genres` (
    `id` VARCHAR(191) NOT NULL,
    `serviceRequestId` VARCHAR(191) NOT NULL,
    `genreId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `service_request_genres_serviceRequestId_genreId_key`(`serviceRequestId`, `genreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `acceptance_conditions` (
    `id` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('mixing', 'mastering', 'recording') NOT NULL,
    `fieldName` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `acceptance_conditions_serviceType_fieldName_key`(`serviceType`, `fieldName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_provider_fees` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('stripe', 'paypal', 'mercadopago', 'other') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `percentage_fee` DOUBLE NOT NULL,
    `fixed_fee` DOUBLE NOT NULL,
    `international_percentage_fee` DOUBLE NULL,
    `international_fixed_fee` DOUBLE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_provider_fees_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_events` (
    `id` VARCHAR(191) NOT NULL,
    `request_id` VARCHAR(191) NOT NULL,
    `type` ENUM('status_changed', 'file_uploaded', 'comment_added', 'revision_requested', 'milestone_completed', 'creator_assigned', 'creator_accepted', 'creator_rejected', 'payment_completed') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('request_matched', 'request_accepted', 'request_rejected', 'file_uploaded', 'status_changed', 'revision_requested', 'project_completed', 'payment_received', 'new_comment') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_rooms` (
    `id` VARCHAR(191) NOT NULL,
    `service_request_id` VARCHAR(191) NOT NULL,
    `artist_id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chat_rooms_service_request_id_key`(`service_request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `chat_room_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `type` ENUM('text', 'file', 'system') NOT NULL DEFAULT 'text',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `service_request_id` VARCHAR(191) NOT NULL,
    `stripe_session_id` VARCHAR(191) NOT NULL,
    `stripe_payment_intent_id` VARCHAR(191) NULL,
    `total_amount` INTEGER NOT NULL,
    `platform_fee` INTEGER NOT NULL,
    `creator_amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'usd',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_stripe_session_id_key`(`stripe_session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfers` (
    `id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `stripe_transfer_id` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'usd',
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transfers_payment_id_key`(`payment_id`),
    UNIQUE INDEX `transfers_stripe_transfer_id_key`(`stripe_transfer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_services` ADD CONSTRAINT `project_services_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_services` ADD CONSTRAINT `project_services_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creators_profiles` ADD CONSTRAINT `creators_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_engineer_profiles` ADD CONSTRAINT `mixing_engineer_profiles_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_engineer_profiles` ADD CONSTRAINT `mixing_engineer_profiles_upload_example_tuned_vocals_id_fkey` FOREIGN KEY (`upload_example_tuned_vocals_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_engineer_profiles` ADD CONSTRAINT `mixing_engineer_profiles_upload_before_mix_id_fkey` FOREIGN KEY (`upload_before_mix_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_engineer_profiles` ADD CONSTRAINT `mixing_engineer_profiles_upload_after_mix_id_fkey` FOREIGN KEY (`upload_after_mix_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_genres` ADD CONSTRAINT `mixing_genres_mixingId_fkey` FOREIGN KEY (`mixingId`) REFERENCES `mixing_engineer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mixing_genres` ADD CONSTRAINT `mixing_genres_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastering_engineer_profiles` ADD CONSTRAINT `mastering_engineer_profiles_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastering_engineer_profiles` ADD CONSTRAINT `mastering_engineer_profiles_upload_before_master_id_fkey` FOREIGN KEY (`upload_before_master_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastering_engineer_profiles` ADD CONSTRAINT `mastering_engineer_profiles_upload_after_master_id_fkey` FOREIGN KEY (`upload_after_master_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastering_genres` ADD CONSTRAINT `mastering_genres_masteringId_fkey` FOREIGN KEY (`masteringId`) REFERENCES `mastering_engineer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastering_genres` ADD CONSTRAINT `mastering_genres_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentalist_profiles` ADD CONSTRAINT `instrumentalist_profiles_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentalist_profiles` ADD CONSTRAINT `instrumentalist_profiles_upload_example_file_id_fkey` FOREIGN KEY (`upload_example_file_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentalist_genres` ADD CONSTRAINT `instrumentalist_genres_instrumentalist_id_fkey` FOREIGN KEY (`instrumentalist_id`) REFERENCES `instrumentalist_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentalist_genres` ADD CONSTRAINT `instrumentalist_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artists_profiles` ADD CONSTRAINT `artists_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_genres` ADD CONSTRAINT `creator_genres_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_genres` ADD CONSTRAINT `creator_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artist_genres` ADD CONSTRAINT `artist_genres_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artist_genres` ADD CONSTRAINT `artist_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_tiers` ADD CONSTRAINT `creator_tiers_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_tiers` ADD CONSTRAINT `creator_tiers_tier_id_fkey` FOREIGN KEY (`tier_id`) REFERENCES `tiers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UpgradeRequirements` ADD CONSTRAINT `UpgradeRequirements_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DowngradeTriggers` ADD CONSTRAINT `DowngradeTriggers_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintainRequirements` ADD CONSTRAINT `MaintainRequirements_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_request_genres` ADD CONSTRAINT `service_request_genres_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_request_genres` ADD CONSTRAINT `service_request_genres_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_events` ADD CONSTRAINT `project_events_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_events` ADD CONSTRAINT `project_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_service_request_id_fkey` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_rooms` ADD CONSTRAINT `chat_rooms_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chat_room_id_fkey` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_service_request_id_fkey` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `creators_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
