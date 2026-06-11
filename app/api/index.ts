// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";
import { Router } from "express";

// Compliance domain routes
import complianceRoutes from "~/compliance/routes/compliance.routes";

// Initialize models
await initializeModels();

// Initialize compliance models (auto-discovered by initializeModels scanning modules)
// but compliance models are in app/compliance/models/ — import them to register with Mongoose
await import("../compliance/models/requirement.model");
await import("../compliance/models/employee-record.model");
await import("../compliance/models/employee-profile.model");
await import("../compliance/models/compliance-audit-log.model");

// Build combined router
const combinedRouter = Router();
combinedRouter.use(routes);
combinedRouter.use(complianceRoutes);

export default combinedRouter;
