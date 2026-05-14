import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [
    "http://localhost:3000",
  ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
