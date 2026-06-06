import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment';
import { User } from '../models/User';
import { ParserService } from '../services/parser.service';
import { CryptoUtils } from '../utils/crypto';
import { CacheService } from '../services/cache.service';
import { assessmentGenerationQueue } from '../config/queue';
import { Types } from 'mongoose';

export class AssignmentController {
  /**
   * Orchestrates the creation of an assessment with Cache-then-Queue strategy.
   */
  public static async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, instructions, dueDate, groupId, config } = req.body;
      let rawContextText = '';
      if (req.file) {
        rawContextText = await ParserService.extractText(req.file);
      }
      const hashableConfig = {
        subject: config.subject,
        className: config.className,
        timeAllowedMinutes: config.timeAllowedMinutes,
        totalMarks: config.totalMarks,
        sections: config.sections,
        rawContextText,
      };

      const cacheHash = CryptoUtils.generateConfigHash(hashableConfig);
      const cacheKey = `assessment_cache:${cacheHash}`;
      const cachedResult = await CacheService.get(cacheKey);

      if (cachedResult) {
        console.log(`⚡ [Cache Hit] config hash: ${cacheHash}`);
        const paperData = JSON.parse(cachedResult);

        const assignment = new Assignment({
          title,
          instructions,
          dueDate: new Date(dueDate),
          groupId: groupId ? new Types.ObjectId(groupId) : null,
          createdBy: new Types.ObjectId(req.userId),
          status: 'completed',
          rawContextText,
          cacheHash,
          paperData,
        });

        await assignment.save();

        res.status(200).json({
          success: true,
          fromCache: true,
          assignment,
        });
        return;
      }
      console.log(`⚙️ [Cache Miss] config hash: ${cacheHash}`);
      const assignment = new Assignment({
        title,
        instructions,
        dueDate: new Date(dueDate),
        groupId: groupId ? new Types.ObjectId(groupId) : null,
        createdBy: new Types.ObjectId(req.userId),
        status: 'pending',
        rawContextText,
        cacheHash,
        paperData: null,
      });

      await assignment.save();
      const teacher = await User.findById(req.userId);
      const institutionName = teacher?.institution?.name || 'VedaAI Academy';
      await assessmentGenerationQueue.add('generate', {
        assignmentId: assignment._id.toString(),
        title,
        instructions,
        config,
        rawContextText,
        institutionName,
        cacheHash,
      });

      res.status(202).json({
        success: true,
        fromCache: false,
        assignment,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all assignments created by the authenticated teacher.
   */
  public static async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await Assignment.find({ createdBy: new Types.ObjectId(req.userId) });
      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves detail of an assignment.
   */
  public static async getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await Assignment.findOne({
        _id: new Types.ObjectId(req.params.id),
        createdBy: new Types.ObjectId(req.userId),
      });

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        assignment,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deletes an assignment.
   */
  public static async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await Assignment.findOneAndDelete({
        _id: new Types.ObjectId(req.params.id),
        createdBy: new Types.ObjectId(req.userId),
      });

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
