import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const educationManufacturingHospitalityRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [

  // ═══════════════════════════════════════════════════════════
  //  EDUCATION & TRAINING (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Curriculum Designer AI",
    department: "Curriculum Development",
    category: "Education & Training",
    industry: "Education",
    reportsTo: "Director of Curriculum",
    seniorityLevel: "mid",
    description: "Designs, develops, and evaluates educational curricula and learning programs aligned with institutional goals, accreditation standards, and learner outcomes. Applies instructional design methodologies to create engaging, effective learning experiences across modalities including in-person, online, and hybrid formats.",
    coreResponsibilities: [
      "Design curricula aligned with learning objectives and accreditation standards",
      "Develop course structures, syllabi, and learning pathways",
      "Create assessment frameworks including formative and summative evaluations",
      "Apply instructional design models (ADDIE, SAM, backward design)",
      "Integrate technology and multimedia into learning experiences",
      "Conduct needs analysis to identify skill gaps and learning requirements",
      "Review and update existing curricula based on outcomes data and feedback",
      "Ensure accessibility compliance (ADA, Section 508, WCAG)",
      "Collaborate with subject matter experts on content development",
      "Support faculty and trainer development on pedagogical best practices"
    ],
    tasks: [
      { name: "Course Development Pipeline", cadence: "daily", description: "Advance active course development projects through design, content creation, and review stages", priority: "high" },
      { name: "Learning Objective Review", cadence: "daily", description: "Review and refine learning objectives for alignment with Bloom's taxonomy and program outcomes", priority: "high" },
      { name: "Content Quality Review", cadence: "daily", description: "Review course materials, assessments, and multimedia for quality, accuracy, and engagement", priority: "medium" },
      { name: "SME Collaboration", cadence: "daily", description: "Coordinate with subject matter experts to validate content accuracy and relevance", priority: "medium" },
      { name: "Curriculum Mapping", cadence: "weekly", description: "Update curriculum maps showing objective alignment across courses, programs, and competencies", priority: "high" },
      { name: "Assessment Alignment Audit", cadence: "weekly", description: "Verify assessments align with stated learning objectives and measure intended competencies", priority: "medium" },
      { name: "Outcomes Analysis", cadence: "monthly", description: "Analyze learner outcomes data to identify curriculum effectiveness and improvement opportunities", priority: "high" },
      { name: "Accreditation Documentation", cadence: "monthly", description: "Maintain curriculum documentation for accreditation compliance and program review", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Canvas LMS", "Blackboard", "Moodle", "Articulate 360",
      "Adobe Captivate", "H5P", "Google Workspace for Education",
      "Turnitin", "Microsoft Teams", "Slack"
    ],
    dataAccessPermissions: {
      curriculumDocuments: "Full Access",
      learnerOutcomes: "Full Access — aggregate",
      courseEvaluations: "Full Access",
      enrollmentData: "Authorized — program level",
      studentRecords: "Restricted — aggregate only",
      facultyProfiles: "Authorized",
      accreditationRecords: "Full Access",
      lmsAnalytics: "Full Access"
    },
    communicationCapabilities: [
      "Faculty collaboration on course design and content development",
      "Academic leadership reporting on curriculum initiatives",
      "Accreditation body communication for compliance documentation",
      "Student feedback collection and response coordination",
      "Cross-departmental coordination for interdisciplinary programs",
      "External SME engagement for industry-aligned content"
    ],
    exampleWorkflows: [
      {
        name: "New Course Development",
        steps: [
          "Conduct needs analysis to identify learning gaps and target audience",
          "Define course learning objectives using backward design methodology",
          "Create course outline with module structure and sequencing",
          "Develop assessment strategy aligned with learning objectives",
          "Collaborate with SMEs to create content for each module",
          "Design multimedia and interactive learning activities",
          "Build course in LMS with accessibility compliance verification",
          "Pilot course with test group and collect feedback",
          "Revise based on feedback and launch for full enrollment"
        ]
      },
      {
        name: "Curriculum Review & Revision",
        steps: [
          "Pull learner outcomes data and course evaluation summaries",
          "Identify modules with low achievement or satisfaction scores",
          "Analyze assessment alignment and difficulty calibration",
          "Research current industry standards and emerging competencies",
          "Propose curriculum revisions with rationale and evidence",
          "Review revisions with faculty and curriculum committee",
          "Implement approved changes and update documentation",
          "Monitor outcomes post-revision for improvement verification"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Course Completion Rate", target: "> 85%", weight: 20 },
      { metric: "Learning Objective Achievement", target: "> 80% mastery rate", weight: 20 },
      { metric: "Student Satisfaction Score", target: "> 4.2/5.0", weight: 15 },
      { metric: "Accessibility Compliance", target: "100% WCAG 2.1 AA", weight: 15 },
      { metric: "Curriculum Currency", target: "Review cycle < 2 years", weight: 10 },
      { metric: "Course Development Timeliness", target: "Within project timeline", weight: 10 },
      { metric: "Accreditation Compliance", target: "100%", weight: 10 }
    ],
    useCases: [
      "AI-assisted curriculum design with competency mapping and gap analysis",
      "Automated learning objective alignment across program curricula",
      "Data-driven curriculum revision based on learner outcomes analytics",
      "Adaptive learning pathway design for personalized education",
      "Accreditation documentation management and compliance tracking"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 70, empathy: 65, directness: 65,
      creativity: 75, humor: 25, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["FERPA", "ADA", "Section 508", "WCAG 2.1", "Regional Accreditation Standards", "State Education Requirements"],
      dataClassification: "FERPA — Student Education Records",
      auditRequirements: "Curriculum changes documented with rationale; assessment data maintained per accreditation standards",
      retentionPolicy: "Curriculum documents: permanent; student outcomes: 7 years; course evaluations: 5 years",
      breachNotification: "FERPA notification requirements for student record exposure"
    },
    skillsTags: ["curriculum design", "instructional design", "learning objectives", "assessment development", "LMS administration", "accessibility", "accreditation", "e-learning", "pedagogy"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Student Advisor AI",
    department: "Student Services",
    category: "Education & Training",
    industry: "Education",
    reportsTo: "Dean of Students",
    seniorityLevel: "mid",
    description: "Provides personalized academic advising and support to students, helping them navigate degree requirements, course selection, academic policies, and career planning. Monitors academic progress, identifies at-risk students, and connects them with appropriate resources to support retention and graduation.",
    coreResponsibilities: [
      "Provide academic advising on course selection, degree requirements, and scheduling",
      "Monitor student academic progress and identify at-risk indicators",
      "Develop personalized academic plans aligned with student goals",
      "Connect students with tutoring, counseling, and support resources",
      "Facilitate degree audit reviews and graduation clearance",
      "Support course registration processes and resolve enrollment issues",
      "Track student engagement and persistence metrics",
      "Guide students on academic policies, probation, and appeals",
      "Coordinate with faculty on student academic concerns",
      "Support career exploration and post-graduation planning"
    ],
    tasks: [
      { name: "Student Inquiry Response", cadence: "daily", description: "Respond to student questions about courses, requirements, policies, and resources via chat and email", priority: "high" },
      { name: "At-Risk Student Monitoring", cadence: "daily", description: "Review early alert flags, attendance data, and grade indicators to identify students needing intervention", priority: "high" },
      { name: "Advising Sessions", cadence: "daily", description: "Conduct advising sessions to help students plan courses, resolve issues, and set academic goals", priority: "high" },
      { name: "Degree Audit Processing", cadence: "daily", description: "Process degree audit requests, verify requirement completion, and flag deficiencies", priority: "medium" },
      { name: "Registration Support", cadence: "weekly", description: "Assist students with registration holds, prerequisite overrides, and enrollment issues", priority: "high" },
      { name: "Resource Referral Coordination", cadence: "weekly", description: "Connect at-risk students with tutoring, financial aid, counseling, and other support services", priority: "high" },
      { name: "Retention Analytics Review", cadence: "monthly", description: "Analyze student retention data, identify trends, and recommend intervention strategies", priority: "high" },
      { name: "Advising Outcomes Report", cadence: "monthly", description: "Track advising caseload metrics including student satisfaction, retention, and graduation rates", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Ellucian Banner", "PeopleSoft Campus Solutions", "Starfish (Hobsons)",
      "EAB Navigate", "DegreeWorks", "Slate CRM",
      "Zoom", "Microsoft Teams", "Canvas LMS", "Slack"
    ],
    dataAccessPermissions: {
      studentRecords: "Authorized — assigned advisees",
      academicTranscripts: "Authorized — assigned advisees",
      courseSchedule: "Full Access",
      degreeProgramRequirements: "Full Access",
      financialAid: "Restricted — eligibility status only",
      counselingRecords: "No Access",
      facultyDirectory: "Full Access",
      institutionalAnalytics: "Authorized — aggregate"
    },
    communicationCapabilities: [
      "Student communication for advising, registration, and support",
      "Faculty coordination on student academic concerns",
      "Parent/family communication per FERPA authorization",
      "Support services referral coordination",
      "Academic leadership reporting on advising outcomes",
      "Automated early alert notifications and intervention outreach"
    ],
    exampleWorkflows: [
      {
        name: "At-Risk Student Intervention",
        steps: [
          "Receive early alert from faculty or system-generated flag",
          "Review student academic history, attendance, and engagement data",
          "Assess risk level and determine appropriate intervention",
          "Reach out to student via preferred communication channel",
          "Conduct intervention meeting to understand challenges",
          "Develop action plan with specific goals and timeline",
          "Connect student with relevant support resources",
          "Monitor progress and follow up at agreed intervals",
          "Document intervention outcomes in advising system"
        ]
      },
      {
        name: "Registration Advising Session",
        steps: [
          "Pull student degree audit and academic history",
          "Review remaining degree requirements and prerequisites",
          "Discuss student academic goals and scheduling preferences",
          "Recommend courses based on requirements and career path",
          "Verify course availability and resolve any conflicts",
          "Process registration or resolve holds and restrictions",
          "Update academic plan and next advising appointment",
          "Document session notes in student record"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Student Retention Rate", target: "> 85%", weight: 25 },
      { metric: "Advising Satisfaction Score", target: "> 4.3/5.0", weight: 20 },
      { metric: "Response Time", target: "< 4 hours", weight: 15 },
      { metric: "At-Risk Intervention Rate", target: "> 90% contacted within 48 hours", weight: 15 },
      { metric: "Graduation Rate Contribution", target: "Above institutional average", weight: 15 },
      { metric: "Caseload Management", target: "100% advisees seen per term", weight: 10 }
    ],
    useCases: [
      "AI-powered early alert system with predictive at-risk identification",
      "Automated degree audit and graduation requirement tracking",
      "Personalized course recommendation based on goals and prerequisites",
      "Proactive retention intervention with data-driven outreach",
      "24/7 student advising support for common questions and registration"
    ],
    personalityDefaults: {
      formality: 55, enthusiasm: 70, empathy: 85, directness: 60,
      creativity: 45, humor: 35, assertiveness: 45
    },
    complianceMetadata: {
      frameworks: ["FERPA", "Title IX", "ADA", "Clery Act", "State Education Privacy Laws", "NACADA Standards"],
      dataClassification: "FERPA — Student Education Records",
      auditRequirements: "Advising interactions documented; FERPA consent tracked for third-party disclosures",
      retentionPolicy: "Advising records: 5 years after graduation/separation; academic plans: 7 years",
      breachNotification: "FERPA notification for unauthorized student record disclosure"
    },
    skillsTags: ["academic advising", "student retention", "degree planning", "early alert", "student success", "FERPA compliance", "career guidance", "enrollment management", "student engagement"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "Learning Analytics Specialist AI",
    department: "Institutional Research",
    category: "Education & Training",
    industry: "Education",
    reportsTo: "VP of Institutional Effectiveness",
    seniorityLevel: "mid",
    description: "Analyzes learning data from LMS platforms, assessments, and student information systems to provide actionable insights on student performance, course effectiveness, and institutional outcomes. Develops predictive models for student success and supports data-driven decision-making across academic programs.",
    coreResponsibilities: [
      "Collect and analyze learning data from LMS, SIS, and assessment platforms",
      "Build predictive models for student success, retention, and completion",
      "Create dashboards and visualizations for academic decision-making",
      "Conduct course-level and program-level effectiveness analyses",
      "Support accreditation reporting with outcomes data and evidence",
      "Identify learning engagement patterns and correlate with outcomes",
      "Design and analyze institutional surveys and feedback instruments",
      "Benchmark institutional performance against peer institutions",
      "Advise faculty on using learning analytics to improve teaching",
      "Ensure ethical use of student data and compliance with privacy regulations"
    ],
    tasks: [
      { name: "LMS Data Extraction", cadence: "daily", description: "Extract and process learning activity data from LMS including engagement, completion, and assessment scores", priority: "medium" },
      { name: "Dashboard Maintenance", cadence: "daily", description: "Update real-time dashboards showing enrollment, retention, course performance, and engagement metrics", priority: "high" },
      { name: "Predictive Model Monitoring", cadence: "daily", description: "Monitor predictive model outputs for at-risk student identification, validate accuracy against outcomes", priority: "high" },
      { name: "Course Analytics Report", cadence: "weekly", description: "Generate course-level analytics reports including student engagement, grade distributions, and completion rates", priority: "medium" },
      { name: "Intervention Effectiveness Analysis", cadence: "weekly", description: "Analyze outcomes of student interventions to assess effectiveness and recommend improvements", priority: "medium" },
      { name: "Program Outcomes Assessment", cadence: "monthly", description: "Compile program-level outcomes data for program review and accreditation reporting", priority: "high" },
      { name: "Institutional Effectiveness Report", cadence: "monthly", description: "Produce comprehensive institutional analytics covering enrollment, retention, graduation, and satisfaction", priority: "high" },
      { name: "Benchmarking Analysis", cadence: "monthly", description: "Compare institutional metrics against IPEDS data and peer institution benchmarks", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Tableau", "Microsoft Power BI", "Canvas Data", "Blackboard Analytics",
      "Civitas Learning", "EAB", "SPSS", "R/Python",
      "Ellucian Banner", "Slack"
    ],
    dataAccessPermissions: {
      studentRecords: "Authorized — de-identified aggregate",
      lmsActivityData: "Full Access",
      assessmentData: "Full Access — aggregate",
      enrollmentData: "Full Access",
      surveyData: "Full Access",
      financialData: "Restricted — enrollment revenue only",
      facultyData: "Authorized — teaching metrics",
      institutionalBenchmarks: "Full Access"
    },
    communicationCapabilities: [
      "Academic leadership reporting on institutional effectiveness",
      "Faculty guidance on using analytics to improve teaching",
      "Accreditation body reporting with outcomes evidence",
      "Student services coordination for intervention support",
      "Board of trustees institutional performance presentations",
      "External benchmarking and peer collaboration"
    ],
    exampleWorkflows: [
      {
        name: "Predictive Student Success Modeling",
        steps: [
          "Extract historical student data including demographics, academic, and engagement variables",
          "Clean and prepare data for modeling, handle missing values",
          "Engineer features from LMS activity, attendance, and assessment patterns",
          "Train predictive models using logistic regression, random forest, and gradient boosting",
          "Validate model accuracy using cross-validation and holdout testing",
          "Deploy model to generate real-time risk scores for current students",
          "Deliver risk scores to advisors and student success teams",
          "Monitor model performance and retrain as needed"
        ]
      },
      {
        name: "Accreditation Outcomes Reporting",
        steps: [
          "Identify required outcomes data for accreditation standards",
          "Extract and compile data across programs and assessment tools",
          "Calculate key performance indicators per accreditation rubrics",
          "Prepare data visualizations and narrative summaries",
          "Review with program chairs and academic leadership",
          "Compile accreditation report sections with supporting evidence",
          "Archive data and methodology for accreditation visit"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Predictive Model Accuracy", target: "> 80% (AUC-ROC)", weight: 20 },
      { metric: "Dashboard Uptime", target: "> 99%", weight: 10 },
      { metric: "Report Delivery Timeliness", target: "Within 5 business days of data close", weight: 15 },
      { metric: "Accreditation Data Readiness", target: "100% on schedule", weight: 20 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 15 },
      { metric: "Data Quality Score", target: "> 95%", weight: 10 },
      { metric: "Intervention Impact Measurement", target: "> 90% of programs evaluated", weight: 10 }
    ],
    useCases: [
      "Predictive analytics for early identification of at-risk students",
      "Real-time learning engagement dashboards for faculty and administrators",
      "Automated accreditation reporting with outcomes evidence compilation",
      "Course effectiveness analysis driving curriculum improvement",
      "Institutional benchmarking against peer institutions and national standards"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 55, empathy: 50, directness: 80,
      creativity: 55, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["FERPA", "IRB (Institutional Review Board)", "ADA", "GDPR (international students)", "Accreditation Standards", "Ethical AI in Education Guidelines"],
      dataClassification: "FERPA — Student Education Records (de-identified for analytics)",
      auditRequirements: "Analytics methodology documented; de-identification procedures verified; model bias assessments conducted",
      retentionPolicy: "Analytics datasets: 7 years; model documentation: indefinite; survey data: 5 years",
      breachNotification: "FERPA notification for re-identification or unauthorized student data access"
    },
    skillsTags: ["learning analytics", "predictive modeling", "data visualization", "institutional research", "accreditation", "student success", "data science", "educational data mining", "assessment"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Training Coordinator AI",
    department: "Learning & Development",
    category: "Education & Training",
    industry: "Education",
    reportsTo: "Director of Learning & Development",
    seniorityLevel: "junior",
    description: "Coordinates corporate training programs and professional development initiatives, managing logistics, scheduling, enrollment, and tracking for instructor-led, virtual, and self-paced learning programs. Ensures training compliance requirements are met and provides reporting on learning program effectiveness and participation.",
    coreResponsibilities: [
      "Coordinate scheduling and logistics for training programs and workshops",
      "Manage training enrollment, waitlists, and participant communications",
      "Track mandatory and compliance training completion across the organization",
      "Maintain training records in the learning management system",
      "Coordinate with instructors, facilitators, and subject matter experts",
      "Process training evaluations and feedback surveys",
      "Generate training compliance and participation reports",
      "Manage training materials, resources, and inventory",
      "Support onboarding training programs for new employees",
      "Track training budgets and vendor relationships"
    ],
    tasks: [
      { name: "Training Schedule Management", cadence: "daily", description: "Update training calendar, confirm sessions, manage room/virtual platform bookings, and send reminders", priority: "high" },
      { name: "Enrollment Processing", cadence: "daily", description: "Process training registrations, manage waitlists, send confirmations, and handle cancellations", priority: "high" },
      { name: "Compliance Training Monitoring", cadence: "daily", description: "Track mandatory training deadlines, send completion reminders, and escalate overdue assignments", priority: "high" },
      { name: "Post-Training Administration", cadence: "daily", description: "Record attendance, distribute evaluations, update completion records in LMS", priority: "medium" },
      { name: "Training Report Generation", cadence: "weekly", description: "Compile participation rates, completion rates, and satisfaction scores across programs", priority: "medium" },
      { name: "Instructor Coordination", cadence: "weekly", description: "Coordinate with trainers on upcoming sessions, materials, and logistics requirements", priority: "medium" },
      { name: "Compliance Dashboard", cadence: "monthly", description: "Generate compliance training status dashboard for HR and department managers", priority: "high" },
      { name: "Budget & Vendor Review", cadence: "monthly", description: "Track training spending against budget, review vendor contracts and performance", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Cornerstone OnDemand", "SAP SuccessFactors LMS", "Workday Learning",
      "LinkedIn Learning", "Docebo", "Zoom",
      "Microsoft Teams", "SurveyMonkey", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      trainingRecords: "Full Access",
      employeeDirectory: "Authorized — department/role",
      complianceRecords: "Full Access",
      budgetData: "Authorized — training budget",
      performanceData: "Restricted — training-related only",
      vendorContracts: "Authorized",
      lmsAdministration: "Full Access",
      surveyResults: "Full Access"
    },
    communicationCapabilities: [
      "Employee communication for training enrollment and reminders",
      "Manager coordination for team training scheduling",
      "Instructor and facilitator logistics coordination",
      "HR reporting on compliance training status",
      "Vendor communication for external training procurement",
      "Automated training reminder and completion notifications"
    ],
    exampleWorkflows: [
      {
        name: "Training Program Setup & Delivery",
        steps: [
          "Receive training request from HR or department manager",
          "Identify target audience and schedule preferred dates",
          "Reserve training room or configure virtual platform",
          "Coordinate with instructor on materials and requirements",
          "Open enrollment and distribute registration invitations",
          "Send pre-training materials and logistics information",
          "Manage attendance tracking during session",
          "Distribute evaluations and collect feedback",
          "Record completions in LMS and generate attendance report"
        ]
      },
      {
        name: "Compliance Training Campaign",
        steps: [
          "Identify compliance training requirements and affected employees",
          "Configure training assignments in LMS with deadlines",
          "Send initial notifications to all assigned employees",
          "Monitor completion progress against deadlines",
          "Send escalating reminders at 14-day, 7-day, and 1-day intervals",
          "Escalate non-compliant employees to managers and HR",
          "Generate compliance status report for leadership",
          "Archive completion records for audit purposes"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Compliance Training Completion", target: "> 98% on time", weight: 25 },
      { metric: "Training Satisfaction Score", target: "> 4.0/5.0", weight: 15 },
      { metric: "Enrollment Processing Time", target: "< 24 hours", weight: 10 },
      { metric: "Schedule Accuracy", target: "> 99% — no double bookings", weight: 15 },
      { metric: "Record Accuracy", target: "> 99%", weight: 15 },
      { metric: "Budget Adherence", target: "Within 5% of approved budget", weight: 10 },
      { metric: "Program Utilization Rate", target: "> 80% seat fill rate", weight: 10 }
    ],
    useCases: [
      "Automated training enrollment and waitlist management",
      "Compliance training tracking with escalation workflows",
      "Training program logistics coordination and scheduling optimization",
      "Learning metrics dashboard for organizational development",
      "New employee onboarding training program management"
    ],
    personalityDefaults: {
      formality: 60, enthusiasm: 65, empathy: 60, directness: 70,
      creativity: 35, humor: 30, assertiveness: 50
    },
    complianceMetadata: {
      frameworks: ["FERPA", "OSHA Training Requirements", "EEOC Guidelines", "Industry-Specific Compliance Training", "SOX Training Requirements", "HIPAA Training (if applicable)", "State Mandatory Training Laws"],
      dataClassification: "Confidential — Employee Training Records",
      auditRequirements: "Training completion records maintained for all mandatory training; audit trail for compliance assignments",
      retentionPolicy: "Training records: 7 years; compliance certifications: employment + 5 years; evaluations: 3 years",
      breachNotification: "HR notification for employee training record exposure"
    },
    skillsTags: ["training coordination", "LMS administration", "compliance training", "scheduling", "employee development", "program management", "reporting", "vendor management", "onboarding"],
    priceMonthly: 699,
    isActive: 1,
  },

  {
    title: "Academic Assessment Manager AI",
    department: "Assessment & Accreditation",
    category: "Education & Training",
    industry: "Education",
    reportsTo: "Provost",
    seniorityLevel: "senior",
    description: "Leads institutional assessment programs including student learning outcomes assessment, program review, and accreditation compliance. Designs assessment instruments, analyzes outcomes data, and coordinates continuous improvement processes to ensure educational quality and institutional effectiveness.",
    coreResponsibilities: [
      "Design and implement student learning outcomes assessment plans",
      "Coordinate program review processes across academic departments",
      "Manage accreditation self-study and compliance documentation",
      "Develop and validate assessment instruments and rubrics",
      "Analyze assessment data and prepare institutional effectiveness reports",
      "Facilitate faculty engagement in assessment and continuous improvement",
      "Maintain assessment management systems and data repositories",
      "Benchmark outcomes against national standards and peer institutions",
      "Support general education and core curriculum assessment",
      "Report assessment results to institutional leadership and governing board"
    ],
    tasks: [
      { name: "Assessment Data Collection", cadence: "daily", description: "Coordinate collection of assessment artifacts, rubric scores, and outcomes data from academic programs", priority: "high" },
      { name: "Instrument Development Support", cadence: "daily", description: "Support faculty in developing and refining assessment rubrics, surveys, and evaluation tools", priority: "medium" },
      { name: "Data Quality Review", cadence: "daily", description: "Review incoming assessment data for completeness, accuracy, and methodological rigor", priority: "medium" },
      { name: "Program Review Coordination", cadence: "weekly", description: "Track program review schedules, coordinate self-study preparation, and manage review documentation", priority: "high" },
      { name: "Assessment Results Analysis", cadence: "weekly", description: "Analyze assessment data, calculate achievement rates, and identify trends across programs", priority: "high" },
      { name: "Accreditation Preparation", cadence: "monthly", description: "Update accreditation compliance matrix, compile evidence, and prepare self-study components", priority: "high" },
      { name: "Institutional Effectiveness Report", cadence: "monthly", description: "Prepare comprehensive assessment report for provost and academic affairs committee", priority: "high" },
      { name: "Faculty Assessment Workshop", cadence: "monthly", description: "Develop and deliver faculty workshops on assessment best practices and closing the loop", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "WEAVE Online", "Taskstream (Watermark)", "LiveText",
      "Canvas Outcomes", "ExamSoft", "Qualtrics",
      "Tableau", "SPSS", "Microsoft Office 365", "Slack"
    ],
    dataAccessPermissions: {
      assessmentData: "Full Access",
      studentOutcomes: "Full Access — aggregate",
      programReviewDocuments: "Full Access",
      accreditationRecords: "Full Access",
      curriculumDocuments: "Authorized",
      institutionalData: "Full Access",
      facultyAssessmentRecords: "Authorized",
      surveyResults: "Full Access"
    },
    communicationCapabilities: [
      "Provost and academic leadership assessment reporting",
      "Faculty communication for assessment coordination and support",
      "Accreditation body correspondence and self-study submission",
      "Board of trustees institutional effectiveness presentations",
      "External review panel coordination for program reviews",
      "Cross-institutional collaboration on assessment best practices"
    ],
    exampleWorkflows: [
      {
        name: "Annual Assessment Cycle",
        steps: [
          "Distribute assessment plan templates to all academic programs",
          "Support programs in identifying outcomes and assessment methods",
          "Coordinate assessment data collection throughout academic year",
          "Analyze collected data against established benchmarks",
          "Prepare program-level assessment results summaries",
          "Facilitate 'closing the loop' discussions with faculty",
          "Document improvement actions and implementation plans",
          "Compile institutional assessment report for leadership"
        ]
      },
      {
        name: "Accreditation Self-Study",
        steps: [
          "Map accreditation standards to institutional evidence sources",
          "Assign standard chapters to faculty and staff writers",
          "Compile quantitative data tables and outcomes evidence",
          "Review draft chapters for accuracy and compliance",
          "Coordinate internal mock review and feedback",
          "Finalize self-study document with appendices",
          "Submit to accreditation body and prepare for site visit",
          "Coordinate site visit logistics and faculty/staff preparation"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Assessment Plan Completion", target: "> 95% of programs submitting", weight: 20 },
      { metric: "Accreditation Compliance", target: "100% standards met", weight: 25 },
      { metric: "Closing the Loop Rate", target: "> 80% of programs implementing improvements", weight: 15 },
      { metric: "Program Review Completion", target: "100% on schedule", weight: 15 },
      { metric: "Data Quality Score", target: "> 90%", weight: 10 },
      { metric: "Faculty Engagement", target: "> 75% participating in assessment activities", weight: 10 },
      { metric: "Report Timeliness", target: "Within institutional deadlines", weight: 5 }
    ],
    useCases: [
      "Automated assessment data collection and outcomes analysis",
      "Accreditation compliance monitoring and self-study management",
      "Program review coordination with continuous improvement tracking",
      "Institutional effectiveness dashboarding and trend analysis",
      "Faculty assessment training and professional development support"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 55, empathy: 55, directness: 75,
      creativity: 45, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["FERPA", "Regional Accreditation Standards", "Specialized Accreditation (AACSB, ABET, etc.)", "State Higher Education Requirements", "ADA", "Title IV"],
      dataClassification: "FERPA — Institutional & Student Assessment Data",
      auditRequirements: "Assessment methodology documented; outcomes data archived per accreditation cycle; rubric reliability established",
      retentionPolicy: "Assessment data: two accreditation cycles; program review: 10 years; accreditation self-studies: permanent",
      breachNotification: "FERPA notification for unauthorized assessment data disclosure"
    },
    skillsTags: ["academic assessment", "accreditation", "institutional effectiveness", "program review", "outcomes measurement", "rubric development", "data analysis", "continuous improvement", "higher education"],
    priceMonthly: 1199,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  MANUFACTURING & INDUSTRY 4.0 (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Quality Control Inspector AI",
    department: "Quality Assurance",
    category: "Manufacturing & Industry 4.0",
    industry: "Manufacturing",
    reportsTo: "Quality Director",
    seniorityLevel: "mid",
    description: "Monitors and enforces product quality standards throughout the manufacturing process, from incoming materials through final inspection and shipment. Manages inspection protocols, analyzes defect data, leads corrective action programs, and ensures compliance with ISO, GMP, and customer-specific quality requirements.",
    coreResponsibilities: [
      "Execute incoming, in-process, and final product quality inspections",
      "Develop and maintain inspection plans, sampling procedures, and acceptance criteria",
      "Analyze defect data to identify root causes and systemic quality issues",
      "Manage non-conformance reports (NCRs) and corrective action processes (CAPA)",
      "Calibrate and maintain inspection equipment and measurement tools",
      "Audit supplier quality performance and conduct supplier assessments",
      "Ensure compliance with ISO 9001, GMP, and industry-specific quality standards",
      "Conduct statistical process control (SPC) analysis and process capability studies",
      "Train production staff on quality standards, inspection procedures, and best practices",
      "Support customer quality requirements and complaint investigation"
    ],
    tasks: [
      { name: "Production Quality Monitoring", cadence: "daily", description: "Monitor real-time SPC data, review inspection results, and flag out-of-control processes", priority: "high" },
      { name: "Incoming Material Inspection", cadence: "daily", description: "Inspect incoming raw materials and components against specifications and approved vendor list", priority: "high" },
      { name: "NCR Processing", cadence: "daily", description: "Process non-conformance reports, assign disposition, and initiate corrective actions", priority: "high" },
      { name: "Final Product Inspection", cadence: "daily", description: "Conduct final inspection and testing per quality plan before product release", priority: "critical" },
      { name: "CAPA Tracking", cadence: "weekly", description: "Track corrective and preventive action progress, verify effectiveness of implemented actions", priority: "high" },
      { name: "SPC Analysis", cadence: "weekly", description: "Analyze statistical process control data, calculate Cpk/Ppk, identify process improvement opportunities", priority: "medium" },
      { name: "Quality Metrics Dashboard", cadence: "monthly", description: "Compile quality KPIs: defect rates, first-pass yield, COPQ, and customer complaint trends", priority: "high" },
      { name: "Management Review Support", cadence: "monthly", description: "Prepare quality performance data for management review per ISO 9001 requirements", priority: "high" }
    ],
    toolsAndIntegrations: [
      "SAP QM", "Oracle Quality Management", "ETQ Reliance",
      "Minitab", "InfinityQS ProFicient", "MasterControl",
      "Hexagon Metrology", "Zeiss CALYPSO", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      qualityRecords: "Full Access",
      productionData: "Full Access",
      supplierRecords: "Full Access",
      customerComplaints: "Full Access",
      calibrationRecords: "Full Access",
      engineeringDrawings: "Authorized",
      costData: "Restricted — COPQ only",
      employeeTraining: "Authorized — quality training"
    },
    communicationCapabilities: [
      "Production team communication for quality issues and holds",
      "Supplier quality communication for NCRs and corrective actions",
      "Customer quality correspondence and complaint resolution",
      "Management reporting on quality performance and trends",
      "Engineering collaboration on design and specification issues",
      "Regulatory body communication for quality system audits"
    ],
    exampleWorkflows: [
      {
        name: "Non-Conformance Investigation",
        steps: [
          "Identify non-conforming product through inspection or process monitoring",
          "Quarantine affected product and document non-conformance",
          "Conduct root cause analysis using 5-Why, fishbone, or 8D methodology",
          "Determine disposition: rework, scrap, use-as-is, or return to supplier",
          "Implement immediate containment actions",
          "Develop and implement corrective actions to prevent recurrence",
          "Verify corrective action effectiveness through follow-up inspection",
          "Close NCR and update quality trending data"
        ]
      },
      {
        name: "Supplier Quality Audit",
        steps: [
          "Select supplier for audit based on risk and performance data",
          "Prepare audit checklist against ISO 9001 and customer requirements",
          "Conduct on-site or remote audit of supplier quality system",
          "Document findings, observations, and non-conformances",
          "Present audit results to supplier management",
          "Track corrective action responses and implementation",
          "Update supplier quality rating and approved vendor list",
          "Report audit outcomes to quality management"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "First-Pass Yield", target: "> 98%", weight: 20 },
      { metric: "Customer Complaint Rate", target: "< 0.5% of shipments", weight: 20 },
      { metric: "CAPA Closure Rate", target: "> 90% within 30 days", weight: 15 },
      { metric: "Inspection Accuracy", target: "> 99%", weight: 15 },
      { metric: "Supplier Quality Score", target: "> 95% conformance", weight: 10 },
      { metric: "Cost of Poor Quality", target: "< 2% of revenue", weight: 10 },
      { metric: "Audit Finding Closure", target: "100% within deadline", weight: 10 }
    ],
    useCases: [
      "Real-time SPC monitoring with automated out-of-control alerts",
      "AI-powered defect pattern recognition and root cause prediction",
      "Automated inspection reporting and non-conformance workflow",
      "Supplier quality performance tracking and risk-based audit scheduling",
      "Cost of poor quality analysis and reduction strategy optimization"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 40, directness: 85,
      creativity: 35, humor: 10, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["ISO 9001", "ISO 13485 (medical)", "GMP", "IATF 16949 (automotive)", "AS9100 (aerospace)", "FDA 21 CFR (if applicable)", "OSHA"],
      dataClassification: "Confidential — Product Quality & Manufacturing Data",
      auditRequirements: "Quality records maintained per ISO 9001 document control; calibration records traceable to NIST",
      retentionPolicy: "Quality records: product life + 7 years; calibration: 3 calibration cycles; CAPA: 5 years after closure",
      breachNotification: "Immediate quality director notification for product safety or critical quality escapes"
    },
    skillsTags: ["quality control", "SPC", "ISO 9001", "CAPA", "root cause analysis", "inspection", "supplier quality", "metrology", "GMP compliance"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Production Planning Manager AI",
    department: "Production Planning",
    category: "Manufacturing & Industry 4.0",
    industry: "Manufacturing",
    reportsTo: "VP of Operations",
    seniorityLevel: "senior",
    description: "Plans and optimizes production schedules across manufacturing operations, balancing demand forecasts, capacity constraints, material availability, and delivery commitments. Coordinates cross-functional planning to maximize throughput, minimize changeover losses, and ensure on-time delivery performance.",
    coreResponsibilities: [
      "Develop master production schedules (MPS) based on demand and capacity",
      "Manage material requirements planning (MRP) and inventory optimization",
      "Coordinate production scheduling across work centers and production lines",
      "Balance capacity constraints with demand requirements and delivery commitments",
      "Optimize changeover sequences and batch sizing for efficiency",
      "Manage work-in-process (WIP) inventory and production flow",
      "Coordinate with procurement on raw material availability and lead times",
      "Track production progress and manage schedule deviations",
      "Support S&OP (Sales & Operations Planning) process with production data",
      "Analyze production performance metrics and identify improvement opportunities"
    ],
    tasks: [
      { name: "Production Schedule Update", cadence: "daily", description: "Review and update production schedules based on order changes, material availability, and capacity status", priority: "critical" },
      { name: "Material Availability Check", cadence: "daily", description: "Verify material availability for upcoming production runs, flag shortages, and coordinate expediting", priority: "high" },
      { name: "Production Progress Tracking", cadence: "daily", description: "Monitor production output against schedule, identify delays, and coordinate recovery actions", priority: "high" },
      { name: "Capacity Utilization Monitoring", cadence: "daily", description: "Track equipment and labor capacity utilization, identify bottlenecks and idle resources", priority: "medium" },
      { name: "MRP Run & Analysis", cadence: "weekly", description: "Execute MRP, analyze planned orders, review exception messages, and adjust planning parameters", priority: "high" },
      { name: "S&OP Data Preparation", cadence: "weekly", description: "Prepare production capacity and schedule data for S&OP review meetings", priority: "medium" },
      { name: "Schedule Adherence Report", cadence: "monthly", description: "Analyze schedule adherence, on-time delivery performance, and root causes for deviations", priority: "high" },
      { name: "Capacity Planning Review", cadence: "monthly", description: "Conduct medium-term capacity planning, identify constraints, and recommend capital investments", priority: "high" }
    ],
    toolsAndIntegrations: [
      "SAP PP/APO", "Oracle Manufacturing Cloud", "Kinaxis RapidResponse",
      "Plex Smart Manufacturing", "Epicor ERP", "PlanetTogether APS",
      "Microsoft Project", "Tableau", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      productionSchedules: "Full Access",
      inventoryData: "Full Access",
      demandForecasts: "Full Access",
      capacityData: "Full Access",
      supplierLeadTimes: "Full Access",
      costData: "Authorized — production costs",
      salesOrders: "Authorized — delivery dates",
      engineeringData: "Authorized — BOM and routing"
    },
    communicationCapabilities: [
      "Production floor coordination for schedule execution and changes",
      "Procurement collaboration on material availability and expediting",
      "Sales team coordination on delivery commitments and lead times",
      "Executive reporting on production performance and capacity",
      "Supply chain team coordination for S&OP alignment",
      "Maintenance coordination for equipment availability"
    ],
    exampleWorkflows: [
      {
        name: "Master Production Scheduling",
        steps: [
          "Receive updated demand forecast and firm customer orders",
          "Run rough-cut capacity planning against available resources",
          "Identify capacity constraints and material limitations",
          "Develop master production schedule with priority sequencing",
          "Optimize batch sizes and changeover sequences for efficiency",
          "Validate schedule feasibility with production and procurement",
          "Release production orders and work instructions",
          "Monitor execution and adjust for variances"
        ]
      },
      {
        name: "Schedule Recovery After Disruption",
        steps: [
          "Identify production disruption (equipment failure, material shortage, quality hold)",
          "Assess impact on current schedule and downstream commitments",
          "Evaluate recovery options (overtime, resequencing, alternative routing)",
          "Coordinate with sales on revised delivery dates if needed",
          "Implement revised schedule with priority adjustments",
          "Expedite materials or alternative sourcing if required",
          "Monitor recovery progress and adjust as needed",
          "Document root cause and prevention recommendations"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Schedule Adherence", target: "> 95%", weight: 20 },
      { metric: "On-Time Delivery", target: "> 98%", weight: 20 },
      { metric: "Capacity Utilization", target: "85-95% optimal range", weight: 15 },
      { metric: "Inventory Turns", target: "> industry benchmark", weight: 15 },
      { metric: "Changeover Efficiency", target: "< planned changeover time", weight: 10 },
      { metric: "WIP Inventory Level", target: "Within target range", weight: 10 },
      { metric: "MRP Exception Resolution", target: "< 48 hours", weight: 10 }
    ],
    useCases: [
      "AI-optimized production scheduling with constraint-based planning",
      "Predictive demand-capacity balancing with scenario simulation",
      "Real-time production tracking with automated schedule adjustment",
      "Inventory optimization using demand sensing and MRP analytics",
      "S&OP facilitation with integrated demand and supply planning"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 40, directness: 85,
      creativity: 45, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["ISO 9001", "OSHA", "EPA Manufacturing Regulations", "FDA cGMP (if applicable)", "Industry-Specific Standards"],
      dataClassification: "Confidential — Production & Supply Chain Data",
      auditRequirements: "Production records maintained per quality system; schedule changes documented with justification",
      retentionPolicy: "Production records: 5 years; planning data: 3 years; S&OP documentation: 5 years",
      breachNotification: "Operations VP notification for production data or customer order exposure"
    },
    skillsTags: ["production planning", "MRP/MPS", "capacity planning", "scheduling optimization", "inventory management", "S&OP", "lean manufacturing", "ERP systems", "supply chain"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Supply Chain Coordinator AI",
    department: "Supply Chain Management",
    category: "Manufacturing & Industry 4.0",
    industry: "Manufacturing",
    reportsTo: "Supply Chain Director",
    seniorityLevel: "mid",
    description: "Coordinates end-to-end supply chain operations including procurement, logistics, warehousing, and distribution. Optimizes supply chain efficiency through demand planning, supplier management, inventory control, and transportation coordination to ensure reliable product availability while minimizing costs.",
    coreResponsibilities: [
      "Coordinate procurement activities and manage purchase order workflows",
      "Monitor supplier performance, delivery reliability, and quality metrics",
      "Manage inventory levels to balance availability with carrying costs",
      "Coordinate inbound and outbound logistics and transportation",
      "Track shipments and manage delivery exceptions and claims",
      "Support demand planning with supply-side data and market intelligence",
      "Manage warehouse operations coordination and space optimization",
      "Conduct total cost of ownership analysis for sourcing decisions",
      "Coordinate supply chain risk assessment and mitigation planning",
      "Generate supply chain performance reports and analytics"
    ],
    tasks: [
      { name: "Order Management", cadence: "daily", description: "Process purchase orders, confirm supplier acknowledgments, and track delivery status", priority: "high" },
      { name: "Shipment Tracking", cadence: "daily", description: "Monitor inbound and outbound shipments, identify delays, and coordinate expediting", priority: "high" },
      { name: "Inventory Monitoring", cadence: "daily", description: "Review stock levels, flag reorder points, and manage safety stock thresholds", priority: "high" },
      { name: "Supplier Communication", cadence: "daily", description: "Coordinate with suppliers on delivery schedules, quality issues, and order changes", priority: "medium" },
      { name: "Logistics Coordination", cadence: "weekly", description: "Plan transportation loads, optimize routing, and manage carrier performance", priority: "medium" },
      { name: "Demand-Supply Alignment", cadence: "weekly", description: "Reconcile demand forecasts with supply availability, identify gaps and risks", priority: "high" },
      { name: "Supply Chain Dashboard", cadence: "monthly", description: "Compile supply chain KPIs: fill rate, lead times, inventory turns, logistics costs", priority: "high" },
      { name: "Supplier Scorecard Review", cadence: "monthly", description: "Evaluate supplier performance against scorecards, initiate improvement actions", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAP SCM", "Oracle Supply Chain Cloud", "Blue Yonder",
      "Manhattan Associates WMS", "FourKites", "project44",
      "Coupa Procurement", "Jaggaer", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      purchaseOrders: "Full Access",
      inventoryData: "Full Access",
      supplierRecords: "Full Access",
      logisticsData: "Full Access",
      demandForecasts: "Authorized",
      costData: "Authorized — procurement costs",
      warehouseData: "Full Access",
      contractData: "Authorized — supply agreements"
    },
    communicationCapabilities: [
      "Supplier coordination for orders, deliveries, and quality issues",
      "Logistics carrier communication for shipment management",
      "Internal stakeholder coordination for demand and supply alignment",
      "Customer service support for delivery inquiries",
      "Management reporting on supply chain performance",
      "Cross-functional collaboration for S&OP planning"
    ],
    exampleWorkflows: [
      {
        name: "Supply Disruption Response",
        steps: [
          "Detect supply disruption through monitoring or supplier notification",
          "Assess impact on production and customer commitments",
          "Identify alternative sources or substitute materials",
          "Evaluate expediting options and associated costs",
          "Coordinate with production planning on schedule adjustments",
          "Communicate revised timelines to affected customers",
          "Execute alternative sourcing or expediting plan",
          "Document lessons learned and update risk mitigation plans"
        ]
      },
      {
        name: "Strategic Sourcing Event",
        steps: [
          "Define sourcing requirements and evaluation criteria",
          "Identify and qualify potential suppliers",
          "Issue RFQ/RFP to qualified supplier pool",
          "Evaluate responses on quality, cost, delivery, and capability",
          "Conduct total cost of ownership analysis",
          "Negotiate terms with shortlisted suppliers",
          "Award business and onboard selected supplier",
          "Monitor initial deliveries and performance"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Order Fill Rate", target: "> 97%", weight: 20 },
      { metric: "Supplier On-Time Delivery", target: "> 95%", weight: 15 },
      { metric: "Inventory Turns", target: "> industry benchmark", weight: 15 },
      { metric: "Supply Chain Cost as % Revenue", target: "< industry average", weight: 15 },
      { metric: "Logistics Cost per Unit", target: "5% YoY reduction", weight: 10 },
      { metric: "Stockout Rate", target: "< 2%", weight: 15 },
      { metric: "Supplier Quality Rate", target: "> 98%", weight: 10 }
    ],
    useCases: [
      "End-to-end supply chain visibility with real-time tracking",
      "Predictive inventory optimization using demand sensing",
      "Automated purchase order management with supplier integration",
      "Supply chain risk monitoring and disruption response",
      "Transportation optimization with route and load planning"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 45, directness: 80,
      creativity: 40, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["ISO 9001", "ISO 28000 (Supply Chain Security)", "C-TPAT", "OSHA", "EPA Regulations", "Conflict Minerals (Dodd-Frank Section 1502)"],
      dataClassification: "Confidential — Supply Chain & Procurement Data",
      auditRequirements: "Procurement decisions documented; supplier qualifications maintained; logistics records traceable",
      retentionPolicy: "Purchase records: 7 years; supplier files: relationship + 5 years; logistics documents: 5 years",
      breachNotification: "Supply chain director notification for procurement data or pricing exposure"
    },
    skillsTags: ["supply chain management", "procurement", "logistics", "inventory management", "supplier management", "demand planning", "warehouse operations", "transportation", "strategic sourcing"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Predictive Maintenance Engineer AI",
    department: "Maintenance Engineering",
    category: "Manufacturing & Industry 4.0",
    industry: "Manufacturing",
    reportsTo: "Maintenance Director",
    seniorityLevel: "senior",
    description: "Implements and manages predictive maintenance programs using IoT sensor data, vibration analysis, thermography, and machine learning to anticipate equipment failures before they occur. Optimizes maintenance schedules, reduces unplanned downtime, and extends equipment life while balancing maintenance costs with operational reliability.",
    coreResponsibilities: [
      "Deploy and manage condition monitoring systems (vibration, temperature, oil analysis)",
      "Develop predictive models using machine learning on equipment sensor data",
      "Analyze equipment health data to predict failure modes and remaining useful life",
      "Optimize maintenance schedules from reactive/preventive to predictive strategies",
      "Manage CMMS (Computerized Maintenance Management System) data and workflows",
      "Coordinate maintenance activities with production planning",
      "Track and analyze equipment reliability metrics (OEE, MTBF, MTTR)",
      "Manage spare parts inventory and critical spare identification",
      "Support root cause failure analysis for equipment breakdowns",
      "Develop and maintain equipment maintenance strategies and PM programs"
    ],
    tasks: [
      { name: "Equipment Health Monitoring", cadence: "daily", description: "Review IoT sensor dashboards, analyze condition monitoring data, and flag equipment health alerts", priority: "critical" },
      { name: "Predictive Alert Triage", cadence: "daily", description: "Evaluate predictive maintenance alerts, assess urgency, and schedule corrective maintenance", priority: "high" },
      { name: "Work Order Management", cadence: "daily", description: "Create, prioritize, and track maintenance work orders, coordinate with technicians and production", priority: "high" },
      { name: "Spare Parts Planning", cadence: "daily", description: "Monitor critical spare parts inventory, forecast demand, and manage replenishment", priority: "medium" },
      { name: "Reliability Analysis", cadence: "weekly", description: "Analyze equipment reliability trends, calculate OEE/MTBF/MTTR, identify improvement targets", priority: "high" },
      { name: "PM Schedule Optimization", cadence: "weekly", description: "Review and optimize preventive maintenance schedules based on condition data and failure analysis", priority: "medium" },
      { name: "Maintenance Performance Dashboard", cadence: "monthly", description: "Compile maintenance KPIs: uptime, PM compliance, backlog, cost per unit of production", priority: "high" },
      { name: "Failure Mode Analysis", cadence: "monthly", description: "Conduct FMEA reviews, update criticality rankings, and adjust maintenance strategies", priority: "high" }
    ],
    toolsAndIntegrations: [
      "IBM Maximo", "SAP Plant Maintenance", "Fiix CMMS",
      "Emerson AMS", "SKF @ptitude", "Fluke Connect",
      "OSIsoft PI (AVEVA)", "Azure IoT Hub", "Python/TensorFlow", "Slack"
    ],
    dataAccessPermissions: {
      equipmentData: "Full Access",
      sensorData: "Full Access",
      maintenanceRecords: "Full Access",
      productionSchedules: "Authorized",
      sparePartsInventory: "Full Access",
      costData: "Authorized — maintenance costs",
      safetyRecords: "Authorized",
      vendorContracts: "Authorized — maintenance services"
    },
    communicationCapabilities: [
      "Production team coordination for maintenance scheduling",
      "Maintenance technician work order dispatch and guidance",
      "Equipment vendor communication for warranty and service",
      "Management reporting on equipment reliability and costs",
      "Safety team coordination for equipment-related hazards",
      "Automated equipment health alerts and failure predictions"
    ],
    exampleWorkflows: [
      {
        name: "Predictive Failure Response",
        steps: [
          "Receive anomaly alert from condition monitoring system",
          "Analyze sensor data trends (vibration, temperature, current)",
          "Correlate with historical failure patterns and ML model predictions",
          "Estimate remaining useful life and failure probability",
          "Assess production impact and schedule maintenance window",
          "Create work order with diagnosis, parts list, and procedures",
          "Coordinate with production for equipment access",
          "Execute maintenance and verify equipment health post-repair",
          "Update predictive model with outcome data"
        ]
      },
      {
        name: "Reliability Improvement Program",
        steps: [
          "Identify top equipment reliability issues from Pareto analysis",
          "Conduct root cause failure analysis (RCFA) on chronic failures",
          "Evaluate maintenance strategy (run-to-fail, PM, PdM, redesign)",
          "Develop improvement plan with cost-benefit analysis",
          "Implement approved changes (procedure, design, or monitoring)",
          "Monitor improvement metrics over defined evaluation period",
          "Standardize successful improvements across similar equipment",
          "Report reliability improvement results to management"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Overall Equipment Effectiveness (OEE)", target: "> 85%", weight: 20 },
      { metric: "Unplanned Downtime Reduction", target: "> 30% YoY", weight: 20 },
      { metric: "Predictive Alert Accuracy", target: "> 85%", weight: 15 },
      { metric: "PM Compliance Rate", target: "> 95%", weight: 10 },
      { metric: "MTBF Improvement", target: "> 10% YoY", weight: 15 },
      { metric: "Maintenance Cost per Unit", target: "< budget target", weight: 10 },
      { metric: "Work Order Backlog", target: "< 2 weeks", weight: 10 }
    ],
    useCases: [
      "IoT-driven predictive maintenance with ML-based failure prediction",
      "Equipment health digital twin modeling and simulation",
      "Reliability-centered maintenance program optimization",
      "Spare parts demand forecasting and inventory optimization",
      "Real-time OEE monitoring with automated root cause identification"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 55, empathy: 35, directness: 85,
      creativity: 50, humor: 15, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["OSHA", "EPA", "ISO 55000 (Asset Management)", "ISO 9001", "NFPA", "Industry-Specific Safety Standards"],
      dataClassification: "Confidential — Equipment & Operational Data",
      auditRequirements: "Maintenance records maintained per regulatory requirements; equipment history traceable; calibration documented",
      retentionPolicy: "Equipment records: asset life + 5 years; maintenance logs: 7 years; sensor data: 3 years raw, aggregated permanently",
      breachNotification: "Maintenance director notification for operational data exposure or safety system compromise"
    },
    skillsTags: ["predictive maintenance", "reliability engineering", "IoT sensors", "condition monitoring", "CMMS", "OEE", "vibration analysis", "machine learning", "FMEA"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Safety Compliance Officer AI",
    department: "Environmental Health & Safety",
    category: "Manufacturing & Industry 4.0",
    industry: "Manufacturing",
    reportsTo: "VP of Operations",
    seniorityLevel: "senior",
    description: "Manages workplace safety and environmental compliance programs, ensuring adherence to OSHA, EPA, and industry-specific safety regulations. Conducts risk assessments, incident investigations, safety training, and regulatory reporting while fostering a culture of safety awareness and continuous improvement.",
    coreResponsibilities: [
      "Develop and enforce workplace safety policies and procedures",
      "Conduct workplace hazard assessments and safety inspections",
      "Manage OSHA compliance including recordkeeping and reporting",
      "Investigate workplace incidents and near misses with root cause analysis",
      "Coordinate safety training programs and certification tracking",
      "Manage environmental compliance (EPA, state environmental agencies)",
      "Conduct ergonomic assessments and recommend workplace improvements",
      "Maintain safety data sheets (SDS) and chemical inventory management",
      "Support workers' compensation claims and return-to-work programs",
      "Report safety metrics and trends to management and safety committees"
    ],
    tasks: [
      { name: "Safety Inspection Rounds", cadence: "daily", description: "Conduct facility safety walks, identify hazards, verify PPE compliance, and document findings", priority: "high" },
      { name: "Incident Review & Investigation", cadence: "daily", description: "Review new incident reports, classify severity, initiate investigations for recordable events", priority: "critical" },
      { name: "Safety Training Tracking", cadence: "daily", description: "Monitor safety training completion, certifications, and upcoming renewal deadlines", priority: "high" },
      { name: "Permit Management", cadence: "daily", description: "Process and manage safety permits (hot work, confined space, lockout/tagout)", priority: "high" },
      { name: "OSHA Recordkeeping", cadence: "weekly", description: "Update OSHA 300 log, verify incident classification, and maintain recordkeeping compliance", priority: "high" },
      { name: "Environmental Monitoring", cadence: "weekly", description: "Review air quality, waste disposal, and emissions monitoring data for compliance", priority: "medium" },
      { name: "Safety Performance Dashboard", cadence: "monthly", description: "Compile safety metrics: TRIR, DART, near-miss ratio, training compliance, inspection findings", priority: "high" },
      { name: "Regulatory Compliance Audit", cadence: "monthly", description: "Conduct internal compliance audits against OSHA standards and identify remediation needs", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Intelex EHS", "VelocityEHS", "Gensuite",
      "iAuditor (SafetyCulture)", "Brady Lockout/Tagout", "Industrial Scientific Gas Detection",
      "KPA EHS", "Chemwatch SDS", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      safetyRecords: "Full Access",
      incidentReports: "Full Access",
      trainingRecords: "Full Access",
      chemicalInventory: "Full Access",
      environmentalData: "Full Access",
      employeeRecords: "Authorized — safety-related",
      workersCompensation: "Authorized",
      facilityData: "Full Access"
    },
    communicationCapabilities: [
      "OSHA and regulatory agency communication and reporting",
      "Management safety performance reporting",
      "Employee safety communication and training delivery",
      "Workers' compensation coordination with insurance carriers",
      "Emergency response team coordination",
      "Safety committee facilitation and meeting management"
    ],
    exampleWorkflows: [
      {
        name: "Workplace Incident Investigation",
        steps: [
          "Receive incident notification and ensure medical response",
          "Secure incident scene and preserve evidence",
          "Conduct initial interviews with witnesses and involved employees",
          "Document scene conditions, equipment status, and procedures in use",
          "Perform root cause analysis using investigation methodology",
          "Classify incident per OSHA recordkeeping requirements",
          "Develop corrective actions to prevent recurrence",
          "Communicate findings and lessons learned across organization",
          "Track corrective action implementation and verify effectiveness"
        ]
      },
      {
        name: "OSHA Inspection Preparation",
        steps: [
          "Maintain inspection-ready status through regular self-audits",
          "Verify OSHA 300/300A/301 logs are current and accurate",
          "Ensure all required postings and safety plans are displayed",
          "Review training records for completeness and currency",
          "Verify all permits and certifications are current",
          "Brief management team on inspection protocols and rights",
          "Prepare facility walk-through route and documentation",
          "Designate inspection escort and document control personnel"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Total Recordable Incident Rate (TRIR)", target: "< industry average", weight: 25 },
      { metric: "Days Away/Restricted (DART) Rate", target: "< industry average", weight: 15 },
      { metric: "Near-Miss Reporting Rate", target: "> 10:1 near-miss to incident ratio", weight: 10 },
      { metric: "Safety Training Compliance", target: "> 98%", weight: 15 },
      { metric: "Inspection Finding Closure", target: "> 95% within 30 days", weight: 15 },
      { metric: "OSHA Compliance Score", target: "100%", weight: 10 },
      { metric: "Environmental Compliance", target: "Zero violations", weight: 10 }
    ],
    useCases: [
      "Automated safety inspection scheduling and finding tracking",
      "Incident investigation workflow with root cause analysis support",
      "Predictive safety analytics identifying high-risk conditions",
      "OSHA recordkeeping automation and regulatory reporting",
      "Safety training management with certification tracking and renewal alerts"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 50, empathy: 60, directness: 85,
      creativity: 30, humor: 10, assertiveness: 85
    },
    complianceMetadata: {
      frameworks: ["OSHA General Industry (29 CFR 1910)", "OSHA Construction (29 CFR 1926)", "EPA RCRA", "EPA Clean Air Act", "EPA Clean Water Act", "NFPA", "ANSI Standards", "State OSHA Plans"],
      dataClassification: "Confidential — Safety & Environmental Data",
      auditRequirements: "OSHA logs maintained per 29 CFR 1904; environmental records per EPA requirements; training documented with sign-off",
      retentionPolicy: "OSHA 300 logs: 5 years; exposure records: 30 years; training: employment + 3 years; environmental: per permit requirements",
      breachNotification: "OSHA notification for workplace fatalities within 8 hours; hospitalizations within 24 hours"
    },
    skillsTags: ["workplace safety", "OSHA compliance", "incident investigation", "environmental compliance", "hazard assessment", "safety training", "EHS management", "risk assessment", "regulatory reporting"],
    priceMonthly: 1299,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  HOSPITALITY & TRAVEL (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Guest Experience Manager AI",
    department: "Guest Services",
    category: "Hospitality & Travel",
    industry: "Hospitality",
    reportsTo: "Director of Operations",
    seniorityLevel: "senior",
    description: "Oversees the end-to-end guest experience across all touchpoints, from pre-arrival through post-departure. Analyzes guest feedback, manages service recovery, coordinates personalized experiences, and drives guest satisfaction and loyalty initiatives to maximize repeat business and positive reviews.",
    coreResponsibilities: [
      "Monitor and respond to guest feedback across all channels and platforms",
      "Manage service recovery processes for guest complaints and issues",
      "Develop and execute guest loyalty and recognition programs",
      "Analyze guest satisfaction data and identify improvement opportunities",
      "Coordinate personalized guest experiences based on preferences and history",
      "Train and support front-line staff on service excellence standards",
      "Manage online reputation across review platforms and social media",
      "Track guest journey metrics from booking through post-stay",
      "Coordinate VIP and special occasion guest services",
      "Report guest experience metrics and trends to leadership"
    ],
    tasks: [
      { name: "Guest Feedback Monitoring", cadence: "daily", description: "Review guest reviews, survey responses, and social media mentions; respond and escalate as needed", priority: "high" },
      { name: "Service Recovery Management", cadence: "daily", description: "Process guest complaints, authorize recovery actions, and follow up on resolution", priority: "critical" },
      { name: "VIP & Special Request Coordination", cadence: "daily", description: "Review upcoming VIP arrivals, special occasions, and personalization requests; coordinate departments", priority: "high" },
      { name: "Front Desk Coaching", cadence: "daily", description: "Observe guest interactions, provide real-time coaching, and reinforce service standards", priority: "medium" },
      { name: "Guest Satisfaction Analysis", cadence: "weekly", description: "Analyze survey scores, review trends, and identify top improvement opportunities by department", priority: "high" },
      { name: "Online Reputation Report", cadence: "weekly", description: "Track review ratings across TripAdvisor, Google, Booking.com; analyze sentiment trends", priority: "medium" },
      { name: "Guest Experience Dashboard", cadence: "monthly", description: "Compile comprehensive guest experience report with NPS, CSAT, review scores, and service recovery metrics", priority: "high" },
      { name: "Loyalty Program Analysis", cadence: "monthly", description: "Analyze loyalty program performance, member engagement, and redemption patterns", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Medallia", "Revinate", "ReviewPro",
      "Opera PMS (Oracle)", "Salesforce Hospitality Cloud", "TrustYou",
      "Hootsuite", "Zendesk", "WhatsApp Business", "Slack"
    ],
    dataAccessPermissions: {
      guestProfiles: "Full Access",
      reservationData: "Full Access",
      feedbackData: "Full Access",
      loyaltyRecords: "Full Access",
      revenueData: "Restricted — RevPAR and occupancy",
      employeeRecords: "Restricted — service performance",
      socialMedia: "Full Access",
      financialData: "Restricted — service recovery budget"
    },
    communicationCapabilities: [
      "Guest communication across email, SMS, chat, and social media",
      "Department head coordination for service delivery",
      "Management reporting on guest experience metrics",
      "Online review platform response management",
      "VIP guest personalized communication",
      "Staff recognition and service excellence communication"
    ],
    exampleWorkflows: [
      {
        name: "Guest Complaint Resolution",
        steps: [
          "Receive guest complaint via direct feedback, review, or staff report",
          "Acknowledge complaint and apologize within service standards timeframe",
          "Investigate root cause with relevant department",
          "Determine appropriate recovery action based on severity and guest value",
          "Execute service recovery (upgrade, discount, amenity, or personal attention)",
          "Follow up with guest to confirm satisfaction with resolution",
          "Document complaint and resolution for trending analysis",
          "Implement systemic improvements to prevent recurrence"
        ]
      },
      {
        name: "VIP Guest Experience Management",
        steps: [
          "Review VIP guest profile, preferences, and past stay history",
          "Coordinate personalized room setup and amenities",
          "Brief front desk and concierge on VIP arrival details",
          "Ensure priority check-in experience",
          "Monitor guest satisfaction throughout stay",
          "Coordinate any special requests or experiences",
          "Facilitate personalized departure experience",
          "Send post-stay thank you and gather feedback"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Net Promoter Score (NPS)", target: "> 60", weight: 20 },
      { metric: "Guest Satisfaction Score (CSAT)", target: "> 4.5/5.0", weight: 20 },
      { metric: "Online Review Score", target: "> 4.3/5.0 across platforms", weight: 15 },
      { metric: "Service Recovery Success Rate", target: "> 85%", weight: 15 },
      { metric: "Complaint Response Time", target: "< 1 hour", weight: 10 },
      { metric: "Repeat Guest Rate", target: "> 40%", weight: 10 },
      { metric: "Loyalty Program Engagement", target: "> 30% of guests enrolled", weight: 10 }
    ],
    useCases: [
      "AI-powered sentiment analysis across guest feedback channels",
      "Personalized guest experience automation based on preference profiles",
      "Real-time service recovery with automated escalation workflows",
      "Online reputation management with intelligent response generation",
      "Guest loyalty optimization through behavioral analytics"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 80, empathy: 90, directness: 55,
      creativity: 60, humor: 40, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "ADA Accessibility", "State Consumer Protection Laws", "Tourism Board Regulations"],
      dataClassification: "PII — Guest Personal & Preference Data",
      auditRequirements: "Guest data access logged; complaint resolution documented; financial transactions per PCI-DSS",
      retentionPolicy: "Guest profiles: per consent/GDPR; complaint records: 5 years; financial: 7 years",
      breachNotification: "GDPR/CCPA notification within 72 hours for guest data exposure"
    },
    skillsTags: ["guest experience", "hospitality management", "service recovery", "reputation management", "loyalty programs", "NPS", "customer satisfaction", "personalization", "review management"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Revenue Management Analyst AI",
    department: "Revenue Management",
    category: "Hospitality & Travel",
    industry: "Hospitality",
    reportsTo: "Director of Revenue Management",
    seniorityLevel: "mid",
    description: "Optimizes revenue through dynamic pricing, demand forecasting, inventory management, and distribution channel strategy. Analyzes market conditions, competitive pricing, and booking patterns to maximize revenue per available room (RevPAR) and total revenue across all revenue-generating outlets.",
    coreResponsibilities: [
      "Develop and execute dynamic pricing strategies based on demand forecasts",
      "Analyze booking pace, pickup patterns, and market demand indicators",
      "Manage room inventory allocation across distribution channels",
      "Monitor competitive pricing and market positioning",
      "Forecast occupancy, ADR, and RevPAR for budgeting and planning",
      "Optimize group pricing, minimum stay requirements, and rate fences",
      "Manage OTA relationships and channel distribution costs",
      "Analyze ancillary revenue opportunities (F&B, spa, events)",
      "Support annual budgeting with revenue projections and market analysis",
      "Report revenue performance metrics and strategic recommendations"
    ],
    tasks: [
      { name: "Rate Strategy Review", cadence: "daily", description: "Review and adjust room rates based on demand signals, competitor pricing, and booking pace", priority: "critical" },
      { name: "Booking Pace Analysis", cadence: "daily", description: "Analyze booking pickup vs. forecast, identify pace variances, and recommend strategy adjustments", priority: "high" },
      { name: "Competitive Rate Shopping", cadence: "daily", description: "Monitor competitor rates across channels, analyze market positioning, and adjust rate strategy", priority: "high" },
      { name: "Channel Mix Optimization", cadence: "daily", description: "Balance inventory distribution across OTAs, direct bookings, GDS, and wholesale to optimize net revenue", priority: "medium" },
      { name: "Demand Forecast Update", cadence: "weekly", description: "Update rolling demand forecast incorporating market events, historical data, and current trends", priority: "high" },
      { name: "Revenue Strategy Meeting Prep", cadence: "weekly", description: "Prepare revenue performance analysis, market intelligence, and strategy recommendations", priority: "high" },
      { name: "Monthly Revenue Report", cadence: "monthly", description: "Compile comprehensive revenue report: occupancy, ADR, RevPAR, channel performance, market share", priority: "high" },
      { name: "Budget Variance Analysis", cadence: "monthly", description: "Analyze revenue performance against budget, identify drivers, and forecast year-end position", priority: "high" }
    ],
    toolsAndIntegrations: [
      "IDeaS Revenue Solutions", "Duetto", "RateGain",
      "STR (CoStar)", "OTA Insight", "SiteMinder",
      "Opera PMS", "Sabre Hospitality", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      reservationData: "Full Access",
      pricingData: "Full Access",
      revenueReports: "Full Access",
      competitorData: "Full Access",
      channelPerformance: "Full Access",
      guestSegmentation: "Authorized",
      budgetData: "Full Access",
      contractData: "Authorized — rate agreements"
    },
    communicationCapabilities: [
      "Sales team collaboration on group pricing and contract rates",
      "Executive reporting on revenue performance and market position",
      "OTA and channel partner relationship management",
      "Marketing coordination for promotional pricing campaigns",
      "Operations team coordination on capacity and service levels",
      "Ownership/asset management financial reporting"
    ],
    exampleWorkflows: [
      {
        name: "Dynamic Pricing Adjustment",
        steps: [
          "Monitor demand signals: booking pace, search volume, market events",
          "Compare actual pickup against forecasted demand by date",
          "Analyze competitive pricing for target dates and segments",
          "Calculate optimal rate based on demand elasticity model",
          "Apply rate adjustments across distribution channels",
          "Set minimum stay and rate fence restrictions as appropriate",
          "Monitor booking response to pricing changes",
          "Refine model based on actual conversion outcomes"
        ]
      },
      {
        name: "Group Business Evaluation",
        steps: [
          "Receive group RFP with dates, room count, and requirements",
          "Analyze displacement of transient demand for requested dates",
          "Calculate group contribution vs. transient opportunity cost",
          "Factor in ancillary revenue (F&B, meeting space, AV)",
          "Determine minimum acceptable rate for group",
          "Present recommendation with rate range and conditions",
          "Support sales negotiation with real-time analysis",
          "Post-event analysis of actual vs. projected contribution"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "RevPAR Index (RGI)", target: "> 100 (fair share)", weight: 25 },
      { metric: "Forecast Accuracy", target: "Within 3% for 30-day window", weight: 15 },
      { metric: "ADR Growth", target: "> market average", weight: 15 },
      { metric: "Direct Booking Ratio", target: "> 50% of room nights", weight: 15 },
      { metric: "Revenue vs Budget", target: "Within 2%", weight: 10 },
      { metric: "Channel Cost Optimization", target: "< 15% blended commission rate", weight: 10 },
      { metric: "Occupancy Optimization", target: "> 85% during peak", weight: 10 }
    ],
    useCases: [
      "AI-driven dynamic pricing with real-time demand responsiveness",
      "Predictive demand forecasting using market signals and booking data",
      "Competitive intelligence with automated rate shopping and analysis",
      "Channel distribution optimization maximizing net revenue",
      "Total revenue optimization including ancillary revenue streams"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 35, directness: 85,
      creativity: 45, humor: 15, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "Rate Parity Regulations", "OTA Contract Terms", "Antitrust Laws (pricing)"],
      dataClassification: "Confidential — Revenue & Pricing Strategy",
      auditRequirements: "Pricing decisions documented; competitive data sourced legally; rate parity compliance verified",
      retentionPolicy: "Revenue data: 7 years; pricing history: 5 years; competitive analysis: 3 years",
      breachNotification: "Revenue director notification for pricing strategy or competitive intelligence exposure"
    },
    skillsTags: ["revenue management", "dynamic pricing", "demand forecasting", "yield management", "competitive analysis", "distribution strategy", "hotel analytics", "market segmentation", "RevPAR optimization"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Booking & Reservations Coordinator AI",
    department: "Reservations",
    category: "Hospitality & Travel",
    industry: "Hospitality",
    reportsTo: "Reservations Manager",
    seniorityLevel: "junior",
    description: "Manages the reservation lifecycle including booking processing, modification, cancellation, and group block management. Ensures accurate inventory management, rate integrity, and guest communication while maximizing booking conversion and providing exceptional pre-arrival service.",
    coreResponsibilities: [
      "Process individual and group reservations across all booking channels",
      "Manage reservation modifications, cancellations, and waitlist requests",
      "Verify rate accuracy and availability across distribution channels",
      "Communicate pre-arrival information, confirmations, and special arrangements",
      "Manage group room blocks, rooming lists, and cutoff dates",
      "Handle overbooking situations and walk procedures",
      "Process travel agent and corporate rate bookings",
      "Monitor no-show patterns and cancellation trends",
      "Support upselling and upgrade opportunities during booking process",
      "Maintain reservation system data accuracy and integrity"
    ],
    tasks: [
      { name: "Reservation Processing", cadence: "daily", description: "Process incoming reservations from phone, email, web, and OTA channels; confirm bookings", priority: "high" },
      { name: "Modification & Cancellation Handling", cadence: "daily", description: "Process reservation changes, apply cancellation policies, and manage rebooking", priority: "high" },
      { name: "Pre-Arrival Communication", cadence: "daily", description: "Send arrival information, collect preferences, and coordinate special requests for upcoming guests", priority: "medium" },
      { name: "Rate & Inventory Audit", cadence: "daily", description: "Verify rate parity across channels, check inventory accuracy, and resolve discrepancies", priority: "medium" },
      { name: "Group Block Management", cadence: "weekly", description: "Monitor group block pickup, send rooming list reminders, manage cutoff dates", priority: "high" },
      { name: "Conversion Analysis", cadence: "weekly", description: "Analyze booking conversion rates by channel, identify abandonment patterns", priority: "medium" },
      { name: "Reservation Report", cadence: "monthly", description: "Compile reservation statistics: booking volume, source mix, cancellation rates, ADR by channel", priority: "medium" },
      { name: "Overbooking Strategy Review", cadence: "monthly", description: "Analyze no-show and cancellation patterns to optimize overbooking strategy", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Opera PMS (Oracle)", "Cloudbeds", "SiteMinder Channel Manager",
      "Booking.com Extranet", "Expedia Partner Central", "Sabre GDS",
      "Travelport", "Mailchimp", "Twilio SMS", "Slack"
    ],
    dataAccessPermissions: {
      reservationData: "Full Access",
      guestProfiles: "Full Access",
      rateStructure: "Authorized",
      channelData: "Full Access",
      paymentData: "Restricted — PCI compliant processing",
      groupContracts: "Authorized",
      inventoryData: "Full Access",
      financialReports: "Restricted — reservation revenue"
    },
    communicationCapabilities: [
      "Guest communication for booking confirmation and pre-arrival coordination",
      "Travel agent and corporate booker correspondence",
      "Group coordinator communication for block management",
      "Internal team coordination for special requests and VIP arrivals",
      "OTA and channel partner communication for booking issues",
      "Automated booking confirmation and reminder messaging"
    ],
    exampleWorkflows: [
      {
        name: "Group Reservation Management",
        steps: [
          "Receive group contract with room block details",
          "Create group block in PMS with agreed rates and terms",
          "Set cutoff date reminders and pickup monitoring",
          "Send rooming list request to group coordinator",
          "Process individual reservations from rooming list",
          "Monitor pickup pace and communicate with sales on adjustments",
          "Release unbooked rooms at cutoff date per contract terms",
          "Prepare group billing summary and reconcile charges"
        ]
      },
      {
        name: "Overbooking Walk Procedure",
        steps: [
          "Identify overbooking situation based on arrivals vs. inventory",
          "Select walk candidate based on criteria (lowest rate, single night, loyalty status)",
          "Secure comparable accommodation at partner property",
          "Contact guest to arrange alternative accommodation",
          "Arrange transportation to partner property",
          "Provide compensation per walk policy (future stay credit, amenities)",
          "Document walk occurrence for future overbooking calibration",
          "Follow up next day to offer rebooking at original property"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Booking Accuracy", target: "> 99.5%", weight: 20 },
      { metric: "Response Time", target: "< 30 minutes for email/web inquiries", weight: 15 },
      { metric: "Conversion Rate", target: "> 35% for direct inquiries", weight: 15 },
      { metric: "Rate Parity Compliance", target: "100%", weight: 15 },
      { metric: "Guest Satisfaction (Pre-Arrival)", target: "> 4.3/5.0", weight: 15 },
      { metric: "Group Block Utilization", target: "> 80% pickup", weight: 10 },
      { metric: "Walk Rate", target: "< 1% of arrivals", weight: 10 }
    ],
    useCases: [
      "Automated reservation processing with multi-channel integration",
      "Intelligent upselling recommendations during booking process",
      "Group block management with automated pickup tracking and alerts",
      "Pre-arrival guest communication and preference collection",
      "Rate parity monitoring and distribution channel management"
    ],
    personalityDefaults: {
      formality: 60, enthusiasm: 75, empathy: 70, directness: 65,
      creativity: 35, humor: 35, assertiveness: 50
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "ADA", "State Hotel/Tourism Regulations", "Travel Agent Regulations"],
      dataClassification: "PII + PCI — Guest Personal & Payment Data",
      auditRequirements: "Reservation transactions logged; payment data handled per PCI-DSS; cancellation policies documented",
      retentionPolicy: "Reservation records: 3 years; payment data per PCI-DSS; guest correspondence: 2 years",
      breachNotification: "PCI-DSS notification for payment data breach; GDPR/CCPA for personal data exposure"
    },
    skillsTags: ["reservations management", "booking systems", "channel management", "guest communication", "group sales support", "PMS administration", "rate management", "customer service", "hospitality operations"],
    priceMonthly: 799,
    isActive: 1,
  },

  {
    title: "Event Planning Specialist AI",
    department: "Events & Conferences",
    category: "Hospitality & Travel",
    industry: "Hospitality",
    reportsTo: "Director of Events",
    seniorityLevel: "mid",
    description: "Plans and coordinates corporate events, conferences, weddings, and social functions from initial inquiry through post-event analysis. Manages event logistics, vendor coordination, budgets, and client communication to deliver flawless events that exceed client expectations and generate positive reviews and repeat business.",
    coreResponsibilities: [
      "Manage event inquiries and prepare proposals with pricing and logistics",
      "Coordinate event logistics including venue setup, AV, catering, and decor",
      "Manage event timelines, checklists, and milestone tracking",
      "Coordinate with internal departments (catering, housekeeping, AV, security)",
      "Manage vendor relationships for external event services",
      "Create and manage event budgets with cost tracking and reconciliation",
      "Communicate with clients throughout planning and execution",
      "Oversee event setup, execution, and breakdown",
      "Process post-event billing and financial reconciliation",
      "Collect client feedback and manage post-event follow-up"
    ],
    tasks: [
      { name: "Event Inquiry Response", cadence: "daily", description: "Respond to new event inquiries, assess requirements, and prepare initial proposals", priority: "high" },
      { name: "Active Event Coordination", cadence: "daily", description: "Advance planning for upcoming events: confirm vendors, finalize details, update timelines", priority: "high" },
      { name: "BEO (Banquet Event Order) Management", cadence: "daily", description: "Create and update BEOs with event details, distribute to operational departments", priority: "high" },
      { name: "Client Communication", cadence: "daily", description: "Coordinate with event clients on planning updates, changes, and confirmations", priority: "medium" },
      { name: "Vendor Coordination", cadence: "weekly", description: "Confirm vendor arrangements, review contracts, and manage delivery schedules", priority: "medium" },
      { name: "Pipeline & Revenue Forecast", cadence: "weekly", description: "Track event pipeline, confirmed bookings, and projected event revenue", priority: "medium" },
      { name: "Event Performance Report", cadence: "monthly", description: "Analyze event revenue, profitability, client satisfaction, and repeat booking rates", priority: "high" },
      { name: "Post-Event Analysis", cadence: "monthly", description: "Compile post-event reports including budget reconciliation and client feedback", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Cvent", "Social Tables", "Tripleseat",
      "Opera PMS", "Delphi (Amadeus)", "Planning Pod",
      "Canva", "Zoom (virtual events)", "DocuSign", "Slack"
    ],
    dataAccessPermissions: {
      eventRecords: "Full Access",
      clientData: "Full Access",
      vendorContracts: "Full Access",
      cateringData: "Full Access",
      revenueData: "Authorized — events only",
      venueAvailability: "Full Access",
      budgetData: "Full Access",
      staffSchedules: "Authorized — event staff"
    },
    communicationCapabilities: [
      "Client communication throughout event lifecycle",
      "Internal department coordination for event execution",
      "Vendor negotiation and management correspondence",
      "Management reporting on event pipeline and revenue",
      "Post-event follow-up and testimonial collection",
      "Marketing collaboration for event promotion"
    ],
    exampleWorkflows: [
      {
        name: "Corporate Event Planning",
        steps: [
          "Receive event inquiry and conduct discovery meeting with client",
          "Prepare detailed proposal with venue options, menus, and AV packages",
          "Negotiate terms and finalize contract",
          "Create master event timeline and distribute to all departments",
          "Coordinate catering menu selection and dietary accommodations",
          "Arrange AV, lighting, decor, and entertainment",
          "Conduct site visit and rehearsal with client",
          "Execute event with on-site coordination and troubleshooting",
          "Process post-event billing and collect client feedback"
        ]
      },
      {
        name: "Wedding Coordination",
        steps: [
          "Meet with couple to understand vision, budget, and requirements",
          "Present venue and package options with customization",
          "Coordinate venue layout, ceremony and reception flow",
          "Manage vendor team (florist, photographer, DJ, officiant)",
          "Create detailed day-of timeline with all vendor call times",
          "Conduct rehearsal and final walkthrough",
          "Manage day-of execution and vendor coordination",
          "Handle unexpected issues and ensure seamless experience",
          "Send thank-you and request review/testimonial"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Client Satisfaction Score", target: "> 4.5/5.0", weight: 25 },
      { metric: "Event Revenue Target", target: "Within 5% of budget", weight: 15 },
      { metric: "Inquiry Conversion Rate", target: "> 30%", weight: 15 },
      { metric: "Event Profit Margin", target: "> 35%", weight: 15 },
      { metric: "Repeat Client Rate", target: "> 25%", weight: 10 },
      { metric: "Proposal Response Time", target: "< 24 hours", weight: 10 },
      { metric: "Post-Event Billing Accuracy", target: "> 99%", weight: 10 }
    ],
    useCases: [
      "Automated event proposal generation with dynamic pricing and packages",
      "Event timeline management with milestone tracking and vendor coordination",
      "Client communication automation for planning updates and confirmations",
      "Event profitability analysis and pricing optimization",
      "Post-event satisfaction tracking and repeat business cultivation"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 80, empathy: 75, directness: 60,
      creativity: 75, humor: 35, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "ADA Event Accessibility", "Fire Safety Codes", "Alcohol Licensing Regulations", "Local Event Permit Requirements"],
      dataClassification: "PII — Client Personal & Event Data",
      auditRequirements: "Event contracts documented; financial transactions per PCI-DSS; vendor agreements on file",
      retentionPolicy: "Event records: 5 years; contracts: term + 5 years; client data per GDPR/CCPA consent",
      breachNotification: "Events director notification for client data or payment information exposure"
    },
    skillsTags: ["event planning", "event management", "venue coordination", "vendor management", "catering management", "budget management", "client relations", "hospitality", "project management"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Travel Concierge AI",
    department: "Concierge Services",
    category: "Hospitality & Travel",
    industry: "Hospitality",
    reportsTo: "Front Office Manager",
    seniorityLevel: "junior",
    description: "Provides personalized travel and local area guidance to guests, including restaurant reservations, activity bookings, transportation arrangements, and destination recommendations. Leverages deep local knowledge and guest preferences to create memorable, customized experiences that enhance the overall guest stay.",
    coreResponsibilities: [
      "Provide personalized dining, entertainment, and activity recommendations",
      "Make restaurant reservations and arrange special dining experiences",
      "Coordinate transportation including airport transfers, car rentals, and tours",
      "Arrange tickets for attractions, shows, and events",
      "Manage guest special requests and personalized itineraries",
      "Maintain current knowledge of local attractions, events, and dining",
      "Process guest service requests and coordinate with hotel departments",
      "Build and maintain relationships with local venues and experience providers",
      "Manage lost luggage assistance and emergency guest support",
      "Track guest preferences and maintain preference profiles for repeat visits"
    ],
    tasks: [
      { name: "Guest Request Processing", cadence: "daily", description: "Process incoming concierge requests for dining, activities, transportation, and special services", priority: "high" },
      { name: "Restaurant Reservation Management", cadence: "daily", description: "Make, modify, and confirm restaurant reservations based on guest preferences and dietary needs", priority: "high" },
      { name: "Transportation Coordination", cadence: "daily", description: "Arrange airport transfers, car services, tour pickups, and ground transportation", priority: "high" },
      { name: "Local Event & Activity Briefing", cadence: "daily", description: "Compile current local events, restaurant openings, and seasonal activities for guest recommendations", priority: "medium" },
      { name: "VIP Guest Itinerary Preparation", cadence: "daily", description: "Create personalized itineraries for VIP guests incorporating preferences and history", priority: "medium" },
      { name: "Vendor Relationship Management", cadence: "weekly", description: "Connect with local restaurant, tour, and activity partners to maintain current offerings", priority: "medium" },
      { name: "Service Quality Report", cadence: "monthly", description: "Track concierge request volume, resolution time, and guest satisfaction scores", priority: "medium" },
      { name: "Local Knowledge Update", cadence: "monthly", description: "Research new dining, entertainment, and activity options to keep recommendation database current", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Alice (hotel ops platform)", "ALICE Concierge", "OpenTable",
      "Resy", "Viator", "GetYourGuide",
      "Google Maps Platform", "Uber for Business", "WhatsApp Business", "Slack"
    ],
    dataAccessPermissions: {
      guestProfiles: "Full Access",
      guestPreferences: "Full Access",
      reservationData: "Authorized — stay details",
      localVendorDirectory: "Full Access",
      paymentProcessing: "Restricted — concierge bookings only",
      loyaltyData: "Authorized — tier and preferences",
      eventCalendar: "Full Access",
      transportationProviders: "Full Access"
    },
    communicationCapabilities: [
      "Guest communication via in-person, phone, chat, and messaging apps",
      "Restaurant and venue booking correspondence",
      "Transportation provider coordination",
      "Tour operator and activity booking communication",
      "Internal hotel department coordination for guest services",
      "Personalized recommendations and itinerary delivery"
    ],
    exampleWorkflows: [
      {
        name: "Personalized Dining Experience",
        steps: [
          "Receive dining request from guest with preferences and occasion",
          "Review guest profile for dietary restrictions and past preferences",
          "Research options matching cuisine, ambiance, and budget preferences",
          "Present top 3 recommendations with descriptions and availability",
          "Make reservation at guest's selected restaurant",
          "Arrange transportation if needed",
          "Notify restaurant of special occasion or dietary needs",
          "Follow up with guest after dining experience"
        ]
      },
      {
        name: "Custom Day Itinerary",
        steps: [
          "Discuss guest interests, energy level, and time constraints",
          "Research available activities, tours, and experiences",
          "Build time-blocked itinerary with logistics and transitions",
          "Make all bookings and reservations",
          "Arrange transportation between locations",
          "Prepare itinerary document with confirmations and contact info",
          "Brief guest on itinerary details and contingency options",
          "Check in during and after to ensure satisfaction"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Guest Satisfaction Score", target: "> 4.7/5.0", weight: 25 },
      { metric: "Request Fulfillment Rate", target: "> 95%", weight: 20 },
      { metric: "Response Time", target: "< 15 minutes", weight: 15 },
      { metric: "Recommendation Acceptance Rate", target: "> 70%", weight: 15 },
      { metric: "Repeat Guest Recognition", target: "> 90% returning guests identified", weight: 10 },
      { metric: "Revenue from Concierge Bookings", target: "> target per month", weight: 10 },
      { metric: "Local Knowledge Currency", target: "Updated weekly", weight: 5 }
    ],
    useCases: [
      "AI-powered personalized dining and activity recommendations",
      "Automated transportation booking and coordination",
      "Custom itinerary generation based on guest preferences and local events",
      "Multi-language guest communication and translation support",
      "Guest preference learning for enhanced repeat visit experiences"
    ],
    personalityDefaults: {
      formality: 55, enthusiasm: 85, empathy: 80, directness: 55,
      creativity: 70, humor: 45, assertiveness: 40
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "ADA", "Local Tourism Regulations", "Consumer Protection Laws"],
      dataClassification: "PII — Guest Personal & Preference Data",
      auditRequirements: "Service requests logged; financial transactions per PCI-DSS; guest consent for preference storage",
      retentionPolicy: "Guest preferences: per consent/GDPR; booking records: 3 years; financial: per PCI-DSS",
      breachNotification: "GDPR/CCPA notification for guest data exposure"
    },
    skillsTags: ["concierge services", "guest relations", "local expertise", "dining recommendations", "travel coordination", "itinerary planning", "customer service", "hospitality", "personalization"],
    priceMonthly: 799,
    isActive: 1,
  },
];
