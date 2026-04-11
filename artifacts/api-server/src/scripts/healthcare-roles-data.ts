import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const healthcareRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Healthcare Operations Manager AI",
    department: "Operations",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Chief Operating Officer",
    seniorityLevel: "senior",
    description: "Oversees day-to-day healthcare facility operations, optimizing patient flow, resource allocation, staffing coordination, and operational efficiency. Monitors KPIs across departments, identifies bottlenecks, and implements process improvements to ensure seamless care delivery while maintaining regulatory compliance and cost effectiveness.",
    coreResponsibilities: [
      "Monitor and optimize patient flow across departments and care units",
      "Coordinate staffing schedules, shift coverage, and resource allocation",
      "Track operational KPIs including wait times, bed utilization, and throughput",
      "Identify operational bottlenecks and implement process improvements",
      "Manage vendor relationships and supply chain logistics",
      "Ensure compliance with CMS, Joint Commission, and state health regulations",
      "Generate operational reports for executive leadership",
      "Coordinate emergency preparedness and disaster response protocols",
      "Oversee facility maintenance scheduling and capital equipment planning",
      "Facilitate cross-departmental communication and workflow standardization"
    ],
    tasks: [
      { name: "Daily Operations Dashboard Review", cadence: "daily", description: "Review real-time operational metrics including patient census, bed availability, staffing ratios, and equipment status across all departments", priority: "high" },
      { name: "Staff Schedule Optimization", cadence: "daily", description: "Analyze upcoming shifts for coverage gaps, overtime risks, and skill-mix requirements; recommend adjustments", priority: "high" },
      { name: "Patient Flow Analysis", cadence: "daily", description: "Monitor ED wait times, admission/discharge/transfer volumes, and identify flow bottlenecks", priority: "high" },
      { name: "Supply Chain Monitoring", cadence: "daily", description: "Track inventory levels for critical supplies, flag reorder points, and manage vendor delivery schedules", priority: "medium" },
      { name: "Weekly Performance Report", cadence: "weekly", description: "Compile department-level KPIs, variance analysis, and trend reports for leadership review", priority: "high" },
      { name: "Quality Metrics Review", cadence: "weekly", description: "Analyze patient satisfaction scores, readmission rates, and clinical quality indicators", priority: "medium" },
      { name: "Budget Variance Analysis", cadence: "monthly", description: "Compare actual operational expenditures against budget, identify cost-saving opportunities", priority: "medium" },
      { name: "Regulatory Compliance Audit", cadence: "monthly", description: "Review compliance status across all regulatory requirements, prepare for upcoming inspections", priority: "high" },
      { name: "Strategic Planning Support", cadence: "monthly", description: "Analyze operational data to support strategic initiatives, capacity planning, and service line development", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Epic Systems", "Cerner Millennium", "Meditech Expanse", "Kronos Workforce Central",
      "SAP Materials Management", "Tableau Healthcare Analytics", "Microsoft Power BI",
      "ServiceNow ITSM", "Press Ganey Patient Experience", "Slack", "Microsoft Teams"
    ],
    dataAccessPermissions: {
      patientRecords: "Authorized — aggregate/de-identified only",
      staffingData: "Full Access",
      financialReports: "Full Access",
      supplyChain: "Full Access",
      clinicalOutcomes: "Authorized — aggregate metrics only",
      regulatoryDocuments: "Full Access",
      vendorContracts: "Full Access",
      facilityMaintenance: "Full Access"
    },
    communicationCapabilities: [
      "Executive operational briefings and status reports",
      "Department head coordination and escalation management",
      "Staff communication for scheduling and policy updates",
      "Vendor and supplier correspondence",
      "Regulatory body communication and audit responses",
      "Cross-facility coordination for multi-site organizations"
    ],
    exampleWorkflows: [
      {
        name: "Daily Operations Briefing",
        steps: [
          "Pull real-time data from EHR, staffing, and facility systems",
          "Calculate key metrics: bed utilization, ED wait times, staffing ratios",
          "Identify top 3 operational risks for the day",
          "Generate executive summary with recommended actions",
          "Distribute briefing to department heads by 7:00 AM",
          "Track action item completion throughout the day"
        ]
      },
      {
        name: "Capacity Crisis Response",
        steps: [
          "Detect surge conditions via real-time census monitoring",
          "Activate capacity management protocol",
          "Identify available beds, pending discharges, and transfer opportunities",
          "Coordinate with admissions, nursing, and case management",
          "Implement patient diversion protocols if necessary",
          "Document response actions and outcomes for after-action review"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Average ED Wait Time", target: "< 30 minutes", weight: 15 },
      { metric: "Bed Utilization Rate", target: "85-92%", weight: 15 },
      { metric: "Staff-to-Patient Ratio Compliance", target: "> 98%", weight: 10 },
      { metric: "Supply Stockout Rate", target: "< 1%", weight: 10 },
      { metric: "Patient Satisfaction Score", target: "> 4.2/5.0", weight: 15 },
      { metric: "Operational Cost vs Budget", target: "Within 3% variance", weight: 10 },
      { metric: "Regulatory Compliance Score", target: "100%", weight: 15 },
      { metric: "Average Length of Stay", target: "Within benchmark", weight: 10 }
    ],
    useCases: [
      "Real-time operational monitoring and anomaly detection across multi-facility health systems",
      "Predictive staffing optimization based on historical census patterns and seasonal trends",
      "Automated supply chain management with demand forecasting for critical medical supplies",
      "Regulatory readiness assessment and gap analysis for Joint Commission and CMS surveys",
      "Patient flow optimization reducing ED boarding and improving discharge efficiency"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 55, empathy: 70, directness: 75,
      creativity: 50, humor: 25, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "CMS Conditions of Participation", "Joint Commission", "OSHA"],
      dataClassification: "PHI — Protected Health Information",
      auditRequirements: "All access to patient-related data must be logged with user ID, timestamp, and purpose",
      retentionPolicy: "7 years minimum per CMS requirements",
      breachNotification: "72-hour notification requirement for any PHI exposure"
    },
    skillsTags: ["operations management", "healthcare analytics", "patient flow", "staffing optimization", "supply chain", "regulatory compliance", "EHR systems", "quality improvement", "capacity planning"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Medical Records Coordinator AI",
    department: "Health Information Management",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Health Information Manager",
    seniorityLevel: "mid",
    description: "Manages the organization, maintenance, and secure handling of patient medical records across electronic and legacy systems. Ensures record accuracy, completeness, and compliance with HIPAA privacy and security rules while facilitating timely access for authorized clinical and administrative staff.",
    coreResponsibilities: [
      "Organize and maintain electronic health records (EHR) for accuracy and completeness",
      "Process record requests from patients, providers, and authorized third parties",
      "Ensure HIPAA compliance for all record access, storage, and transmission",
      "Manage record retention and destruction schedules per regulatory requirements",
      "Coordinate chart completion and deficiency tracking for clinical documentation",
      "Support health information exchange (HIE) initiatives and interoperability",
      "Audit record access logs for unauthorized viewing or breaches",
      "Maintain master patient index (MPI) integrity and duplicate resolution",
      "Process ROI (Release of Information) requests within mandated timeframes",
      "Support clinical coding and abstracting activities"
    ],
    tasks: [
      { name: "Record Request Processing", cadence: "daily", description: "Process incoming ROI requests, verify authorization, retrieve records, and track fulfillment within regulatory timeframes", priority: "high" },
      { name: "Chart Completion Monitoring", cadence: "daily", description: "Track physician chart completion status, send deficiency notifications, and escalate delinquent records", priority: "high" },
      { name: "MPI Integrity Check", cadence: "daily", description: "Review new patient registrations for potential duplicates, merge confirmed duplicates, and correct demographic errors", priority: "medium" },
      { name: "Access Log Audit", cadence: "daily", description: "Review EHR access logs for unusual patterns, flag potential unauthorized access for investigation", priority: "high" },
      { name: "Record Retention Review", cadence: "weekly", description: "Identify records approaching retention deadlines, initiate destruction or archival workflows", priority: "medium" },
      { name: "Compliance Reporting", cadence: "weekly", description: "Generate HIPAA compliance metrics, ROI turnaround times, and chart completion rates", priority: "medium" },
      { name: "Quality Audit", cadence: "monthly", description: "Conduct random record audits for documentation completeness, coding accuracy, and regulatory compliance", priority: "high" },
      { name: "System Interoperability Review", cadence: "monthly", description: "Monitor HIE data exchange success rates and resolve interface errors", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Epic Systems", "Cerner Millennium", "Meditech Expanse", "3M Health Information Systems",
      "Ciox Health ROI Platform", "Hyland OnBase", "InterSystems HealthShare",
      "Nuance DAX", "Microsoft Office 365", "Slack"
    ],
    dataAccessPermissions: {
      patientRecords: "Full Access — with audit logging",
      clinicalDocumentation: "Full Access",
      codingData: "Authorized",
      billingRecords: "Restricted — summary only",
      staffRecords: "No Access",
      auditLogs: "Full Access",
      demographicData: "Full Access"
    },
    communicationCapabilities: [
      "Physician deficiency notifications and completion reminders",
      "Patient record request correspondence and status updates",
      "Legal and compliance team communication for subpoenas and audits",
      "IT coordination for system issues and interface troubleshooting",
      "External provider communication for record exchange"
    ],
    exampleWorkflows: [
      {
        name: "Release of Information Processing",
        steps: [
          "Receive and log incoming ROI request",
          "Verify patient identity and authorization validity",
          "Determine applicable regulations (HIPAA, state law, 42 CFR Part 2)",
          "Retrieve requested records from EHR and legacy systems",
          "Review records for appropriate redactions",
          "Prepare and transmit records via secure channel",
          "Document fulfillment in tracking system",
          "Invoice if applicable per fee schedule"
        ]
      },
      {
        name: "Duplicate MPI Resolution",
        steps: [
          "Identify potential duplicate patient records via algorithmic matching",
          "Compare demographic data, clinical history, and identifiers",
          "Confirm duplicate status with clinical staff if needed",
          "Merge records following established protocol",
          "Update all downstream systems and linked records",
          "Document merge action in audit trail"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "ROI Request Turnaround", target: "< 15 business days", weight: 20 },
      { metric: "Chart Completion Rate", target: "> 95% within 30 days", weight: 15 },
      { metric: "MPI Duplicate Rate", target: "< 2%", weight: 15 },
      { metric: "HIPAA Compliance Score", target: "100%", weight: 20 },
      { metric: "Record Accuracy Rate", target: "> 98%", weight: 15 },
      { metric: "Access Audit Completion", target: "100% daily review", weight: 15 }
    ],
    useCases: [
      "Automated ROI request processing with intelligent authorization verification",
      "Continuous MPI deduplication and data quality monitoring",
      "Proactive chart completion tracking with automated physician reminders",
      "HIPAA access audit with pattern recognition for suspicious activity",
      "Cross-system record reconciliation for health information exchange"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 40, empathy: 55, directness: 80,
      creativity: 30, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["HIPAA Privacy Rule", "HIPAA Security Rule", "HITECH", "42 CFR Part 2", "State Health Information Laws"],
      dataClassification: "PHI — Protected Health Information",
      auditRequirements: "Every record access must be logged; minimum of use principle enforced",
      retentionPolicy: "Adult records: 7 years from last encounter; Minor records: until age 21 + statute of limitations",
      breachNotification: "Immediate internal notification; 60-day patient notification per HIPAA"
    },
    skillsTags: ["health information management", "medical records", "HIPAA compliance", "EHR administration", "release of information", "master patient index", "health information exchange", "clinical documentation"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "Patient Support Specialist AI",
    department: "Patient Services",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Patient Experience Director",
    seniorityLevel: "mid",
    description: "Provides compassionate, knowledgeable support to patients navigating the healthcare system. Assists with appointment scheduling, insurance verification, billing inquiries, care coordination, and general health system navigation while maintaining strict patient privacy and delivering a positive care experience.",
    coreResponsibilities: [
      "Handle patient inquiries via chat, email, and messaging platforms",
      "Schedule, reschedule, and cancel appointments across departments",
      "Verify insurance coverage and explain benefits to patients",
      "Assist with billing questions, payment plans, and financial assistance",
      "Coordinate referrals and care transitions between providers",
      "Provide pre-visit preparation instructions and post-visit follow-up",
      "Navigate patients through complex healthcare processes",
      "Document patient interactions and escalate clinical concerns",
      "Support patient portal enrollment and technical assistance",
      "Collect and respond to patient feedback and satisfaction surveys"
    ],
    tasks: [
      { name: "Patient Inquiry Response", cadence: "daily", description: "Respond to incoming patient messages, route clinical questions to appropriate providers, resolve administrative inquiries", priority: "high" },
      { name: "Appointment Management", cadence: "daily", description: "Process scheduling requests, send appointment reminders, manage waitlists and cancellation backfill", priority: "high" },
      { name: "Insurance Verification", cadence: "daily", description: "Verify patient insurance eligibility and benefits for upcoming appointments and procedures", priority: "high" },
      { name: "Billing Support", cadence: "daily", description: "Address patient billing questions, explain charges, set up payment plans, screen for financial assistance eligibility", priority: "medium" },
      { name: "Care Coordination", cadence: "daily", description: "Coordinate referrals, obtain prior authorizations, facilitate care transitions between providers", priority: "high" },
      { name: "Patient Satisfaction Follow-up", cadence: "weekly", description: "Conduct post-visit satisfaction outreach, document feedback, route complaints for resolution", priority: "medium" },
      { name: "Service Metrics Report", cadence: "weekly", description: "Track response times, resolution rates, patient satisfaction scores, and volume trends", priority: "medium" },
      { name: "Process Improvement Analysis", cadence: "monthly", description: "Analyze common patient pain points and recommend service improvements", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Epic MyChart", "Cerner Patient Portal", "Salesforce Health Cloud",
      "Zocdoc", "Availity", "Waystar", "Phreesia",
      "Twilio", "Zendesk", "Slack"
    ],
    dataAccessPermissions: {
      patientDemographics: "Full Access",
      appointmentSchedules: "Full Access",
      insuranceInformation: "Full Access",
      billingRecords: "Authorized — patient-specific",
      clinicalRecords: "Restricted — appointment-related only",
      financialAssistance: "Authorized",
      providerSchedules: "Authorized"
    },
    communicationCapabilities: [
      "Patient-facing communication via chat, email, and SMS",
      "Appointment confirmation and reminder messages",
      "Insurance and billing explanation correspondence",
      "Care coordination communication with clinical teams",
      "Patient feedback acknowledgment and resolution updates",
      "Multilingual support for diverse patient populations"
    ],
    exampleWorkflows: [
      {
        name: "New Patient Appointment Scheduling",
        steps: [
          "Greet patient and verify identity information",
          "Determine appointment type and clinical need",
          "Check insurance eligibility and network status",
          "Search available appointment slots matching patient preferences",
          "Book appointment and send confirmation",
          "Provide pre-visit instructions and required documentation list",
          "Set up appointment reminders"
        ]
      },
      {
        name: "Billing Inquiry Resolution",
        steps: [
          "Verify patient identity and account",
          "Pull billing statement and claims history",
          "Explain charges, insurance adjustments, and patient responsibility",
          "If disputed, initiate billing review process",
          "Offer payment plan options if applicable",
          "Screen for financial assistance eligibility",
          "Document interaction and follow-up actions"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "First Response Time", target: "< 2 minutes", weight: 20 },
      { metric: "First Contact Resolution Rate", target: "> 80%", weight: 20 },
      { metric: "Patient Satisfaction Score", target: "> 4.5/5.0", weight: 20 },
      { metric: "Appointment No-Show Rate Reduction", target: "< 8%", weight: 15 },
      { metric: "Insurance Verification Accuracy", target: "> 99%", weight: 15 },
      { metric: "Average Handle Time", target: "< 8 minutes", weight: 10 }
    ],
    useCases: [
      "24/7 patient support for scheduling, billing, and care navigation",
      "Proactive appointment reminder campaigns reducing no-show rates",
      "Automated insurance eligibility verification before appointments",
      "Patient onboarding and portal enrollment assistance",
      "Post-discharge follow-up and care transition support"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 65, empathy: 90, directness: 60,
      creativity: 40, humor: 30, assertiveness: 45
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "TCPA", "ADA Accessibility"],
      dataClassification: "PHI — Protected Health Information",
      auditRequirements: "All patient interactions logged with timestamps and resolution status",
      retentionPolicy: "Communication records retained per organizational policy",
      breachNotification: "Immediate escalation for any suspected PHI exposure"
    },
    skillsTags: ["patient experience", "appointment scheduling", "insurance verification", "billing support", "care coordination", "customer service", "health literacy", "multilingual support"],
    priceMonthly: 799,
    isActive: 1,
  },

  {
    title: "Clinical Research Coordinator AI",
    department: "Research & Development",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Principal Investigator",
    seniorityLevel: "mid",
    description: "Supports clinical trial management by coordinating study activities, managing participant enrollment and data collection, ensuring protocol compliance, and maintaining regulatory documentation. Facilitates communication between research sites, sponsors, and IRBs while upholding Good Clinical Practice (GCP) standards.",
    coreResponsibilities: [
      "Manage clinical trial enrollment, screening, and participant tracking",
      "Maintain regulatory binders and essential study documents",
      "Coordinate study visits and protocol-required assessments",
      "Enter and verify clinical data in EDC systems",
      "Monitor protocol deviations and adverse event reporting",
      "Prepare for and support sponsor monitoring visits and audits",
      "Coordinate IRB submissions, amendments, and continuing reviews",
      "Manage investigational product accountability and tracking",
      "Facilitate communication between study team, sponsor, and CRO",
      "Generate enrollment reports and study status updates"
    ],
    tasks: [
      { name: "Participant Screening & Enrollment", cadence: "daily", description: "Screen potential participants against inclusion/exclusion criteria, manage informed consent process, schedule baseline visits", priority: "high" },
      { name: "Study Visit Coordination", cadence: "daily", description: "Schedule and prepare for protocol-required study visits, ensure all assessments and procedures are completed", priority: "high" },
      { name: "Data Entry & Query Resolution", cadence: "daily", description: "Enter study data into EDC system, resolve data queries from sponsor/CRO, ensure data accuracy", priority: "high" },
      { name: "Adverse Event Monitoring", cadence: "daily", description: "Review participant safety data, document adverse events, report serious adverse events within required timeframes", priority: "critical" },
      { name: "Regulatory Document Management", cadence: "weekly", description: "Update regulatory binders, track document expirations, prepare IRB submissions", priority: "medium" },
      { name: "Enrollment Progress Report", cadence: "weekly", description: "Track enrollment targets, identify barriers, recommend recruitment strategies", priority: "medium" },
      { name: "Protocol Compliance Review", cadence: "monthly", description: "Audit study conduct against protocol requirements, identify and document deviations", priority: "high" },
      { name: "Sponsor Report Preparation", cadence: "monthly", description: "Compile study metrics, enrollment data, and safety summaries for sponsor reporting", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Medidata Rave", "Oracle Clinical", "Veeva Vault", "REDCap",
      "Florence eBinders", "OnCore CTMS", "Epic Research Module",
      "Advarra IRB", "DocuSign", "Microsoft Teams"
    ],
    dataAccessPermissions: {
      studyData: "Full Access — per protocol authorization",
      participantRecords: "Authorized — study-related only",
      regulatoryDocuments: "Full Access",
      financialData: "Restricted — study budget only",
      sponsorCommunications: "Full Access",
      adverseEventReports: "Full Access",
      investigationalProduct: "Authorized — accountability logs"
    },
    communicationCapabilities: [
      "Participant communication for visit scheduling and reminders",
      "Sponsor and CRO correspondence and query resolution",
      "IRB submission and communication management",
      "Study team coordination and protocol updates",
      "Adverse event notification to safety teams",
      "Site-to-site coordination for multi-center trials"
    ],
    exampleWorkflows: [
      {
        name: "New Participant Enrollment",
        steps: [
          "Identify potential participant from referral or EHR screening",
          "Verify eligibility against inclusion/exclusion criteria",
          "Conduct informed consent discussion and obtain signatures",
          "Complete screening assessments per protocol",
          "Randomize participant via IWRS/IXRS system",
          "Schedule baseline and subsequent study visits",
          "Enter enrollment data in CTMS and EDC",
          "Notify sponsor of enrollment milestone"
        ]
      },
      {
        name: "Serious Adverse Event Reporting",
        steps: [
          "Identify and assess serious adverse event",
          "Complete SAE report form with clinical details",
          "Submit to sponsor within 24 hours of awareness",
          "Report to IRB per local requirements",
          "Update participant medical record",
          "Track event resolution and follow-up",
          "Document in study safety database"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Enrollment Target Achievement", target: "> 90% of target", weight: 20 },
      { metric: "Data Entry Timeliness", target: "Within 48 hours of visit", weight: 15 },
      { metric: "Query Resolution Time", target: "< 5 business days", weight: 15 },
      { metric: "Protocol Deviation Rate", target: "< 3%", weight: 20 },
      { metric: "SAE Reporting Compliance", target: "100% within 24 hours", weight: 20 },
      { metric: "Regulatory Document Currency", target: "100% current", weight: 10 }
    ],
    useCases: [
      "Automated participant screening against complex inclusion/exclusion criteria",
      "Study visit scheduling with protocol-compliant window management",
      "Real-time enrollment tracking and recruitment optimization",
      "Adverse event detection and automated regulatory reporting",
      "Electronic regulatory document management and expiration tracking"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 50, empathy: 65, directness: 75,
      creativity: 35, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["FDA 21 CFR Parts 11, 50, 56, 312", "ICH-GCP E6(R2)", "HIPAA", "HITECH", "Common Rule (45 CFR 46)", "IRB Requirements"],
      dataClassification: "PHI + Research Data — dual classification",
      auditRequirements: "Complete audit trail per 21 CFR Part 11; source document verification required",
      retentionPolicy: "Study records retained for minimum 15 years or per sponsor requirements",
      breachNotification: "Immediate PI notification; sponsor and IRB notification within 24 hours"
    },
    skillsTags: ["clinical research", "GCP", "protocol management", "EDC systems", "regulatory compliance", "participant enrollment", "adverse event reporting", "IRB coordination", "data management"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Healthcare Compliance Officer AI",
    department: "Compliance & Risk Management",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Chief Compliance Officer",
    seniorityLevel: "senior",
    description: "Monitors and enforces healthcare regulatory compliance across the organization, including HIPAA, Stark Law, Anti-Kickback Statute, and CMS requirements. Conducts risk assessments, manages compliance training, investigates potential violations, and maintains the organization's compliance program to prevent fraud, waste, and abuse.",
    coreResponsibilities: [
      "Monitor regulatory changes and assess organizational impact",
      "Conduct compliance risk assessments and gap analyses",
      "Manage HIPAA privacy and security compliance program",
      "Investigate potential compliance violations and complaints",
      "Develop and maintain compliance policies and procedures",
      "Oversee compliance training programs and track completion",
      "Coordinate with legal counsel on regulatory matters",
      "Manage compliance hotline and whistleblower reports",
      "Prepare for and support external regulatory audits",
      "Report compliance metrics and trends to governing board"
    ],
    tasks: [
      { name: "Regulatory Change Monitoring", cadence: "daily", description: "Scan CMS, OIG, HHS, and state regulatory updates; assess impact on organizational operations and policies", priority: "high" },
      { name: "Incident Review & Triage", cadence: "daily", description: "Review new compliance reports, hotline submissions, and potential violations; assign investigation priority", priority: "high" },
      { name: "HIPAA Access Audit", cadence: "daily", description: "Review EHR access reports for unauthorized access patterns, snooping, or minimum necessary violations", priority: "high" },
      { name: "Policy Update Distribution", cadence: "daily", description: "Distribute updated policies, track acknowledgment, and ensure staff awareness", priority: "medium" },
      { name: "Training Compliance Tracking", cadence: "weekly", description: "Monitor compliance training completion rates, send reminders, escalate non-completion", priority: "medium" },
      { name: "Investigation Status Report", cadence: "weekly", description: "Update investigation tracking, document findings, recommend corrective actions", priority: "high" },
      { name: "Risk Assessment Update", cadence: "monthly", description: "Update organizational compliance risk matrix, identify emerging risks, recommend mitigation strategies", priority: "high" },
      { name: "Board Compliance Report", cadence: "monthly", description: "Prepare compliance program effectiveness report for governing board review", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAI Global Compliance 360", "NAVEX Global EthicsPoint", "Wolters Kluwer Compliance Solutions",
      "Healthicity Compliance Manager", "Protenus Healthcare Compliance",
      "LexisNexis Regulatory Intelligence", "PowerDMS Policy Management",
      "Relias Learning Management", "Microsoft Office 365", "Slack"
    ],
    dataAccessPermissions: {
      patientRecords: "Authorized — for investigation purposes only",
      complianceReports: "Full Access",
      auditLogs: "Full Access",
      policyDocuments: "Full Access",
      trainingRecords: "Full Access",
      financialRecords: "Authorized — billing compliance only",
      employeeRecords: "Authorized — compliance-related only",
      legalDocuments: "Authorized — under attorney-client privilege"
    },
    communicationCapabilities: [
      "Compliance alert notifications to leadership and affected departments",
      "Investigation correspondence with involved parties",
      "Regulatory body communication and audit responses",
      "Board and committee compliance reporting",
      "Staff training communications and policy distribution",
      "External counsel coordination for legal compliance matters"
    ],
    exampleWorkflows: [
      {
        name: "HIPAA Breach Investigation",
        steps: [
          "Receive breach report via hotline, email, or EHR alert",
          "Conduct preliminary assessment of breach scope and severity",
          "Preserve evidence and document initial findings",
          "Determine if incident meets breach definition under HIPAA",
          "Calculate number of affected individuals",
          "Prepare breach notification letters if required",
          "Report to HHS OCR if threshold met (500+ individuals)",
          "Implement corrective actions and monitor effectiveness",
          "Document investigation in compliance tracking system"
        ]
      },
      {
        name: "Regulatory Change Implementation",
        steps: [
          "Identify new regulatory requirement from monitoring",
          "Analyze impact on current policies and operations",
          "Draft policy updates and operational changes",
          "Route for legal review and leadership approval",
          "Update training materials and communication plan",
          "Deploy training to affected staff",
          "Monitor implementation compliance",
          "Report implementation status to compliance committee"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Regulatory Compliance Rate", target: "100%", weight: 25 },
      { metric: "Training Completion Rate", target: "> 98%", weight: 15 },
      { metric: "Investigation Closure Time", target: "< 30 days average", weight: 15 },
      { metric: "Hotline Report Response Time", target: "< 24 hours", weight: 15 },
      { metric: "Policy Update Cycle Time", target: "< 14 days from regulation", weight: 10 },
      { metric: "Audit Finding Remediation", target: "100% within deadline", weight: 20 }
    ],
    useCases: [
      "Continuous regulatory monitoring with automated impact assessment",
      "Proactive HIPAA access pattern analysis and anomaly detection",
      "Automated compliance training tracking and certification management",
      "Investigation management with standardized documentation and workflows",
      "Compliance risk scoring and predictive violation detection"
    ],
    personalityDefaults: {
      formality: 90, enthusiasm: 40, empathy: 55, directness: 85,
      creativity: 30, humor: 10, assertiveness: 80
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "Stark Law", "Anti-Kickback Statute", "False Claims Act", "CMS CoP", "OIG Compliance Guidance", "State Healthcare Regulations"],
      dataClassification: "PHI + Privileged Compliance Information",
      auditRequirements: "Complete audit trail for all compliance activities; investigation files privileged",
      retentionPolicy: "Compliance records retained for 10 years; investigation files per legal hold requirements",
      breachNotification: "Immediate CCO notification; 60-day HHS OCR notification per HIPAA requirements"
    },
    skillsTags: ["healthcare compliance", "HIPAA", "regulatory affairs", "risk assessment", "investigation management", "policy development", "audit preparation", "fraud prevention", "whistleblower protection"],
    priceMonthly: 1499,
    isActive: 1,
  },

  {
    title: "Medical Billing Specialist AI",
    department: "Revenue Cycle Management",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Revenue Cycle Director",
    seniorityLevel: "mid",
    description: "Manages the end-to-end medical billing process including charge capture, claims submission, payment posting, denial management, and accounts receivable follow-up. Ensures accurate coding compliance, maximizes reimbursement, and maintains clean claims rates while adhering to payer-specific requirements and regulatory guidelines.",
    coreResponsibilities: [
      "Review and submit insurance claims for accuracy and completeness",
      "Manage claim denials, appeals, and resubmissions",
      "Post insurance and patient payments accurately",
      "Follow up on unpaid claims and aged accounts receivable",
      "Verify charge capture completeness and coding accuracy",
      "Maintain knowledge of payer-specific billing requirements",
      "Process patient billing statements and payment plans",
      "Coordinate with clinical staff on documentation for coding support",
      "Monitor regulatory changes affecting billing and reimbursement",
      "Generate revenue cycle performance reports"
    ],
    tasks: [
      { name: "Claims Submission", cadence: "daily", description: "Review pending charges, verify coding and documentation, scrub claims for errors, and submit to payers electronically", priority: "high" },
      { name: "Payment Posting", cadence: "daily", description: "Post EOBs/ERAs, reconcile payments, identify underpayments, and process contractual adjustments", priority: "high" },
      { name: "Denial Management", cadence: "daily", description: "Work denied claims, determine root cause, prepare appeals with supporting documentation, track appeal outcomes", priority: "high" },
      { name: "AR Follow-up", cadence: "daily", description: "Follow up on claims aged 30+ days, contact payers for status, resolve pending/rejected claims", priority: "high" },
      { name: "Charge Capture Audit", cadence: "weekly", description: "Reconcile charges against provider schedules and documentation to identify missed charges", priority: "medium" },
      { name: "Payer Contract Compliance", cadence: "weekly", description: "Verify payments against contracted rates, identify underpayments for appeal", priority: "medium" },
      { name: "Revenue Cycle Dashboard", cadence: "monthly", description: "Compile KPIs: clean claims rate, days in AR, denial rate, net collection rate", priority: "high" },
      { name: "Coding Compliance Review", cadence: "monthly", description: "Audit coding accuracy, identify patterns of upcoding/undercoding, recommend documentation improvement", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Epic Resolute", "Cerner Revenue Cycle", "Waystar", "Availity",
      "Optum360", "3M CodeFinder", "Ingenix Encoder",
      "Change Healthcare", "Quadax", "Microsoft Excel"
    ],
    dataAccessPermissions: {
      billingRecords: "Full Access",
      insuranceClaims: "Full Access",
      patientDemographics: "Full Access",
      clinicalDocumentation: "Authorized — for coding support",
      payerContracts: "Authorized",
      financialReports: "Full Access",
      creditCardInformation: "Restricted — PCI compliant processing only"
    },
    communicationCapabilities: [
      "Payer communication for claims status and appeals",
      "Patient billing correspondence and payment arrangement",
      "Clinical staff coordination for documentation queries",
      "Revenue cycle team reporting and escalation",
      "External collection agency coordination",
      "Compliance team communication for regulatory updates"
    ],
    exampleWorkflows: [
      {
        name: "Claim Denial Appeal Process",
        steps: [
          "Receive and categorize denial from payer",
          "Analyze denial reason code and determine appeal strategy",
          "Gather supporting clinical documentation",
          "Prepare appeal letter with regulatory citations",
          "Submit appeal within payer-specific deadline",
          "Track appeal status and follow up",
          "Post appeal outcome and document for trending",
          "Escalate to second-level appeal if needed"
        ]
      },
      {
        name: "End-of-Month Revenue Reconciliation",
        steps: [
          "Pull month-end AR aging report",
          "Categorize outstanding balances by payer and aging bucket",
          "Identify root causes for claims in 90+ day buckets",
          "Calculate net collection rate and days in AR",
          "Prepare executive summary with trending analysis",
          "Recommend targeted collection strategies",
          "Set priorities for next month's AR follow-up"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Clean Claims Rate", target: "> 95%", weight: 20 },
      { metric: "Days in Accounts Receivable", target: "< 35 days", weight: 20 },
      { metric: "Denial Rate", target: "< 5%", weight: 15 },
      { metric: "Net Collection Rate", target: "> 96%", weight: 20 },
      { metric: "Appeal Success Rate", target: "> 65%", weight: 15 },
      { metric: "Charge Lag", target: "< 3 days", weight: 10 }
    ],
    useCases: [
      "Automated claims scrubbing and pre-submission validation",
      "Intelligent denial pattern analysis and prevention strategies",
      "Underpayment detection based on contracted rate comparison",
      "Predictive AR aging analysis and collection prioritization",
      "Real-time charge capture reconciliation with provider schedules"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 45, empathy: 50, directness: 80,
      creativity: 30, humor: 15, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "CMS Billing Guidelines", "False Claims Act", "Anti-Kickback Statute", "ICD-10-CM/PCS", "CPT/HCPCS Coding Standards", "PCI-DSS"],
      dataClassification: "PHI + Financial PII",
      auditRequirements: "All billing transactions logged; coding audits required quarterly",
      retentionPolicy: "Billing records retained for 7 years per CMS requirements",
      breachNotification: "Financial data breach: immediate PCI notification; PHI breach: HIPAA protocol"
    },
    skillsTags: ["medical billing", "claims management", "denial management", "revenue cycle", "medical coding", "payer relations", "accounts receivable", "compliance", "reimbursement"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Pharmacy Benefits Coordinator AI",
    department: "Pharmacy Services",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Pharmacy Director",
    seniorityLevel: "mid",
    description: "Manages pharmacy benefit administration including formulary management, prior authorization processing, medication therapy management coordination, and cost optimization. Works with insurers, pharmacies, and clinical teams to ensure patients receive appropriate, affordable medication access while controlling pharmacy spend.",
    coreResponsibilities: [
      "Process and manage prior authorization requests for medications",
      "Coordinate formulary management and therapeutic alternatives",
      "Analyze pharmacy utilization trends and cost optimization opportunities",
      "Support medication therapy management (MTM) program coordination",
      "Manage pharmacy benefit inquiries from patients and providers",
      "Monitor drug pricing changes and contract compliance",
      "Coordinate specialty pharmacy referrals and patient support programs",
      "Track prescription adherence metrics and intervention opportunities",
      "Support PBM contract negotiations with utilization data",
      "Ensure compliance with pharmacy regulations and accreditation standards"
    ],
    tasks: [
      { name: "Prior Authorization Processing", cadence: "daily", description: "Review incoming PA requests, verify clinical criteria, communicate decisions to providers and pharmacies", priority: "high" },
      { name: "Formulary Exception Review", cadence: "daily", description: "Evaluate non-formulary medication requests, assess clinical justification, recommend alternatives", priority: "high" },
      { name: "Patient Medication Inquiry Support", cadence: "daily", description: "Assist patients with medication coverage questions, copay information, and patient assistance programs", priority: "medium" },
      { name: "Specialty Pharmacy Coordination", cadence: "daily", description: "Manage specialty medication referrals, track patient enrollment, monitor therapy outcomes", priority: "high" },
      { name: "Utilization Report Generation", cadence: "weekly", description: "Analyze prescription utilization patterns, identify high-cost trends, recommend interventions", priority: "medium" },
      { name: "Adherence Monitoring", cadence: "weekly", description: "Track medication refill patterns, identify non-adherent patients, coordinate outreach interventions", priority: "medium" },
      { name: "Cost Analysis Report", cadence: "monthly", description: "Compile pharmacy spend analysis, generic utilization rates, and cost avoidance metrics", priority: "high" },
      { name: "Formulary Review Support", cadence: "monthly", description: "Prepare drug utilization data and clinical evidence for P&T committee formulary decisions", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "CVS Caremark RxClaim", "Express Scripts", "OptumRx", "Medi-Span",
      "First Databank (FDB)", "Surescripts", "Epic Willow",
      "CoverMyMeds", "RxBenefits", "Slack"
    ],
    dataAccessPermissions: {
      prescriptionData: "Full Access",
      patientDemographics: "Authorized",
      formularyData: "Full Access",
      pricingData: "Full Access",
      clinicalRecords: "Restricted — medication-related only",
      contractData: "Authorized — PBM contracts",
      financialReports: "Authorized — pharmacy spend only"
    },
    communicationCapabilities: [
      "Provider communication for prior authorization and formulary guidance",
      "Patient outreach for medication adherence and assistance programs",
      "Pharmacy coordination for prescription fulfillment issues",
      "PBM communication for contract and claims issues",
      "P&T committee reporting and drug information presentations",
      "Specialty pharmacy coordination for complex therapies"
    ],
    exampleWorkflows: [
      {
        name: "Prior Authorization Processing",
        steps: [
          "Receive PA request from prescriber or pharmacy",
          "Verify patient eligibility and benefit coverage",
          "Review request against formulary and clinical criteria",
          "Request additional clinical documentation if needed",
          "Make determination (approve, deny, suggest alternative)",
          "Communicate decision to prescriber and pharmacy",
          "Process appeal if determination is contested",
          "Document outcome and update tracking system"
        ]
      },
      {
        name: "Medication Adherence Intervention",
        steps: [
          "Identify non-adherent patients through refill gap analysis",
          "Stratify patients by risk and medication criticality",
          "Generate personalized outreach communications",
          "Coordinate with clinical team for intervention strategy",
          "Track intervention outcomes and adherence improvement",
          "Report program effectiveness metrics"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "PA Turnaround Time", target: "< 24 hours", weight: 20 },
      { metric: "Generic Dispensing Rate", target: "> 90%", weight: 15 },
      { metric: "Formulary Compliance Rate", target: "> 95%", weight: 15 },
      { metric: "Medication Adherence Rate", target: "> 80% (PDC)", weight: 20 },
      { metric: "Pharmacy Cost Trend", target: "< CPI medical inflation", weight: 15 },
      { metric: "PA Denial Overturn Rate", target: "< 15%", weight: 15 }
    ],
    useCases: [
      "Automated prior authorization with clinical criteria matching",
      "Formulary optimization using drug utilization and outcomes data",
      "Patient medication adherence monitoring and proactive intervention",
      "Specialty pharmacy care coordination for high-cost therapies",
      "Pharmacy spend analytics and cost containment strategy"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 45, empathy: 65, directness: 75,
      creativity: 30, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "Medicare Part D Requirements", "State Pharmacy Board Regulations", "URAC Pharmacy Accreditation", "NCQA Standards"],
      dataClassification: "PHI — Prescription Drug Information",
      auditRequirements: "PA decisions documented with clinical rationale; prescription data access logged",
      retentionPolicy: "Pharmacy records retained per state pharmacy board requirements (minimum 5 years)",
      breachNotification: "HIPAA breach protocol for prescription information exposure"
    },
    skillsTags: ["pharmacy benefits", "prior authorization", "formulary management", "medication adherence", "PBM administration", "specialty pharmacy", "drug utilization review", "cost optimization"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Healthcare Quality Analyst AI",
    department: "Quality Improvement",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Chief Quality Officer",
    seniorityLevel: "mid",
    description: "Analyzes clinical quality data, tracks performance measures, and supports quality improvement initiatives across the healthcare organization. Monitors core quality metrics (HEDIS, CMS Star Ratings, Leapfrog), identifies performance gaps, and facilitates evidence-based improvement projects to enhance patient outcomes and organizational quality ratings.",
    coreResponsibilities: [
      "Monitor and report on clinical quality measures (HEDIS, CMS Stars, MIPS)",
      "Analyze clinical outcomes data to identify improvement opportunities",
      "Support quality improvement project planning and execution",
      "Track hospital-acquired condition rates and patient safety indicators",
      "Prepare quality performance dashboards for leadership review",
      "Coordinate with clinical departments on quality initiatives",
      "Manage quality measure abstraction and data submission",
      "Support accreditation readiness and survey preparation",
      "Conduct root cause analysis for sentinel events and near misses",
      "Benchmark performance against national and peer comparisons"
    ],
    tasks: [
      { name: "Quality Dashboard Update", cadence: "daily", description: "Update real-time quality metrics including infection rates, falls, pressure injuries, and readmissions", priority: "high" },
      { name: "Incident Review & Classification", cadence: "daily", description: "Review safety event reports, classify severity, and route for investigation as appropriate", priority: "high" },
      { name: "Measure Abstraction", cadence: "daily", description: "Abstract clinical data for quality measure reporting (CMS, Joint Commission, state requirements)", priority: "medium" },
      { name: "Performance Variance Analysis", cadence: "weekly", description: "Analyze quality metric trends, identify statistically significant variances, generate alerts", priority: "high" },
      { name: "Improvement Project Tracking", cadence: "weekly", description: "Update quality improvement project status, track PDSA cycles, document outcomes", priority: "medium" },
      { name: "Benchmarking Report", cadence: "monthly", description: "Compare organizational quality metrics against CMS benchmarks, Vizient data, and peer institutions", priority: "medium" },
      { name: "CMS Star Rating Projection", cadence: "monthly", description: "Model projected CMS Star Ratings based on current performance, identify measures needing focus", priority: "high" },
      { name: "Quality Committee Report", cadence: "monthly", description: "Prepare comprehensive quality report for medical executive committee and board", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Vizient Clinical Database", "Press Ganey Quality Analytics", "Midas Health Analytics",
      "NCQA Quality Compass", "CMS HARP/CART", "Tableau Healthcare",
      "Epic Quality Reporting", "Leapfrog Survey Platform", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      clinicalOutcomes: "Full Access — aggregate and case-level",
      patientRecords: "Authorized — for quality abstraction",
      safetyEventReports: "Full Access",
      performanceMetrics: "Full Access",
      staffCredentials: "Restricted — peer review only",
      financialData: "Restricted — quality-related costs only",
      benchmarkData: "Full Access"
    },
    communicationCapabilities: [
      "Quality performance reports to clinical leadership and board",
      "Department-level quality feedback and improvement recommendations",
      "Safety event investigation correspondence",
      "Regulatory body quality reporting submissions",
      "Accreditation survey preparation communications",
      "Quality improvement team facilitation and coordination"
    ],
    exampleWorkflows: [
      {
        name: "Quality Measure Performance Improvement",
        steps: [
          "Identify underperforming quality measure through trend analysis",
          "Conduct root cause analysis with clinical stakeholders",
          "Design improvement intervention using evidence-based practices",
          "Develop PDSA cycle plan with measurable objectives",
          "Implement intervention with clinical team support",
          "Monitor real-time performance data during implementation",
          "Evaluate outcomes and statistical significance",
          "Standardize successful interventions across organization"
        ]
      },
      {
        name: "CMS Star Rating Optimization",
        steps: [
          "Pull current performance data for all Star Rating measures",
          "Calculate projected ratings using CMS methodology",
          "Identify measures closest to threshold for improvement",
          "Prioritize interventions by impact potential and feasibility",
          "Deploy targeted improvement campaigns",
          "Track progress weekly against improvement targets",
          "Generate executive summary with projected rating impact"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Quality Measure Reporting Accuracy", target: "> 99%", weight: 20 },
      { metric: "Hospital-Acquired Condition Rate", target: "Below national benchmark", weight: 20 },
      { metric: "CMS Star Rating", target: "4+ stars", weight: 15 },
      { metric: "Readmission Rate", target: "Below expected", weight: 15 },
      { metric: "Patient Safety Indicator Score", target: "Top quartile", weight: 15 },
      { metric: "Quality Improvement Project Success Rate", target: "> 75%", weight: 15 }
    ],
    useCases: [
      "Real-time clinical quality monitoring with automated alerting",
      "Predictive modeling for hospital-acquired conditions and readmissions",
      "CMS Star Rating simulation and optimization strategy development",
      "Automated quality measure abstraction from EHR data",
      "Benchmarking analysis against national databases and peer institutions"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 50, empathy: 55, directness: 80,
      creativity: 45, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "CMS Quality Reporting", "Joint Commission Standards", "HEDIS", "MIPS/MACRA", "Leapfrog Safety Standards", "Patient Safety Act"],
      dataClassification: "PHI — Clinical Quality Data",
      auditRequirements: "Quality abstraction methodology documented; peer review data privileged",
      retentionPolicy: "Quality data retained per CMS and accreditation requirements (minimum 5 years)",
      breachNotification: "Patient safety events reported per state mandatory reporting requirements"
    },
    skillsTags: ["healthcare quality", "performance improvement", "HEDIS", "CMS Star Ratings", "patient safety", "clinical analytics", "accreditation", "root cause analysis", "benchmarking"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Telehealth Support Agent AI",
    department: "Digital Health",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Telehealth Program Director",
    seniorityLevel: "junior",
    description: "Provides technical and clinical workflow support for telehealth encounters, assisting patients and providers with virtual visit setup, troubleshooting, and post-visit coordination. Ensures smooth telehealth operations while maintaining patient satisfaction and clinical workflow efficiency in the virtual care environment.",
    coreResponsibilities: [
      "Assist patients with telehealth platform setup and connectivity",
      "Troubleshoot audio, video, and connectivity issues during virtual visits",
      "Manage virtual waiting room and patient queuing",
      "Coordinate pre-visit documentation and questionnaire completion",
      "Support providers with telehealth workflow and documentation",
      "Process post-visit orders, referrals, and follow-up scheduling",
      "Monitor telehealth quality metrics and patient experience",
      "Maintain knowledge of telehealth regulations and billing requirements",
      "Support after-hours virtual care triage and routing",
      "Collect patient feedback on telehealth experience"
    ],
    tasks: [
      { name: "Pre-Visit Technical Check", cadence: "daily", description: "Contact patients scheduled for telehealth visits to verify device compatibility, connectivity, and platform access", priority: "high" },
      { name: "Virtual Visit Support", cadence: "daily", description: "Monitor active telehealth sessions, provide real-time technical support, manage patient queue", priority: "high" },
      { name: "Post-Visit Processing", cadence: "daily", description: "Process telehealth visit outcomes including follow-up scheduling, referrals, and prescription routing", priority: "medium" },
      { name: "Platform Issue Escalation", cadence: "daily", description: "Document and escalate recurring technical issues to IT team, track resolution", priority: "medium" },
      { name: "Telehealth Utilization Report", cadence: "weekly", description: "Track visit volumes, completion rates, no-show rates, and patient satisfaction for telehealth", priority: "medium" },
      { name: "Provider Feedback Collection", cadence: "weekly", description: "Gather provider feedback on telehealth workflow, identify friction points, suggest improvements", priority: "medium" },
      { name: "Technology Assessment", cadence: "monthly", description: "Evaluate telehealth platform performance, compare alternatives, recommend improvements", priority: "low" },
      { name: "Regulatory Compliance Check", cadence: "monthly", description: "Review telehealth operations against state licensing, consent, and billing requirements", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Teladoc Health", "Amwell", "Doxy.me", "Zoom for Healthcare",
      "Epic Telehealth", "Microsoft Teams (Healthcare)", "Twilio Video",
      "DocuSign (consent)", "Zendesk", "Slack"
    ],
    dataAccessPermissions: {
      patientDemographics: "Full Access",
      appointmentSchedules: "Full Access",
      technicalLogs: "Full Access",
      clinicalRecords: "Restricted — appointment context only",
      billingRecords: "Restricted — telehealth visits only",
      platformAnalytics: "Full Access",
      providerSchedules: "Authorized"
    },
    communicationCapabilities: [
      "Patient pre-visit communication and technical support",
      "Real-time chat support during virtual visits",
      "Provider technical assistance and workflow guidance",
      "Post-visit follow-up and satisfaction surveys",
      "IT escalation for platform issues",
      "Patient education on telehealth best practices"
    ],
    exampleWorkflows: [
      {
        name: "Telehealth Visit Facilitation",
        steps: [
          "Send pre-visit reminder with device check instructions",
          "Verify patient identity and consent documentation",
          "Conduct technical readiness assessment",
          "Admit patient to virtual waiting room",
          "Monitor visit for technical issues and provide support",
          "Process post-visit documentation and follow-up",
          "Send patient satisfaction survey"
        ]
      },
      {
        name: "Technical Issue Resolution",
        steps: [
          "Receive report of connectivity or platform issue",
          "Diagnose issue category (network, device, platform, user)",
          "Walk patient/provider through troubleshooting steps",
          "If unresolved, offer alternative connection methods",
          "Escalate persistent issues to IT with documentation",
          "Follow up on resolution and document for knowledge base"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Visit Completion Rate", target: "> 95%", weight: 25 },
      { metric: "Technical Issue Resolution Time", target: "< 5 minutes", weight: 20 },
      { metric: "Patient Satisfaction (Telehealth)", target: "> 4.3/5.0", weight: 20 },
      { metric: "Pre-Visit Contact Rate", target: "> 90%", weight: 15 },
      { metric: "Platform Uptime", target: "> 99.5%", weight: 10 },
      { metric: "No-Show Rate", target: "< 10%", weight: 10 }
    ],
    useCases: [
      "Automated pre-visit technical readiness assessment and troubleshooting",
      "Real-time virtual waiting room management and patient queuing",
      "Post-visit workflow automation for follow-ups and referrals",
      "Telehealth utilization analytics and optimization",
      "Patient satisfaction monitoring and experience improvement"
    ],
    personalityDefaults: {
      formality: 55, enthusiasm: 70, empathy: 75, directness: 65,
      creativity: 40, humor: 35, assertiveness: 45
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "State Telehealth Regulations", "Ryan Haight Act", "CMS Telehealth Billing Guidelines", "Informed Consent Requirements"],
      dataClassification: "PHI — Telehealth Encounter Data",
      auditRequirements: "All virtual visit sessions logged with duration, participants, and technical metrics",
      retentionPolicy: "Telehealth records retained same as in-person encounter records",
      breachNotification: "HIPAA breach protocol for any telehealth data exposure"
    },
    skillsTags: ["telehealth", "virtual care", "technical support", "patient experience", "healthcare IT", "video conferencing", "workflow optimization", "digital health"],
    priceMonthly: 699,
    isActive: 1,
  },

  {
    title: "Health Information Manager AI",
    department: "Health Information Management",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Chief Information Officer",
    seniorityLevel: "senior",
    description: "Leads the health information management program, overseeing data governance, coding quality, clinical documentation improvement, and health information systems strategy. Ensures the integrity, availability, and security of organizational health data assets while driving analytics capabilities and interoperability initiatives.",
    coreResponsibilities: [
      "Develop and implement HIM policies, procedures, and standards",
      "Oversee clinical coding quality and compliance programs",
      "Lead clinical documentation improvement (CDI) initiatives",
      "Manage health data governance framework and data quality",
      "Direct HIM staff operations and professional development",
      "Ensure EHR system optimization and data integrity",
      "Lead health information exchange and interoperability projects",
      "Manage HIPAA privacy and security compliance for HIM",
      "Oversee release of information program and policies",
      "Support analytics, reporting, and population health initiatives"
    ],
    tasks: [
      { name: "Coding Quality Dashboard", cadence: "daily", description: "Review coding accuracy metrics, DRG assignment patterns, and coder productivity across all service lines", priority: "high" },
      { name: "CDI Program Monitoring", cadence: "daily", description: "Track CDI query rates, response rates, physician agreement rates, and CC/MCC capture impact", priority: "high" },
      { name: "Data Quality Monitoring", cadence: "daily", description: "Monitor data quality metrics across EHR systems, flag integrity issues, coordinate remediation", priority: "medium" },
      { name: "HIM Operations Dashboard", cadence: "daily", description: "Review department productivity, turnaround times, and workload distribution", priority: "medium" },
      { name: "Coding Compliance Audit", cadence: "weekly", description: "Conduct targeted coding audits, document findings, and provide feedback to coding team", priority: "high" },
      { name: "CMI Analysis", cadence: "weekly", description: "Analyze Case Mix Index trends, identify documentation improvement opportunities for severity capture", priority: "high" },
      { name: "Strategic Initiative Review", cadence: "monthly", description: "Update progress on HIM strategic plan including interoperability, analytics, and modernization projects", priority: "medium" },
      { name: "Regulatory Readiness Assessment", cadence: "monthly", description: "Review compliance with ICD-10, CPT updates, CMS coding guidelines, and OIG work plan items", priority: "high" }
    ],
    toolsAndIntegrations: [
      "3M Health Information Systems", "Optum360 CAC", "Nuance CDI",
      "Epic HIM Module", "Dolbey Fusion CAC", "AHIMA Resources",
      "Vizient Clinical Database", "Tableau", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      patientRecords: "Full Access — HIM oversight",
      codingData: "Full Access",
      clinicalDocumentation: "Full Access",
      financialImpact: "Authorized — CMI and DRG related",
      staffPerformance: "Full Access — HIM department",
      auditLogs: "Full Access",
      analyticsData: "Full Access"
    },
    communicationCapabilities: [
      "Executive reporting on HIM program performance and strategic initiatives",
      "Clinical leadership communication for CDI and documentation improvement",
      "Coding team guidance, education, and quality feedback",
      "IT partnership for system optimization and interoperability",
      "Regulatory body communication for coding and data inquiries",
      "Cross-departmental coordination for data governance"
    ],
    exampleWorkflows: [
      {
        name: "Clinical Documentation Improvement Review",
        steps: [
          "Identify cases with documentation gaps via CDI worklist",
          "Review clinical documentation against coding specificity requirements",
          "Formulate clinical clarification query for physician",
          "Route query through approved CDI communication channel",
          "Track physician response and documentation amendment",
          "Evaluate coding impact of improved documentation",
          "Report CDI program impact on CMI and quality metrics"
        ]
      },
      {
        name: "Coding Compliance Audit Program",
        steps: [
          "Select audit sample based on risk criteria and OIG work plan",
          "Conduct independent code review against clinical documentation",
          "Document findings including accuracy rate and error patterns",
          "Calculate financial impact of coding errors",
          "Deliver results to coding leadership with education plan",
          "Track remediation and re-audit for improvement verification",
          "Report compliance metrics to leadership and compliance committee"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Coding Accuracy Rate", target: "> 95%", weight: 20 },
      { metric: "CDI Query Response Rate", target: "> 80%", weight: 15 },
      { metric: "Case Mix Index Accuracy", target: "Within 2% of benchmark", weight: 15 },
      { metric: "Record Completion Rate", target: "> 98% within 30 days", weight: 15 },
      { metric: "Data Quality Score", target: "> 95%", weight: 15 },
      { metric: "HIM Productivity", target: "Within 5% of target", weight: 10 },
      { metric: "Regulatory Compliance", target: "100%", weight: 10 }
    ],
    useCases: [
      "Automated coding quality monitoring with real-time accuracy tracking",
      "CDI program optimization using NLP-based documentation analysis",
      "Data governance enforcement across EHR and ancillary systems",
      "CMI optimization through documentation improvement targeting",
      "Health information exchange facilitation and interoperability management"
    ],
    personalityDefaults: {
      formality: 85, enthusiasm: 45, empathy: 50, directness: 80,
      creativity: 40, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["HIPAA Privacy & Security Rules", "HITECH", "ICD-10-CM/PCS Official Guidelines", "CPT/HCPCS Guidelines", "CMS Inpatient/Outpatient Coding", "OIG Compliance"],
      dataClassification: "PHI — Complete Medical Record Access",
      auditRequirements: "Coding audits documented per compliance plan; CDI queries tracked and reported",
      retentionPolicy: "HIM records per state and federal retention requirements (7+ years)",
      breachNotification: "HIPAA breach investigation and notification as HIM department head"
    },
    skillsTags: ["health information management", "medical coding", "CDI", "data governance", "EHR optimization", "HIPAA compliance", "case mix index", "interoperability", "analytics"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Patient Intake Coordinator AI",
    department: "Patient Access",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "Patient Access Manager",
    seniorityLevel: "junior",
    description: "Manages the patient registration and intake process, collecting demographic, insurance, and clinical information accurately and efficiently. Ensures a smooth onboarding experience while verifying eligibility, obtaining consent, and preparing patients for their healthcare encounter.",
    coreResponsibilities: [
      "Collect and verify patient demographic and insurance information",
      "Verify insurance eligibility and benefits in real-time",
      "Obtain required consents, authorizations, and advance directives",
      "Screen for financial assistance and charity care eligibility",
      "Collect patient copays, deductibles, and outstanding balances",
      "Ensure accurate patient identity verification and MPI matching",
      "Distribute required regulatory notices (HIPAA, patient rights)",
      "Coordinate pre-service clinical requirements (labs, imaging orders)",
      "Manage patient check-in queues and wait time optimization",
      "Update patient records and flag data discrepancies"
    ],
    tasks: [
      { name: "Patient Registration Processing", cadence: "daily", description: "Process new and returning patient registrations, verify identity, collect demographics and insurance", priority: "high" },
      { name: "Insurance Eligibility Verification", cadence: "daily", description: "Run real-time eligibility checks for scheduled patients, flag coverage issues for pre-service resolution", priority: "high" },
      { name: "Consent and Authorization Collection", cadence: "daily", description: "Obtain and document required consents, treatment authorizations, and advance directive status", priority: "high" },
      { name: "Financial Screening", cadence: "daily", description: "Screen patients for financial assistance eligibility, connect with financial counselors as needed", priority: "medium" },
      { name: "Pre-Registration Outreach", cadence: "daily", description: "Contact patients before appointments to complete registration, verify insurance, and collect information", priority: "medium" },
      { name: "Registration Accuracy Audit", cadence: "weekly", description: "Audit completed registrations for accuracy, identify error patterns, provide feedback", priority: "medium" },
      { name: "Point-of-Service Collection Report", cadence: "weekly", description: "Track copay collection rates, outstanding balances, and financial counseling referrals", priority: "medium" },
      { name: "Compliance Review", cadence: "monthly", description: "Verify compliance with consent requirements, regulatory notices, and registration policies", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Epic Prelude/Welcome", "Cerner Revenue Cycle", "Experian Health",
      "Availity", "Phreesia", "InstaMed", "LexisNexis Risk Solutions",
      "DocuSign Health", "Waystar", "Slack"
    ],
    dataAccessPermissions: {
      patientDemographics: "Full Access",
      insuranceInformation: "Full Access",
      billingRecords: "Authorized — copay and balance collection",
      clinicalRecords: "Restricted — allergies and advance directives only",
      financialAssistance: "Authorized",
      consentDocuments: "Full Access",
      identityVerification: "Full Access"
    },
    communicationCapabilities: [
      "Patient communication for pre-registration and arrival instructions",
      "Insurance company verification calls and correspondence",
      "Clinical team notification for special needs patients",
      "Financial counseling referral communication",
      "Registration quality feedback to intake team",
      "Welcome messaging and patient experience communication"
    ],
    exampleWorkflows: [
      {
        name: "Pre-Registration Process",
        steps: [
          "Identify upcoming appointments requiring pre-registration",
          "Contact patient via preferred communication method",
          "Verify and update demographic information",
          "Confirm insurance coverage and benefits",
          "Calculate estimated patient responsibility",
          "Collect consent documents electronically",
          "Flag any special needs or accommodations",
          "Confirm arrival instructions and required documentation"
        ]
      },
      {
        name: "Financial Assistance Screening",
        steps: [
          "Identify patients with coverage gaps or high liability",
          "Screen against financial assistance criteria",
          "Collect required documentation for eligibility",
          "Submit application to financial counseling team",
          "Communicate determination to patient",
          "Apply approved assistance to patient account",
          "Document outcomes for reporting"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Registration Accuracy Rate", target: "> 98%", weight: 25 },
      { metric: "Pre-Registration Completion Rate", target: "> 85%", weight: 15 },
      { metric: "Insurance Verification Rate", target: "> 99%", weight: 20 },
      { metric: "Point-of-Service Collection Rate", target: "> 90%", weight: 15 },
      { metric: "Average Check-in Time", target: "< 5 minutes", weight: 15 },
      { metric: "Patient Satisfaction (Registration)", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "Automated pre-registration with real-time eligibility verification",
      "Digital intake with electronic consent and documentation collection",
      "Patient identity verification and fraud prevention",
      "Financial screening and assistance program matching",
      "Wait time optimization through queue management"
    ],
    personalityDefaults: {
      formality: 60, enthusiasm: 65, empathy: 80, directness: 65,
      creativity: 30, humor: 25, assertiveness: 45
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "EMTALA", "ADA", "Patient Self-Determination Act", "State Consent Laws", "Red Flags Rule"],
      dataClassification: "PHI + Financial PII",
      auditRequirements: "Registration transactions logged; consent documentation timestamped and archived",
      retentionPolicy: "Registration records retained per medical record retention requirements",
      breachNotification: "HIPAA breach protocol; Red Flags Rule identity theft notification"
    },
    skillsTags: ["patient registration", "insurance verification", "financial screening", "consent management", "identity verification", "patient access", "revenue cycle", "customer service"],
    priceMonthly: 699,
    isActive: 1,
  },

  {
    title: "Clinical Documentation Specialist AI",
    department: "Clinical Documentation Improvement",
    category: "Healthcare & Life Sciences",
    industry: "Healthcare",
    reportsTo: "CDI Program Director",
    seniorityLevel: "mid",
    description: "Reviews clinical documentation for accuracy, completeness, and specificity to ensure proper reflection of patient acuity, severity of illness, and risk of mortality. Partners with physicians and clinical staff to improve documentation quality, supporting accurate coding, appropriate reimbursement, and reliable quality metrics.",
    coreResponsibilities: [
      "Review concurrent and retrospective clinical documentation for completeness",
      "Identify documentation gaps affecting coding accuracy and DRG assignment",
      "Formulate and route clinical clarification queries to physicians",
      "Educate physicians on documentation improvement opportunities",
      "Monitor CC/MCC capture rates and documentation specificity",
      "Collaborate with coding team on complex case DRG validation",
      "Track and report CDI program outcomes and physician engagement",
      "Stay current on coding guideline changes and their documentation implications",
      "Support denial management with clinical documentation expertise",
      "Analyze SOI/ROM scoring and documentation completeness impact"
    ],
    tasks: [
      { name: "Concurrent Chart Review", cadence: "daily", description: "Review active inpatient charts for documentation specificity, clinical indicators, and coding opportunities", priority: "high" },
      { name: "Query Generation & Routing", cadence: "daily", description: "Create clinical clarification queries based on documentation review, route to appropriate physicians", priority: "high" },
      { name: "Query Response Tracking", cadence: "daily", description: "Monitor physician query responses, follow up on pending queries, document outcomes", priority: "high" },
      { name: "DRG Reconciliation", cadence: "daily", description: "Compare working DRG with final coded DRG, identify discrepancies, collaborate with coders", priority: "medium" },
      { name: "Physician Education Sessions", cadence: "weekly", description: "Prepare and deliver targeted documentation education based on query trends and coding changes", priority: "medium" },
      { name: "CDI Metrics Report", cadence: "weekly", description: "Track query rates, response rates, agree rates, CC/MCC impact, and CMI effect", priority: "high" },
      { name: "Denial Support", cadence: "weekly", description: "Review clinical documentation to support coding denial appeals, provide clinical rationale", priority: "medium" },
      { name: "Program Performance Report", cadence: "monthly", description: "Compile comprehensive CDI program metrics including financial impact and quality measure effects", priority: "high" }
    ],
    toolsAndIntegrations: [
      "3M 360 Encompass CDI", "Optum CDI", "Nuance CDI",
      "Epic CDI Module", "Dolbey Fusion CAC", "AHIMA CDI Resources",
      "CMS MS-DRG Grouper", "Vizient", "Microsoft Teams", "Slack"
    ],
    dataAccessPermissions: {
      clinicalDocumentation: "Full Access",
      codingData: "Full Access",
      patientRecords: "Authorized — active and recent discharges",
      financialImpact: "Authorized — DRG and CMI data",
      physicianProfiles: "Authorized — query and response history",
      qualityMetrics: "Authorized — documentation-related measures",
      denialData: "Authorized — clinical review cases"
    },
    communicationCapabilities: [
      "Physician communication for clinical clarification queries",
      "Coding team collaboration for DRG validation and complex cases",
      "CDI leadership reporting on program performance",
      "Education delivery to clinical staff on documentation best practices",
      "Denial management team support with clinical expertise",
      "Quality team coordination on documentation-dependent measures"
    ],
    exampleWorkflows: [
      {
        name: "Concurrent Documentation Review",
        steps: [
          "Select case from CDI worklist based on priority criteria",
          "Review H&P, progress notes, labs, imaging, and assessments",
          "Identify clinical indicators suggesting unaddressed diagnoses",
          "Evaluate documentation specificity for present-on-admission conditions",
          "Assess SOI/ROM accuracy based on clinical evidence",
          "Formulate clinical query if documentation gap identified",
          "Route query to attending physician via approved method",
          "Document review findings and expected DRG impact"
        ]
      },
      {
        name: "CDI Query Impact Analysis",
        steps: [
          "Pull query data for analysis period",
          "Calculate query rate, response rate, and agreement rate by service line",
          "Determine CC/MCC capture rate improvement from successful queries",
          "Calculate CMI impact and estimated revenue effect",
          "Identify top query categories and physician response patterns",
          "Generate recommendations for focused education topics",
          "Present findings to CDI committee and physician leadership"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Review Rate", target: "> 90% of eligible cases", weight: 15 },
      { metric: "Query Rate", target: "25-35% of reviewed cases", weight: 10 },
      { metric: "Physician Response Rate", target: "> 85%", weight: 15 },
      { metric: "Physician Agreement Rate", target: "> 75%", weight: 15 },
      { metric: "CC/MCC Capture Rate Improvement", target: "> 5% improvement", weight: 20 },
      { metric: "CMI Impact", target: "Positive CMI contribution", weight: 15 },
      { metric: "DRG Accuracy", target: "> 95% working DRG accuracy", weight: 10 }
    ],
    useCases: [
      "NLP-assisted concurrent documentation review and gap identification",
      "Automated clinical query generation based on documentation analysis",
      "Real-time DRG tracking and documentation opportunity alerts",
      "Physician documentation pattern analysis and targeted education",
      "CMI optimization through documentation specificity improvement"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 60, directness: 75,
      creativity: 35, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["HIPAA", "HITECH", "CMS ICD-10-CM/PCS Guidelines", "AHIMA CDI Practice Standards", "ACDIS Guidelines", "OIG Compliance", "CMS Conditions of Participation"],
      dataClassification: "PHI — Clinical Documentation",
      auditRequirements: "CDI queries documented per compliant query practice standards; review methodology auditable",
      retentionPolicy: "CDI records and queries retained per organizational medical record retention policy",
      breachNotification: "HIPAA breach protocol for any clinical documentation exposure"
    },
    skillsTags: ["clinical documentation improvement", "CDI", "medical coding", "DRG validation", "physician education", "clinical analysis", "case mix index", "query management", "revenue integrity"],
    priceMonthly: 1099,
    isActive: 1,
  },
];
