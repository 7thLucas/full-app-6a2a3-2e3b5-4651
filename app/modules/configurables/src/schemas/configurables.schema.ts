/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "companyName",
      type: "string",
      required: true,
      label: "Company Name",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "statusColors",
      type: "object",
      required: false,
      label: "Status Colors",
      fields: [
        {
          fieldName: "compliant",
          type: "color",
          required: false,
          label: "Compliant (Green)",
        },
        {
          fieldName: "pending",
          type: "color",
          required: false,
          label: "Pending (Amber)",
        },
        {
          fieldName: "nonCompliant",
          type: "color",
          required: false,
          label: "Non-Compliant (Red)",
        },
      ],
    },
    {
      fieldName: "reminderEmailEnabled",
      type: "boolean",
      required: false,
      label: "Enable Reminder Emails",
    },
    {
      fieldName: "expirationWindowDays",
      type: "object",
      required: false,
      label: "Expiration Warning Windows",
      fields: [
        {
          fieldName: "warning30",
          type: "number",
          required: false,
          label: "30-Day Warning (days)",
        },
        {
          fieldName: "warning60",
          type: "number",
          required: false,
          label: "60-Day Warning (days)",
        },
        {
          fieldName: "warning90",
          type: "number",
          required: false,
          label: "90-Day Warning (days)",
        },
      ],
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
    },
    {
      fieldName: "loginWelcomeMessage",
      type: "string",
      required: false,
      label: "Login Welcome Message",
    },
    {
      fieldName: "departments",
      type: "array",
      required: false,
      label: "Departments",
      item: { type: "string", required: true },
    },
    {
      fieldName: "enableEmployeeSelfRegistration",
      type: "boolean",
      required: false,
      label: "Allow Employee Self-Registration",
    },
    {
      fieldName: "csvExportEnabled",
      type: "boolean",
      required: false,
      label: "Enable CSV Export",
    },
    {
      fieldName: "pdfExportEnabled",
      type: "boolean",
      required: false,
      label: "Enable PDF Export",
    },
  ],
};
