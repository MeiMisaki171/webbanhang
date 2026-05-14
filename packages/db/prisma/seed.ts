import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = dirname(fileURLToPath(import.meta.url));

type GeoData = {
  provinces: Array<{ code: string; name: string }>;
  wards: Array<{ code: string; provinceCode: string; name: string }>;
};

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  soldCount: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  categorySlug: string;
  imageText: string;
};

const categorySeeds = [
  { name: "Đồ gia dụng", slug: "do-gia-dung", sortOrder: 1 },
  { name: "Nhà bếp", slug: "nha-bep", parentSlug: "do-gia-dung", sortOrder: 1 },
  { name: "Dọn nhà", slug: "don-nha", parentSlug: "do-gia-dung", sortOrder: 2 },
  { name: "Điện máy", slug: "dien-may", sortOrder: 2 },
  { name: "Tủ lạnh", slug: "tu-lanh", parentSlug: "dien-may", sortOrder: 1 },
  { name: "Máy giặt", slug: "may-giat", parentSlug: "dien-may", sortOrder: 2 },
  { name: "Thiết bị điện", slug: "thiet-bi-dien", sortOrder: 3 },
  { name: "Phụ kiện", slug: "phu-kien", sortOrder: 4 },
];

const productSeeds: ProductSeed[] = [
  {
    name: "Nồi cơm điện tử Panasonic 1.8L",
    slug: "noi-com-dien-tu-panasonic-1-8l",
    sku: "DGDP-NC-001",
    brand: "Panasonic",
    price: 1890000,
    compareAtPrice: 2190000,
    stock: 42,
    soldCount: 128,
    shortDescription: "Nồi cơm điện tử 1.8L, 12 chế độ nấu",
    description: "Nồi cơm điện tử Panasonic dung tích 1.8L phù hợp gia đình 4-6 người.",
    specs: { "Dung tích": "1.8L", "Công suất": "700W", "Bảo hành": "12 tháng" },
    categorySlug: "nha-bep",
    imageText: "Noi+com",
  },
  {
    name: "Bếp từ đơn Sunhouse 2000W",
    slug: "bep-tu-don-sunhouse-2000w",
    sku: "DGDP-BT-002",
    brand: "Sunhouse",
    price: 990000,
    stock: 35,
    soldCount: 86,
    shortDescription: "Bếp từ đơn cảm ứng, kính chịu nhiệt",
    description: "Bếp từ đơn Sunhouse tiết kiệm điện, an toàn cho nhà bếp hiện đại.",
    specs: { "Công suất": "2000W", "Mặt kính": "Kính chịu nhiệt" },
    categorySlug: "nha-bep",
    imageText: "Bep+tu",
  },
  {
    name: "Máy xay sinh tố Philips 700W",
    slug: "may-xay-sinh-to-philips-700w",
    sku: "DGDP-MX-003",
    brand: "Philips",
    price: 1290000,
    compareAtPrice: 1490000,
    stock: 28,
    soldCount: 64,
    shortDescription: "Máy xay đa năng, cối thủy tinh 1.5L",
    description: "Máy xay sinh tố Philips công suất 700W, phù hợp pha chế hàng ngày.",
    specs: { "Công suất": "700W", "Dung tích": "1.5L" },
    categorySlug: "nha-bep",
    imageText: "May+xay",
  },
  {
    name: "Ấm siêu tốc Lock&Lock 1.7L",
    slug: "am-sieu-toc-locklock-1-7l",
    sku: "DGDP-AS-004",
    brand: "Lock&Lock",
    price: 590000,
    stock: 60,
    soldCount: 210,
    shortDescription: "Ấm siêu tốc inox 1.7L, tự ngắt",
    description: "Ấm siêu tốc Lock&Lock đun nhanh, thân inox bền bỉ.",
    specs: { "Dung tích": "1.7L", "Chất liệu": "Inox 304" },
    categorySlug: "nha-bep",
    imageText: "Am+sieu+toc",
  },
  {
    name: "Lò vi sóng Sharp 20L",
    slug: "lo-vi-song-sharp-20l",
    sku: "DGDP-LVS-005",
    brand: "Sharp",
    price: 2190000,
    stock: 18,
    soldCount: 41,
    shortDescription: "Lò vi sóng 20L, 10 mức công suất",
    description: "Lò vi sóng Sharp dung tích 20L, hâm nóng và nấu tiện lợi.",
    specs: { "Dung tích": "20L", "Công suất": "800W" },
    categorySlug: "nha-bep",
    imageText: "Lo+vi+song",
  },
  {
    name: "Máy hút bụi cầm tay Xiaomi",
    slug: "may-hut-bui-cam-tay-xiaomi",
    sku: "DGDP-MHB-006",
    brand: "Xiaomi",
    price: 1590000,
    compareAtPrice: 1790000,
    stock: 24,
    soldCount: 95,
    shortDescription: "Máy hút bụi cầm tay nhẹ, lọc HEPA",
    description: "Máy hút bụi cầm tay Xiaomi phù hợp sofa, xe và góc nhỏ.",
    specs: { "Lực hút": "130AW", "Pin": "Li-ion" },
    categorySlug: "don-nha",
    imageText: "Hut+bui",
  },
  {
    name: "Máy lọc không khí Daikin",
    slug: "may-loc-khong-khi-daikin",
    sku: "DGDP-MLKK-007",
    brand: "Daikin",
    price: 4990000,
    stock: 12,
    soldCount: 22,
    shortDescription: "Lọc bụi mịn PM2.5, diện tích 25m2",
    description: "Máy lọc không khí Daikin cho phòng khách và phòng ngủ.",
    specs: { "Diện tích": "25m2", "Màng lọc": "HEPA" },
    categorySlug: "don-nha",
    imageText: "Loc+kk",
  },
  {
    name: "Cây nước nóng lạnh Kangaroo",
    slug: "cay-nuoc-nong-lanh-kangaroo",
    sku: "DGDP-CN-008",
    brand: "Kangaroo",
    price: 3490000,
    stock: 15,
    soldCount: 33,
    shortDescription: "Cây nước nóng lạnh 3 vòi",
    description: "Cây nước nóng lạnh Kangaroo phù hợp văn phòng và gia đình.",
    specs: { "Công suất làm lạnh": "500W", "Bình chứa": "Nóng 1L" },
    categorySlug: "don-nha",
    imageText: "Cay+nuoc",
  },
  {
    name: "Tủ lạnh Samsung Inverter 280L",
    slug: "tu-lanh-samsung-inverter-280l",
    sku: "DGDP-TL-009",
    brand: "Samsung",
    price: 8990000,
    compareAtPrice: 9590000,
    stock: 10,
    soldCount: 18,
    shortDescription: "Tủ lạnh 2 cánh, công nghệ Digital Inverter",
    description: "Tủ lạnh Samsung 280L tiết kiệm điện, ngăn đông mềm.",
    specs: { "Dung tích": "280L", "Công nghệ": "Digital Inverter" },
    categorySlug: "tu-lanh",
    imageText: "Tu+lanh",
  },
  {
    name: "Tủ lạnh LG Side by Side 617L",
    slug: "tu-lanh-lg-side-by-side-617l",
    sku: "DGDP-TL-010",
    brand: "LG",
    price: 21990000,
    stock: 6,
    soldCount: 7,
    shortDescription: "Tủ lạnh side by side, lọc nước tích hợp",
    description: "Tủ lạnh LG Side by Side dung tích lớn cho gia đình đông người.",
    specs: { "Dung tích": "617L", "Tiện ích": "Lọc nước" },
    categorySlug: "tu-lanh",
    imageText: "Tu+lanh+LG",
  },
  {
    name: "Tủ lạnh mini Aqua 90L",
    slug: "tu-lanh-mini-aqua-90l",
    sku: "DGDP-TL-011",
    brand: "Aqua",
    price: 2590000,
    stock: 20,
    soldCount: 52,
    shortDescription: "Tủ lạnh mini 90L cho phòng trọ",
    description: "Tủ lạnh mini Aqua gọn nhẹ, phù hợp phòng ngủ và văn phòng.",
    specs: { "Dung tích": "90L", "Kiểu dáng": "Mini" },
    categorySlug: "tu-lanh",
    imageText: "Tu+mini",
  },
  {
    name: "Máy giặt Electrolux 9kg Inverter",
    slug: "may-giat-electrolux-9kg-inverter",
    sku: "DGDP-MG-012",
    brand: "Electrolux",
    price: 10990000,
    compareAtPrice: 11990000,
    stock: 8,
    soldCount: 14,
    shortDescription: "Máy giặt cửa trước 9kg, inverter",
    description: "Máy giặt Electrolux 9kg vận hành êm, tiết kiệm nước.",
    specs: { "Khối lượng giặt": "9kg", "Công nghệ": "Inverter" },
    categorySlug: "may-giat",
    imageText: "May+giat",
  },
  {
    name: "Máy giặt Toshiba 7.4kg",
    slug: "may-giat-toshiba-7-4kg",
    sku: "DGDP-MG-013",
    brand: "Toshiba",
    price: 6490000,
    stock: 11,
    soldCount: 27,
    shortDescription: "Máy giặt cửa trên 7.4kg",
    description: "Máy giặt Toshiba 7.4kg phù hợp gia đình 3-4 người.",
    specs: { "Khối lượng giặt": "7.4kg", "Kiểu cửa": "Cửa trên" },
    categorySlug: "may-giat",
    imageText: "May+giat+Toshiba",
  },
  {
    name: "Máy sấy quần áo Bosch 8kg",
    slug: "may-say-quan-ao-bosch-8kg",
    sku: "DGDP-MS-014",
    brand: "Bosch",
    price: 13990000,
    stock: 5,
    soldCount: 6,
    shortDescription: "Máy sấy 8kg, cảm biến độ ẩm",
    description: "Máy sấy Bosch 8kg giúp quần áo khô nhanh, mềm mại.",
    specs: { "Khối lượng sấy": "8kg", "Công nghệ": "AutoDry" },
    categorySlug: "may-giat",
    imageText: "May+say",
  },
  {
    name: "Đèn LED bulb 9W Panasonic",
    slug: "den-led-bulb-9w-panasonic",
    sku: "DGDP-DEN-015",
    brand: "Panasonic",
    price: 69000,
    stock: 200,
    soldCount: 540,
    shortDescription: "Bóng LED 9W ánh sáng trắng",
    description: "Bóng đèn LED Panasonic tiết kiệm điện, tuổi thọ cao.",
    specs: { "Công suất": "9W", "Tuổi thọ": "15000h" },
    categorySlug: "thiet-bi-dien",
    imageText: "Den+LED",
  },
  {
    name: "Ổ cắm điện đôi Panasonic",
    slug: "o-cam-dien-doi-panasonic",
    sku: "DGDP-OC-016",
    brand: "Panasonic",
    price: 89000,
    stock: 150,
    soldCount: 320,
    shortDescription: "Ổ cắm đôi có nắp che",
    description: "Ổ cắm điện đôi Panasonic an toàn cho gia đình có trẻ nhỏ.",
    specs: { "Dòng điện": "10A", "Tiêu chuẩn": "TCVN" },
    categorySlug: "thiet-bi-dien",
    imageText: "O+cam",
  },
  {
    name: "Công tắc điện 2 chiều Sino",
    slug: "cong-tac-dien-2-chieu-sino",
    sku: "DGDP-CT-017",
    brand: "Sino",
    price: 45000,
    stock: 180,
    soldCount: 410,
    shortDescription: "Công tắc 2 chiều màu trắng",
    description: "Công tắc điện Sino lắp đặt dễ, phù hợp sửa chữa nhà.",
    specs: { "Kiểu": "2 chiều", "Màu": "Trắng" },
    categorySlug: "thiet-bi-dien",
    imageText: "Cong+tac",
  },
  {
    name: "Dây sạc nhanh USB-C 1.2m Anker",
    slug: "day-sac-nhanh-usb-c-1-2m-anker",
    sku: "DGDP-DS-018",
    brand: "Anker",
    price: 190000,
    stock: 90,
    soldCount: 260,
    shortDescription: "Cáp USB-C hỗ trợ sạc nhanh 60W",
    description: "Dây sạc Anker bện chắc, tương thích đa thiết bị.",
    specs: { "Chiều dài": "1.2m", "Công suất": "60W" },
    categorySlug: "phu-kien",
    imageText: "Cap+USB",
  },
  {
    name: "Pin AA Energizer vỉ 4 viên",
    slug: "pin-aa-energizer-vi-4-vien",
    sku: "DGDP-PIN-019",
    brand: "Energizer",
    price: 85000,
    stock: 120,
    soldCount: 390,
    shortDescription: "Pin kiềm AA vỉ 4 viên",
    description: "Pin Energizer AA dùng cho remote, đồ chơi và thiết bị gia dụng.",
    specs: { "Loại pin": "AA", "Số viên": "4" },
    categorySlug: "phu-kien",
    imageText: "Pin+AA",
  },
  {
    name: "Ổ điện dự phòng 10000mAh Baseus",
    slug: "o-dien-du-phong-10000mah-baseus",
    sku: "DGDP-OD-020",
    brand: "Baseus",
    price: 590000,
    compareAtPrice: 690000,
    stock: 45,
    soldCount: 118,
    shortDescription: "Sạc dự phòng 10000mAh, 2 cổng USB",
    description: "Pin dự phòng Baseus nhỏ gọn, sạc nhanh cho điện thoại.",
    specs: { "Dung lượng": "10000mAh", "Cổng": "USB-A + USB-C" },
    categorySlug: "phu-kien",
    imageText: "Sac+dp",
  },
  {
    name: "Bộ ổ điện âm tường 3 ổ Sino",
    slug: "bo-o-dien-am-tuong-3-o-sino",
    sku: "DGDP-BO-021",
    brand: "Sino",
    price: 159000,
    stock: 70,
    soldCount: 88,
    shortDescription: "Bộ ổ điện âm tường 3 lỗ",
    description: "Bộ ổ điện âm tường Sino cho công trình và gia đình.",
    specs: { "Số ổ": "3", "Lắp đặt": "Âm tường" },
    categorySlug: "thiet-bi-dien",
    imageText: "Bo+o+dien",
  },
  {
    name: "Quạt đứng Mitsubishi 16 inch",
    slug: "quat-dung-mitsubishi-16-inch",
    sku: "DGDP-QD-022",
    brand: "Mitsubishi",
    price: 1290000,
    stock: 22,
    soldCount: 73,
    shortDescription: "Quạt đứng 16 inch, 3 tốc độ",
    description: "Quạt đứng Mitsubishi mát mẻ, tiết kiệm điện cho mùa hè.",
    specs: { "Cánh quạt": "16 inch", "Tốc độ": "3 mức" },
    categorySlug: "dien-may",
    imageText: "Quat+dung",
  },
];

