import { Worker, Job, WorkerOptions } from 'bullmq';
import { connectDB } from '../config/db';
import { redis } from '../config/redis';
import { pdfCompilationQueue } from '../config/queue';
import { Assignment } from '../models/Assignment';
import { AIService } from '../services/ai.service';
import { CacheService } from '../services/cache.service';

type BullWorkerConnectionOptions = NonNullable<WorkerOptions>['connection'];
const bullRedisConnection = redis as BullWorkerConnectionOptions;
connectDB();

const worker = new Worker(
  'assessment-generation',
  async (job: Job) => {
    const { assignmentId, title, instructions, config, rawContextText, institutionName, cacheHash } = job.data;
    console.log(`🤖 [Worker A] Processing assessment generation for Assignment: ${assignmentId}`);

    try {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      await redis.publish(
        'socket_broadcast',
        JSON.stringify({
          room: `assignment:${assignmentId}`,
          event: 'status_update',
          data: { status: 'processing', assignmentId },
        })
      );
      const paperData = await AIService.generateAssessment({
        title,
        instructions,
        config,
        rawContextText,
        institutionName,
      });
      const cacheKey = `assessment_cache:${cacheHash}`;
      await CacheService.set(cacheKey, JSON.stringify(paperData), 86400);
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        paperData,
      });
      await redis.publish(
        'socket_broadcast',
        JSON.stringify({
          room: `assignment:${assignmentId}`,
          event: 'generation_success',
          data: { status: 'completed', assignmentId, paperData },
        })
      );
      console.log(`📁 [Worker A] Enqueuing PDF compilation job for Assignment: ${assignmentId}`);
      await pdfCompilationQueue.add('compile', {
        assignmentId,
        paperData,
      });

    } catch (err: any) {
      console.error(`❌ [Worker A] Generation process failed for Assignment: ${assignmentId}`, err);

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        errorReason: err.message || 'AI Generation process encountered an error.',
      });
      await redis.publish(
        'socket_broadcast',
        JSON.stringify({
          room: `assignment:${assignmentId}`,
          event: 'generation_failed',
          data: { status: 'failed', assignmentId, error: err.message || 'AI Generation failed.' },
        })
      );

      throw err; 
    }
  },
  { connection: bullRedisConnection }
);

worker.on('completed', (job) => {
  console.log(`✅ [Worker A] Job completed successfully: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ [Worker A] Job failed to execute: ${job?.id}`, err);
});

console.log('🤖 [Worker A] Assessment generation worker has booted and is listening for jobs.');
export default worker;
