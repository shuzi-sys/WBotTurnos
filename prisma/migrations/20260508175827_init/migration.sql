-- CreateTable
CREATE TABLE "Peluquero" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,

    CONSTRAINT "Peluquero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" SERIAL NOT NULL,
    "peluqueroId" INTEGER NOT NULL,
    "nombre" TEXT,
    "telefonocreador" TEXT NOT NULL,
    "creadoen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitadopara" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Peluquero_nombre_key" ON "Peluquero"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Peluquero_telefono_key" ON "Peluquero"("telefono");

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_peluqueroId_fkey" FOREIGN KEY ("peluqueroId") REFERENCES "Peluquero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
