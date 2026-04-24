import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import itemsRouter from "./items";
import outfitsRouter from "./outfits";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(itemsRouter);
router.use(outfitsRouter);
router.use(summaryRouter);

export default router;
