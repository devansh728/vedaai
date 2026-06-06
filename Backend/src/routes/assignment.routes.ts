import { Router, Request, Response, NextFunction } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { checkAuth } from '../middleware/checkAuth';
import { uploadOptionalDocument } from '../middleware/multer';
import { validate } from '../middleware/validate';
import { CreateAssignmentSchema } from '../validators/assignment.validators';

const router = Router();

router.use(checkAuth); 

function parseAssignmentFormData(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body.config && typeof req.body.config === 'string') {
      req.body.config = JSON.parse(req.body.config);
    }
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON structure provided in config field.',
    });
  }
}

router.post(
  '/',
  uploadOptionalDocument,
  parseAssignmentFormData,
  validate(CreateAssignmentSchema),
  AssignmentController.createAssignment
);

router.get('/', AssignmentController.getAssignments);
router.get('/:id', AssignmentController.getAssignment);
router.delete('/:id', AssignmentController.deleteAssignment);

export default router;
