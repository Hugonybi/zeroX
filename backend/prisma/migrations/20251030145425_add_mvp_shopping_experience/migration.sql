-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "availableQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "dimensionDepth" DOUBLE PRECISION,
ADD COLUMN     "dimensionHeight" DOUBLE PRECISION,
ADD COLUMN     "dimensionUnit" TEXT DEFAULT 'cm',
ADD COLUMN     "dimensionWidth" DOUBLE PRECISION,
ADD COLUMN     "isUnique" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "medium" TEXT,
ADD COLUMN     "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totalQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "yearCreated" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shippingAddress" JSONB,
ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "taxCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCents" INTEGER,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "unitPriceCents" INTEGER;

-- CreateTable
CREATE TABLE "ArtistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "profileImage" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "education" TEXT,
    "exhibitions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "awards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistProfile_userId_key" ON "ArtistProfile"("userId");

-- CreateIndex
CREATE INDEX "ArtistProfile_userId_idx" ON "ArtistProfile"("userId");

-- CreateIndex
CREATE INDEX "Artwork_status_idx" ON "Artwork"("status");

-- CreateIndex
CREATE INDEX "Artwork_artistId_idx" ON "Artwork"("artistId");

-- CreateIndex
CREATE INDEX "Artwork_priceCents_idx" ON "Artwork"("priceCents");

-- CreateIndex
CREATE INDEX "Artwork_category_idx" ON "Artwork"("category");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_artworkId_idx" ON "Order"("artworkId");

-- CreateIndex
CREATE INDEX "Order_orderStatus_idx" ON "Order"("orderStatus");

-- AddForeignKey
ALTER TABLE "ArtistProfile" ADD CONSTRAINT "ArtistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
