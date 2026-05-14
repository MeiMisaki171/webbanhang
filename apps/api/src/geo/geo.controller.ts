import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { GeoService } from "./geo.service";

@Controller("geo")
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get("provinces")
  listProvinces() {
    return this.geoService.listProvinces();
  }

  @Get("wards")
  listWards(@Query("provinceCode") provinceCode?: string) {
    if (!provinceCode?.trim()) {
      throw new BadRequestException("Thiếu mã tỉnh/thành.");
    }

    return this.geoService.listWards(provinceCode.trim());
  }
}
