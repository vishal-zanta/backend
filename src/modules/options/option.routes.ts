import { Router } from "express";
import { OptionController } from "./option.controller.js";
import { authProtect } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/permissionMiddleware.js";
// You can import and inject the authProtect middleware here if you only want admins to create/view options.
// import { authProtect } from "../../middlewares/authMiddleware.js";

const router = Router();
router.get("/", OptionController.getOptions);

// Define routes
router.use(authProtect);

router.get("/types", OptionController.getTypes); 
router.post("/",checkPermission("ALL"), OptionController.createOption); 
router.put("/:id",checkPermission("ALL"), OptionController.updateOption);
router.delete("/:id",checkPermission("ALL"), OptionController.deleteOption);

export default router;