function imageUrl(text: string): string {
  return `https://placehold.co/800x800/png?text=${encodeURIComponent(text)}`;
}

async function seedGeo(): Promise<void> {
  const geo = JSON.parse(
    readFileSync(join(__dirname, "data", "provinces-wards.json"), "utf8"),
  ) as GeoData;

  for (const province of geo.provinces) {
    await prisma.province.upsert({
      where: { code: province.code },
      update: { name: province.name },
      create: province,
    });
  }

  for (const ward of geo.wards) {
    await prisma.ward.upsert({
      where: { code: ward.code },
      update: { name: ward.name, provinceCode: ward.provinceCode },
      create: ward,
    });
  }
}

async function seedUsers(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@diengiadungpro.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const customerEmail =
    process.env.SEED_CUSTOMER_EMAIL ?? "customer@diengiadungpro.local";
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD ?? "Customer@12345";

  const adminHash = await hash(adminPassword, 12);
  const customerHash = await hash(customerPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      fullName: "Quản trị viên",
      role: UserRole.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      fullName: "Quản trị viên",
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      passwordHash: customerHash,
      fullName: "Khách hàng demo",
      role: UserRole.CUSTOMER,
    },
    create: {
      email: customerEmail,
      passwordHash: customerHash,
      fullName: "Khách hàng demo",
      role: UserRole.CUSTOMER,
    },
  });
}

async function seedCategories(): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>();

  for (const category of categorySeeds.filter((item) => !item.parentSlug)) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    slugToId.set(category.slug, created.id);
  }

  for (const category of categorySeeds.filter((item) => item.parentSlug)) {
    const parentId = slugToId.get(category.parentSlug!);
    if (!parentId) {
      throw new Error(`Missing parent category ${category.parentSlug}`);
    }

    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        parentId,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        parentId,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    slugToId.set(category.slug, created.id);
  }

  return slugToId;
}

async function seedProducts(slugToId: Map<string, string>): Promise<void> {
  for (const product of productSeeds) {
    const categoryId = slugToId.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category ${product.categorySlug}`);
    }

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        categoryId,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        brand: product.brand,
        specs: product.specs,
        soldCount: product.soldCount,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        categoryId,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        brand: product.brand,
        specs: product.specs,
        soldCount: product.soldCount,
        isActive: true,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    await prisma.productImage.create({
      data: {
        productId: created.id,
        url: imageUrl(product.imageText),
        sortOrder: 0,
        alt: product.name,
      },
    });
  }
}

async function main(): Promise<void> {
  await seedGeo();
  await seedUsers();
  const categories = await seedCategories();
  await seedProducts(categories);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
