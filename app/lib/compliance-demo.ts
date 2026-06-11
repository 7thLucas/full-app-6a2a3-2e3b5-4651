export type UserRole = "HR" | "Employee";
export type Department = "All" | "Sales" | "Compliance";
export type EmployeeDepartment = Exclude<Department, "All">;
export type ComplianceConfigType = "SOP" | "CONFIG";
export type ComplianceStatus = "Pending" | "Submitted" | "Approved" | "Needs Review";

export interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  department: Department;
}

export interface ComplianceConfigDto {
  _id: string;
  pluginId: string;
  title: string;
  description: string;
  type: ComplianceConfigType;
  targetDepartment: Department;
  dueDate?: string;
  requirements: string[];
  rules?: string;
  inputSchema?: Record<string, unknown>;
  criteria?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceSubmissionDto {
  _id: string;
  configId: string;
  configTitle: string;
  employeeName: string;
  employeeEmail: string;
  department: EmployeeDepartment;
  evidenceText: string;
  evidenceFileName?: string;
  status: ComplianceStatus;
  judgmentStatus?: "PENDING" | "DONE" | "ERROR";
  result?: Record<string, unknown>;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const departments: Department[] = ["All", "Sales", "Compliance"];

export const demoAccounts: DemoAccount[] = [
  {
    role: "HR",
    name: "Penny Goldberg",
    email: "hr@insureco.demo",
    password: "Demo@123",
    department: "All",
  },
  {
    role: "Employee",
    name: "James Carter",
    email: "james.sales@insureco.demo",
    password: "Demo@123",
    department: "Sales",
  },
  {
    role: "Employee",
    name: "Emily Brooks",
    email: "emily.compliance@insureco.demo",
    password: "Demo@123",
    department: "Compliance",
  },
];

const sessionKey = "insurance-compliance-demo-session";

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  return demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === email.trim().toLowerCase() &&
      account.password === password,
  );
}

export function saveDemoSession(account: DemoAccount): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(sessionKey, JSON.stringify(account));
}

export function getDemoSession(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  const rawSession = window.localStorage.getItem(sessionKey);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as DemoAccount;
  } catch {
    window.localStorage.removeItem(sessionKey);
    return null;
  }
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(sessionKey);
}

export function isEmployeeDepartment(department: Department): department is EmployeeDepartment {
  return department === "Sales" || department === "Compliance";
}
