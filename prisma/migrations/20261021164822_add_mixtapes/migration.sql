-- CreateEnum
CREATE TYPE "TapeSide" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "Mixtape" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dedication" TEXT,
    "note" TEXT,
    "tapeLength" INTEGER NOT NULL DEFAULT 60,
    "color" TEXT NOT NULL DEFAULT 'sunset',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Mixtape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixtapeTrack" (
    "id" TEXT NOT NULL,
    "side" "TapeSide" NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "year" INTEGER,
    "durationSec" INTEGER NOT NULL,
    "note" TEXT,
    "link" TEXT,
    "mixtapeId" TEXT NOT NULL,

    CONSTRAINT "MixtapeTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mixtape_authorId_idx" ON "Mixtape"("authorId");

-- CreateIndex
CREATE INDEX "Mixtape_isPublic_publishedAt_idx" ON "Mixtape"("isPublic", "publishedAt");

-- CreateIndex
CREATE INDEX "MixtapeTrack_mixtapeId_side_position_idx" ON "MixtapeTrack"("mixtapeId", "side", "position");

-- AddForeignKey
ALTER TABLE "Mixtape" ADD CONSTRAINT "Mixtape_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixtapeTrack" ADD CONSTRAINT "MixtapeTrack_mixtapeId_fkey" FOREIGN KEY ("mixtapeId") REFERENCES "Mixtape"("id") ON DELETE CASCADE ON UPDATE CASCADE;
