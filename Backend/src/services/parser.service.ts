import pdfParse from 'pdf-parse';

export class ParserService {
  public static async extractText(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8').trim();
    } else if (file.mimetype === 'application/pdf') {
      try {
        const parsed = await pdfParse(file.buffer);
        return parsed.text
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n') 
          .trim();
      } catch (err) {
        console.error('PDF text extraction error:', err);
        throw new Error('Failed to parse and extract text from the PDF document.');
      }
    } else {
      throw new Error('Unsupported file format. Only PDF and plain text documents are supported.');
    }
  }
}
