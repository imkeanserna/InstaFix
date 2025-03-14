-- CreateTable
CREATE TABLE "PopularSearch" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSearched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopularSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularSearch_query_key" ON "PopularSearch"("query");

-- CreateIndex
CREATE INDEX "PopularSearch_count_lastSearched_idx" ON "PopularSearch"("count", "lastSearched");
