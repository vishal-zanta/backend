import { Router } from "express";
import { OptionController } from "./option.controller.js";
// You can import and inject the authProtect middleware here if you only want admins to create/view options.
// import { authProtect } from "../../middlewares/authMiddleware.js";

const router = Router();

// Define routes
router.get("/types", OptionController.getTypes); 
router.get("/", OptionController.getOptions);
router.post("/", OptionController.createOption); 
router.put("/:id", OptionController.updateOption);
router.delete("/:id", OptionController.deleteOption);

export default router;
