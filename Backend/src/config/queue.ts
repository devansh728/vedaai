import { Queue, QueueOptions } from 'bullmq';
import { redis } from './redis';

type BullConnectionOptions = NonNullable<QueueOptions>['connection'];
const bullRedisConnection = redis as BullConnectionOptions;

export const assessmentGenerationQueue = new Queue('assessment-generation', {
  connection: bullRedisConnection,
});

export const pdfCompilationQueue = new Queue('pdf-compilation', {
  connection: bullRedisConnection,
});
