-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Resturants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
