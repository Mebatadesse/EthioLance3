-- CreateTable
CREATE TABLE "RegistrationOtp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationOtp_userId_key" ON "RegistrationOtp"("userId");

-- AddForeignKey
ALTER TABLE "RegistrationOtp" ADD CONSTRAINT "RegistrationOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
