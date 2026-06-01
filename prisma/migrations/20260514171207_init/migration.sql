/*
  Warnings:

  - You are about to drop the column `telefonocreador` on the `Turno` table. All the data in the column will be lost.
  - Added the required column `telefonoCliente` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "telefonocreador",
ADD COLUMN     "telefonoCliente" TEXT NOT NULL;
