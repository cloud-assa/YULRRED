import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { IncomingMessage, ServerResponse } from 'http';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const expressApp = express();
let nestInitialized = false;
let initPromise: Promise<void> | null = null;

async function initNest() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { rawBody: true, logger: false },
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  await app.init();
  nestInitialized = true;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!nestInitialized) {
    if (!initPromise) {
      initPromise = initNest();
    }
    await initPromise;
  }
  expressApp(req, res);
}
