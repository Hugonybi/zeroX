-- CreateTable
CREATE TABLE "OwnershipToken" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authenticityTokenId" TEXT NOT NULL,
    "hederaTokenId" TEXT NOT NULL,
    "hederaTxHash" TEXT NOT NULL,
    "metadataIpfs" TEXT NOT NULL,
    "transferable" BOOLEAN NOT NULL DEFAULT true,
    "fractions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnershipToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnershipToken_orderId_key" ON "OwnershipToken"("orderId");

-- AddForeignKey
ALTER TABLE "OwnershipToken" ADD CONSTRAINT "OwnershipToken_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipToken" ADD CONSTRAINT "OwnershipToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipToken" ADD CONSTRAINT "OwnershipToken_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipToken" ADD CONSTRAINT "OwnershipToken_authenticityTokenId_fkey" FOREIGN KEY ("authenticityTokenId") REFERENCES "AuthToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
