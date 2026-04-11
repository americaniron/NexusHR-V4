import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const techPublicSectorMediaRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [

  // ═══════════════════════════════════════════════════════════
  //  TECHNOLOGY & CYBERSECURITY (4 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "SOC Analyst AI",
    department: "Security Operations Center",
    category: "Technology & Cybersecurity",
    industry: "Technology",
    reportsTo: "SOC Manager",
    seniorityLevel: "mid",
    description: "Monitors and analyzes security events across the enterprise environment from the Security Operations Center. Triages alerts, investigates potential threats, performs incident response, and maintains security monitoring coverage to detect and mitigate cyber threats in real-time.",
    coreResponsibilities: [
      "Monitor SIEM dashboards and security alert queues in real-time",
      "Triage and classify security alerts by severity and threat category",
      "Investigate suspicious events using log analysis and threat intelligence",
      "Perform initial incident response and containment actions",
      "Analyze network traffic, endpoint telemetry, and user behavior anomalies",
      "Maintain and tune detection rules, correlation logic, and alert thresholds",
      "Document security incidents with timeline, impact, and remediation steps",
      "Coordinate with IT teams on threat mitigation and system hardening",
      "Track threat intelligence feeds and correlate with internal indicators",
      "Generate SOC performance reports and incident trend analysis"
    ],
    tasks: [
      { name: "Alert Queue Monitoring", cadence: "daily", description: "Monitor and triage incoming security alerts, classify by severity, and escalate critical threats", priority: "critical" },
      { name: "Threat Hunt Sweeps", cadence: "daily", description: "Conduct proactive threat hunting across endpoints, network, and cloud environments", priority: "high" },
      { name: "Incident Investigation", cadence: "daily", description: "Investigate escalated alerts with log analysis, packet capture, and forensic tools", priority: "high" },
      { name: "IOC Correlation", cadence: "daily", description: "Correlate indicators of compromise from threat intel with internal environment data", priority: "high" },
      { name: "Detection Rule Tuning", cadence: "weekly", description: "Review and tune SIEM rules, reduce false positives, and improve detection accuracy", priority: "high" },
      { name: "Vulnerability Correlation", cadence: "weekly", description: "Correlate vulnerability scan results with threat landscape and prioritize remediation", priority: "medium" },
      { name: "SOC Metrics Report", cadence: "monthly", description: "Compile SOC KPIs: MTTD, MTTR, alert volume, true positive rate, incident trends", priority: "high" },
      { name: "Threat Landscape Review", cadence: "monthly", description: "Analyze evolving threat landscape, update playbooks, and brief stakeholders", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Splunk / Microsoft Sentinel", "CrowdStrike Falcon", "Palo Alto Cortex XDR",
      "Wireshark / Zeek", "VirusTotal / MISP", "TheHive / SOAR",
      "Elastic Security", "Carbon Black", "MITRE ATT&CK Navigator", "Slack"
    ],
    dataAccessPermissions: {
      securityLogs: "Full Access",
      networkTraffic: "Full Access",
      endpointTelemetry: "Full Access",
      threatIntelligence: "Full Access",
      userActivityLogs: "Full Access",
      systemConfigurations: "Authorized — security relevant",
      incidentRecords: "Full Access",
      vulnerabilityData: "Full Access"
    },
    communicationCapabilities: [
      "IT operations coordination for incident response and remediation",
      "Management escalation for critical security incidents",
      "Threat intelligence sharing with industry peers (ISACs)",
      "Executive briefing on security posture and incidents",
      "Law enforcement coordination for criminal cyber activity",
      "Automated alert and incident notification workflows"
    ],
    exampleWorkflows: [
      {
        name: "Security Incident Response",
        steps: [
          "Detect anomalous activity through SIEM alert or threat hunt",
          "Triage alert: validate, classify severity, and determine scope",
          "Contain threat: isolate affected systems, block malicious indicators",
          "Collect evidence: preserve logs, capture forensic images",
          "Analyze attack vector, technique, and lateral movement",
          "Eradicate threat: remove malware, close attack path",
          "Restore affected systems and verify clean state",
          "Document incident timeline, impact, and lessons learned"
        ]
      },
      {
        name: "Proactive Threat Hunting",
        steps: [
          "Develop hunt hypothesis based on threat intelligence or risk assessment",
          "Define data sources and analytical techniques for investigation",
          "Query SIEM, EDR, and network data for suspicious patterns",
          "Analyze results for indicators of compromise or living-off-the-land techniques",
          "Investigate confirmed anomalies with deeper forensic analysis",
          "Document findings and create detection rules for discovered threats",
          "Brief stakeholders on hunt results and risk assessment",
          "Update threat model and hunting playbooks"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Mean Time to Detect (MTTD)", target: "< 15 minutes", weight: 20 },
      { metric: "Mean Time to Respond (MTTR)", target: "< 1 hour", weight: 20 },
      { metric: "True Positive Rate", target: "> 80%", weight: 15 },
      { metric: "Alert Triage Coverage", target: "100% of critical/high alerts", weight: 15 },
      { metric: "Incident Containment Time", target: "< 4 hours", weight: 10 },
      { metric: "False Positive Reduction", target: "> 10% quarterly improvement", weight: 10 },
      { metric: "Threat Hunt Findings", target: "> 2 actionable findings/month", weight: 10 }
    ],
    useCases: [
      "AI-powered alert triage with automated severity classification",
      "Real-time threat detection using behavioral analytics and ML",
      "Automated incident response playbook execution",
      "Proactive threat hunting with intelligence-driven hypotheses",
      "Security monitoring coverage optimization and gap analysis"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 40, empathy: 30, directness: 90,
      creativity: 45, humor: 10, assertiveness: 80
    },
    complianceMetadata: {
      frameworks: ["NIST CSF", "NIST 800-53", "SOC 2", "ISO 27001", "PCI-DSS", "HIPAA Security Rule", "GDPR (Data Breach)", "MITRE ATT&CK"],
      dataClassification: "Top Secret — Security Operations & Incident Data",
      auditRequirements: "All security incidents documented; investigation evidence preserved; response actions logged with timestamps",
      retentionPolicy: "Security logs: 1 year minimum; incident records: 7 years; forensic evidence: per legal hold; threat intel: 3 years",
      breachNotification: "Immediate SOC manager escalation; CISO notification per severity matrix; regulatory notification per framework requirements"
    },
    skillsTags: ["security operations", "SIEM", "incident response", "threat hunting", "malware analysis", "network security", "forensics", "threat intelligence", "MITRE ATT&CK"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Penetration Testing Coordinator AI",
    department: "Offensive Security",
    category: "Technology & Cybersecurity",
    industry: "Technology",
    reportsTo: "CISO",
    seniorityLevel: "senior",
    description: "Coordinates and manages penetration testing programs across applications, networks, and cloud infrastructure. Plans test engagements, tracks findings, coordinates remediation efforts, and maintains the organization's offensive security posture to identify and address vulnerabilities before adversaries exploit them.",
    coreResponsibilities: [
      "Plan and coordinate penetration testing engagements across the technology stack",
      "Manage scope definition, rules of engagement, and test authorization",
      "Coordinate with internal teams and external pen test vendors",
      "Review and validate penetration test findings and severity ratings",
      "Track vulnerability remediation progress and verify fixes",
      "Maintain penetration testing methodology and standards documentation",
      "Manage bug bounty program operations and researcher relationships",
      "Coordinate red team exercises and adversary simulation programs",
      "Report penetration testing results and risk posture to leadership",
      "Analyze testing trends to identify systemic security weaknesses"
    ],
    tasks: [
      { name: "Engagement Management", cadence: "daily", description: "Track active pen test engagements, coordinate tester access, and manage communications", priority: "high" },
      { name: "Finding Validation", cadence: "daily", description: "Review submitted findings, validate severity, and coordinate with asset owners", priority: "high" },
      { name: "Remediation Tracking", cadence: "daily", description: "Track remediation status for open findings, follow up on overdue items", priority: "high" },
      { name: "Bug Bounty Triage", cadence: "daily", description: "Triage incoming bug bounty submissions, validate reports, and manage researcher communication", priority: "medium" },
      { name: "Test Planning", cadence: "weekly", description: "Plan upcoming pen test engagements, define scope, and coordinate scheduling", priority: "high" },
      { name: "Retest Coordination", cadence: "weekly", description: "Schedule and coordinate retesting of remediated vulnerabilities", priority: "medium" },
      { name: "Pen Test Program Report", cadence: "monthly", description: "Compile program metrics: tests completed, findings by severity, remediation rates, risk trends", priority: "high" },
      { name: "Methodology Review", cadence: "monthly", description: "Review and update testing methodology, tools, and attack scenarios", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Burp Suite Professional", "Cobalt Strike / Metasploit", "Nessus / Qualys",
      "HackerOne / Bugcrowd", "Jira / ServiceNow", "Plextrac",
      "Nuclei / OWASP ZAP", "BloodHound (AD)", "GitHub Security", "Slack"
    ],
    dataAccessPermissions: {
      vulnerabilityData: "Full Access",
      penTestReports: "Full Access",
      systemArchitecture: "Authorized — test scoping",
      networkDiagrams: "Authorized — test planning",
      applicationCode: "Authorized — code review scope",
      bugBountySubmissions: "Full Access",
      remediationRecords: "Full Access",
      riskAssessments: "Full Access"
    },
    communicationCapabilities: [
      "Development and IT teams for finding communication and remediation",
      "Executive reporting on security posture and pen test results",
      "External pen test vendor management and coordination",
      "Bug bounty researcher communication and reward management",
      "Risk management team for vulnerability risk assessment",
      "Regulatory and compliance teams for security testing evidence"
    ],
    exampleWorkflows: [
      {
        name: "Penetration Test Engagement Lifecycle",
        steps: [
          "Receive pen test request and define engagement objectives",
          "Define scope, rules of engagement, and test authorization",
          "Select and brief testing team (internal or external)",
          "Coordinate access, credentials, and environment setup",
          "Monitor test progress and manage any operational issues",
          "Receive and review draft findings report",
          "Facilitate findings walkthrough with asset owners",
          "Track remediation and coordinate retesting"
        ]
      },
      {
        name: "Bug Bounty Program Management",
        steps: [
          "Define program scope, reward structure, and disclosure policy",
          "Manage researcher onboarding and platform configuration",
          "Triage incoming submissions for validity and severity",
          "Coordinate with engineering teams for finding validation",
          "Process reward payments for valid findings",
          "Track remediation of accepted vulnerabilities",
          "Analyze submission trends and update program scope",
          "Report program metrics and ROI to leadership"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Test Coverage", target: "100% of critical assets annually", weight: 20 },
      { metric: "Critical Finding Remediation", target: "< 30 days", weight: 20 },
      { metric: "Retest Pass Rate", target: "> 90%", weight: 15 },
      { metric: "Finding Triage Time", target: "< 48 hours", weight: 10 },
      { metric: "Program Coverage Growth", target: "> 10% YoY", weight: 10 },
      { metric: "Bug Bounty Response Time", target: "< 24 hours initial response", weight: 10 },
      { metric: "Systemic Issue Identification", target: "> 3 patterns per quarter", weight: 15 }
    ],
    useCases: [
      "AI-assisted vulnerability prioritization with exploit likelihood scoring",
      "Pen test program scheduling and coverage optimization",
      "Automated finding tracking and remediation workflow management",
      "Bug bounty triage with duplicate detection and severity classification",
      "Security posture trending and systemic weakness identification"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 35, directness: 85,
      creativity: 55, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["NIST CSF", "PCI-DSS (Requirement 11)", "SOC 2", "ISO 27001", "OWASP Testing Guide", "PTES", "GDPR", "HIPAA"],
      dataClassification: "Top Secret — Vulnerability & Offensive Security Data",
      auditRequirements: "Test authorizations documented; findings classified per severity; remediation tracked with evidence",
      retentionPolicy: "Pen test reports: 5 years; findings: until remediated + 3 years; bug bounty: 5 years; methodology: current version + 2 prior",
      breachNotification: "CISO immediate notification for critical zero-day findings; management notification for high-severity patterns"
    },
    skillsTags: ["penetration testing", "vulnerability assessment", "offensive security", "bug bounty", "red teaming", "application security", "network security", "remediation management", "security program management"],
    priceMonthly: 1499,
    isActive: 1,
  },

  {
    title: "IT Infrastructure Monitor AI",
    department: "IT Operations",
    category: "Technology & Cybersecurity",
    industry: "Technology",
    reportsTo: "Director of IT Operations",
    seniorityLevel: "mid",
    description: "Monitors IT infrastructure health across servers, networks, cloud services, and applications. Detects performance degradation, outages, and capacity issues using observability platforms. Ensures system reliability, coordinates incident response, and provides infrastructure analytics for capacity planning and optimization.",
    coreResponsibilities: [
      "Monitor infrastructure health across on-premises and cloud environments",
      "Detect and alert on performance degradation, outages, and anomalies",
      "Analyze system metrics: CPU, memory, disk, network, and application performance",
      "Manage observability platforms and monitoring tool configuration",
      "Coordinate incident response for infrastructure outages and degradation",
      "Track SLA compliance and system availability metrics",
      "Perform capacity planning analysis and forecast resource needs",
      "Manage alerting rules, escalation policies, and on-call rotations",
      "Analyze infrastructure cost optimization opportunities (cloud right-sizing)",
      "Generate infrastructure health reports and trend analysis"
    ],
    tasks: [
      { name: "Infrastructure Health Check", cadence: "daily", description: "Review system health dashboards, verify monitoring coverage, and address active alerts", priority: "critical" },
      { name: "Alert Management", cadence: "daily", description: "Triage infrastructure alerts, validate criticality, and coordinate resolution", priority: "high" },
      { name: "Performance Analysis", cadence: "daily", description: "Analyze system performance trends, identify degradation, and flag capacity concerns", priority: "high" },
      { name: "Cloud Resource Monitoring", cadence: "daily", description: "Monitor cloud service health, resource utilization, and cost metrics", priority: "medium" },
      { name: "Capacity Trend Analysis", cadence: "weekly", description: "Analyze resource utilization trends and forecast capacity needs for planning", priority: "high" },
      { name: "Monitoring Coverage Audit", cadence: "weekly", description: "Verify all critical systems are monitored, update configurations for new assets", priority: "medium" },
      { name: "Infrastructure SLA Report", cadence: "monthly", description: "Compile SLA performance: uptime, response time, MTTR, and incident volume", priority: "high" },
      { name: "Cost Optimization Review", cadence: "monthly", description: "Analyze cloud spending, identify right-sizing and reserved instance opportunities", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Datadog", "New Relic / Dynatrace", "Prometheus / Grafana",
      "PagerDuty / OpsGenie", "AWS CloudWatch / Azure Monitor", "Nagios / Zabbix",
      "Elastic APM", "Terraform", "ServiceNow", "Slack"
    ],
    dataAccessPermissions: {
      infrastructureMetrics: "Full Access",
      serverLogs: "Full Access",
      networkData: "Full Access",
      cloudConsoles: "Authorized — monitoring",
      applicationMetrics: "Full Access",
      incidentRecords: "Full Access",
      costData: "Authorized — infrastructure spend",
      configurationData: "Authorized — monitoring configs"
    },
    communicationCapabilities: [
      "IT operations teams for incident response coordination",
      "Development teams for application performance issues",
      "Management reporting on infrastructure health and SLAs",
      "Cloud provider support coordination for service issues",
      "On-call team coordination for after-hours incidents",
      "Automated alert and status page notification workflows"
    ],
    exampleWorkflows: [
      {
        name: "Infrastructure Incident Response",
        steps: [
          "Detect infrastructure anomaly through monitoring alert",
          "Validate alert and assess impact on services and users",
          "Classify incident severity and notify appropriate teams",
          "Coordinate investigation to identify root cause",
          "Implement mitigation or failover to restore service",
          "Monitor recovery and verify service restoration",
          "Conduct post-incident review and root cause analysis",
          "Update monitoring and runbooks to prevent recurrence"
        ]
      },
      {
        name: "Cloud Cost Optimization",
        steps: [
          "Collect resource utilization data across cloud accounts",
          "Identify underutilized instances and oversized resources",
          "Analyze reserved instance and savings plan coverage",
          "Calculate potential savings from right-sizing recommendations",
          "Prioritize optimization actions by savings impact",
          "Coordinate with teams to implement approved changes",
          "Monitor impact on performance and costs post-optimization",
          "Report realized savings and update optimization roadmap"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "System Uptime", target: "> 99.9%", weight: 25 },
      { metric: "Mean Time to Detect", target: "< 5 minutes", weight: 15 },
      { metric: "Mean Time to Resolve", target: "< 30 minutes (P1)", weight: 15 },
      { metric: "Monitoring Coverage", target: "100% of critical systems", weight: 15 },
      { metric: "False Alert Rate", target: "< 10%", weight: 10 },
      { metric: "SLA Compliance", target: "> 99.5%", weight: 10 },
      { metric: "Cloud Cost Optimization", target: "> 15% savings identified", weight: 10 }
    ],
    useCases: [
      "AI-powered anomaly detection for infrastructure performance",
      "Predictive capacity planning using utilization trend analysis",
      "Automated incident classification and escalation routing",
      "Cloud cost optimization with right-sizing recommendations",
      "Infrastructure observability with unified dashboarding"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 40, empathy: 30, directness: 85,
      creativity: 35, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["SOC 2", "ISO 27001", "ITIL", "NIST CSF", "PCI-DSS", "HIPAA (Infrastructure)", "FedRAMP", "SLA Frameworks"],
      dataClassification: "Confidential — Infrastructure Operations & Configuration Data",
      auditRequirements: "System access logs maintained; incident response documented; availability metrics tracked per SLA",
      retentionPolicy: "Infrastructure logs: 1 year; incident records: 5 years; performance data: 2 years; configuration history: 3 years",
      breachNotification: "IT Director notification for infrastructure compromise; CISO escalation for security-related incidents"
    },
    skillsTags: ["infrastructure monitoring", "observability", "incident management", "cloud operations", "capacity planning", "SRE", "DevOps", "performance analysis", "cost optimization"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "DevSecOps Pipeline Manager AI",
    department: "Platform Engineering",
    category: "Technology & Cybersecurity",
    industry: "Technology",
    reportsTo: "VP of Engineering",
    seniorityLevel: "senior",
    description: "Manages the CI/CD pipeline with integrated security controls, ensuring code quality, security scanning, and compliance checks are embedded throughout the software delivery lifecycle. Optimizes build and deployment processes while maintaining security gates that prevent vulnerable code from reaching production.",
    coreResponsibilities: [
      "Manage CI/CD pipeline configuration, health, and performance optimization",
      "Integrate security scanning tools (SAST, DAST, SCA, container scanning) into pipelines",
      "Define and enforce security gate policies for build promotion",
      "Monitor pipeline metrics: build times, failure rates, and deployment frequency",
      "Coordinate vulnerability remediation with development teams",
      "Manage infrastructure-as-code security and compliance scanning",
      "Track software supply chain security (dependency management, SBOM)",
      "Support developer experience improvements in the build and deploy process",
      "Manage secrets management and credential rotation in pipelines",
      "Report DevSecOps program metrics and maturity progress"
    ],
    tasks: [
      { name: "Pipeline Health Monitoring", cadence: "daily", description: "Monitor CI/CD pipeline status, build failures, and deployment activity", priority: "critical" },
      { name: "Security Scan Review", cadence: "daily", description: "Review SAST/DAST/SCA scan results, triage findings, and route to developers", priority: "high" },
      { name: "Gate Policy Enforcement", cadence: "daily", description: "Verify security gate compliance for production deployments, manage exceptions", priority: "high" },
      { name: "Vulnerability Remediation Tracking", cadence: "daily", description: "Track open security findings, follow up on SLA compliance, escalate overdue items", priority: "high" },
      { name: "Pipeline Performance Optimization", cadence: "weekly", description: "Analyze build times, caching effectiveness, and pipeline bottlenecks", priority: "medium" },
      { name: "Dependency Security Review", cadence: "weekly", description: "Review dependency updates, assess CVE impact, and coordinate patching", priority: "high" },
      { name: "DevSecOps Metrics Report", cadence: "monthly", description: "Compile pipeline metrics: DORA metrics, security finding rates, remediation SLAs", priority: "high" },
      { name: "Tool & Policy Review", cadence: "monthly", description: "Evaluate security tools effectiveness, update policies, and assess new capabilities", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "GitHub Actions / GitLab CI", "Jenkins / CircleCI", "SonarQube",
      "Snyk / Checkmarx", "Trivy / Aqua Security", "HashiCorp Vault",
      "ArgoCD / Flux", "Terraform / Pulumi", "Jira", "Slack"
    ],
    dataAccessPermissions: {
      pipelineConfigs: "Full Access",
      codeRepositories: "Authorized — pipeline configs and security scans",
      securityFindings: "Full Access",
      deploymentRecords: "Full Access",
      secretsManagement: "Full Access — pipeline secrets",
      infrastructureCode: "Authorized — IaC security review",
      dependencyData: "Full Access",
      metricsData: "Full Access"
    },
    communicationCapabilities: [
      "Development team coordination for security finding remediation",
      "Security team alignment on policy and tool integration",
      "Platform engineering collaboration on pipeline optimization",
      "Management reporting on DevSecOps program metrics",
      "Vendor coordination for security tool management",
      "Automated pipeline failure and security gate notification"
    ],
    exampleWorkflows: [
      {
        name: "Security Gate Enforcement",
        steps: [
          "Developer pushes code triggering CI/CD pipeline",
          "SAST scanner analyzes source code for vulnerabilities",
          "SCA scanner checks dependencies against vulnerability databases",
          "Container scanner validates base images and layer security",
          "Aggregate findings and evaluate against gate policy thresholds",
          "Block or warn based on finding severity and policy rules",
          "Provide developer with actionable remediation guidance",
          "Track remediation and allow promotion upon resolution"
        ]
      },
      {
        name: "Supply Chain Security Program",
        steps: [
          "Inventory all software dependencies across repositories",
          "Generate Software Bill of Materials (SBOM) for each service",
          "Monitor dependencies for newly disclosed CVEs",
          "Assess CVE impact on affected services and environments",
          "Prioritize patching based on severity and exploitability",
          "Coordinate dependency update PRs with development teams",
          "Verify updated dependencies pass security and functional tests",
          "Report supply chain security posture and improvement trends"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Deployment Frequency", target: "Multiple per day", weight: 15 },
      { metric: "Lead Time for Changes", target: "< 1 day", weight: 10 },
      { metric: "Security Gate Pass Rate", target: "> 85% first attempt", weight: 15 },
      { metric: "Critical Vuln Remediation SLA", target: "< 7 days", weight: 20 },
      { metric: "Pipeline Availability", target: "> 99.5%", weight: 10 },
      { metric: "Mean Build Time", target: "< 10 minutes", weight: 10 },
      { metric: "SBOM Coverage", target: "100% of production services", weight: 10 },
      { metric: "Change Failure Rate", target: "< 5%", weight: 10 }
    ],
    useCases: [
      "Automated security scanning integrated into CI/CD pipelines",
      "Security gate enforcement with policy-driven promotion controls",
      "Software supply chain security with SBOM and dependency monitoring",
      "Pipeline performance optimization with bottleneck identification",
      "DevSecOps maturity tracking and program improvement"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 55, empathy: 40, directness: 85,
      creativity: 50, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["NIST SSDF", "NIST CSF", "SOC 2", "ISO 27001", "PCI-DSS", "OWASP SAMM", "SLSA Framework", "Executive Order 14028 (Software Supply Chain)"],
      dataClassification: "Confidential — Source Code & Security Pipeline Data",
      auditRequirements: "Pipeline executions logged; security scan results archived; gate decisions documented; SBOM maintained per NTIA",
      retentionPolicy: "Pipeline logs: 1 year; security findings: until remediated + 2 years; SBOMs: product life; deployment records: 3 years",
      breachNotification: "VP Engineering notification for pipeline compromise; CISO for security tool bypass or supply chain incident"
    },
    skillsTags: ["DevSecOps", "CI/CD", "security scanning", "pipeline management", "supply chain security", "SBOM", "infrastructure as code", "secrets management", "platform engineering"],
    priceMonthly: 1399,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  PUBLIC SECTOR & NON-PROFIT (4 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Grant Management Coordinator AI",
    department: "Grants & Funding",
    category: "Public Sector & Non-profit",
    industry: "Government & Non-profit",
    reportsTo: "Director of Grants",
    seniorityLevel: "mid",
    description: "Manages the full grant lifecycle from opportunity identification and proposal development through award management, compliance monitoring, and closeout. Coordinates grant applications, tracks reporting requirements, and ensures compliance with funder guidelines and federal/state regulations.",
    coreResponsibilities: [
      "Identify and research grant funding opportunities aligned with organizational mission",
      "Coordinate grant proposal development with program teams and leadership",
      "Manage grant application timelines, submissions, and follow-up",
      "Track grant award compliance with funder requirements and regulations",
      "Monitor grant budgets, expenditures, and financial reporting obligations",
      "Coordinate grant progress reports and performance metric submissions",
      "Manage subgrant agreements and subrecipient monitoring",
      "Ensure compliance with Uniform Guidance (2 CFR 200) for federal grants",
      "Support single audit preparation and grant audit documentation",
      "Report grant portfolio status, pipeline, and funding forecasts"
    ],
    tasks: [
      { name: "Opportunity Monitoring", cadence: "daily", description: "Search grants.gov, foundation databases, and funding alerts for new opportunities", priority: "high" },
      { name: "Application Deadline Tracking", cadence: "daily", description: "Track active grant applications, upcoming deadlines, and required submissions", priority: "critical" },
      { name: "Budget Monitoring", cadence: "daily", description: "Monitor grant expenditures against budgets, flag variances and burn rate concerns", priority: "high" },
      { name: "Compliance Tracking", cadence: "daily", description: "Track compliance requirements, reporting deadlines, and documentation needs", priority: "high" },
      { name: "Report Preparation", cadence: "weekly", description: "Prepare grant progress reports, financial reports, and performance metrics", priority: "high" },
      { name: "Subrecipient Monitoring", cadence: "weekly", description: "Review subrecipient reports, compliance status, and risk assessments", priority: "medium" },
      { name: "Grant Portfolio Report", cadence: "monthly", description: "Compile portfolio status: active grants, pipeline, funding forecast, and compliance", priority: "high" },
      { name: "Proposal Pipeline Review", cadence: "monthly", description: "Review upcoming funding opportunities and prioritize proposal development", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Grants.gov", "Fluxx / Submittable", "Salesforce NPSP",
      "SAM.gov", "Foundation Directory Online", "Instrumentl",
      "QuickBooks / Sage Intacct", "SharePoint / Box", "Smartsheet", "Slack"
    ],
    dataAccessPermissions: {
      grantApplications: "Full Access",
      budgetData: "Full Access — grant budgets",
      programData: "Authorized — grant-funded programs",
      financialRecords: "Full Access — grant accounting",
      complianceRecords: "Full Access",
      funderCorrespondence: "Full Access",
      subrecipientData: "Full Access",
      auditDocuments: "Authorized"
    },
    communicationCapabilities: [
      "Funder communication for applications, reports, and compliance",
      "Program team coordination for proposal development and reporting",
      "Finance team collaboration for grant accounting and budgeting",
      "Executive reporting on grant portfolio and funding pipeline",
      "Subrecipient management and monitoring communication",
      "Audit coordination for single audit and grant-specific audits"
    ],
    exampleWorkflows: [
      {
        name: "Grant Proposal Development",
        steps: [
          "Identify funding opportunity aligned with organizational priorities",
          "Analyze funder requirements, eligibility criteria, and evaluation factors",
          "Assemble proposal team and assign writing responsibilities",
          "Develop project narrative with goals, activities, and outcomes",
          "Build grant budget with cost justification and matching funds",
          "Compile required attachments: letters of support, resumes, certifications",
          "Conduct internal review and finalize proposal package",
          "Submit application by deadline and confirm receipt"
        ]
      },
      {
        name: "Grant Compliance Management",
        steps: [
          "Set up grant tracking with all compliance requirements and deadlines",
          "Configure budget categories and spending authorization controls",
          "Monitor expenditures against approved budget categories",
          "Track program activities and performance metrics per grant agreement",
          "Prepare and submit periodic financial and progress reports",
          "Manage grant modifications and budget amendments as needed",
          "Coordinate closeout procedures at grant end",
          "Archive grant documentation per retention requirements"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Grant Win Rate", target: "> 30% of submitted proposals", weight: 20 },
      { metric: "On-Time Report Submission", target: "100%", weight: 20 },
      { metric: "Budget Compliance", target: "Within approved budget categories", weight: 15 },
      { metric: "Audit Findings", target: "Zero material findings", weight: 15 },
      { metric: "Pipeline Value", target: "> annual funding target", weight: 10 },
      { metric: "Grant Revenue Growth", target: "> 10% YoY", weight: 10 },
      { metric: "Compliance Documentation", target: "100% complete", weight: 10 }
    ],
    useCases: [
      "AI-powered grant opportunity matching and prioritization",
      "Automated compliance tracking with deadline management",
      "Grant budget monitoring with real-time expenditure analysis",
      "Proposal development support with funder requirement analysis",
      "Grant portfolio analytics and funding forecast reporting"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 55, empathy: 60, directness: 70,
      creativity: 45, humor: 15, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["2 CFR 200 (Uniform Guidance)", "OMB Circulars", "Single Audit Act", "State Grant Regulations", "Funder-Specific Requirements", "FFATA (Transparency Act)", "SAM Registration"],
      dataClassification: "Confidential — Grant Financial & Program Data",
      auditRequirements: "Grant transactions documented per Uniform Guidance; single audit readiness maintained; subrecipient monitoring documented",
      retentionPolicy: "Grant records: 3 years after closeout per 2 CFR 200; audit records: 5 years; proposals: 5 years",
      breachNotification: "Director notification for grant data or funder correspondence exposure"
    },
    skillsTags: ["grant management", "proposal writing", "federal grants", "compliance", "nonprofit finance", "Uniform Guidance", "grant accounting", "funder relations", "program management"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Policy Research Analyst AI",
    department: "Policy & Research",
    category: "Public Sector & Non-profit",
    industry: "Government & Non-profit",
    reportsTo: "Director of Policy",
    seniorityLevel: "mid",
    description: "Conducts policy research and analysis to support legislative advocacy, regulatory engagement, and organizational positioning. Monitors policy developments, analyzes proposed legislation, prepares policy briefs and position papers, and provides evidence-based recommendations that advance organizational mission and stakeholder interests.",
    coreResponsibilities: [
      "Monitor federal, state, and local legislative and regulatory developments",
      "Analyze proposed legislation and regulations for organizational impact",
      "Conduct policy research using academic, governmental, and industry sources",
      "Prepare policy briefs, white papers, and position statements",
      "Support advocacy strategy development with evidence-based analysis",
      "Track regulatory comment periods and coordinate organizational submissions",
      "Analyze policy outcomes and evaluate program effectiveness",
      "Monitor peer organization positions and coalition partner activities",
      "Support testimony preparation for legislative and regulatory hearings",
      "Report policy landscape changes and strategic implications to leadership"
    ],
    tasks: [
      { name: "Legislative Monitoring", cadence: "daily", description: "Track bill introductions, committee actions, and floor votes across jurisdictions", priority: "high" },
      { name: "Regulatory Alert Review", cadence: "daily", description: "Monitor Federal Register, state registers, and agency announcements for regulatory changes", priority: "high" },
      { name: "Policy News Scan", cadence: "daily", description: "Review policy news, think tank publications, and industry position papers", priority: "medium" },
      { name: "Impact Assessment", cadence: "daily", description: "Assess impact of active policy developments on organization and stakeholders", priority: "medium" },
      { name: "Research & Analysis", cadence: "weekly", description: "Conduct in-depth policy research on priority issues using multiple data sources", priority: "high" },
      { name: "Stakeholder Position Tracking", cadence: "weekly", description: "Track positions of legislators, regulators, and peer organizations on key issues", priority: "medium" },
      { name: "Policy Landscape Report", cadence: "monthly", description: "Compile policy environment report with legislative tracker and strategic analysis", priority: "high" },
      { name: "Advocacy Material Development", cadence: "monthly", description: "Develop or update fact sheets, talking points, and advocacy materials", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Congress.gov / GovTrack", "FiscalNote / Quorum", "Federal Register / Regulations.gov",
      "LexisNexis / Westlaw", "Bloomberg Government", "Google Scholar",
      "CQ Roll Call", "Salesforce Advocacy", "SharePoint", "Slack"
    ],
    dataAccessPermissions: {
      legislativeData: "Full Access",
      regulatoryData: "Full Access",
      researchDatabases: "Full Access",
      organizationPositions: "Full Access",
      advocacyRecords: "Full Access",
      stakeholderData: "Authorized — policy contacts",
      financialData: "Restricted — policy cost analysis",
      memberData: "Restricted — aggregate advocacy"
    },
    communicationCapabilities: [
      "Leadership advisory on policy developments and implications",
      "Advocacy team coordination for legislative and regulatory engagement",
      "Coalition partner communication on joint policy positions",
      "Government affairs coordination for legislative outreach",
      "Public communication support for policy positions",
      "Academic and research community engagement"
    ],
    exampleWorkflows: [
      {
        name: "Legislative Analysis & Response",
        steps: [
          "Identify new legislation relevant to organizational interests",
          "Analyze bill text for key provisions and potential impact",
          "Research comparable policies from other jurisdictions",
          "Assess economic and programmatic impact on stakeholders",
          "Draft policy analysis memo with organizational position recommendation",
          "Brief leadership and advocacy team on analysis",
          "Develop advocacy response: letters, testimony, coalition engagement",
          "Track bill progress and update analysis as amendments occur"
        ]
      },
      {
        name: "Regulatory Comment Submission",
        steps: [
          "Identify proposed regulation in Federal Register or state equivalent",
          "Analyze proposed rule against organizational policy positions",
          "Research evidence supporting organizational perspective",
          "Draft comment letter with specific, data-supported recommendations",
          "Circulate draft for internal review and coalition input",
          "Finalize and submit comment by regulatory deadline",
          "Track agency response and final rule publication",
          "Analyze final rule impact and prepare compliance guidance"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Policy Coverage", target: "100% of priority issues tracked", weight: 20 },
      { metric: "Analysis Turnaround Time", target: "< 48 hours for urgent issues", weight: 15 },
      { metric: "Comment Submission Rate", target: "100% of priority regulations", weight: 15 },
      { metric: "Research Quality Score", target: "> 4.0/5.0 internal review", weight: 15 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 },
      { metric: "Advocacy Material Currency", target: "Updated within 30 days of changes", weight: 10 },
      { metric: "Coalition Engagement", target: "> 5 joint positions per year", weight: 15 }
    ],
    useCases: [
      "AI-powered legislative tracking with automated impact assessment",
      "Policy research automation with multi-source evidence synthesis",
      "Regulatory monitoring with comment period deadline management",
      "Advocacy material generation with data-driven talking points",
      "Policy landscape analytics and trend identification"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 50, empathy: 55, directness: 75,
      creativity: 50, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["Lobbying Disclosure Act", "FARA", "State Lobbying Registration", "IRS 501(c) Lobbying Limits", "Hatch Act (government employees)", "FOIA", "Ethics in Government Act"],
      dataClassification: "Confidential — Policy Strategy & Advocacy Data",
      auditRequirements: "Lobbying activities documented per LDA; advocacy expenditures tracked; government contacts logged",
      retentionPolicy: "Policy research: 5 years; advocacy records: 7 years per LDA; legislative tracking: 5 years; comments: 5 years",
      breachNotification: "Director notification for policy strategy or advocacy data exposure"
    },
    skillsTags: ["policy analysis", "legislative research", "regulatory affairs", "advocacy", "government relations", "public policy", "research methodology", "policy writing", "coalition building"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Constituent Services Manager AI",
    department: "Constituent Relations",
    category: "Public Sector & Non-profit",
    industry: "Government & Non-profit",
    reportsTo: "Director of Community Services",
    seniorityLevel: "mid",
    description: "Manages constituent service operations for government agencies or elected officials, processing requests, resolving issues, tracking casework, and ensuring responsive communication with community members. Coordinates with government agencies to advocate for constituents and improve service delivery.",
    coreResponsibilities: [
      "Process incoming constituent requests, inquiries, and complaints",
      "Manage casework tracking from intake through resolution",
      "Coordinate with government agencies on behalf of constituents",
      "Analyze constituent issue trends and identify systemic concerns",
      "Manage constituent communication across phone, email, web, and in-person",
      "Track service delivery metrics and response time compliance",
      "Coordinate community outreach events and town hall logistics",
      "Maintain constituent database and interaction history",
      "Support emergency constituent services during crises and disasters",
      "Report constituent services metrics and community concerns to leadership"
    ],
    tasks: [
      { name: "Request Processing", cadence: "daily", description: "Process incoming constituent contacts, categorize issues, and initiate casework", priority: "high" },
      { name: "Casework Management", cadence: "daily", description: "Follow up on open cases, coordinate with agencies, and update constituent status", priority: "high" },
      { name: "Agency Coordination", cadence: "daily", description: "Contact government agencies to resolve constituent issues and track responses", priority: "high" },
      { name: "Constituent Communication", cadence: "daily", description: "Respond to constituent inquiries, provide status updates, and manage correspondence", priority: "high" },
      { name: "Issue Trend Analysis", cadence: "weekly", description: "Analyze constituent issue patterns, identify emerging concerns, and flag systemic issues", priority: "medium" },
      { name: "Community Outreach", cadence: "weekly", description: "Plan and coordinate community events, town halls, and outreach activities", priority: "medium" },
      { name: "Service Performance Report", cadence: "monthly", description: "Compile service metrics: case volume, resolution rate, response time, satisfaction", priority: "high" },
      { name: "Community Needs Assessment", cadence: "monthly", description: "Analyze constituent data to identify community needs and service gaps", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "IQ / Indigov (Constituent Management)", "Salesforce Government Cloud", "Zendesk",
      "Granicus GovDelivery", "Microsoft Dynamics 365", "SeeClickFix",
      "CallRail", "Mailchimp / Constant Contact", "Smartsheet", "Slack"
    ],
    dataAccessPermissions: {
      constituentRecords: "Full Access",
      caseworkData: "Full Access",
      correspondenceHistory: "Full Access",
      agencyContacts: "Full Access",
      communityData: "Full Access",
      eventRecords: "Full Access",
      legislativeData: "Authorized — constituent relevant",
      budgetData: "Restricted — constituent services budget"
    },
    communicationCapabilities: [
      "Constituent communication across all service channels",
      "Government agency coordination for casework resolution",
      "Elected official/leadership briefing on constituent concerns",
      "Community organization partnership communication",
      "Emergency communication coordination during crises",
      "Automated constituent notification and status updates"
    ],
    exampleWorkflows: [
      {
        name: "Constituent Casework Resolution",
        steps: [
          "Receive constituent request via phone, email, web, or walk-in",
          "Document issue details, gather supporting information and consent",
          "Categorize issue and determine appropriate agency or resource",
          "Contact agency on constituent's behalf with case information",
          "Track agency response and advocate for timely resolution",
          "Communicate progress and resolution to constituent",
          "Document resolution and close case in tracking system",
          "Follow up with constituent for satisfaction and additional needs"
        ]
      },
      {
        name: "Community Town Hall Coordination",
        steps: [
          "Identify community topics based on constituent issue trends",
          "Plan event logistics: venue, date, format, and speakers",
          "Promote event through constituent database and community channels",
          "Prepare briefing materials on anticipated community issues",
          "Coordinate event execution with staff and guest speakers",
          "Collect community input and constituent contacts during event",
          "Document issues raised and action items from town hall",
          "Follow up on commitments and report outcomes to leadership"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Case Resolution Rate", target: "> 85%", weight: 20 },
      { metric: "Average Response Time", target: "< 24 hours initial response", weight: 20 },
      { metric: "Constituent Satisfaction", target: "> 80%", weight: 15 },
      { metric: "Case Volume Capacity", target: "Zero backlog over 30 days", weight: 10 },
      { metric: "Agency Response Coordination", target: "> 90% agency follow-through", weight: 15 },
      { metric: "Community Outreach Events", target: "> quarterly targets", weight: 10 },
      { metric: "Data Accuracy", target: "> 95% constituent records current", weight: 10 }
    ],
    useCases: [
      "AI-powered constituent request classification and routing",
      "Casework automation with agency coordination workflows",
      "Constituent issue trend analysis for policy insight",
      "Community outreach optimization with targeted engagement",
      "Service delivery analytics with satisfaction monitoring"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 55, empathy: 85, directness: 60,
      creativity: 35, humor: 20, assertiveness: 50
    },
    complianceMetadata: {
      frameworks: ["FOIA", "Privacy Act", "ADA", "Title VI (Civil Rights)", "Hatch Act", "State Open Records Laws", "State Ethics Laws", "Records Retention Schedules"],
      dataClassification: "PII — Constituent Personal & Case Data",
      auditRequirements: "Constituent interactions logged; casework documented per records retention; FOIA requests tracked",
      retentionPolicy: "Constituent records: per state/federal retention schedule; casework: typically 5-7 years; correspondence: 3-5 years",
      breachNotification: "Director notification for constituent PII exposure; per state breach notification law requirements"
    },
    skillsTags: ["constituent services", "casework management", "government relations", "community engagement", "customer service", "agency coordination", "public administration", "crisis communication", "civic engagement"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "Non-profit Program Coordinator AI",
    department: "Program Management",
    category: "Public Sector & Non-profit",
    industry: "Government & Non-profit",
    reportsTo: "Director of Programs",
    seniorityLevel: "mid",
    description: "Coordinates non-profit program operations including participant services, volunteer management, outcome tracking, and reporting. Manages program delivery logistics, tracks impact metrics, coordinates with community partners, and ensures programs achieve their intended social outcomes.",
    coreResponsibilities: [
      "Coordinate program delivery operations and participant services",
      "Manage participant enrollment, intake, and case management workflows",
      "Track program outcomes, impact metrics, and success indicators",
      "Coordinate volunteer recruitment, training, and scheduling",
      "Manage community partner relationships and referral networks",
      "Prepare program reports for funders, board, and stakeholders",
      "Coordinate program events, workshops, and service delivery activities",
      "Monitor program budgets and resource allocation",
      "Support program evaluation and continuous improvement",
      "Maintain program compliance with funder and regulatory requirements"
    ],
    tasks: [
      { name: "Participant Services", cadence: "daily", description: "Process participant inquiries, manage enrollments, and coordinate service delivery", priority: "high" },
      { name: "Case Management", cadence: "daily", description: "Track participant progress, update case notes, and coordinate follow-up services", priority: "high" },
      { name: "Volunteer Coordination", cadence: "daily", description: "Manage volunteer schedules, assignments, and support needs", priority: "medium" },
      { name: "Partner Coordination", cadence: "daily", description: "Communicate with community partners on referrals, resources, and collaboration", priority: "medium" },
      { name: "Outcome Data Collection", cadence: "weekly", description: "Collect and enter program outcome data, verify data quality", priority: "high" },
      { name: "Program Activity Planning", cadence: "weekly", description: "Plan upcoming program events, workshops, and service delivery logistics", priority: "medium" },
      { name: "Program Performance Report", cadence: "monthly", description: "Compile program metrics: enrollment, completion, outcomes, and impact indicators", priority: "high" },
      { name: "Funder Report Preparation", cadence: "monthly", description: "Prepare program reports for grant funders with outcome data and narratives", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Salesforce NPSP", "Apricot (Social Solutions)", "ETO (Social Solutions)",
      "VolunteerHub / Galaxy Digital", "Mailchimp", "SurveyMonkey",
      "QuickBooks Non-profit", "Canva", "Smartsheet", "Slack"
    ],
    dataAccessPermissions: {
      participantRecords: "Full Access",
      programData: "Full Access",
      volunteerRecords: "Full Access",
      partnerData: "Full Access",
      outcomeData: "Full Access",
      budgetData: "Authorized — program budgets",
      funderReports: "Full Access",
      eventRecords: "Full Access"
    },
    communicationCapabilities: [
      "Participant communication for services and program updates",
      "Volunteer coordination and engagement communication",
      "Community partner collaboration and referral management",
      "Funder reporting and relationship management",
      "Board and leadership reporting on program impact",
      "Community outreach and program promotion"
    ],
    exampleWorkflows: [
      {
        name: "Program Participant Journey",
        steps: [
          "Receive referral or application from participant",
          "Conduct intake assessment and determine eligibility",
          "Enroll participant and create individualized service plan",
          "Deliver program services according to plan timeline",
          "Track participation, progress, and milestone completion",
          "Conduct periodic check-ins and adjust services as needed",
          "Complete program exit assessment and document outcomes",
          "Conduct follow-up at 30, 60, and 90 days post-program"
        ]
      },
      {
        name: "Volunteer Program Management",
        steps: [
          "Recruit volunteers through outreach and community partnerships",
          "Screen applicants with background checks and interviews",
          "Conduct volunteer orientation and role-specific training",
          "Assign volunteers to program activities and schedules",
          "Monitor volunteer engagement and provide ongoing support",
          "Recognize volunteer contributions and track hours",
          "Collect volunteer feedback for program improvement",
          "Report volunteer impact metrics to leadership"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Program Completion Rate", target: "> 75%", weight: 20 },
      { metric: "Outcome Achievement Rate", target: "> 70% of targets met", weight: 20 },
      { metric: "Participant Satisfaction", target: "> 4.0/5.0", weight: 15 },
      { metric: "Volunteer Retention Rate", target: "> 70% annual", weight: 10 },
      { metric: "Funder Report Timeliness", target: "100% on-time", weight: 15 },
      { metric: "Partner Referral Volume", target: "> quarterly targets", weight: 10 },
      { metric: "Data Completeness", target: "> 95% for outcome metrics", weight: 10 }
    ],
    useCases: [
      "AI-powered participant intake and eligibility determination",
      "Automated outcome tracking and impact measurement",
      "Volunteer matching and schedule optimization",
      "Community partner network management and referral coordination",
      "Program evaluation with data-driven improvement recommendations"
    ],
    personalityDefaults: {
      formality: 60, enthusiasm: 70, empathy: 85, directness: 55,
      creativity: 50, humor: 25, assertiveness: 45
    },
    complianceMetadata: {
      frameworks: ["2 CFR 200 (Uniform Guidance)", "IRS 501(c)(3) Requirements", "State Non-profit Regulations", "HIPAA (if health services)", "FERPA (if education services)", "ADA", "State Volunteer Protection Acts"],
      dataClassification: "PII — Participant Personal & Service Data",
      auditRequirements: "Participant records maintained per funder requirements; outcome data auditable; volunteer records documented",
      retentionPolicy: "Participant records: program + 5 years; volunteer records: service + 3 years; program data: per funder (typically 3-7 years)",
      breachNotification: "Director notification for participant PII exposure; funder notification per grant requirements"
    },
    skillsTags: ["program management", "non-profit operations", "case management", "volunteer management", "outcome measurement", "community partnerships", "grant reporting", "social services", "impact evaluation"],
    priceMonthly: 899,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  MEDIA & COMMUNICATIONS (4 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Media Relations Manager AI",
    department: "Public Relations",
    category: "Media & Communications",
    industry: "Media & Communications",
    reportsTo: "VP of Communications",
    seniorityLevel: "senior",
    description: "Manages media relationships and earned media strategies to build brand awareness, manage reputation, and drive positive coverage. Develops press materials, coordinates media outreach, manages press events, and monitors media sentiment to protect and enhance organizational reputation.",
    coreResponsibilities: [
      "Develop and execute earned media strategies and press outreach plans",
      "Build and maintain relationships with journalists, editors, and media outlets",
      "Draft press releases, media advisories, and press kit materials",
      "Coordinate media interviews, press conferences, and media tours",
      "Monitor media coverage, sentiment, and competitive share of voice",
      "Manage crisis communication response and media inquiries",
      "Prepare spokespersons with talking points and media training",
      "Track media placements, reach, and advertising value equivalency",
      "Coordinate with marketing on integrated communications campaigns",
      "Report media relations performance and earned media value"
    ],
    tasks: [
      { name: "Media Monitoring", cadence: "daily", description: "Monitor media coverage, brand mentions, and industry news across all channels", priority: "high" },
      { name: "Journalist Outreach", cadence: "daily", description: "Pitch stories to journalists, respond to media inquiries, and manage press contacts", priority: "high" },
      { name: "Press Material Development", cadence: "daily", description: "Draft and distribute press releases, media alerts, and response statements", priority: "high" },
      { name: "Crisis Monitoring", cadence: "daily", description: "Monitor for potential reputation issues and prepare rapid response if needed", priority: "critical" },
      { name: "Coverage Analysis", cadence: "weekly", description: "Analyze media placements, sentiment, reach, and messaging accuracy", priority: "high" },
      { name: "Spokesperson Preparation", cadence: "weekly", description: "Brief and prepare spokespersons for scheduled media interactions", priority: "medium" },
      { name: "Earned Media Report", cadence: "monthly", description: "Compile earned media metrics: placements, reach, AVE, sentiment, share of voice", priority: "high" },
      { name: "Media Strategy Review", cadence: "monthly", description: "Review media strategy effectiveness and adjust outreach plan", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Cision / Meltwater", "Muck Rack", "PR Newswire / Business Wire",
      "Brandwatch / Talkwalker", "Google News / Media Monitoring", "HARO",
      "Canva / Adobe", "Salesforce", "Prezly", "Slack"
    ],
    dataAccessPermissions: {
      mediaDatabases: "Full Access",
      pressContacts: "Full Access",
      coverageData: "Full Access",
      pressReleases: "Full Access",
      executiveCalendars: "Authorized — media scheduling",
      marketingData: "Authorized — integrated campaigns",
      crisisPlans: "Full Access",
      competitorData: "Full Access"
    },
    communicationCapabilities: [
      "Journalist and media outlet relationship management",
      "Executive preparation for media appearances",
      "Crisis communication team coordination",
      "Marketing team alignment on integrated communications",
      "Management reporting on earned media performance",
      "Agency and vendor coordination for PR activities"
    ],
    exampleWorkflows: [
      {
        name: "Proactive Story Placement",
        steps: [
          "Identify newsworthy story angle aligned with organizational messaging",
          "Research target journalists and outlets covering relevant beat",
          "Develop compelling pitch with supporting data and assets",
          "Personalize outreach to each journalist's coverage interests",
          "Follow up with journalists and offer exclusive angles or interviews",
          "Coordinate interview logistics and spokesperson preparation",
          "Monitor story publication and share across channels",
          "Analyze coverage quality, reach, and message pull-through"
        ]
      },
      {
        name: "Crisis Media Response",
        steps: [
          "Detect potential crisis through media monitoring or internal alert",
          "Assess situation severity and activate crisis communication plan",
          "Assemble crisis response team and establish communication protocols",
          "Draft holding statement and initial response messaging",
          "Coordinate spokesperson for media inquiries and statements",
          "Monitor real-time media and social coverage of the crisis",
          "Issue follow-up statements as situation develops",
          "Conduct post-crisis analysis and update crisis playbook"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Earned Media Placements", target: "> monthly target", weight: 20 },
      { metric: "Media Sentiment", target: "> 80% positive/neutral", weight: 15 },
      { metric: "Share of Voice", target: "> competitive benchmark", weight: 15 },
      { metric: "Tier 1 Media Placements", target: "> quarterly target", weight: 15 },
      { metric: "Media Response Time", target: "< 2 hours for inquiries", weight: 10 },
      { metric: "Message Pull-Through", target: "> 70% key messages in coverage", weight: 10 },
      { metric: "Crisis Response Readiness", target: "< 1 hour activation", weight: 15 }
    ],
    useCases: [
      "AI-powered media monitoring with automated sentiment analysis",
      "Journalist relationship management with outreach optimization",
      "Press release distribution with targeted media list generation",
      "Crisis communication monitoring and rapid response coordination",
      "Earned media analytics with competitive share of voice tracking"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 65, empathy: 55, directness: 70,
      creativity: 65, humor: 25, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["FTC Disclosure Guidelines", "SEC Regulation FD (if public)", "GDPR", "CCPA", "Defamation Law", "Copyright Law", "Press Freedom/Shield Laws", "Industry Self-Regulation Codes"],
      dataClassification: "Confidential — Communications Strategy & Media Relations Data",
      auditRequirements: "Press releases archived; media interactions logged; crisis response documented; disclosure compliance tracked",
      retentionPolicy: "Press releases: indefinite; media lists: active + 2 years; coverage archives: 5 years; crisis records: 7 years",
      breachNotification: "VP Communications notification for strategy or embargoed information exposure"
    },
    skillsTags: ["media relations", "public relations", "press management", "crisis communication", "media monitoring", "earned media", "spokesperson training", "reputation management", "communications strategy"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Content Distribution Strategist AI",
    department: "Content Distribution",
    category: "Media & Communications",
    industry: "Media & Communications",
    reportsTo: "Director of Content",
    seniorityLevel: "mid",
    description: "Develops and executes content distribution strategies to maximize reach, engagement, and monetization across owned, earned, and paid channels. Optimizes distribution timing, channel selection, and format adaptation to ensure content reaches target audiences effectively and drives measurable business outcomes.",
    coreResponsibilities: [
      "Develop multi-channel content distribution strategies and plans",
      "Optimize content distribution timing and frequency across platforms",
      "Manage owned media channels: website, email, newsletters, and apps",
      "Coordinate paid content promotion and native advertising campaigns",
      "Analyze content distribution performance and audience reach metrics",
      "Manage syndication partnerships and content licensing agreements",
      "Optimize content format and adaptation for each distribution channel",
      "Track audience acquisition, retention, and engagement by channel",
      "Support content monetization strategies across distribution channels",
      "Report distribution performance and ROI by channel and campaign"
    ],
    tasks: [
      { name: "Distribution Execution", cadence: "daily", description: "Execute content distribution across channels, manage publishing and promotion", priority: "high" },
      { name: "Performance Monitoring", cadence: "daily", description: "Monitor real-time distribution metrics: views, shares, engagement, and referral traffic", priority: "high" },
      { name: "Email Campaign Management", cadence: "daily", description: "Manage email newsletter distribution, segmentation, and performance tracking", priority: "medium" },
      { name: "Paid Promotion Optimization", cadence: "daily", description: "Monitor paid content promotion campaigns, optimize targeting and spend", priority: "medium" },
      { name: "Channel Performance Analysis", cadence: "weekly", description: "Analyze distribution performance by channel, identify optimization opportunities", priority: "high" },
      { name: "Syndication Management", cadence: "weekly", description: "Manage content syndication partnerships and track partner performance", priority: "medium" },
      { name: "Distribution Performance Report", cadence: "monthly", description: "Compile comprehensive distribution metrics: reach, engagement, acquisition, and ROI", priority: "high" },
      { name: "Strategy Optimization Review", cadence: "monthly", description: "Review distribution strategy effectiveness and recommend adjustments", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "HubSpot / Mailchimp", "Buffer / Hootsuite", "Outbrain / Taboola",
      "Google Analytics 4", "Facebook Ads Manager", "LinkedIn Campaign Manager",
      "Chartbeat / Parse.ly", "WordPress / Contentful", "Canva", "Slack"
    ],
    dataAccessPermissions: {
      contentLibrary: "Full Access",
      distributionChannels: "Full Access",
      audienceData: "Full Access",
      analyticsData: "Full Access",
      emailLists: "Full Access",
      adAccountData: "Full Access",
      partnerData: "Full Access — syndication",
      revenueData: "Authorized — content monetization"
    },
    communicationCapabilities: [
      "Content team coordination for distribution-ready assets",
      "Marketing team alignment on campaign distribution",
      "Syndication partner management and communication",
      "Management reporting on distribution performance",
      "Audience engagement and community interaction",
      "Ad platform coordination for paid promotion"
    ],
    exampleWorkflows: [
      {
        name: "Multi-Channel Content Distribution",
        steps: [
          "Receive final content asset with distribution objectives",
          "Adapt content format for each target distribution channel",
          "Schedule publishing across owned channels (web, email, social)",
          "Configure paid promotion campaigns for targeted amplification",
          "Coordinate syndication distribution with partner networks",
          "Monitor real-time performance and adjust promotion spend",
          "Engage with audience responses across channels",
          "Analyze distribution results and optimize for future content"
        ]
      },
      {
        name: "Email Newsletter Optimization",
        steps: [
          "Analyze subscriber segmentation and engagement history",
          "Curate newsletter content based on audience preferences",
          "Design email layout optimized for mobile and desktop",
          "Configure A/B tests for subject lines, send time, and content",
          "Execute email distribution to segmented audience lists",
          "Monitor open rates, click rates, and unsubscribe rates",
          "Analyze subscriber behavior and content preference patterns",
          "Optimize newsletter strategy based on performance data"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Content Reach", target: "> target by channel", weight: 20 },
      { metric: "Email Open Rate", target: "> 25%", weight: 15 },
      { metric: "Click-Through Rate", target: "> channel benchmarks", weight: 15 },
      { metric: "Audience Growth Rate", target: "> 5% monthly", weight: 10 },
      { metric: "Distribution Cost Efficiency", target: "< target CPC/CPM", weight: 15 },
      { metric: "Content Syndication Revenue", target: "> licensing targets", weight: 10 },
      { metric: "Channel Diversification", target: "No single channel > 40% of traffic", weight: 15 }
    ],
    useCases: [
      "AI-optimized content distribution timing and channel selection",
      "Audience segmentation for personalized content delivery",
      "Paid content promotion with automated bid and budget optimization",
      "Email newsletter optimization with send time and subject line AI",
      "Content syndication management and partner performance analytics"
    ],
    personalityDefaults: {
      formality: 60, enthusiasm: 70, empathy: 50, directness: 70,
      creativity: 65, humor: 25, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "CAN-SPAM", "TCPA", "FTC Native Advertising Guidelines", "DMCA", "Platform Advertising Policies", "ePrivacy Directive"],
      dataClassification: "PII — Audience Personal & Behavioral Data",
      auditRequirements: "Email consent tracked per GDPR/CAN-SPAM; ad disclosures documented; distribution metrics archived",
      retentionPolicy: "Distribution data: 3 years; email subscriber data per consent; syndication contracts: term + 3 years",
      breachNotification: "Director notification for audience data or distribution strategy exposure"
    },
    skillsTags: ["content distribution", "email marketing", "paid media", "syndication", "audience development", "channel strategy", "newsletter management", "content monetization", "digital marketing"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Broadcast Operations Coordinator AI",
    department: "Broadcast Operations",
    category: "Media & Communications",
    industry: "Media & Communications",
    reportsTo: "Director of Broadcast Operations",
    seniorityLevel: "mid",
    description: "Coordinates broadcast operations including live production, master control, transmission monitoring, and content scheduling. Manages broadcast equipment, coordinates technical crews, ensures FCC compliance, and maintains signal quality across traditional and digital broadcast platforms.",
    coreResponsibilities: [
      "Manage live broadcast production workflows and technical operations",
      "Coordinate master control operations and content playout scheduling",
      "Monitor broadcast signal quality, transmission, and distribution systems",
      "Manage broadcast equipment maintenance and technical infrastructure",
      "Coordinate technical crews for studio and remote broadcast productions",
      "Ensure FCC regulatory compliance for broadcast operations",
      "Manage broadcast content scheduling and traffic operations",
      "Coordinate with satellite and streaming distribution partners",
      "Track broadcast operations metrics and technical quality indicators",
      "Support emergency broadcast system compliance and testing"
    ],
    tasks: [
      { name: "Transmission Monitoring", cadence: "daily", description: "Monitor live broadcast signal quality, stream health, and distribution systems", priority: "critical" },
      { name: "Production Coordination", cadence: "daily", description: "Coordinate live and recorded production schedules, crew assignments, and studio resources", priority: "high" },
      { name: "Content Scheduling", cadence: "daily", description: "Manage broadcast content schedule, program log, and commercial traffic", priority: "high" },
      { name: "Equipment Status Review", cadence: "daily", description: "Review equipment status, manage maintenance schedules, and track repair needs", priority: "medium" },
      { name: "FCC Compliance Monitoring", cadence: "weekly", description: "Verify FCC compliance: public file, EAS tests, tower lighting, and technical standards", priority: "high" },
      { name: "Quality Control Review", cadence: "weekly", description: "Review broadcast quality metrics and address technical issues affecting viewer experience", priority: "medium" },
      { name: "Operations Performance Report", cadence: "monthly", description: "Compile broadcast operations KPIs: uptime, quality, incidents, and compliance", priority: "high" },
      { name: "Capital Planning Review", cadence: "monthly", description: "Assess equipment lifecycle, plan technology upgrades, and track capital budget", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Grass Valley / Ross Video", "Vizrt / ChyronHego", "Harmonic (Playout)",
      "Evertz (Master Control)", "Dalet / Avid MediaCentral", "WideOrbit (Traffic)",
      "Telestream Vantage", "SRT / RIST Protocol", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      broadcastSystems: "Full Access",
      contentSchedule: "Full Access",
      equipmentRecords: "Full Access",
      crewSchedules: "Full Access",
      technicalLogs: "Full Access",
      fccRecords: "Full Access",
      vendorContracts: "Authorized — broadcast equipment",
      budgetData: "Authorized — operations budget"
    },
    communicationCapabilities: [
      "Technical crew coordination for productions and operations",
      "News and programming team production support",
      "Satellite and distribution partner coordination",
      "Equipment vendor management and support coordination",
      "Management reporting on broadcast operations performance",
      "FCC and regulatory communication for compliance matters"
    ],
    exampleWorkflows: [
      {
        name: "Live Broadcast Production",
        steps: [
          "Receive production schedule and technical requirements",
          "Coordinate studio setup: cameras, lighting, audio, graphics",
          "Assign technical crew roles and brief on production rundown",
          "Test all systems and connectivity before air time",
          "Execute live production with real-time monitoring",
          "Manage any technical issues during broadcast",
          "Complete post-production archival and quality review",
          "Document lessons learned and equipment issues"
        ]
      },
      {
        name: "Broadcast System Upgrade",
        steps: [
          "Assess current system capabilities and identified limitations",
          "Research technology options and develop upgrade specifications",
          "Coordinate vendor evaluation and procurement process",
          "Plan installation timeline to minimize broadcast disruption",
          "Execute installation with parallel testing alongside existing systems",
          "Conduct comprehensive system testing and quality verification",
          "Transition to new system with rollback plan in place",
          "Train operations staff and update procedures documentation"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Broadcast Uptime", target: "> 99.95%", weight: 25 },
      { metric: "Technical Quality Score", target: "> 4.5/5.0", weight: 15 },
      { metric: "FCC Compliance", target: "100%", weight: 20 },
      { metric: "Equipment Availability", target: "> 99%", weight: 10 },
      { metric: "Production On-Time Start", target: "> 98%", weight: 10 },
      { metric: "Incident Response Time", target: "< 5 minutes", weight: 10 },
      { metric: "Maintenance Schedule Adherence", target: "> 95%", weight: 10 }
    ],
    useCases: [
      "AI-powered broadcast monitoring with automated quality detection",
      "Production resource scheduling and crew management optimization",
      "Predictive equipment maintenance with failure prediction",
      "Content scheduling optimization for broadcast traffic",
      "FCC compliance monitoring and automated documentation"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 35, directness: 85,
      creativity: 35, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["FCC Broadcast Regulations", "EAS (Emergency Alert System)", "CALM Act (Audio Levels)", "FCC Public File Requirements", "OSHA", "FAA (Tower Regulations)", "Copyright (Broadcast Licensing)", "ATSC Standards"],
      dataClassification: "Confidential — Broadcast Operations & Technical Data",
      auditRequirements: "FCC public file maintained; EAS tests logged; technical logs archived; equipment maintenance documented",
      retentionPolicy: "Broadcast logs: per FCC (typically 2 years); equipment records: asset life + 3 years; FCC filings: license term + 3 years",
      breachNotification: "Director notification for broadcast system compromise; FCC notification for regulatory violations"
    },
    skillsTags: ["broadcast operations", "master control", "live production", "broadcast engineering", "FCC compliance", "signal monitoring", "content scheduling", "broadcast technology", "transmission"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Digital Newsroom Manager AI",
    department: "Digital News Operations",
    category: "Media & Communications",
    industry: "Media & Communications",
    reportsTo: "Editor-in-Chief / Digital Director",
    seniorityLevel: "senior",
    description: "Manages digital newsroom operations including content publishing, real-time news coverage, audience engagement, and digital workflow optimization. Coordinates editorial workflows, manages CMS operations, tracks digital audience metrics, and ensures timely, accurate, and engaging news delivery across digital platforms.",
    coreResponsibilities: [
      "Manage digital news publishing workflows and CMS operations",
      "Coordinate real-time news coverage and breaking news digital response",
      "Optimize content for digital platforms: SEO, social, mobile, and newsletters",
      "Analyze digital audience metrics and content performance data",
      "Manage homepage curation, push notifications, and content prioritization",
      "Coordinate multimedia content production: video, graphics, and interactive",
      "Track digital revenue metrics: pageviews, subscribers, and ad performance",
      "Support newsroom innovation with new digital storytelling formats",
      "Manage digital editorial standards and fact-checking workflows",
      "Report digital newsroom performance and audience growth metrics"
    ],
    tasks: [
      { name: "Content Publishing Management", cadence: "daily", description: "Manage CMS publishing queue, optimize headlines/SEO, and ensure timely publication", priority: "critical" },
      { name: "Breaking News Coordination", cadence: "daily", description: "Coordinate digital response to breaking news: alerts, updates, and live coverage", priority: "critical" },
      { name: "Homepage Curation", cadence: "daily", description: "Curate homepage content, manage story positioning, and optimize for engagement", priority: "high" },
      { name: "Audience Analytics Review", cadence: "daily", description: "Review real-time audience data, identify trending content, and guide editorial priorities", priority: "high" },
      { name: "Digital Optimization Review", cadence: "weekly", description: "Analyze SEO performance, social engagement, and newsletter metrics for optimization", priority: "high" },
      { name: "Multimedia Production Coordination", cadence: "weekly", description: "Coordinate video, graphics, and interactive element production for digital stories", priority: "medium" },
      { name: "Digital Performance Report", cadence: "monthly", description: "Compile digital metrics: unique visitors, engagement, subscriber growth, and revenue", priority: "high" },
      { name: "Innovation & Format Review", cadence: "monthly", description: "Evaluate new digital storytelling formats, tools, and audience engagement techniques", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Arc Publishing / WordPress VIP", "Chartbeat / Parse.ly", "Google Analytics 4",
      "Apple News / Google News Publisher", "Taboola / Outbrain", "Adobe Premiere / Canva",
      "SEMrush / Ahrefs", "Mailchimp / Sailthru", "TweetDeck / CrowdTangle", "Slack"
    ],
    dataAccessPermissions: {
      cmsSystem: "Full Access",
      analyticsData: "Full Access",
      audienceData: "Full Access",
      editorialContent: "Full Access",
      subscriberData: "Authorized — engagement metrics",
      revenueData: "Authorized — digital revenue",
      socialMediaAccounts: "Full Access",
      competitorData: "Full Access"
    },
    communicationCapabilities: [
      "Newsroom editorial coordination for digital publishing",
      "Breaking news communication and coverage coordination",
      "Audience engagement and community interaction",
      "Management reporting on digital performance",
      "Technology team coordination for CMS and tools",
      "Advertising team alignment on revenue optimization"
    ],
    exampleWorkflows: [
      {
        name: "Breaking News Digital Response",
        steps: [
          "Receive breaking news alert from editorial or wire services",
          "Publish initial alert/push notification to audience",
          "Create digital breaking news page with live updates capability",
          "Coordinate with reporters for verification and updates",
          "Manage homepage positioning and story prioritization",
          "Coordinate social media coverage and audience engagement",
          "Update and expand coverage as story develops",
          "Transition to follow-up coverage and analysis pieces"
        ]
      },
      {
        name: "Digital Subscriber Growth Program",
        steps: [
          "Analyze current subscriber funnel: awareness to conversion",
          "Identify content types and topics that drive subscription conversion",
          "Optimize paywall strategy and metering rules",
          "Develop newsletter strategy to nurture potential subscribers",
          "Create targeted acquisition campaigns across digital channels",
          "Test pricing, offers, and messaging variations",
          "Monitor retention rates and churn indicators",
          "Report subscriber growth metrics and LTV analysis"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Unique Visitors", target: "> monthly growth target", weight: 15 },
      { metric: "Digital Subscriber Growth", target: "> 5% monthly", weight: 20 },
      { metric: "Page Views per Visit", target: "> 2.5", weight: 10 },
      { metric: "Breaking News Response Time", target: "< 5 minutes to publish", weight: 15 },
      { metric: "Newsletter Open Rate", target: "> 30%", weight: 10 },
      { metric: "Social Referral Traffic", target: "> 20% of total", weight: 10 },
      { metric: "Digital Revenue Growth", target: "> 10% YoY", weight: 20 }
    ],
    useCases: [
      "AI-powered headline optimization and SEO content recommendations",
      "Real-time audience analytics with content prioritization guidance",
      "Breaking news workflow automation with alert and publishing coordination",
      "Digital subscriber analytics with churn prediction and retention",
      "Newsroom performance dashboarding with competitive benchmarking"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 65, empathy: 45, directness: 80,
      creativity: 60, humor: 20, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["First Amendment / Press Freedom", "GDPR", "CCPA", "DMCA", "FTC Native Advertising Guidelines", "Copyright Law", "Defamation Law", "SPJ Code of Ethics"],
      dataClassification: "PII — Audience & Subscriber Data; Confidential — Editorial Content",
      auditRequirements: "Published content archived; subscriber consent documented; editorial corrections logged; fact-check records maintained",
      retentionPolicy: "Published content: permanent; audience data per GDPR/CCPA; subscriber data per consent; editorial records: 7 years",
      breachNotification: "Editor/Digital Director notification for subscriber data or unpublished content exposure"
    },
    skillsTags: ["digital newsroom", "CMS management", "audience analytics", "SEO", "breaking news", "digital publishing", "subscriber growth", "editorial workflow", "multimedia journalism"],
    priceMonthly: 1299,
    isActive: 1,
  },
];
