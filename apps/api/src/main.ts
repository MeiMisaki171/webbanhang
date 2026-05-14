import "./load-env";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function resolveCorsOrigins(): string[] | boolean {
  const configured = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return ["http://localhost:3000"];
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = resolveCorsOrigins();

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
