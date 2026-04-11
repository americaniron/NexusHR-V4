import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const financeLegalInsuranceRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [

  // ═══════════════════════════════════════════════════════════
  //  FINANCE & BANKING (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Financial Analyst AI",
    department: "Finance",
    category: "Finance & Banking",
    industry: "Financial Services",
    reportsTo: "Chief Financial Officer",
    seniorityLevel: "mid",
    description: "Performs comprehensive financial analysis including budgeting, forecasting, variance analysis, and financial modeling to support strategic decision-making. Analyzes revenue trends, cost structures, and profitability across business units while producing detailed reports and recommendations for executive leadership.",
    coreResponsibilities: [
      "Build and maintain financial models for forecasting and scenario planning",
      "Conduct variance analysis comparing actuals to budget and prior periods",
      "Prepare monthly, quarterly, and annual financial reports and dashboards",
      "Analyze revenue streams, cost drivers, and profitability by segment",
      "Support annual budgeting and long-range planning processes",
      "Evaluate capital expenditure proposals and ROI analyses",
      "Monitor key financial KPIs and alert leadership to trends",
      "Prepare board-level financial presentations and executive summaries",
      "Coordinate with accounting on close processes and reconciliations",
      "Conduct competitive benchmarking and industry financial analysis"
    ],
    tasks: [
      { name: "Daily Financial Dashboard", cadence: "daily", description: "Update real-time financial dashboards with revenue, expenses, cash position, and key ratios", priority: "high" },
      { name: "Revenue & Expense Monitoring", cadence: "daily", description: "Track daily revenue recognition, expense accruals, and flag anomalies against forecast", priority: "high" },
      { name: "Cash Flow Monitoring", cadence: "daily", description: "Monitor cash balances, upcoming obligations, and short-term liquidity position", priority: "medium" },
      { name: "Weekly Variance Report", cadence: "weekly", description: "Prepare week-over-week and month-to-date variance analysis with commentary on key drivers", priority: "high" },
      { name: "Forecast Update", cadence: "weekly", description: "Update rolling financial forecast incorporating latest actuals and business intelligence", priority: "high" },
      { name: "Department Cost Review", cadence: "weekly", description: "Analyze departmental spending against budget, identify overruns, and recommend corrective actions", priority: "medium" },
      { name: "Monthly Close Support", cadence: "monthly", description: "Support month-end close with accruals, reconciliations, and financial statement preparation", priority: "high" },
      { name: "Board Financial Package", cadence: "monthly", description: "Compile comprehensive financial package for board review with analysis and strategic commentary", priority: "high" },
      { name: "Scenario Modeling", cadence: "monthly", description: "Run financial scenario analyses for strategic initiatives, M&A, and market conditions", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAP S/4HANA", "Oracle Financials", "Workday Adaptive Planning",
      "Anaplan", "Tableau", "Microsoft Power BI",
      "Bloomberg Terminal", "FactSet", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      financialStatements: "Full Access",
      generalLedger: "Full Access",
      budgetData: "Full Access",
      revenueData: "Full Access",
      costData: "Full Access",
      employeeCompensation: "Restricted — aggregate only",
      bankingData: "Authorized — treasury reports",
      investorRelations: "Authorized"
    },
    communicationCapabilities: [
      "Executive financial briefings and board presentation materials",
      "Department head budget reviews and cost analysis discussions",
      "Investor relations support with financial data and analysis",
      "Audit coordination and financial documentation",
      "Cross-functional collaboration on financial planning",
      "Automated financial alert notifications"
    ],
    exampleWorkflows: [
      {
        name: "Monthly Financial Close & Reporting",
        steps: [
          "Collect preliminary revenue and expense data from all business units",
          "Run automated reconciliations across GL accounts",
          "Calculate accruals and prepare adjusting entries",
          "Generate draft financial statements (P&L, balance sheet, cash flow)",
          "Perform variance analysis against budget and prior year",
          "Prepare management commentary on key drivers",
          "Compile executive dashboard and board-ready financial package",
          "Distribute reports and schedule review meetings"
        ]
      },
      {
        name: "Annual Budget Development",
        steps: [
          "Distribute budget templates and guidelines to department heads",
          "Collect and consolidate departmental budget submissions",
          "Validate assumptions against historical trends and market data",
          "Build consolidated budget model with scenario analysis",
          "Facilitate budget review sessions with leadership",
          "Incorporate feedback and finalize approved budget",
          "Load approved budget into financial systems",
          "Set up variance tracking and reporting cadence"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Forecast Accuracy", target: "Within 5% of actuals", weight: 20 },
      { metric: "Report Delivery Timeliness", target: "Within 3 business days of close", weight: 15 },
      { metric: "Budget Variance Identification", target: "> 95% of material variances flagged", weight: 15 },
      { metric: "Model Accuracy", target: "Within 3% on key assumptions", weight: 15 },
      { metric: "Cost Savings Identified", target: "> $500K annually", weight: 15 },
      { metric: "Stakeholder Satisfaction", target: "> 4.2/5.0", weight: 10 },
      { metric: "Data Quality Score", target: "> 98%", weight: 10 }
    ],
    useCases: [
      "Automated financial close and reporting with real-time dashboards",
      "Rolling forecast management with scenario-based planning",
      "Departmental cost optimization and budget adherence monitoring",
      "Capital expenditure evaluation and ROI tracking",
      "Competitive financial benchmarking and market analysis"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 40, directness: 85,
      creativity: 40, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["SOX", "GAAP", "IFRS", "SEC Reporting Requirements", "FCPA"],
      dataClassification: "Confidential Financial Information",
      auditRequirements: "All financial models and reports maintained with version control; SOX controls documented",
      retentionPolicy: "Financial records retained for 7 years per SOX requirements",
      breachNotification: "Immediate CFO notification for any financial data exposure"
    },
    skillsTags: ["financial analysis", "budgeting", "forecasting", "financial modeling", "variance analysis", "FP&A", "reporting", "data visualization", "strategic finance"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Compliance Officer AI",
    department: "Compliance",
    category: "Finance & Banking",
    industry: "Financial Services",
    reportsTo: "Chief Compliance Officer",
    seniorityLevel: "senior",
    description: "Monitors and enforces regulatory compliance across financial operations, including AML/KYC programs, sanctions screening, consumer protection, and regulatory reporting. Conducts risk assessments, manages compliance testing, investigates potential violations, and ensures the organization meets all federal and state financial regulatory requirements.",
    coreResponsibilities: [
      "Administer AML/BSA compliance program including transaction monitoring",
      "Manage KYC/CDD processes and enhanced due diligence for high-risk clients",
      "Conduct sanctions screening against OFAC, EU, and UN sanctions lists",
      "Monitor regulatory changes from CFPB, OCC, FDIC, SEC, and FinCEN",
      "Perform compliance risk assessments and control testing",
      "Investigate suspicious activity and file SARs/CTRs as required",
      "Manage compliance training programs and policy development",
      "Coordinate with regulators during examinations and audits",
      "Oversee consumer protection compliance (TILA, RESPA, ECOA, UDAAP)",
      "Report compliance metrics and emerging risks to board and committees"
    ],
    tasks: [
      { name: "Transaction Monitoring Review", cadence: "daily", description: "Review flagged transactions from AML monitoring systems, disposition alerts, and escalate suspicious activity", priority: "critical" },
      { name: "Sanctions Screening", cadence: "daily", description: "Process sanctions screening alerts, investigate potential matches, clear false positives", priority: "critical" },
      { name: "KYC/CDD Review", cadence: "daily", description: "Review new account openings for KYC completeness, process enhanced due diligence for high-risk relationships", priority: "high" },
      { name: "Regulatory Change Assessment", cadence: "daily", description: "Monitor regulatory bulletins, enforcement actions, and guidance; assess impact on compliance program", priority: "high" },
      { name: "SAR/CTR Filing", cadence: "weekly", description: "Prepare and file Suspicious Activity Reports and Currency Transaction Reports within regulatory deadlines", priority: "critical" },
      { name: "Compliance Testing", cadence: "weekly", description: "Execute scheduled compliance testing across business lines, document findings and remediation", priority: "high" },
      { name: "Risk Assessment Update", cadence: "monthly", description: "Update enterprise compliance risk assessment, identify emerging risks, recommend control enhancements", priority: "high" },
      { name: "Board Compliance Report", cadence: "monthly", description: "Prepare comprehensive compliance status report for board/committee review", priority: "high" },
      { name: "Training Compliance Tracking", cadence: "monthly", description: "Monitor regulatory training completion rates, deploy new training for regulatory changes", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "NICE Actimize", "Verafin", "LexisNexis Risk Solutions", "World-Check (Refinitiv)",
      "Hummingbird (SAR filing)", "Trulioo", "Dow Jones Risk & Compliance",
      "Wolters Kluwer OneSumX", "RegTech Solutions", "Slack"
    ],
    dataAccessPermissions: {
      transactionData: "Full Access — AML monitoring",
      customerRecords: "Full Access — KYC/CDD",
      sanctionsLists: "Full Access",
      complianceReports: "Full Access",
      auditFindings: "Full Access",
      employeeTraining: "Full Access",
      bankingOperations: "Authorized — compliance review",
      legalDocuments: "Authorized — regulatory matters"
    },
    communicationCapabilities: [
      "Regulatory body communication and examination coordination",
      "Board and committee compliance reporting",
      "Business line compliance guidance and advisory",
      "SAR/CTR filing with FinCEN",
      "Law enforcement coordination for financial crimes",
      "Staff compliance training and policy distribution"
    ],
    exampleWorkflows: [
      {
        name: "Suspicious Activity Investigation",
        steps: [
          "Receive alert from transaction monitoring system",
          "Gather customer profile, transaction history, and account documentation",
          "Analyze activity patterns against known typologies",
          "Conduct open-source intelligence research on subjects",
          "Interview relationship manager for additional context",
          "Document investigation findings and determination",
          "Prepare SAR filing if suspicious activity confirmed",
          "File SAR with FinCEN within 30-day deadline",
          "Flag account for enhanced monitoring or exit recommendation"
        ]
      },
      {
        name: "Regulatory Examination Preparation",
        steps: [
          "Review examination scope letter and information requests",
          "Compile requested documents and data from relevant departments",
          "Prepare management responses to prior examination findings",
          "Brief executive team on examination scope and key risk areas",
          "Coordinate document production and examiner workspace",
          "Facilitate examiner meetings with management and staff",
          "Track and respond to examiner questions during fieldwork",
          "Develop corrective action plans for examination findings"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "SAR Filing Timeliness", target: "100% within 30-day deadline", weight: 20 },
      { metric: "AML Alert Disposition Time", target: "< 48 hours average", weight: 15 },
      { metric: "Sanctions False Positive Rate", target: "< 5% after tuning", weight: 10 },
      { metric: "KYC Completion Rate", target: "100% before account activation", weight: 15 },
      { metric: "Regulatory Exam Findings", target: "Zero repeat findings", weight: 20 },
      { metric: "Compliance Training Completion", target: "> 98%", weight: 10 },
      { metric: "Risk Assessment Currency", target: "Updated quarterly", weight: 10 }
    ],
    useCases: [
      "Real-time transaction monitoring with ML-enhanced anomaly detection",
      "Automated KYC/CDD workflow with risk-based tiering",
      "Sanctions screening with intelligent false positive reduction",
      "Regulatory change management with impact assessment automation",
      "Compliance testing program management and finding tracking"
    ],
    personalityDefaults: {
      formality: 90, enthusiasm: 35, empathy: 45, directness: 90,
      creativity: 25, humor: 10, assertiveness: 85
    },
    complianceMetadata: {
      frameworks: ["BSA/AML", "OFAC Sanctions", "KYC/CDD", "FCPA", "SOX", "GDPR", "CCPA", "Dodd-Frank", "UDAAP", "ECOA", "TILA", "RESPA"],
      dataClassification: "Confidential — Financial Crime & Customer PII",
      auditRequirements: "Complete audit trail for all compliance decisions; SAR confidentiality maintained per 31 USC 5318(g)",
      retentionPolicy: "BSA records: 5 years; SAR filings: 5 years from filing date; KYC records: 5 years after account closure",
      breachNotification: "Immediate CCO and legal counsel notification; regulatory notification per applicable requirements"
    },
    skillsTags: ["AML compliance", "KYC/CDD", "sanctions screening", "regulatory affairs", "risk assessment", "SAR filing", "financial crimes", "regulatory examination", "compliance testing"],
    priceMonthly: 1499,
    isActive: 1,
  },

  {
    title: "Risk Management Analyst AI",
    department: "Enterprise Risk Management",
    category: "Finance & Banking",
    industry: "Financial Services",
    reportsTo: "Chief Risk Officer",
    seniorityLevel: "mid",
    description: "Identifies, assesses, and monitors enterprise risks across credit, market, operational, and strategic categories. Develops risk models, conducts stress testing, maintains risk registers, and provides quantitative risk analysis to support informed decision-making and regulatory capital adequacy requirements.",
    coreResponsibilities: [
      "Maintain and update the enterprise risk register with risk assessments",
      "Develop and run credit risk models and scoring algorithms",
      "Conduct market risk analysis including VaR and stress testing",
      "Monitor operational risk events and loss data collection",
      "Perform scenario analysis for emerging and systemic risks",
      "Support regulatory capital calculations (Basel III/IV frameworks)",
      "Prepare risk reports and dashboards for risk committee review",
      "Coordinate risk and control self-assessments (RCSA) across business lines",
      "Analyze concentration risk across portfolios and counterparties",
      "Support model validation and governance processes"
    ],
    tasks: [
      { name: "Risk Dashboard Update", cadence: "daily", description: "Update real-time risk metrics including portfolio exposure, VaR, limit utilization, and risk appetite indicators", priority: "high" },
      { name: "Market Risk Monitoring", cadence: "daily", description: "Calculate daily VaR, monitor market volatility, track position limits, and flag breaches", priority: "high" },
      { name: "Credit Exposure Monitoring", cadence: "daily", description: "Monitor credit portfolio concentrations, counterparty exposures, and credit quality migrations", priority: "high" },
      { name: "Operational Risk Event Review", cadence: "daily", description: "Review and classify new operational risk events, assess impact, and route for investigation", priority: "medium" },
      { name: "Limit Breach Reporting", cadence: "weekly", description: "Compile risk limit breaches, analyze root causes, and track remediation actions", priority: "high" },
      { name: "Stress Testing", cadence: "weekly", description: "Run portfolio stress tests against regulatory and internal scenarios, analyze capital impact", priority: "high" },
      { name: "Risk Committee Report", cadence: "monthly", description: "Prepare comprehensive risk report covering all risk categories, trends, and emerging threats", priority: "high" },
      { name: "RCSA Coordination", cadence: "monthly", description: "Facilitate risk and control self-assessments, aggregate results, and identify control gaps", priority: "medium" },
      { name: "Model Performance Review", cadence: "monthly", description: "Review risk model performance metrics, backtesting results, and calibration accuracy", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAS Risk Management", "Moody's Analytics", "Bloomberg Risk",
      "MSCI RiskMetrics", "Archer GRC", "MetricStream",
      "Palantir Foundry", "MATLAB", "Python/R Analytics", "Microsoft Power BI"
    ],
    dataAccessPermissions: {
      portfolioData: "Full Access",
      tradingPositions: "Full Access",
      creditExposures: "Full Access",
      marketData: "Full Access",
      operationalLossData: "Full Access",
      capitalCalculations: "Full Access",
      customerData: "Restricted — aggregate risk metrics only",
      strategicPlans: "Authorized — risk assessment purposes"
    },
    communicationCapabilities: [
      "Risk committee and board risk reporting",
      "Business line risk advisory and limit management",
      "Regulatory communication for stress testing and capital requirements",
      "Model governance committee presentations",
      "Cross-functional risk awareness and training",
      "Automated risk alert notifications for limit breaches"
    ],
    exampleWorkflows: [
      {
        name: "Enterprise Stress Testing",
        steps: [
          "Define stress scenarios based on regulatory and internal requirements",
          "Gather portfolio data across all asset classes and business lines",
          "Apply stress factors to credit, market, and operational risk models",
          "Calculate stressed losses and capital impact",
          "Assess capital adequacy under stress scenarios",
          "Identify portfolios and concentrations most vulnerable to stress",
          "Prepare stress test results report with recommendations",
          "Present findings to risk committee and regulators"
        ]
      },
      {
        name: "New Product Risk Assessment",
        steps: [
          "Receive new product proposal from business line",
          "Identify applicable risk categories (credit, market, operational, legal)",
          "Assess inherent risk level and proposed controls",
          "Evaluate regulatory implications and capital requirements",
          "Document risk assessment and mitigation recommendations",
          "Present assessment to new product committee",
          "Monitor post-launch risk metrics and experience"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Risk Model Accuracy", target: "> 95% backtesting pass rate", weight: 20 },
      { metric: "VaR Breach Rate", target: "< 5% (consistent with confidence level)", weight: 15 },
      { metric: "Risk Report Timeliness", target: "Within 2 business days", weight: 10 },
      { metric: "Stress Test Completion", target: "100% on schedule", weight: 15 },
      { metric: "RCSA Completion Rate", target: "> 95% of business units", weight: 15 },
      { metric: "Loss Event Capture Rate", target: "> 98%", weight: 15 },
      { metric: "Capital Adequacy Ratio", target: "Above regulatory minimum + buffer", weight: 10 }
    ],
    useCases: [
      "Real-time portfolio risk monitoring with automated limit breach detection",
      "Predictive credit risk scoring using machine learning models",
      "Regulatory stress testing automation for CCAR/DFAST requirements",
      "Operational risk event management and loss data analytics",
      "Enterprise risk appetite framework monitoring and reporting"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 40, directness: 85,
      creativity: 45, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["Basel III/IV", "SOX", "Dodd-Frank", "CCAR/DFAST", "GDPR", "CCPA", "OCC Risk Management Guidelines", "FFIEC"],
      dataClassification: "Confidential — Risk & Financial Data",
      auditRequirements: "All risk models documented per SR 11-7 model governance; stress test methodology auditable",
      retentionPolicy: "Risk records retained for 7 years; model documentation retained for model lifecycle + 3 years",
      breachNotification: "Immediate CRO notification; regulatory notification per applicable capital adequacy requirements"
    },
    skillsTags: ["risk management", "credit risk", "market risk", "operational risk", "stress testing", "VaR", "Basel III", "financial modeling", "risk analytics"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Treasury Operations Specialist AI",
    department: "Treasury",
    category: "Finance & Banking",
    industry: "Financial Services",
    reportsTo: "Treasurer",
    seniorityLevel: "mid",
    description: "Manages corporate treasury operations including cash management, liquidity planning, debt administration, investment portfolio management, and banking relationship coordination. Optimizes working capital, manages foreign exchange exposure, and ensures the organization maintains adequate liquidity for operational and strategic needs.",
    coreResponsibilities: [
      "Monitor and forecast daily cash positions across all accounts and entities",
      "Manage short-term investments and money market placements",
      "Coordinate debt service payments, covenant compliance, and facility draws",
      "Execute foreign exchange transactions and hedging strategies",
      "Manage banking relationships and optimize account structures",
      "Process wire transfers, ACH payments, and intercompany settlements",
      "Maintain cash flow forecasting models and liquidity projections",
      "Support credit facility negotiations and documentation",
      "Monitor interest rate exposure and recommend hedging strategies",
      "Ensure compliance with treasury policies, controls, and SOX requirements"
    ],
    tasks: [
      { name: "Daily Cash Position", cadence: "daily", description: "Compile cash positions across all bank accounts, calculate net position, and determine funding needs or investment opportunities", priority: "critical" },
      { name: "Payment Processing", cadence: "daily", description: "Review and authorize outgoing payments, wire transfers, and ACH batches per approval matrix", priority: "high" },
      { name: "FX Exposure Monitoring", cadence: "daily", description: "Monitor foreign currency exposures, mark-to-market hedging positions, and execute approved FX transactions", priority: "high" },
      { name: "Investment Management", cadence: "daily", description: "Monitor short-term investment portfolio, execute trades within policy guidelines, track maturities", priority: "medium" },
      { name: "Cash Flow Forecast Update", cadence: "weekly", description: "Update 13-week cash flow forecast incorporating latest AR/AP data, planned disbursements, and projected receipts", priority: "high" },
      { name: "Bank Fee Analysis", cadence: "weekly", description: "Review bank account analysis statements, optimize service charges, and identify cost reduction opportunities", priority: "medium" },
      { name: "Debt Covenant Compliance", cadence: "monthly", description: "Calculate and report financial covenant compliance ratios, flag any potential breaches", priority: "high" },
      { name: "Treasury Dashboard", cadence: "monthly", description: "Prepare treasury performance report covering liquidity, investment returns, FX exposure, and cost of funds", priority: "high" },
      { name: "Counterparty Risk Review", cadence: "monthly", description: "Assess banking and investment counterparty credit quality and concentration limits", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Kyriba Treasury Management", "SAP Treasury", "FIS Quantum",
      "Bloomberg Terminal", "SWIFT Alliance", "360T FX Platform",
      "Bank of America CashPro", "J.P. Morgan ACCESS", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      bankAccounts: "Full Access",
      paymentSystems: "Full Access — with dual control",
      investmentPortfolio: "Full Access",
      debtAgreements: "Full Access",
      fxPositions: "Full Access",
      cashForecasts: "Full Access",
      employeeData: "No Access",
      customerData: "Restricted — AR aging only"
    },
    communicationCapabilities: [
      "Banking partner coordination and relationship management",
      "CFO and executive treasury briefings",
      "Accounting team coordination for cash reconciliations",
      "Business unit cash flow planning collaboration",
      "External counsel communication for financing documentation",
      "Automated payment authorization notifications"
    ],
    exampleWorkflows: [
      {
        name: "Daily Cash Management",
        steps: [
          "Retrieve prior-day balances from all bank accounts via TMS",
          "Incorporate incoming payment notifications and expected disbursements",
          "Calculate net cash position across all entities and currencies",
          "Determine excess cash available for investment or deficit requiring funding",
          "Execute investment trades or credit facility draws as needed",
          "Process intercompany funding transfers for subsidiary requirements",
          "Update cash position report and distribute to stakeholders",
          "Reconcile any discrepancies with bank statements"
        ]
      },
      {
        name: "FX Hedging Execution",
        steps: [
          "Compile FX exposures from business units (AR, AP, forecasted)",
          "Calculate net exposure by currency and maturity bucket",
          "Compare against hedging policy coverage targets",
          "Obtain competitive FX quotes from banking counterparties",
          "Execute forward contracts or options per approved strategy",
          "Record hedge transactions in TMS and accounting systems",
          "Document hedge effectiveness testing for accounting treatment",
          "Report hedging activity and P&L impact to treasury committee"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Cash Forecast Accuracy", target: "Within 5% weekly", weight: 20 },
      { metric: "Investment Return vs Benchmark", target: "> 90-day T-bill rate", weight: 15 },
      { metric: "Payment Processing Accuracy", target: "> 99.9%", weight: 15 },
      { metric: "FX Hedging Effectiveness", target: "> 80% per ASC 815", weight: 15 },
      { metric: "Bank Fee Optimization", target: "5% YoY reduction", weight: 10 },
      { metric: "Covenant Compliance", target: "100% — no breaches", weight: 15 },
      { metric: "Idle Cash Minimization", target: "< 2% of total liquidity idle", weight: 10 }
    ],
    useCases: [
      "Automated daily cash positioning with AI-driven investment optimization",
      "Predictive cash flow forecasting using ML on historical payment patterns",
      "Real-time FX exposure monitoring and automated hedging recommendations",
      "Bank fee analysis and optimization across multi-bank structures",
      "Covenant compliance monitoring with early warning alerts"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 40, empathy: 35, directness: 85,
      creativity: 35, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["SOX", "Dodd-Frank", "EMIR", "ASC 815 (Hedge Accounting)", "GDPR", "CCPA", "OFAC Sanctions", "BSA/AML"],
      dataClassification: "Confidential — Treasury & Banking Data",
      auditRequirements: "Dual control for all payments; complete audit trail for investment and FX transactions",
      retentionPolicy: "Treasury records retained for 7 years; banking agreements retained for agreement term + 5 years",
      breachNotification: "Immediate Treasurer and CFO notification for any payment or treasury system breach"
    },
    skillsTags: ["treasury management", "cash management", "FX hedging", "liquidity planning", "investment management", "debt administration", "banking operations", "working capital", "payments"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Audit Coordinator AI",
    department: "Internal Audit",
    category: "Finance & Banking",
    industry: "Financial Services",
    reportsTo: "Chief Audit Executive",
    seniorityLevel: "mid",
    description: "Coordinates internal and external audit activities, manages audit planning and scheduling, tracks findings and remediation, and supports audit execution. Ensures comprehensive audit coverage across the organization, maintains audit documentation standards, and facilitates timely remediation of control deficiencies.",
    coreResponsibilities: [
      "Develop and maintain the annual audit plan based on risk assessment",
      "Coordinate audit engagement scheduling and resource allocation",
      "Support fieldwork execution including testing and evidence collection",
      "Track audit findings, recommendations, and management action plans",
      "Monitor remediation progress and validate corrective actions",
      "Maintain audit workpaper documentation standards and quality",
      "Coordinate with external auditors on integrated audit activities",
      "Prepare audit committee reports and dashboards",
      "Manage continuous auditing and monitoring programs",
      "Support SOX compliance testing and control documentation"
    ],
    tasks: [
      { name: "Audit Finding Tracking", cadence: "daily", description: "Monitor open audit findings, track remediation progress, send overdue alerts to action owners", priority: "high" },
      { name: "Engagement Status Monitoring", cadence: "daily", description: "Track active audit engagements against timelines, flag delays, and coordinate team resources", priority: "medium" },
      { name: "Evidence Collection Coordination", cadence: "daily", description: "Request and collect audit evidence from business units, organize in workpaper system", priority: "medium" },
      { name: "Continuous Monitoring Review", cadence: "weekly", description: "Review outputs from continuous auditing analytics, flag exceptions for investigation", priority: "high" },
      { name: "Audit Progress Report", cadence: "weekly", description: "Compile weekly status of all active and upcoming audit engagements for CAE", priority: "medium" },
      { name: "SOX Testing Coordination", cadence: "weekly", description: "Coordinate SOX control testing schedules, track completion, and manage evidence documentation", priority: "high" },
      { name: "Risk Assessment Update", cadence: "monthly", description: "Update audit risk universe based on emerging risks, business changes, and regulatory updates", priority: "high" },
      { name: "Audit Committee Dashboard", cadence: "monthly", description: "Prepare audit activity dashboard with findings summary, plan completion, and risk trends", priority: "high" }
    ],
    toolsAndIntegrations: [
      "TeamMate Audit Management", "AuditBoard", "Workiva (Wdesk)",
      "ACL Analytics (Galvanize)", "SAP Audit Management", "ServiceNow GRC",
      "SharePoint", "Microsoft Power BI", "JIRA", "Slack"
    ],
    dataAccessPermissions: {
      auditWorkpapers: "Full Access",
      auditFindings: "Full Access",
      controlDocumentation: "Full Access",
      financialData: "Authorized — audit scope only",
      operationalData: "Authorized — audit scope only",
      employeeRecords: "Restricted — HR audit scope only",
      itSystems: "Authorized — IT audit scope only",
      regulatoryCorrespondence: "Authorized"
    },
    communicationCapabilities: [
      "Audit committee and board audit reporting",
      "Business unit communication for audit scheduling and evidence requests",
      "External auditor coordination and information sharing",
      "Management communication for findings and remediation tracking",
      "Regulatory communication for examination support",
      "Automated finding status and overdue notifications"
    ],
    exampleWorkflows: [
      {
        name: "Audit Engagement Lifecycle",
        steps: [
          "Select audit from approved annual plan based on risk priority",
          "Conduct audit planning meeting with engagement team and auditee",
          "Develop audit program with detailed test procedures",
          "Request and collect initial documentation from auditee",
          "Execute fieldwork: walkthroughs, testing, and evidence evaluation",
          "Draft findings with risk ratings and recommendations",
          "Conduct exit meeting with auditee management",
          "Issue final audit report and track management action plans",
          "Validate remediation at agreed follow-up dates"
        ]
      },
      {
        name: "SOX Compliance Testing Cycle",
        steps: [
          "Update SOX control matrix for new processes and risk changes",
          "Coordinate testing schedule with control owners",
          "Execute control testing per approved methodology",
          "Document test results and evidence in workpaper system",
          "Identify and classify control deficiencies",
          "Coordinate remediation for identified deficiencies",
          "Prepare SOX attestation support documentation",
          "Facilitate external auditor reliance testing"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Audit Plan Completion Rate", target: "> 90%", weight: 20 },
      { metric: "Finding Remediation Rate", target: "> 85% on time", weight: 20 },
      { metric: "Audit Report Timeliness", target: "< 30 days from fieldwork end", weight: 15 },
      { metric: "SOX Deficiency Rate", target: "Zero material weaknesses", weight: 15 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 },
      { metric: "Workpaper Quality Score", target: "> 95% peer review pass", weight: 10 },
      { metric: "Repeat Finding Rate", target: "< 10%", weight: 10 }
    ],
    useCases: [
      "Automated audit planning with risk-based engagement prioritization",
      "Continuous auditing analytics for real-time control monitoring",
      "Finding lifecycle management with automated escalation workflows",
      "SOX compliance testing coordination and evidence management",
      "External auditor collaboration and integrated audit facilitation"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 50, directness: 80,
      creativity: 35, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["SOX", "IIA Standards", "PCAOB", "COSO Framework", "COBIT", "GDPR", "CCPA"],
      dataClassification: "Confidential — Audit Privileged Information",
      auditRequirements: "Workpapers maintained per IIA standards; audit independence requirements enforced",
      retentionPolicy: "Audit workpapers: 7 years; SOX documentation: 7 years from fiscal year end",
      breachNotification: "Immediate CAE notification; audit committee notification for significant control failures"
    },
    skillsTags: ["internal audit", "SOX compliance", "risk-based auditing", "control testing", "audit management", "continuous monitoring", "workpaper documentation", "finding remediation", "GRC"],
    priceMonthly: 1099,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  LEGAL & COMPLIANCE (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Contract Review Specialist AI",
    department: "Legal",
    category: "Legal & Compliance",
    industry: "Legal Services",
    reportsTo: "General Counsel",
    seniorityLevel: "mid",
    description: "Reviews, analyzes, and manages commercial contracts throughout their lifecycle. Identifies risk provisions, non-standard terms, and compliance issues in vendor agreements, customer contracts, NDAs, and partnership agreements. Ensures contractual terms align with organizational policies and legal requirements.",
    coreResponsibilities: [
      "Review and redline commercial contracts against approved templates and playbooks",
      "Identify non-standard terms, risk provisions, and liability exposure",
      "Manage contract lifecycle from initiation through execution and renewal",
      "Maintain contract repository and obligation tracking database",
      "Monitor contract compliance and key obligation deadlines",
      "Coordinate contract negotiations between business and legal teams",
      "Draft standard agreements, amendments, and SOWs from approved templates",
      "Analyze contract portfolio for risk concentration and term trends",
      "Support M&A due diligence with contract review and analysis",
      "Track regulatory changes affecting standard contract provisions"
    ],
    tasks: [
      { name: "Contract Review Queue", cadence: "daily", description: "Review incoming contract requests, prioritize by value and urgency, perform initial risk assessment", priority: "high" },
      { name: "Redline & Markup", cadence: "daily", description: "Compare submitted contracts against playbook, flag deviations, draft redlines with legal commentary", priority: "high" },
      { name: "Obligation Monitoring", cadence: "daily", description: "Monitor upcoming contract milestones, renewal dates, notice periods, and compliance deadlines", priority: "high" },
      { name: "Execution Tracking", cadence: "daily", description: "Track contracts in signature workflow, follow up on pending approvals, manage fully executed filing", priority: "medium" },
      { name: "Contract Status Report", cadence: "weekly", description: "Compile pipeline report of contracts in review, negotiation, and execution stages", priority: "medium" },
      { name: "Template & Playbook Updates", cadence: "weekly", description: "Incorporate recent legal developments and business feedback into contract templates and review playbooks", priority: "medium" },
      { name: "Portfolio Risk Analysis", cadence: "monthly", description: "Analyze contract portfolio for concentration risk, unfavorable terms, and renewal optimization opportunities", priority: "medium" },
      { name: "Compliance Audit", cadence: "monthly", description: "Audit sample contracts for policy compliance, signature authority adherence, and documentation completeness", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Ironclad", "DocuSign CLM", "Agiloft", "ContractPodAi",
      "Kira Systems", "Luminance", "iManage", "DocuSign eSignature",
      "Salesforce CPQ", "Slack"
    ],
    dataAccessPermissions: {
      contractRepository: "Full Access",
      legalDocuments: "Full Access",
      vendorRecords: "Authorized",
      financialTerms: "Authorized — contract-specific",
      customerData: "Restricted — contract-related only",
      intellectualProperty: "Authorized — IP-related contracts",
      employmentAgreements: "Restricted — HR authorization required"
    },
    communicationCapabilities: [
      "Business stakeholder communication for contract requests and status",
      "External counsel coordination for complex negotiations",
      "Counterparty communication for redline discussions",
      "Management reporting on contract pipeline and risk exposure",
      "Automated renewal and deadline notification alerts",
      "Cross-functional coordination for multi-department contracts"
    ],
    exampleWorkflows: [
      {
        name: "Contract Review & Approval",
        steps: [
          "Receive contract request with business justification and submitted draft",
          "Classify contract type and determine review level based on value/risk",
          "Compare terms against approved playbook and highlight deviations",
          "Assess risk provisions: liability caps, indemnification, IP, termination",
          "Draft redline markup with legal commentary and recommendations",
          "Return to business with risk summary and approval conditions",
          "Track negotiation rounds until terms are acceptable",
          "Route for appropriate signature authority approval",
          "Execute via e-signature and file in contract repository"
        ]
      },
      {
        name: "Contract Renewal Management",
        steps: [
          "Identify contracts approaching renewal window (90/60/30 day alerts)",
          "Pull contract performance data and compliance history",
          "Assess market conditions and renegotiation opportunities",
          "Recommend renewal, renegotiation, or termination",
          "If renewing, initiate review of updated terms",
          "Coordinate with business stakeholder on negotiation strategy",
          "Process renewal amendment or new agreement",
          "Update contract repository with new terms and dates"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Contract Review Turnaround", target: "< 3 business days for standard", weight: 20 },
      { metric: "Risk Identification Accuracy", target: "> 98%", weight: 20 },
      { metric: "Contract Cycle Time", target: "< 14 days from request to execution", weight: 15 },
      { metric: "Renewal Notice Compliance", target: "100% — no missed deadlines", weight: 15 },
      { metric: "Template Utilization Rate", target: "> 80% standard templates used", weight: 10 },
      { metric: "Portfolio Compliance Rate", target: "> 95%", weight: 10 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "AI-powered contract review with automated risk scoring and redlining",
      "Contract lifecycle management with automated obligation tracking",
      "Intelligent contract analytics for portfolio risk assessment",
      "Automated renewal management with proactive notification workflows",
      "Template-based contract generation with dynamic clause selection"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 45, directness: 80,
      creativity: 35, humor: 10, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["SOX", "GDPR", "CCPA", "UCC", "FCPA", "Export Controls (EAR/ITAR)", "Data Protection Regulations"],
      dataClassification: "Confidential — Legal Privileged",
      auditRequirements: "Complete audit trail for all contract modifications; signature authority compliance verified",
      retentionPolicy: "Active contracts: full term + 7 years; expired contracts: 7 years from expiration",
      breachNotification: "Immediate General Counsel notification for material contract breach or confidentiality exposure"
    },
    skillsTags: ["contract review", "legal analysis", "risk assessment", "CLM", "negotiation support", "redlining", "obligation management", "legal technology", "due diligence"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Legal Research Analyst AI",
    department: "Legal",
    category: "Legal & Compliance",
    industry: "Legal Services",
    reportsTo: "Senior Counsel",
    seniorityLevel: "mid",
    description: "Conducts comprehensive legal research across statutes, case law, regulations, and legal commentary to support litigation, transactions, and advisory matters. Prepares research memoranda, tracks regulatory developments, and provides analysis on legal questions to inform strategic decision-making by the legal team.",
    coreResponsibilities: [
      "Conduct statutory, regulatory, and case law research across jurisdictions",
      "Prepare legal research memoranda and analysis summaries",
      "Monitor legislative and regulatory developments affecting the organization",
      "Maintain legal precedent and knowledge management databases",
      "Support litigation teams with case research and fact analysis",
      "Research opposing counsel arguments and prepare counter-analysis",
      "Track judicial decisions and regulatory enforcement trends",
      "Analyze regulatory impact on business operations and compliance",
      "Support transactional matters with due diligence research",
      "Compile legal briefing materials for senior counsel and management"
    ],
    tasks: [
      { name: "Research Request Processing", cadence: "daily", description: "Review incoming research requests, prioritize by urgency and matter, begin research execution", priority: "high" },
      { name: "Regulatory Monitoring", cadence: "daily", description: "Scan regulatory feeds, legislative updates, and enforcement actions for relevant developments", priority: "high" },
      { name: "Case Law Update", cadence: "daily", description: "Monitor new judicial decisions in relevant jurisdictions and practice areas, flag impactful rulings", priority: "medium" },
      { name: "Research Memorandum Drafting", cadence: "daily", description: "Draft and refine legal research memoranda for pending matters", priority: "high" },
      { name: "Knowledge Base Update", cadence: "weekly", description: "Update legal research database with new precedents, regulatory guidance, and analysis templates", priority: "medium" },
      { name: "Litigation Research Support", cadence: "weekly", description: "Compile case research, jury verdict analysis, and opposing counsel profiles for active litigation", priority: "high" },
      { name: "Regulatory Impact Assessment", cadence: "monthly", description: "Analyze upcoming regulatory changes and assess organizational impact with recommended actions", priority: "high" },
      { name: "Research Productivity Report", cadence: "monthly", description: "Track research requests, turnaround times, utilization, and knowledge base growth", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Westlaw Edge", "LexisNexis", "Bloomberg Law", "vLex",
      "Casetext (CoCounsel)", "PACER", "Practical Law (Thomson Reuters)",
      "iManage", "Microsoft Office 365", "Slack"
    ],
    dataAccessPermissions: {
      legalResearchDatabases: "Full Access",
      caseMaterials: "Authorized — assigned matters only",
      regulatoryDocuments: "Full Access",
      clientFiles: "Restricted — attorney-supervised",
      contractRepository: "Authorized — research purposes",
      corporateRecords: "Authorized — research purposes",
      privilegedCommunications: "Restricted — attorney direction only"
    },
    communicationCapabilities: [
      "Attorney briefing and research delivery",
      "Regulatory alert distribution to affected departments",
      "Legal team knowledge sharing and precedent updates",
      "External counsel research coordination",
      "Management briefing on regulatory developments",
      "Litigation team research collaboration"
    ],
    exampleWorkflows: [
      {
        name: "Legal Research Request Fulfillment",
        steps: [
          "Receive research request with specific legal question and context",
          "Clarify scope, jurisdiction, and urgency with requesting attorney",
          "Develop research strategy identifying relevant databases and sources",
          "Conduct statutory and regulatory research in applicable jurisdictions",
          "Search for relevant case law, analyzing holdings and applicability",
          "Review secondary sources for scholarly analysis and commentary",
          "Draft research memorandum with analysis, conclusions, and citations",
          "Submit for attorney review and incorporate feedback"
        ]
      },
      {
        name: "Regulatory Change Analysis",
        steps: [
          "Identify new or proposed regulatory change from monitoring feeds",
          "Analyze rule text and compare against current regulatory requirements",
          "Assess impact on organizational operations and compliance obligations",
          "Research industry commentary and peer responses",
          "Draft impact analysis with compliance gap assessment",
          "Recommend action items and implementation timeline",
          "Brief legal team and affected business units",
          "Track implementation and compliance deadlines"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Research Turnaround Time", target: "< 24 hours for standard requests", weight: 20 },
      { metric: "Research Quality Score", target: "> 4.5/5.0 attorney rating", weight: 25 },
      { metric: "Citation Accuracy", target: "> 99%", weight: 15 },
      { metric: "Regulatory Alert Timeliness", target: "Within 24 hours of publication", weight: 15 },
      { metric: "Knowledge Base Currency", target: "Updated within 7 days of new precedent", weight: 10 },
      { metric: "Request Completion Rate", target: "> 95%", weight: 15 }
    ],
    useCases: [
      "AI-powered legal research with natural language query processing",
      "Automated regulatory monitoring with impact assessment",
      "Case law analysis and judicial trend identification",
      "Litigation research support with opposing counsel profiling",
      "Legal knowledge management and precedent database maintenance"
    ],
    personalityDefaults: {
      formality: 90, enthusiasm: 40, empathy: 40, directness: 75,
      creativity: 45, humor: 10, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["Attorney-Client Privilege", "Work Product Doctrine", "GDPR", "CCPA", "Professional Responsibility Rules", "Court Rules"],
      dataClassification: "Privileged & Confidential — Attorney Work Product",
      auditRequirements: "Research requests and deliverables tracked; privilege designations maintained",
      retentionPolicy: "Research files retained per matter retention schedule; knowledge base maintained indefinitely",
      breachNotification: "Immediate counsel notification for privilege breach or unauthorized access to case materials"
    },
    skillsTags: ["legal research", "case law analysis", "regulatory monitoring", "legal writing", "statutory analysis", "litigation support", "knowledge management", "due diligence", "legal technology"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Regulatory Affairs Manager AI",
    department: "Regulatory Affairs",
    category: "Legal & Compliance",
    industry: "Legal Services",
    reportsTo: "VP of Regulatory Affairs",
    seniorityLevel: "senior",
    description: "Manages the organization's regulatory affairs program, coordinating submissions, maintaining licenses and registrations, and ensuring ongoing compliance with industry-specific regulatory requirements. Serves as the primary liaison with regulatory agencies and manages the regulatory change management process.",
    coreResponsibilities: [
      "Manage regulatory submissions, filings, and approval processes",
      "Maintain licenses, registrations, and regulatory permits across jurisdictions",
      "Monitor regulatory changes and coordinate organizational response",
      "Serve as primary liaison with regulatory agencies and examiners",
      "Develop and maintain regulatory compliance policies and procedures",
      "Coordinate regulatory impact assessments for new products and services",
      "Manage regulatory examination and audit preparation",
      "Track regulatory enforcement trends and adjust compliance strategies",
      "Support product labeling, advertising, and marketing compliance review",
      "Report regulatory status and emerging risks to senior management"
    ],
    tasks: [
      { name: "Regulatory Filing Tracking", cadence: "daily", description: "Monitor pending regulatory filings, track submission deadlines, and manage approval workflows", priority: "critical" },
      { name: "Agency Communication Management", cadence: "daily", description: "Process incoming regulatory correspondence, prepare responses, and coordinate with internal stakeholders", priority: "high" },
      { name: "License Renewal Monitoring", cadence: "daily", description: "Track license and registration expiration dates, initiate renewal processes within required timeframes", priority: "high" },
      { name: "Regulatory Intelligence Scanning", cadence: "daily", description: "Scan regulatory bulletins, proposed rules, and enforcement actions across all applicable jurisdictions", priority: "high" },
      { name: "Submission Preparation", cadence: "weekly", description: "Coordinate document preparation, review, and formatting for upcoming regulatory submissions", priority: "high" },
      { name: "Compliance Attestation Coordination", cadence: "weekly", description: "Manage periodic compliance attestations and certifications across business units", priority: "medium" },
      { name: "Regulatory Change Implementation", cadence: "monthly", description: "Coordinate implementation of new regulatory requirements, track compliance milestones", priority: "high" },
      { name: "Regulatory Affairs Dashboard", cadence: "monthly", description: "Compile regulatory status report covering filings, approvals, examinations, and enforcement activity", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Veeva Vault RIM", "MasterControl Regulatory", "Wolters Kluwer Regulatory Solutions",
      "Thomson Reuters CLEAR", "RegTech Solutions", "Docket Alarm",
      "SharePoint", "DocuSign", "Microsoft Office 365", "Slack"
    ],
    dataAccessPermissions: {
      regulatoryFilings: "Full Access",
      licenseRecords: "Full Access",
      compliancePolicies: "Full Access",
      productDocumentation: "Authorized — regulatory review",
      financialReports: "Restricted — regulatory reporting only",
      legalDocuments: "Authorized — regulatory matters",
      employeeCredentials: "Restricted — licensing only",
      agencyCorrespondence: "Full Access"
    },
    communicationCapabilities: [
      "Regulatory agency formal and informal communication",
      "Executive reporting on regulatory status and emerging risks",
      "Cross-functional coordination for regulatory change implementation",
      "External counsel collaboration on regulatory strategy",
      "Business unit guidance on regulatory requirements",
      "Industry association participation and regulatory advocacy"
    ],
    exampleWorkflows: [
      {
        name: "Regulatory Submission Management",
        steps: [
          "Identify required regulatory submission and applicable deadline",
          "Assemble cross-functional team for document preparation",
          "Compile required data, documentation, and supporting materials",
          "Review submission for accuracy, completeness, and formatting",
          "Obtain internal approvals per delegation of authority",
          "Submit to regulatory agency via required channel",
          "Track submission status and respond to agency information requests",
          "Manage approval, conditional approval, or denial response"
        ]
      },
      {
        name: "Regulatory Examination Coordination",
        steps: [
          "Receive examination notification and scope from regulatory agency",
          "Brief executive team and establish examination coordination team",
          "Compile requested documents and prepare management responses",
          "Set up examiner workspace and access per information security protocols",
          "Coordinate examiner meetings with subject matter experts",
          "Manage real-time information requests during examination",
          "Review draft examination report and prepare management responses",
          "Develop and track corrective action plans for any findings"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Filing Deadline Compliance", target: "100% on-time submission", weight: 25 },
      { metric: "License Currency", target: "100% — no lapses", weight: 20 },
      { metric: "Regulatory Response Time", target: "< 48 hours for agency requests", weight: 15 },
      { metric: "Examination Finding Rate", target: "< 3 findings per exam", weight: 15 },
      { metric: "Regulatory Change Implementation", target: "100% by effective date", weight: 15 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "Automated regulatory deadline tracking and submission management",
      "Multi-jurisdiction license and registration management",
      "Regulatory change monitoring with automated impact assessment",
      "Examination preparation and coordination facilitation",
      "Regulatory intelligence analysis and strategic planning support"
    ],
    personalityDefaults: {
      formality: 90, enthusiasm: 40, empathy: 45, directness: 80,
      creativity: 30, humor: 10, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["SOX", "GDPR", "CCPA", "FCPA", "Industry-Specific Regulations", "State & Federal Licensing Laws", "Administrative Procedure Act"],
      dataClassification: "Confidential — Regulatory Privileged",
      auditRequirements: "All regulatory submissions and agency communications documented with complete audit trail",
      retentionPolicy: "Regulatory filings: permanent; correspondence: 10 years; examination records: 10 years",
      breachNotification: "Immediate VP notification; regulatory agency notification per applicable requirements"
    },
    skillsTags: ["regulatory affairs", "compliance management", "regulatory submissions", "licensing", "regulatory intelligence", "examination management", "policy development", "government relations"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Intellectual Property Coordinator AI",
    department: "Legal — IP",
    category: "Legal & Compliance",
    industry: "Legal Services",
    reportsTo: "IP Counsel",
    seniorityLevel: "mid",
    description: "Manages the organization's intellectual property portfolio including patents, trademarks, copyrights, and trade secrets. Coordinates IP filings and prosecution, monitors the competitive IP landscape, manages licensing agreements, and supports IP enforcement and defense activities.",
    coreResponsibilities: [
      "Manage patent, trademark, and copyright filing and prosecution workflows",
      "Maintain IP portfolio database with status tracking and deadline management",
      "Conduct IP landscape analysis and competitive intelligence monitoring",
      "Coordinate with outside patent and trademark counsel on prosecution matters",
      "Manage IP licensing agreements, royalty tracking, and compliance",
      "Monitor for potential IP infringement and coordinate enforcement responses",
      "Support IP due diligence for M&A and investment transactions",
      "Track IP-related costs, budgets, and return on IP investment",
      "Manage trade secret identification, classification, and protection programs",
      "Coordinate invention disclosure review and patent committee activities"
    ],
    tasks: [
      { name: "IP Deadline Management", cadence: "daily", description: "Monitor upcoming IP filing deadlines, office action response dates, maintenance fee due dates, and renewal deadlines", priority: "critical" },
      { name: "New Filing Coordination", cadence: "daily", description: "Process new invention disclosures, trademark applications, and copyright registrations through filing workflow", priority: "high" },
      { name: "Infringement Monitoring", cadence: "daily", description: "Scan market and patent databases for potential infringement of organization's IP rights", priority: "medium" },
      { name: "Office Action Response Coordination", cadence: "daily", description: "Coordinate responses to patent/trademark office actions with outside counsel", priority: "high" },
      { name: "Portfolio Status Report", cadence: "weekly", description: "Compile IP portfolio status including pending applications, granted rights, and prosecution progress", priority: "medium" },
      { name: "Licensing Compliance Review", cadence: "weekly", description: "Monitor IP licensing agreements for compliance, royalty payments, and usage restrictions", priority: "medium" },
      { name: "Competitive IP Analysis", cadence: "monthly", description: "Analyze competitor patent filings, trademark registrations, and IP strategy indicators", priority: "medium" },
      { name: "IP Budget & ROI Report", cadence: "monthly", description: "Track IP spending against budget, calculate IP portfolio value and ROI metrics", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Anaqua IP Management", "CPA Global (Clarivate)", "PatSnap",
      "Derwent Innovation", "CompuMark (Trademark)", "USPTO PAIR/TEAS",
      "WIPO IP Portal", "iManage", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      ipPortfolio: "Full Access",
      inventionDisclosures: "Full Access",
      licensingAgreements: "Full Access",
      outsideCounselFiles: "Authorized",
      financialData: "Restricted — IP costs and royalties",
      productDocumentation: "Authorized — IP-related review",
      tradeSecretRegistry: "Authorized — classification management",
      competitorIntelligence: "Full Access"
    },
    communicationCapabilities: [
      "Outside patent/trademark counsel coordination",
      "Inventor communication for disclosure and prosecution",
      "Management reporting on IP portfolio value and strategy",
      "Licensing counterparty communication",
      "IP committee facilitation and decision documentation",
      "Infringement notification and enforcement correspondence"
    ],
    exampleWorkflows: [
      {
        name: "Patent Application Filing",
        steps: [
          "Receive invention disclosure from R&D team",
          "Conduct preliminary patentability search",
          "Present disclosure to patent committee for filing decision",
          "If approved, assign to outside counsel for drafting",
          "Review and approve patent application draft",
          "File application with patent office (USPTO, EPO, etc.)",
          "Docket all deadlines and prosecution milestones",
          "Monitor prosecution and coordinate office action responses",
          "Track through grant or abandonment decision"
        ]
      },
      {
        name: "IP Infringement Response",
        steps: [
          "Detect potential infringement through monitoring or internal report",
          "Conduct preliminary infringement analysis",
          "Engage outside counsel for formal opinion",
          "Assess business impact and enforcement value",
          "Recommend enforcement strategy (cease & desist, licensing, litigation)",
          "Coordinate with business stakeholders on strategy approval",
          "Execute approved enforcement action",
          "Track resolution and update portfolio accordingly"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Filing Deadline Compliance", target: "100% — zero missed deadlines", weight: 25 },
      { metric: "Portfolio Growth Rate", target: "Per strategic plan targets", weight: 15 },
      { metric: "Prosecution Cycle Time", target: "Within benchmark for technology area", weight: 10 },
      { metric: "Licensing Revenue Tracking", target: "100% royalties collected on time", weight: 15 },
      { metric: "Infringement Detection Rate", target: "> 90% of significant infringements identified", weight: 15 },
      { metric: "IP Cost Management", target: "Within 5% of budget", weight: 10 },
      { metric: "Disclosure Processing Time", target: "< 30 days to committee review", weight: 10 }
    ],
    useCases: [
      "Automated IP deadline management and prosecution workflow coordination",
      "AI-powered patent landscape analysis and competitive intelligence",
      "IP portfolio valuation and strategic planning support",
      "Licensing agreement management with automated royalty tracking",
      "Infringement detection through automated market and patent monitoring"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 45, empathy: 40, directness: 75,
      creativity: 50, humor: 10, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["Patent Cooperation Treaty (PCT)", "Paris Convention", "Berne Convention", "TRIPS Agreement", "GDPR", "CCPA", "Trade Secret Laws (DTSA, UTSA)"],
      dataClassification: "Confidential — IP Privileged & Trade Secret",
      auditRequirements: "Complete prosecution history maintained; trade secret access logged per classification",
      retentionPolicy: "IP records retained for life of IP right + 7 years; trade secret records retained indefinitely while active",
      breachNotification: "Immediate IP Counsel notification for trade secret exposure or unauthorized IP disclosure"
    },
    skillsTags: ["intellectual property", "patent management", "trademark prosecution", "IP licensing", "competitive intelligence", "portfolio management", "trade secrets", "IP strategy", "legal technology"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Litigation Support Specialist AI",
    department: "Legal",
    category: "Legal & Compliance",
    industry: "Legal Services",
    reportsTo: "Litigation Counsel",
    seniorityLevel: "mid",
    description: "Provides comprehensive support for litigation and dispute resolution matters, including e-discovery management, document review coordination, deposition preparation, trial support, and case management. Manages litigation hold processes, coordinates with outside counsel, and maintains case databases and trial preparation materials.",
    coreResponsibilities: [
      "Manage e-discovery processes including collection, processing, and review",
      "Coordinate document review projects with review teams and outside counsel",
      "Administer litigation hold notices and custodian compliance tracking",
      "Prepare deposition outlines, witness files, and exhibit packages",
      "Maintain case management databases and matter tracking systems",
      "Support trial preparation with exhibit management and presentation",
      "Coordinate with forensic experts and e-discovery vendors",
      "Track litigation budgets, accruals, and outside counsel spending",
      "Prepare case chronologies, fact summaries, and key document lists",
      "Manage privilege review and privilege log preparation"
    ],
    tasks: [
      { name: "Case Status Tracking", cadence: "daily", description: "Update case management system with new developments, deadlines, and action items across active matters", priority: "high" },
      { name: "Discovery Deadline Management", cadence: "daily", description: "Monitor discovery deadlines, production schedules, and court-ordered dates across all matters", priority: "critical" },
      { name: "Document Review Coordination", cadence: "daily", description: "Manage active document review projects, track reviewer progress, quality metrics, and escalations", priority: "high" },
      { name: "Litigation Hold Administration", cadence: "daily", description: "Process new holds, send reminders, track custodian acknowledgments, release expired holds", priority: "high" },
      { name: "Outside Counsel Coordination", cadence: "weekly", description: "Coordinate with outside counsel on case strategy, document production, and scheduling", priority: "high" },
      { name: "Budget & Spend Tracking", cadence: "weekly", description: "Review outside counsel invoices, track spending against budgets, flag overruns", priority: "medium" },
      { name: "Case Portfolio Report", cadence: "monthly", description: "Compile litigation portfolio status including exposure assessment, budget tracking, and case progression", priority: "high" },
      { name: "eDiscovery Vendor Management", cadence: "monthly", description: "Review vendor performance, negotiate rates, and evaluate new technology solutions", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Relativity (eDiscovery)", "Concordance", "Nuix",
      "Logikcull", "Everlaw", "CaseMap/TextMap",
      "Legal Tracker (Thomson Reuters)", "iManage", "TrialDirector", "Slack"
    ],
    dataAccessPermissions: {
      caseFiles: "Full Access — assigned matters",
      discoveryDocuments: "Full Access — with privilege controls",
      privilegedCommunications: "Authorized — under attorney supervision",
      financialData: "Restricted — litigation budget only",
      employeeRecords: "Restricted — case-relevant only",
      clientFiles: "Authorized — case-specific",
      outsideCounselBilling: "Full Access",
      courtFilings: "Full Access"
    },
    communicationCapabilities: [
      "Outside counsel coordination and case management",
      "Court filing and service of process coordination",
      "Witness communication for deposition preparation",
      "Opposing counsel discovery correspondence",
      "Management reporting on litigation portfolio",
      "Vendor coordination for e-discovery and forensics"
    ],
    exampleWorkflows: [
      {
        name: "eDiscovery Project Management",
        steps: [
          "Receive discovery requests and analyze scope",
          "Identify custodians and data sources for collection",
          "Issue preservation and collection directives",
          "Coordinate data collection with IT and custodians",
          "Process collected data through eDiscovery platform",
          "Apply search terms, filters, and AI-assisted prioritization",
          "Manage document review with quality control protocols",
          "Prepare privilege log and withhold privileged documents",
          "Produce responsive documents in court-ordered format",
          "Document chain of custody and processing methodology"
        ]
      },
      {
        name: "Trial Preparation Support",
        steps: [
          "Compile trial exhibit list with supporting documents",
          "Prepare exhibit binders for attorneys and witnesses",
          "Create case chronology and key facts timeline",
          "Assemble witness files with prior testimony and key documents",
          "Set up courtroom technology for electronic presentation",
          "Prepare deposition clips and demonstrative exhibits",
          "Coordinate witness logistics and scheduling",
          "Manage real-time trial support and document retrieval"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Discovery Deadline Compliance", target: "100% on-time productions", weight: 25 },
      { metric: "Document Review Throughput", target: "Within project timeline", weight: 15 },
      { metric: "Privilege Review Accuracy", target: "> 99% — zero inadvertent disclosures", weight: 20 },
      { metric: "Litigation Hold Compliance", target: "100% custodian acknowledgment", weight: 15 },
      { metric: "Budget Variance", target: "Within 10% of approved budget", weight: 10 },
      { metric: "Case Database Accuracy", target: "> 98%", weight: 10 },
      { metric: "eDiscovery Cost Efficiency", target: "10% YoY cost reduction", weight: 5 }
    ],
    useCases: [
      "AI-assisted document review with predictive coding and continuous active learning",
      "Automated litigation hold management with compliance tracking",
      "Case management with intelligent deadline tracking and alert systems",
      "eDiscovery project management with cost optimization analytics",
      "Trial preparation support with electronic exhibit management"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 40, directness: 80,
      creativity: 35, humor: 10, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["Federal Rules of Civil Procedure", "Federal Rules of Evidence", "Attorney-Client Privilege", "Work Product Doctrine", "GDPR", "CCPA", "Sedona Principles (eDiscovery)"],
      dataClassification: "Privileged & Confidential — Litigation Work Product",
      auditRequirements: "Complete chain of custody for all evidence; privilege log maintained; processing methodology documented",
      retentionPolicy: "Case files retained per matter close + 7 years; hold documents per litigation hold requirements",
      breachNotification: "Immediate counsel notification for privilege breach or evidence spoliation risk"
    },
    skillsTags: ["litigation support", "eDiscovery", "document review", "case management", "trial preparation", "legal project management", "privilege review", "legal technology", "forensics coordination"],
    priceMonthly: 1099,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  INSURANCE & RISK MANAGEMENT (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Claims Processing Analyst AI",
    department: "Claims",
    category: "Insurance & Risk Management",
    industry: "Insurance",
    reportsTo: "Claims Director",
    seniorityLevel: "mid",
    description: "Manages insurance claims processing from first notice of loss through resolution, including investigation, coverage determination, reserve setting, and settlement. Ensures timely and accurate claim adjudication while maintaining compliance with regulatory requirements and company guidelines.",
    coreResponsibilities: [
      "Process first notice of loss (FNOL) and initiate claim files",
      "Investigate claims through documentation review, interviews, and inspections",
      "Determine coverage applicability under policy terms and conditions",
      "Set and adjust claim reserves based on exposure and development",
      "Negotiate and authorize claim settlements within authority limits",
      "Manage vendor relationships for appraisals, repairs, and medical evaluations",
      "Identify potential fraud indicators and refer suspicious claims for SIU review",
      "Ensure compliance with state-specific claims handling regulations",
      "Track claims to resolution and manage diary/follow-up systems",
      "Generate claims reports and analytics for management review"
    ],
    tasks: [
      { name: "FNOL Processing", cadence: "daily", description: "Process incoming claims notifications, verify policy coverage, assign claims, and initiate investigation workflows", priority: "high" },
      { name: "Claims Investigation", cadence: "daily", description: "Review documentation, conduct interviews, request additional evidence, and analyze coverage questions", priority: "high" },
      { name: "Reserve Management", cadence: "daily", description: "Set initial reserves and review/adjust reserves based on new information and claim development", priority: "high" },
      { name: "Settlement Processing", cadence: "daily", description: "Evaluate settlement offers, negotiate with claimants/attorneys, and process approved payments", priority: "high" },
      { name: "Fraud Screening", cadence: "daily", description: "Screen claims against fraud indicators, flag suspicious patterns, and refer to SIU as appropriate", priority: "medium" },
      { name: "Regulatory Compliance Check", cadence: "weekly", description: "Verify claims handling timelines meet state regulatory requirements, flag overdue actions", priority: "high" },
      { name: "Claims Dashboard", cadence: "weekly", description: "Compile claims metrics including open inventory, cycle time, severity trends, and closure rates", priority: "medium" },
      { name: "Loss Development Analysis", cadence: "monthly", description: "Analyze claim development patterns, reserve adequacy, and ultimate loss projections by line of business", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Guidewire ClaimCenter", "Duck Creek Claims", "Majesco Claims",
      "LexisNexis CLUE", "ISO ClaimSearch", "Mitchell WorkCenter",
      "Verisk Analytics", "Xactimate", "Salesforce", "Slack"
    ],
    dataAccessPermissions: {
      claimFiles: "Full Access",
      policyData: "Full Access",
      claimantInformation: "Full Access",
      medicalRecords: "Authorized — claim-related only",
      financialReserves: "Full Access",
      vendorReports: "Full Access",
      fraudIntelligence: "Authorized",
      reinsuranceRecords: "Restricted — large loss only"
    },
    communicationCapabilities: [
      "Claimant/insured communication for claim status and documentation",
      "Attorney and adjuster correspondence for represented claims",
      "Vendor coordination for appraisals, repairs, and examinations",
      "SIU referral communication and investigation coordination",
      "Reinsurance notification for large or catastrophic losses",
      "State DOI communication for regulatory inquiries"
    ],
    exampleWorkflows: [
      {
        name: "Claim Adjudication Process",
        steps: [
          "Receive FNOL and create claim file in claims system",
          "Verify policy in force and applicable coverage",
          "Assign claim to appropriate handler based on type and complexity",
          "Conduct coverage analysis against policy terms",
          "Investigate facts: collect statements, documents, and evidence",
          "Set initial reserve based on investigation findings",
          "Determine liability and coverage applicability",
          "Negotiate settlement with claimant or counsel",
          "Process payment and close claim file",
          "Archive file per retention requirements"
        ]
      },
      {
        name: "Catastrophe Claims Response",
        steps: [
          "Activate catastrophe response protocol based on event declaration",
          "Deploy field adjusters and set up temporary claims offices",
          "Process surge FNOL volume with expedited intake procedures",
          "Triage claims by severity and prioritize vulnerable policyholders",
          "Coordinate vendor response for emergency mitigation and repairs",
          "Issue advance payments for immediate needs",
          "Track catastrophe claim inventory and financial exposure",
          "Report to reinsurers and regulators as required"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Average Claim Cycle Time", target: "< 30 days for standard claims", weight: 20 },
      { metric: "Claims Accuracy Rate", target: "> 97%", weight: 15 },
      { metric: "Reserve Adequacy", target: "Within 10% of ultimate", weight: 15 },
      { metric: "Customer Satisfaction", target: "> 4.2/5.0", weight: 15 },
      { metric: "Fraud Detection Rate", target: "> 85% of suspicious claims identified", weight: 15 },
      { metric: "Regulatory Compliance", target: "100% — zero violations", weight: 10 },
      { metric: "Litigation Rate", target: "< 5% of closed claims", weight: 10 }
    ],
    useCases: [
      "Automated FNOL intake with intelligent claim triage and routing",
      "AI-powered fraud detection with pattern recognition and scoring",
      "Predictive reserve setting using historical loss development data",
      "Automated regulatory compliance monitoring for claims handling timelines",
      "Catastrophe response management with surge capacity coordination"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 40, empathy: 70, directness: 75,
      creativity: 30, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["State Insurance Regulations", "NAIC Model Laws", "Fair Claims Settlement Practices", "GDPR", "CCPA", "Anti-Fraud Statutes", "Unfair Trade Practices Acts"],
      dataClassification: "Confidential — PII & PHI (medical claims)",
      auditRequirements: "Complete claims diary documented; all settlement authority documented; regulatory timelines tracked",
      retentionPolicy: "Claims files retained for statute of limitations + 5 years; catastrophe claims: 10 years",
      breachNotification: "Immediate management notification; state DOI notification per applicable data breach laws"
    },
    skillsTags: ["claims management", "investigation", "coverage analysis", "reserve management", "settlement negotiation", "fraud detection", "regulatory compliance", "catastrophe response", "vendor management"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Underwriting Assistant AI",
    department: "Underwriting",
    category: "Insurance & Risk Management",
    industry: "Insurance",
    reportsTo: "Chief Underwriting Officer",
    seniorityLevel: "mid",
    description: "Supports the underwriting process by analyzing risk submissions, gathering and verifying information, applying rating algorithms, preparing quotes, and managing the policy issuance workflow. Evaluates risk characteristics, applies underwriting guidelines, and ensures accurate pricing and policy documentation.",
    coreResponsibilities: [
      "Analyze risk submissions and gather supplementary underwriting information",
      "Apply underwriting guidelines, rating algorithms, and pricing models",
      "Prepare quotes, proposals, and policy documentation",
      "Conduct loss history analysis and experience rating calculations",
      "Verify applicant information through third-party data sources",
      "Manage new business, renewal, and endorsement workflows",
      "Coordinate with agents/brokers on submissions and binding",
      "Identify risks requiring referral to senior underwriters or specialties",
      "Monitor portfolio composition and accumulation exposure",
      "Track underwriting performance metrics and hit ratios"
    ],
    tasks: [
      { name: "Submission Processing", cadence: "daily", description: "Review incoming submissions, gather required information, perform initial risk assessment and triage", priority: "high" },
      { name: "Quote Preparation", cadence: "daily", description: "Apply rating models, calculate premiums, prepare coverage proposals, and issue quotes to agents/brokers", priority: "high" },
      { name: "Renewal Processing", cadence: "daily", description: "Review upcoming renewals, analyze loss experience, recommend renewal terms, and prepare renewal offers", priority: "high" },
      { name: "Third-Party Data Verification", cadence: "daily", description: "Order and review inspection reports, MVRs, credit reports, and loss history from third-party vendors", priority: "medium" },
      { name: "Policy Issuance", cadence: "daily", description: "Process bound policies, verify accuracy of all documentation, and issue policy packages", priority: "medium" },
      { name: "Referral Queue Management", cadence: "weekly", description: "Review referred risks with senior underwriters, document decisions and rationale", priority: "high" },
      { name: "Portfolio Monitoring", cadence: "weekly", description: "Analyze book of business composition, identify concentration risks and profitability trends", priority: "medium" },
      { name: "Underwriting Performance Report", cadence: "monthly", description: "Compile underwriting metrics including hit ratios, premium adequacy, and loss ratios by segment", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Guidewire PolicyCenter", "Duck Creek Policy", "Majesco Policy",
      "LexisNexis Risk Solutions", "Verisk Underwriting Solutions", "ISO Rating",
      "A.M. Best", "CoreLogic", "Salesforce", "Slack"
    ],
    dataAccessPermissions: {
      applicantData: "Full Access",
      policyData: "Full Access",
      ratingAlgorithms: "Full Access",
      lossHistory: "Full Access",
      thirdPartyReports: "Full Access",
      reinsuranceTerms: "Authorized",
      claimsData: "Authorized — loss analysis",
      financialData: "Restricted — premium and commission only"
    },
    communicationCapabilities: [
      "Agent/broker communication for submissions, quotes, and binding",
      "Applicant outreach for additional information and documentation",
      "Reinsurance coordination for facultative placements",
      "Internal referral communication with senior underwriters",
      "Management reporting on portfolio and performance metrics",
      "Vendor coordination for inspection and verification services"
    ],
    exampleWorkflows: [
      {
        name: "New Business Underwriting",
        steps: [
          "Receive submission from agent/broker",
          "Verify completeness and request missing information",
          "Order third-party reports (loss runs, inspections, credit)",
          "Analyze risk characteristics against underwriting guidelines",
          "Apply rating model and calculate premium",
          "Determine appropriate terms, conditions, and exclusions",
          "Prepare and issue quote to agent/broker",
          "Track quote through negotiation and binding decision",
          "If bound, initiate policy issuance workflow"
        ]
      },
      {
        name: "Renewal Underwriting",
        steps: [
          "Identify policies approaching renewal (90/60/30 day windows)",
          "Pull current policy data, loss history, and experience",
          "Analyze loss development and frequency/severity trends",
          "Calculate experience modification and renewal pricing",
          "Assess portfolio impact and accumulation considerations",
          "Prepare renewal offer with updated terms and premium",
          "Coordinate with agent/broker for renewal negotiation",
          "Process renewal binding and policy issuance"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Quote Turnaround Time", target: "< 48 hours for standard risks", weight: 20 },
      { metric: "Hit Ratio", target: "> 30% (quotes to bound)", weight: 15 },
      { metric: "Premium Adequacy", target: "Loss ratio within target range", weight: 20 },
      { metric: "Underwriting Accuracy", target: "> 98% error-free policies", weight: 15 },
      { metric: "Renewal Retention Rate", target: "> 85%", weight: 15 },
      { metric: "Guideline Compliance", target: "100%", weight: 10 },
      { metric: "Referral Appropriateness", target: "> 90% correctly referred", weight: 5 }
    ],
    useCases: [
      "Automated submission intake with intelligent risk classification",
      "AI-enhanced risk scoring and pricing optimization",
      "Predictive underwriting using alternative data sources",
      "Renewal optimization with experience-based pricing models",
      "Portfolio management with accumulation monitoring and exposure analysis"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 45, empathy: 45, directness: 80,
      creativity: 35, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["State Insurance Regulations", "NAIC Guidelines", "Rate Filing Requirements", "Unfair Discrimination Laws", "GDPR", "CCPA", "FCRA"],
      dataClassification: "Confidential — PII & Financial Data",
      auditRequirements: "Underwriting decisions documented with rationale; rating calculations auditable; referral decisions tracked",
      retentionPolicy: "Underwriting files retained for policy term + 7 years; declined submissions: 3 years",
      breachNotification: "Immediate management notification; state DOI notification per applicable requirements"
    },
    skillsTags: ["underwriting", "risk assessment", "insurance rating", "pricing", "policy administration", "loss analysis", "portfolio management", "agent relations", "regulatory compliance"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Policy Administration Specialist AI",
    department: "Policy Services",
    category: "Insurance & Risk Management",
    industry: "Insurance",
    reportsTo: "Policy Administration Manager",
    seniorityLevel: "junior",
    description: "Manages insurance policy lifecycle administration including issuance, endorsements, renewals, cancellations, and reinstatements. Ensures accurate policy documentation, premium calculations, and compliance with regulatory requirements while providing efficient service to agents, brokers, and policyholders.",
    coreResponsibilities: [
      "Process new policy issuance with accurate documentation and coverage",
      "Handle policy endorsements, modifications, and mid-term changes",
      "Process policy cancellations, non-renewals, and reinstatements",
      "Calculate and process premium adjustments and return premiums",
      "Maintain accurate policyholder records and contact information",
      "Generate policy documents, declarations pages, and certificates",
      "Respond to agent and policyholder service inquiries",
      "Ensure compliance with state-specific policy form requirements",
      "Manage policy audit processes for adjustable premium programs",
      "Track and process commission calculations for agents/brokers"
    ],
    tasks: [
      { name: "Policy Issuance Processing", cadence: "daily", description: "Process bound new business, verify accuracy of all policy data, generate and distribute policy packages", priority: "high" },
      { name: "Endorsement Processing", cadence: "daily", description: "Process policy change requests, calculate premium adjustments, issue endorsement documentation", priority: "high" },
      { name: "Cancellation & Reinstatement", cadence: "daily", description: "Process cancellation requests, calculate return premiums, handle reinstatement requests per guidelines", priority: "high" },
      { name: "Certificate Issuance", cadence: "daily", description: "Generate certificates of insurance and evidence of coverage per policyholder/third-party requests", priority: "medium" },
      { name: "Service Inquiry Response", cadence: "daily", description: "Respond to agent and policyholder inquiries regarding coverage, billing, and policy status", priority: "medium" },
      { name: "Renewal Processing", cadence: "weekly", description: "Process policy renewals, generate renewal documents, and distribute to agents for delivery", priority: "high" },
      { name: "Quality Audit", cadence: "weekly", description: "Conduct quality audits on processed transactions for accuracy and compliance", priority: "medium" },
      { name: "Compliance Report", cadence: "monthly", description: "Generate reports on policy form usage, state compliance, and processing metrics", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Guidewire PolicyCenter", "Duck Creek Policy", "Majesco Policy",
      "ISCS SilverLink", "Applied Epic", "AMS360",
      "DocuSign", "Oracle Insurance Policy Admin", "JIRA", "Slack"
    ],
    dataAccessPermissions: {
      policyData: "Full Access",
      policyholderRecords: "Full Access",
      premiumCalculations: "Full Access",
      agentCommissions: "Authorized",
      claimsData: "Restricted — policy reference only",
      billingRecords: "Authorized — policy-related",
      policyForms: "Full Access",
      regulatoryFilings: "Restricted — policy forms only"
    },
    communicationCapabilities: [
      "Agent/broker communication for policy servicing and documentation",
      "Policyholder correspondence for policy changes and certificates",
      "Underwriting coordination for endorsement approvals",
      "Billing department coordination for premium adjustments",
      "Regulatory communication for policy form compliance",
      "Automated policy document distribution"
    ],
    exampleWorkflows: [
      {
        name: "Policy Endorsement Processing",
        steps: [
          "Receive endorsement request from agent or policyholder",
          "Verify policy status and eligibility for requested change",
          "Determine if endorsement requires underwriting approval",
          "Calculate premium adjustment for coverage change",
          "Generate endorsement documentation with updated terms",
          "Process premium adjustment in billing system",
          "Issue updated declarations page and endorsement",
          "Distribute documents to agent and policyholder"
        ]
      },
      {
        name: "Policy Cancellation & Reinstatement",
        steps: [
          "Receive cancellation request or non-payment notice",
          "Verify cancellation reason and applicable regulatory requirements",
          "Calculate pro-rata or short-rate return premium",
          "Issue cancellation notice per state-required timeframes",
          "Process cancellation effective date in policy system",
          "For reinstatement requests: verify eligibility and conditions",
          "Process reinstatement with any applicable fees or coverage gaps",
          "Update all records and notify affected parties"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Processing Turnaround Time", target: "< 24 hours for standard transactions", weight: 20 },
      { metric: "Processing Accuracy", target: "> 99%", weight: 25 },
      { metric: "Certificate Issuance Time", target: "< 4 hours", weight: 10 },
      { metric: "Compliance Rate", target: "100% state form compliance", weight: 15 },
      { metric: "Agent Satisfaction", target: "> 4.3/5.0", weight: 15 },
      { metric: "Backlog Management", target: "< 1 day aged items", weight: 10 },
      { metric: "Query Response Time", target: "< 2 hours", weight: 5 }
    ],
    useCases: [
      "Automated policy issuance with rule-based documentation generation",
      "Self-service endorsement processing for standard modifications",
      "Intelligent certificate of insurance generation and distribution",
      "Automated compliance checking for state-specific form requirements",
      "Policy lifecycle analytics and processing efficiency optimization"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 55, directness: 75,
      creativity: 25, humor: 20, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["State Insurance Regulations", "NAIC Model Laws", "Policy Form Filing Requirements", "GDPR", "CCPA", "Cancellation Notice Requirements"],
      dataClassification: "Confidential — PII & Policy Data",
      auditRequirements: "All policy transactions logged with user, timestamp, and business justification",
      retentionPolicy: "Policy documents retained for policy term + 7 years; cancellation records: 5 years",
      breachNotification: "Immediate manager notification; state DOI notification per breach requirements"
    },
    skillsTags: ["policy administration", "insurance operations", "endorsement processing", "premium calculations", "compliance", "customer service", "document management", "billing coordination"],
    priceMonthly: 799,
    isActive: 1,
  },

  {
    title: "Actuarial Analysis Coordinator AI",
    department: "Actuarial",
    category: "Insurance & Risk Management",
    industry: "Insurance",
    reportsTo: "Chief Actuary",
    seniorityLevel: "senior",
    description: "Supports actuarial analysis including loss reserving, ratemaking, experience analysis, and capital modeling. Manages actuarial data pipelines, coordinates analysis projects, and produces actuarial reports that inform pricing decisions, reserve adequacy, and enterprise risk management strategies.",
    coreResponsibilities: [
      "Support loss reserving analysis using standard actuarial methodologies",
      "Coordinate ratemaking studies and pricing adequacy reviews",
      "Manage actuarial data collection, validation, and analysis pipelines",
      "Prepare loss development triangles and experience summaries",
      "Support regulatory rate filings with actuarial documentation",
      "Conduct experience analysis for renewal pricing and profitability review",
      "Coordinate catastrophe modeling and aggregate exposure analysis",
      "Prepare actuarial reports for management and regulatory purposes",
      "Support reinsurance program analysis and treaty negotiations",
      "Monitor industry loss trends and benchmarking data"
    ],
    tasks: [
      { name: "Data Quality Monitoring", cadence: "daily", description: "Validate incoming claims and premium data for actuarial analysis, flag data quality issues", priority: "high" },
      { name: "Loss Development Tracking", cadence: "daily", description: "Monitor claim development patterns against expected emergence, flag unusual development", priority: "medium" },
      { name: "Rate Adequacy Monitoring", cadence: "daily", description: "Track written premium, earned premium, and loss ratio trends against pricing targets", priority: "medium" },
      { name: "Triangle Updates", cadence: "weekly", description: "Update loss development triangles, paid and incurred, and run standard actuarial projections", priority: "high" },
      { name: "Experience Analysis", cadence: "weekly", description: "Analyze loss experience by line of business, state, and key rating variables", priority: "high" },
      { name: "Reserve Analysis Support", cadence: "monthly", description: "Prepare data and run actuarial reserving methods for quarterly reserve review", priority: "critical" },
      { name: "Rate Filing Support", cadence: "monthly", description: "Compile actuarial data and analysis for regulatory rate filing submissions", priority: "high" },
      { name: "Actuarial Dashboard", cadence: "monthly", description: "Produce comprehensive actuarial dashboard with reserve adequacy, pricing, and loss trends", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Arius (Milliman)", "ResQ (Willis Towers Watson)", "Emblem (Willis Towers Watson)",
      "AIR Touchstone", "RMS RiskLink", "SAS Analytics",
      "R/Python (actuarial packages)", "Microsoft Excel", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      claimsData: "Full Access — aggregate and detail",
      premiumData: "Full Access",
      policyData: "Full Access",
      reserveData: "Full Access",
      ratingAlgorithms: "Full Access",
      financialStatements: "Authorized — statutory and GAAP",
      reinsuranceData: "Full Access",
      industryBenchmarks: "Full Access"
    },
    communicationCapabilities: [
      "Actuarial committee and management presentations",
      "Underwriting team pricing guidance and support",
      "Regulatory communication for rate filing and examination support",
      "Reinsurance broker coordination for treaty analysis",
      "Finance team coordination for reserve and capital reporting",
      "External actuarial peer review coordination"
    ],
    exampleWorkflows: [
      {
        name: "Quarterly Reserve Review",
        steps: [
          "Extract and validate claims and premium data as of evaluation date",
          "Build loss development triangles (paid, incurred, reported counts)",
          "Apply actuarial methods: Chain Ladder, Bornhuetter-Ferguson, Cape Cod",
          "Select ultimate losses and IBNR by line and accident period",
          "Compare results across methods and prior evaluations",
          "Prepare actuarial reserve analysis report with selections and commentary",
          "Present to actuarial committee and management",
          "Document methodology and assumptions per actuarial standards"
        ]
      },
      {
        name: "Ratemaking Study",
        steps: [
          "Compile historical premium, exposure, and loss data",
          "Develop losses to ultimate and trend to prospective period",
          "Calculate loss costs by coverage and rating territory",
          "Determine expense provisions and profit/contingency loading",
          "Analyze rate relativities by key classification factors",
          "Calculate indicated rate change and credibility-weighted result",
          "Prepare actuarial memorandum for rate filing",
          "Support regulatory review and respond to examiner questions"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Reserve Accuracy", target: "Within 5% of ultimate development", weight: 25 },
      { metric: "Rate Filing Approval Rate", target: "> 90%", weight: 15 },
      { metric: "Data Quality Score", target: "> 98%", weight: 15 },
      { metric: "Analysis Delivery Timeliness", target: "Within 5 business days of data close", weight: 15 },
      { metric: "Loss Ratio Performance", target: "Within 2 points of pricing target", weight: 15 },
      { metric: "Actuarial Standard Compliance", target: "100%", weight: 10 },
      { metric: "Model Validation Pass Rate", target: "> 95%", weight: 5 }
    ],
    useCases: [
      "Automated loss development triangle generation and projection",
      "AI-enhanced reserving with multiple methodology comparison",
      "Predictive ratemaking using granular risk factor analysis",
      "Catastrophe exposure monitoring and aggregation management",
      "Real-time loss ratio monitoring with early warning indicators"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 35, directness: 85,
      creativity: 45, humor: 10, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["Actuarial Standards of Practice (ASOPs)", "NAIC SAP", "State Rate Filing Requirements", "Casualty Actuarial Society Standards", "SOX", "GDPR", "CCPA"],
      dataClassification: "Confidential — Actuarial & Financial Data",
      auditRequirements: "Actuarial memoranda per ASOP standards; methodology and assumptions fully documented",
      retentionPolicy: "Actuarial studies: 10 years; rate filings: permanent; reserve analyses: 10 years",
      breachNotification: "Immediate Chief Actuary notification for data integrity issues affecting reserve or pricing"
    },
    skillsTags: ["actuarial analysis", "loss reserving", "ratemaking", "catastrophe modeling", "statistical analysis", "insurance pricing", "regulatory filings", "data analytics", "risk quantification"],
    priceMonthly: 1499,
    isActive: 1,
  },

  {
    title: "Insurance Compliance Monitor AI",
    department: "Compliance",
    category: "Insurance & Risk Management",
    industry: "Insurance",
    reportsTo: "Chief Compliance Officer",
    seniorityLevel: "senior",
    description: "Monitors and enforces regulatory compliance across insurance operations including market conduct, claims practices, underwriting guidelines, and producer licensing. Tracks state regulatory requirements across all operating jurisdictions, manages examination readiness, and ensures organizational adherence to insurance laws and regulations.",
    coreResponsibilities: [
      "Monitor insurance regulatory changes across all operating states",
      "Conduct market conduct self-assessments and compliance testing",
      "Manage producer licensing compliance and appointment tracking",
      "Ensure compliance with unfair claims settlement practices acts",
      "Track and report on regulatory examination findings and remediation",
      "Manage state filing requirements for rates, rules, and forms",
      "Oversee privacy and data protection compliance for insurance operations",
      "Coordinate with state departments of insurance on regulatory matters",
      "Develop and maintain insurance compliance policies and procedures",
      "Report compliance metrics and risks to senior management and board"
    ],
    tasks: [
      { name: "Regulatory Change Monitoring", cadence: "daily", description: "Scan state DOI bulletins, NAIC updates, and legislative changes across all operating jurisdictions", priority: "high" },
      { name: "Producer Licensing Verification", cadence: "daily", description: "Verify producer licenses and appointments, flag expirations, process new appointments", priority: "high" },
      { name: "Complaint Tracking", cadence: "daily", description: "Review and track DOI complaints, ensure timely response within state-mandated deadlines", priority: "high" },
      { name: "Filing Compliance Tracking", cadence: "daily", description: "Monitor rate, rule, and form filing deadlines, track approval status across states", priority: "high" },
      { name: "Market Conduct Testing", cadence: "weekly", description: "Execute scheduled compliance testing on claims, underwriting, and marketing practices", priority: "high" },
      { name: "Privacy Compliance Review", cadence: "weekly", description: "Audit data handling practices against privacy regulations (state insurance privacy, CCPA, etc.)", priority: "medium" },
      { name: "Compliance Dashboard", cadence: "monthly", description: "Compile multi-state compliance status report with risk ratings and remediation tracking", priority: "high" },
      { name: "Examination Readiness Assessment", cadence: "monthly", description: "Assess readiness for potential market conduct or financial examinations, address preparedness gaps", priority: "high" }
    ],
    toolsAndIntegrations: [
      "NIPR (Producer Licensing)", "SERFF (State Filing)", "Wolters Kluwer Insurance Compliance",
      "Perr&Knight Regulatory Solutions", "Vertafore Producer Manager",
      "SAI Global Compliance 360", "RegTech Solutions",
      "SharePoint", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      complianceReports: "Full Access",
      producerRecords: "Full Access",
      policyData: "Authorized — compliance review",
      claimsData: "Authorized — market conduct testing",
      customerComplaints: "Full Access",
      filingRecords: "Full Access",
      financialData: "Restricted — regulatory reporting",
      employeeRecords: "Restricted — licensing only"
    },
    communicationCapabilities: [
      "State DOI communication and examination coordination",
      "NAIC reporting and industry participation",
      "Internal compliance advisory to business units",
      "Board and management compliance reporting",
      "Producer communication for licensing compliance",
      "Regulatory complaint response coordination"
    ],
    exampleWorkflows: [
      {
        name: "Market Conduct Examination Response",
        steps: [
          "Receive examination notification from state DOI",
          "Analyze examination scope and information requests",
          "Brief executive team and assemble response team",
          "Compile requested files, data, and documentation",
          "Prepare management responses to prior examination findings",
          "Coordinate examiner access and information delivery",
          "Monitor examination progress and address real-time requests",
          "Review draft examination report and prepare management responses",
          "Develop corrective action plans for findings",
          "Track remediation and report completion to DOI"
        ]
      },
      {
        name: "Multi-State Regulatory Change Implementation",
        steps: [
          "Identify new regulation or model law adoption across states",
          "Map affected operations, products, and jurisdictions",
          "Assess compliance gaps against new requirements",
          "Develop implementation plan with state-specific timelines",
          "Coordinate policy, procedure, and system updates",
          "Deploy training to affected staff",
          "Verify implementation through compliance testing",
          "Document compliance and report to management"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Regulatory Compliance Rate", target: "100% across all states", weight: 25 },
      { metric: "DOI Complaint Response Time", target: "100% within state deadlines", weight: 15 },
      { metric: "Producer Licensing Compliance", target: "100% — zero unlicensed transactions", weight: 15 },
      { metric: "Filing Approval Rate", target: "> 95% first-submission approval", weight: 10 },
      { metric: "Examination Finding Remediation", target: "100% within agreed timeline", weight: 15 },
      { metric: "Market Conduct Test Pass Rate", target: "> 95%", weight: 10 },
      { metric: "Regulatory Change Implementation", target: "100% by effective date", weight: 10 }
    ],
    useCases: [
      "Multi-state regulatory monitoring with automated impact assessment",
      "Producer licensing compliance tracking and automated verification",
      "Market conduct self-assessment with risk-based testing programs",
      "State filing management across all operating jurisdictions",
      "Examination readiness monitoring and preparation automation"
    ],
    personalityDefaults: {
      formality: 90, enthusiasm: 35, empathy: 45, directness: 85,
      creativity: 25, humor: 10, assertiveness: 80
    },
    complianceMetadata: {
      frameworks: ["State Insurance Codes", "NAIC Model Laws & Regulations", "Unfair Trade Practices Acts", "Market Conduct Standards", "GDPR", "CCPA", "Producer Licensing Laws", "SOX"],
      dataClassification: "Confidential — Regulatory & Compliance Data",
      auditRequirements: "Market conduct testing documented per NAIC standards; examination responses archived; compliance decisions tracked",
      retentionPolicy: "Compliance records: 10 years; examination files: permanent; producer records: appointment term + 7 years",
      breachNotification: "Immediate CCO notification; state DOI notification per state data breach laws and insurance regulations"
    },
    skillsTags: ["insurance compliance", "market conduct", "regulatory affairs", "producer licensing", "state filing", "examination management", "NAIC standards", "privacy compliance", "multi-state regulation"],
    priceMonthly: 1399,
    isActive: 1,
  },
];
