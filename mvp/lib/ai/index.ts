// AI Module Exports
export * from "./types";
export * from "./model";
export { executeMarketingDepartment, type MarketingVariables } from "./agents/marketing";
export {
  marketingDepartmentConfig,
  brandStrategistTemplate,
  designerTemplate,
  contentWriterTemplate,
  socialMediaManagerTemplate,
  fillTemplate,
  defaultMarketingVariables,
} from "./templates/marketing";
