import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { validate } from '../middleware/validate';
import { checkAuth } from '../middleware/checkAuth';
import { CreateGroupSchema, AddStudentSchema } from '../validators/group.validators';

const router = Router();

router.use(checkAuth); 

router.post('/', validate(CreateGroupSchema), GroupController.createGroup);
router.get('/', GroupController.getGroups);
router.get('/:id', GroupController.getGroup);
router.put('/:id', validate(CreateGroupSchema), GroupController.updateGroup);
router.delete('/:id', GroupController.deleteGroup);

router.post('/:id/students', validate(AddStudentSchema), GroupController.addStudent);
router.delete('/:id/students/:rollNumber', GroupController.removeStudent);

export default router;
