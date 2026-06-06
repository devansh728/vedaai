import { Worker, Job, WorkerOptions } from 'bullmq';
import puppeteer from 'puppeteer';
import { connectDB } from '../config/db';
import { redis } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { StorageService } from '../services/storage.service';
import { IPaperData } from '../models/Assignment';

type BullWorkerConnectionOptions = NonNullable<WorkerOptions>['connection'];
const bullRedisConnection = redis as BullWorkerConnectionOptions;
connectDB();
function generateHtmlTemplate(paper: IPaperData): string {
  const sectionsHtml = paper.sections.map((section, secIdx) => {
    const questionsHtml = section.questions.map((question, qIdx) => `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Q${qIdx + 1}.</span>
          <span class="question-text">${question.questionText}</span>
          <span class="question-marks">[${question.marks} Marks]</span>
        </div>
        <div class="difficulty-badge ${question.difficulty.toLowerCase()}">${question.difficulty}</div>
        <div class="answer-space">
          <div class="writing-line"></div>
          <div class="writing-line"></div>
          <div class="writing-line"></div>
        </div>
      </div>
    `).join('');

    return `
      <div class="section-container">
        <h2 class="section-title">Section ${String.fromCharCode(65 + secIdx)}: ${section.sectionName}</h2>
        <p class="section-instructions"><em>Instructions: ${section.instructions}</em></p>
        <div class="questions-container">
          ${questionsHtml}
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${paper.title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #222;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }
    .institution-name {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin: 0 0 5px 0;
      color: #111;
      letter-spacing: 0.5px;
    }
    .paper-title {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin: 0 0 15px 0;
      color: #333;
    }
    .meta-info-row {
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .candidate-info {
      border: 1.5px solid #333;
      padding: 10px;
      margin-top: 15px;
      margin-bottom: 25px;
      font-size: 9.5pt;
    }
    .candidate-row {
      display: flex;
      justify-content: space-between;
    }
    .candidate-field {
      width: 30%;
      border-bottom: 1px dashed #333;
      padding-bottom: 2px;
    }
    .section-container {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      border-bottom: 1.5px solid #333;
      padding-bottom: 3px;
      margin-top: 15px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .section-instructions {
      font-size: 9pt;
      color: #555;
      margin-bottom: 12px;
    }
    .question-block {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .question-number {
      font-weight: bold;
      margin-right: 5px;
    }
    .question-text {
      flex: 1;
      text-align: justify;
      padding-right: 15px;
    }
    .question-marks {
      font-weight: bold;
      white-space: nowrap;
    }
    .difficulty-badge {
      display: inline-block;
      font-size: 7.5pt;
      padding: 1px 6px;
      border-radius: 2px;
      text-transform: uppercase;
      font-weight: bold;
      margin-left: 25px;
      margin-bottom: 6px;
    }
    .difficulty-badge.easy {
      background-color: #e2f0d9;
      color: #385723;
      border: 1px solid #abcca1;
    }
    .difficulty-badge.moderate {
      background-color: #fff2cc;
      color: #7f6000;
      border: 1px solid #ffe599;
    }
    .difficulty-badge.hard {
      background-color: #fce4d6;
      color: #c65911;
      border: 1px solid #f8cbad;
    }
    .answer-space {
      margin-left: 25px;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    .writing-line {
      height: 22px;
      border-bottom: 1px dashed #ddd;
    }
    .footer-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      border-top: 1px solid #bbb;
      padding-top: 12px;
      page-break-inside: avoid;
    }
    .signature-space {
      width: 150px;
      border-top: 1.5px dashed #333;
      text-align: center;
      padding-top: 5px;
      margin-top: 25px;
    }
  </style>
</head>
<body>

  <div class="institution-name">${paper.institutionName}</div>
  <div class="paper-title">${paper.title}</div>
  
  <div class="meta-info-row">
    <div><strong>Subject:</strong> ${paper.subject}</div>
    <div><strong>Class:</strong> ${paper.className}</div>
  </div>
  <div class="meta-info-row">
    <div><strong>Time Allowed:</strong> ${paper.timeAllowedMinutes} Mins</div>
    <div><strong>Total Marks:</strong> ${paper.totalMarks} Marks</div>
  </div>
  <div style="border-bottom: 2px solid #333; margin-top: 5px;"></div>

  <div class="candidate-info">
    <div class="candidate-row">
      <div class="candidate-field"><strong>Student Name:</strong></div>
      <div class="candidate-field"><strong>Roll Number:</strong></div>
      <div class="candidate-field"><strong>Date:</strong></div>
    </div>
  </div>

  <!-- Sections & Questions -->
  ${sectionsHtml}

  <div class="footer-section">
    <div class="signature-space">
      Invigilator Signature
    </div>
    <div class="signature-space">
      Examiner Signature
    </div>
  </div>

</body>
</html>
  `;
}

const worker = new Worker(
  'pdf-compilation',
  async (job: Job) => {
    const { assignmentId, paperData } = job.data;
    console.log(`🤖 [Worker B] Compiling PDF print layout for Assignment: ${assignmentId}`);

    let browser;
    try {
      const htmlContent = generateHtmlTemplate(paperData);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });

      await browser.close();
      browser = null;
      console.log(`📁 [Worker B] Uploading compiled PDF buffer to Storj S3 bucket...`);
      const fileName = `exam_${assignmentId}`;
      const publicUrl = await StorageService.uploadPDF(pdfBuffer, fileName);
      await Assignment.findByIdAndUpdate(assignmentId, {
        'paperData.pdfUrl': publicUrl,
      });

      console.log(`✅ [Worker B] PDF compiled and uploaded. Public Link: ${publicUrl}`);
      await redis.publish(
        'socket_broadcast',
        JSON.stringify({
          room: `assignment:${assignmentId}`,
          event: 'pdf_ready',
          data: { status: 'completed', assignmentId, pdfUrl: publicUrl },
        })
      );

    } catch (err: any) {
      console.error(`❌ [Worker B] PDF Compilation task failed for Assignment: ${assignmentId}`, err);

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'failed',
        errorReason: err.message || 'PDF compilation failed.',
      });
      await redis.publish(
        'socket_broadcast',
        JSON.stringify({
          room: `assignment:${assignmentId}`,
          event: 'generation_failed',
          data: { status: 'failed', assignmentId, error: err.message || 'PDF compilation failed.' },
        })
      );

      throw err;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
  { connection: bullRedisConnection }
);

worker.on('completed', (job) => {
  console.log(`✅ [Worker B] Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ [Worker B] Job execution failed: ${job?.id}`, err);
});

console.log('🤖 [Worker B] PDF compilation worker has booted and is listening for jobs.');
export default worker;
