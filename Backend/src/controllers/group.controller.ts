import { Request, Response, NextFunction } from 'express';
import { Group } from '../models/Group';
import { Types } from 'mongoose';

export class GroupController {
  /**
   * Creates a new classroom student group cohort.
   */
  public static async createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, subject, roster } = req.body;
      const group = new Group({
        name,
        subject,
        teacherId: new Types.ObjectId(req.userId),
        roster,
      });

      await group.save();
      res.status(201).json({
        success: true,
        group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists all classroom groups registered under the active educator.
   */
  public static async getGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groups = await Group.find({ teacherId: new Types.ObjectId(req.userId) });
      res.status(200).json({
        success: true,
        groups,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetches single classroom group details by identifier.
   */
  public static async getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await Group.findOne({
        _id: new Types.ObjectId(req.params.id),
        teacherId: new Types.ObjectId(req.userId),
      });

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Classroom group cohort not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Updates attributes of the classroom group.
   */
  public static async updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, subject } = req.body;
      const group = await Group.findOneAndUpdate(
        {
          _id: new Types.ObjectId(req.params.id),
          teacherId: new Types.ObjectId(req.userId),
        },
        { name, subject },
        { new: true, runValidators: true }
      );

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Classroom group cohort not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deletes classroom group records.
   */
  public static async deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await Group.findOneAndDelete({
        _id: new Types.ObjectId(req.params.id),
        teacherId: new Types.ObjectId(req.userId),
      });

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Classroom group cohort not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Classroom group deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Appends student structure to class roster.
   */
  public static async addStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await Group.findOne({
        _id: new Types.ObjectId(req.params.id),
        teacherId: new Types.ObjectId(req.userId),
      });

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Classroom group cohort not found.',
        });
        return;
      }

      const { studentName, rollNumber, email } = req.body;

      const studentExists = group.roster.some((s) => s.rollNumber === rollNumber);
      if (studentExists) {
        res.status(400).json({
          success: false,
          error: 'A student with this roll number is already registered in this cohort.',
        });
        return;
      }

      group.roster.push({ studentName, rollNumber, email });
      await group.save();

      res.status(200).json({
        success: true,
        group,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Removes student from cohort roster list.
   */
  public static async removeStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const group = await Group.findOne({
        _id: new Types.ObjectId(req.params.id),
        teacherId: new Types.ObjectId(req.userId),
      });

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Classroom group cohort not found.',
        });
        return;
      }

      const { rollNumber } = req.params;
      const initialSize = group.roster.length;
      group.roster = group.roster.filter((s) => s.rollNumber !== rollNumber);

      if (group.roster.length === initialSize) {
        res.status(404).json({
          success: false,
          error: 'Student with specified roll number not found in this group.',
        });
        return;
      }

      await group.save();
      res.status(200).json({
        success: true,
        group,
      });
    } catch (err) {
      next(err);
    }
  }
}
