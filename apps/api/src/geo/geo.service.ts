import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  listProvinces() {
    return this.prisma.province.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
      },
    });
  }

  listWards(provinceCode: string) {
    return this.prisma.ward.findMany({
      where: { provinceCode },
      orderBy: { name: "asc" },
      select: {
        code: true,
        provinceCode: true,
        name: true,
      },
    });
  }
}
