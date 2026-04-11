import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const retailEnergyTransportationRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [

  // ═══════════════════════════════════════════════════════════
  //  RETAIL & CONSUMER GOODS (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Inventory Management Specialist AI",
    department: "Inventory & Supply Chain",
    category: "Retail & Consumer Goods",
    industry: "Retail",
    reportsTo: "VP of Supply Chain",
    seniorityLevel: "mid",
    description: "Manages inventory planning, replenishment, and optimization across retail locations and distribution centers. Analyzes demand patterns, manages safety stock levels, coordinates with suppliers on replenishment, and minimizes stockouts while controlling carrying costs and reducing shrinkage across the retail network.",
    coreResponsibilities: [
      "Monitor inventory levels across stores, warehouses, and distribution centers",
      "Execute demand-driven replenishment planning and purchase order generation",
      "Optimize safety stock levels and reorder points by SKU and location",
      "Analyze inventory turnover, days-on-hand, and sell-through rates",
      "Manage seasonal inventory buildup and markdown planning",
      "Coordinate with suppliers on lead times, MOQs, and delivery schedules",
      "Track and reduce inventory shrinkage through loss prevention analytics",
      "Manage dead stock identification and liquidation processes",
      "Support new product launch inventory allocation and distribution",
      "Generate inventory performance reports for merchandise planning"
    ],
    tasks: [
      { name: "Stock Level Monitoring", cadence: "daily", description: "Review real-time inventory levels, flag stockouts and overstock positions, trigger replenishment", priority: "critical" },
      { name: "Replenishment Order Processing", cadence: "daily", description: "Generate and submit purchase orders based on demand forecasts and inventory policies", priority: "high" },
      { name: "Receiving & Discrepancy Resolution", cadence: "daily", description: "Verify incoming shipments against POs, resolve quantity and quality discrepancies", priority: "high" },
      { name: "Shrinkage Monitoring", cadence: "daily", description: "Analyze inventory variance reports, identify shrinkage patterns, and flag anomalies", priority: "medium" },
      { name: "Demand Forecast Alignment", cadence: "weekly", description: "Compare actual demand against forecasts, adjust inventory parameters for accuracy", priority: "high" },
      { name: "Supplier Performance Review", cadence: "weekly", description: "Track supplier fill rates, lead time reliability, and quality metrics", priority: "medium" },
      { name: "Inventory Health Dashboard", cadence: "monthly", description: "Compile inventory KPIs: turns, GMROI, stockout rate, overstock value, shrinkage rate", priority: "high" },
      { name: "Dead Stock Analysis", cadence: "monthly", description: "Identify slow-moving and obsolete inventory, recommend markdown or liquidation strategies", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAP Retail", "Oracle Retail Merchandising", "Blue Yonder (JDA)",
      "Manhattan Associates WMS", "Relex Solutions", "Infor CloudSuite",
      "Shopify Plus", "Tableau", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      inventoryData: "Full Access",
      purchaseOrders: "Full Access",
      supplierRecords: "Full Access",
      salesData: "Full Access",
      warehouseData: "Full Access",
      pricingData: "Authorized — cost and margin",
      storeOperations: "Authorized — inventory related",
      financialReports: "Restricted — inventory valuation only"
    },
    communicationCapabilities: [
      "Supplier coordination for orders, deliveries, and quality issues",
      "Store operations communication for stock issues and allocations",
      "Merchandise planning collaboration on inventory strategy",
      "Warehouse team coordination for receiving and distribution",
      "Management reporting on inventory performance metrics",
      "Automated stockout and overstock alert notifications"
    ],
    exampleWorkflows: [
      {
        name: "Automated Replenishment Cycle",
        steps: [
          "Pull real-time inventory positions across all locations",
          "Compare against reorder points and safety stock thresholds",
          "Calculate replenishment quantities using demand forecast and lead times",
          "Apply supplier MOQ and pack-size constraints",
          "Generate purchase orders and route for approval",
          "Submit approved orders to suppliers electronically",
          "Track order status and expected delivery dates",
          "Process receipts and update inventory records"
        ]
      },
      {
        name: "Seasonal Inventory Planning",
        steps: [
          "Analyze historical seasonal demand patterns by category",
          "Incorporate trend data and promotional calendar",
          "Calculate seasonal buildup quantities by SKU and location",
          "Coordinate with suppliers on production and delivery schedules",
          "Allocate inventory across stores based on demand profiles",
          "Monitor sell-through during season and adjust allocations",
          "Plan end-of-season markdown strategy for remaining inventory",
          "Document lessons learned for next season's planning"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "In-Stock Rate", target: "> 97%", weight: 25 },
      { metric: "Inventory Turns", target: "> industry benchmark", weight: 15 },
      { metric: "Shrinkage Rate", target: "< 1.5%", weight: 15 },
      { metric: "GMROI", target: "> $3.00", weight: 15 },
      { metric: "Overstock Value", target: "< 5% of total inventory", weight: 10 },
      { metric: "Supplier Fill Rate", target: "> 95%", weight: 10 },
      { metric: "Dead Stock Ratio", target: "< 3%", weight: 10 }
    ],
    useCases: [
      "AI-driven demand-responsive replenishment with real-time optimization",
      "Predictive stockout prevention using ML demand sensing",
      "Shrinkage pattern detection and loss prevention analytics",
      "Seasonal inventory planning with dynamic allocation",
      "Supplier performance management and sourcing optimization"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 40, directness: 80,
      creativity: 40, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["SOX", "GAAP (Inventory Valuation)", "CCPA", "GDPR", "FDA (food/cosmetics)", "CPSC (consumer products)", "State Retail Regulations"],
      dataClassification: "Confidential — Inventory & Supply Chain Data",
      auditRequirements: "Inventory transactions logged; physical count reconciliation documented; valuation methods per GAAP",
      retentionPolicy: "Inventory records: 7 years; purchase orders: 7 years; supplier records: relationship + 5 years",
      breachNotification: "Supply chain VP notification for inventory data or supplier pricing exposure"
    },
    skillsTags: ["inventory management", "demand planning", "replenishment", "supply chain", "retail operations", "loss prevention", "merchandise planning", "WMS", "ERP systems"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Customer Experience Analyst AI",
    department: "Customer Experience",
    category: "Retail & Consumer Goods",
    industry: "Retail",
    reportsTo: "VP of Customer Experience",
    seniorityLevel: "mid",
    description: "Analyzes customer behavior, feedback, and journey data to identify experience improvement opportunities across all retail channels. Uses voice-of-customer programs, sentiment analysis, and behavioral analytics to drive customer satisfaction, loyalty, and lifetime value across digital and physical retail touchpoints.",
    coreResponsibilities: [
      "Analyze customer journey data across omnichannel touchpoints",
      "Manage voice-of-customer programs including surveys and feedback collection",
      "Conduct customer sentiment analysis across reviews, social media, and support",
      "Build customer segmentation models for targeted experience strategies",
      "Track customer satisfaction metrics (NPS, CSAT, CES) and identify trends",
      "Map customer journeys and identify friction points and drop-off stages",
      "Analyze customer lifetime value and churn prediction models",
      "Support loyalty program optimization with behavioral analytics",
      "Collaborate with product, marketing, and ops teams on CX improvements",
      "Generate customer experience dashboards and executive reports"
    ],
    tasks: [
      { name: "Feedback Monitoring", cadence: "daily", description: "Review incoming customer feedback from surveys, reviews, social media, and support tickets", priority: "high" },
      { name: "Sentiment Analysis", cadence: "daily", description: "Analyze customer sentiment trends, flag emerging issues, and identify positive highlights", priority: "high" },
      { name: "CX Metric Tracking", cadence: "daily", description: "Update real-time NPS, CSAT, and CES dashboards across channels and touchpoints", priority: "medium" },
      { name: "Journey Analytics", cadence: "daily", description: "Analyze customer journey data, identify conversion bottlenecks and experience gaps", priority: "medium" },
      { name: "Customer Segment Analysis", cadence: "weekly", description: "Analyze behavioral patterns by segment, identify high-value and at-risk customer groups", priority: "high" },
      { name: "Churn Risk Monitoring", cadence: "weekly", description: "Run churn prediction models, identify at-risk customers, recommend retention interventions", priority: "high" },
      { name: "CX Performance Report", cadence: "monthly", description: "Compile comprehensive CX report with trends, root causes, and improvement recommendations", priority: "high" },
      { name: "Competitive CX Benchmarking", cadence: "monthly", description: "Benchmark CX metrics against competitors and industry standards", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Qualtrics XM", "Medallia", "Clarabridge (Qualtrics)",
      "Google Analytics 4", "Adobe Analytics", "Amplitude",
      "Salesforce Service Cloud", "Zendesk", "Sprout Social", "Slack"
    ],
    dataAccessPermissions: {
      customerFeedback: "Full Access",
      surveyData: "Full Access",
      behavioralData: "Full Access — anonymized",
      transactionData: "Authorized — aggregate patterns",
      supportTickets: "Full Access",
      socialMedia: "Full Access",
      loyaltyData: "Authorized",
      customerPII: "Restricted — aggregate analytics only"
    },
    communicationCapabilities: [
      "Executive CX reporting and strategic recommendations",
      "Cross-functional collaboration on experience improvement initiatives",
      "Marketing team coordination for customer engagement strategies",
      "Store operations feedback and improvement guidance",
      "Customer advocacy and escalation management",
      "Automated CX alert notifications for metric deviations"
    ],
    exampleWorkflows: [
      {
        name: "Customer Journey Optimization",
        steps: [
          "Map end-to-end customer journey across digital and physical channels",
          "Instrument journey touchpoints with measurement and feedback collection",
          "Analyze conversion and satisfaction data at each stage",
          "Identify top friction points and drop-off drivers",
          "Quantify business impact of experience gaps",
          "Design improvement hypotheses with cross-functional teams",
          "Implement improvements and measure before/after impact",
          "Scale successful improvements across channels"
        ]
      },
      {
        name: "Voice of Customer Program Management",
        steps: [
          "Design survey instruments for key customer touchpoints",
          "Configure automated survey distribution triggers",
          "Collect and aggregate feedback across all channels",
          "Apply text analytics and sentiment analysis to open-ended responses",
          "Identify thematic patterns and root cause drivers",
          "Prioritize improvement opportunities by impact and feasibility",
          "Communicate insights and action plans to business owners",
          "Track improvement implementation and measure outcome impact"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Net Promoter Score", target: "> 50", weight: 20 },
      { metric: "Customer Satisfaction (CSAT)", target: "> 85%", weight: 20 },
      { metric: "Customer Effort Score", target: "< 3.0", weight: 15 },
      { metric: "Customer Retention Rate", target: "> 75%", weight: 15 },
      { metric: "Survey Response Rate", target: "> 15%", weight: 10 },
      { metric: "Improvement Initiative ROI", target: "> 3x investment", weight: 10 },
      { metric: "Customer Lifetime Value Growth", target: "> 5% YoY", weight: 10 }
    ],
    useCases: [
      "AI-powered customer sentiment analysis across omnichannel feedback",
      "Predictive churn modeling with automated retention interventions",
      "Real-time customer experience dashboarding and alerting",
      "Journey analytics with friction point identification and optimization",
      "Customer segmentation for personalized experience strategies"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 65, empathy: 75, directness: 70,
      creativity: 55, humor: 25, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "CAN-SPAM", "TCPA", "PCI-DSS", "ADA Accessibility", "FTC Consumer Protection"],
      dataClassification: "PII — Customer Personal & Behavioral Data",
      auditRequirements: "Customer data usage documented; consent tracked; analytics methodology transparent",
      retentionPolicy: "Survey data: 3 years; behavioral data per consent/GDPR; PII per CCPA deletion requests",
      breachNotification: "GDPR 72-hour notification; CCPA notification for customer data exposure"
    },
    skillsTags: ["customer experience", "CX analytics", "NPS", "sentiment analysis", "journey mapping", "customer segmentation", "retention analytics", "voice of customer", "omnichannel"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Visual Merchandising Coordinator AI",
    department: "Merchandising",
    category: "Retail & Consumer Goods",
    industry: "Retail",
    reportsTo: "VP of Merchandising",
    seniorityLevel: "mid",
    description: "Plans and coordinates visual merchandising strategies across retail locations, managing planogram development, store layout optimization, seasonal display programs, and brand presentation standards. Analyzes sales performance by display to optimize product placement and drive conversion and basket size.",
    coreResponsibilities: [
      "Develop and distribute planograms for product placement and shelf optimization",
      "Create visual merchandising guidelines and brand presentation standards",
      "Coordinate seasonal and promotional display programs across locations",
      "Analyze sales lift and conversion data by display and product placement",
      "Manage fixture planning, procurement, and allocation",
      "Coordinate with buying teams on assortment presentation strategies",
      "Conduct store compliance audits for merchandising standards",
      "Support new store openings and remodel visual merchandising plans",
      "Monitor competitive visual merchandising strategies and trends",
      "Train store teams on visual merchandising execution standards"
    ],
    tasks: [
      { name: "Planogram Updates", cadence: "daily", description: "Develop and revise planograms based on assortment changes, new products, and performance data", priority: "high" },
      { name: "Display Program Coordination", cadence: "daily", description: "Coordinate promotional and seasonal display rollouts, track execution timelines", priority: "high" },
      { name: "Store Compliance Monitoring", cadence: "daily", description: "Review store compliance photos and reports, flag deviations from merchandising standards", priority: "medium" },
      { name: "Performance Analysis", cadence: "daily", description: "Analyze sales data by display location, endcap, and feature to measure merchandising effectiveness", priority: "medium" },
      { name: "Fixture & Signage Management", cadence: "weekly", description: "Coordinate fixture orders, signage production, and distribution to stores", priority: "medium" },
      { name: "Competitive Analysis", cadence: "weekly", description: "Monitor competitor visual merchandising strategies, trends, and innovative displays", priority: "medium" },
      { name: "Merchandising Performance Report", cadence: "monthly", description: "Compile visual merchandising KPIs: compliance rate, sales lift, space productivity", priority: "high" },
      { name: "Seasonal Planning", cadence: "monthly", description: "Plan upcoming seasonal visual merchandising programs, themes, and fixture requirements", priority: "high" }
    ],
    toolsAndIntegrations: [
      "JDA Space Planning (Blue Yonder)", "Spaceman (Nielsen)", "One Door Merchandising",
      "IWD Visual Merchandising", "Adobe Creative Suite", "Canva",
      "SAP Retail", "Trax Retail Execution", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      salesData: "Full Access — category and product level",
      planogramData: "Full Access",
      storeLayouts: "Full Access",
      fixtureInventory: "Full Access",
      supplierData: "Authorized — fixture vendors",
      competitorData: "Full Access",
      marketingCalendar: "Authorized",
      budgetData: "Authorized — merchandising budget"
    },
    communicationCapabilities: [
      "Store team guidance on visual merchandising execution",
      "Buying team collaboration on assortment presentation",
      "Marketing coordination on promotional display programs",
      "Store operations communication for new program rollouts",
      "Management reporting on merchandising performance",
      "Vendor coordination for fixtures and signage"
    ],
    exampleWorkflows: [
      {
        name: "Seasonal Display Program Launch",
        steps: [
          "Define seasonal theme, color palette, and visual direction",
          "Develop planograms and display guidelines for each store format",
          "Coordinate fixture and signage production with vendors",
          "Create execution guide with photos and step-by-step instructions",
          "Distribute materials and allocate fixtures to stores",
          "Set execution timeline with milestones and deadlines",
          "Monitor store execution through compliance photos and reports",
          "Analyze sales performance of seasonal displays vs prior year"
        ]
      },
      {
        name: "Planogram Optimization",
        steps: [
          "Pull sales, margin, and velocity data by SKU and shelf position",
          "Analyze space-to-sales ratios and identify underperforming positions",
          "Model alternative planogram layouts with optimization software",
          "Simulate expected sales lift from proposed changes",
          "Test optimized planogram in pilot stores",
          "Measure pilot results against control stores",
          "Roll out successful planogram changes across chain",
          "Document best practices and update standards"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Planogram Compliance Rate", target: "> 90%", weight: 20 },
      { metric: "Sales Lift from Displays", target: "> 15% vs baseline", weight: 20 },
      { metric: "Space Productivity ($/sq ft)", target: "> category benchmark", weight: 15 },
      { metric: "Program Execution Timeliness", target: "> 95% on-time", weight: 15 },
      { metric: "Conversion Rate Impact", target: "Measurable improvement", weight: 10 },
      { metric: "Basket Size Impact", target: "> 3% increase in featured categories", weight: 10 },
      { metric: "Fixture Budget Adherence", target: "Within 5%", weight: 10 }
    ],
    useCases: [
      "AI-optimized planogram development using sales and space analytics",
      "Automated store compliance monitoring via image recognition",
      "Seasonal display program management and performance tracking",
      "Space-to-sales optimization across store formats",
      "Competitive visual merchandising intelligence and trend analysis"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 70, empathy: 45, directness: 70,
      creativity: 80, humor: 25, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["CCPA", "GDPR", "ADA Accessibility", "FTC Advertising Standards", "State Consumer Protection", "OSHA (store safety)"],
      dataClassification: "Confidential — Retail Sales & Strategy Data",
      auditRequirements: "Planogram versions documented; compliance audits recorded; display performance tracked",
      retentionPolicy: "Planograms: 3 years; compliance records: 3 years; performance data: 5 years",
      breachNotification: "VP Merchandising notification for strategic merchandising data exposure"
    },
    skillsTags: ["visual merchandising", "planogram development", "retail analytics", "space planning", "display design", "store execution", "fixture management", "brand presentation", "retail operations"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "E-Commerce Operations Manager AI",
    department: "Digital Commerce",
    category: "Retail & Consumer Goods",
    industry: "Retail",
    reportsTo: "VP of Digital",
    seniorityLevel: "senior",
    description: "Manages day-to-day e-commerce operations including product catalog management, order fulfillment coordination, marketplace optimization, and digital storefront performance. Ensures seamless online shopping experiences while maximizing conversion rates, operational efficiency, and customer satisfaction across digital channels.",
    coreResponsibilities: [
      "Manage online product catalog including listings, content, and pricing",
      "Monitor and optimize website performance, conversion, and checkout flow",
      "Coordinate order fulfillment across warehouses and shipping partners",
      "Manage marketplace operations (Amazon, Walmart, Target, etc.)",
      "Optimize search, navigation, and product discovery on digital platforms",
      "Monitor and resolve customer service issues related to online orders",
      "Manage digital promotions, flash sales, and promotional mechanics",
      "Track and analyze e-commerce KPIs and competitive positioning",
      "Coordinate with IT on platform stability, features, and integrations",
      "Support omnichannel initiatives including BOPIS and curbside pickup"
    ],
    tasks: [
      { name: "Site Health Monitoring", cadence: "daily", description: "Monitor website uptime, page load speeds, error rates, and checkout conversion funnel", priority: "critical" },
      { name: "Order Fulfillment Tracking", cadence: "daily", description: "Monitor order processing, shipping status, and delivery exceptions; resolve fulfillment issues", priority: "high" },
      { name: "Product Listing Management", cadence: "daily", description: "Update product listings, pricing, availability, and content across owned and marketplace channels", priority: "high" },
      { name: "Customer Issue Resolution", cadence: "daily", description: "Review and resolve escalated e-commerce customer issues including returns and refunds", priority: "high" },
      { name: "Marketplace Performance Review", cadence: "weekly", description: "Analyze marketplace sales, Buy Box performance, and competitive positioning", priority: "high" },
      { name: "Conversion Optimization", cadence: "weekly", description: "Analyze conversion funnel, identify drop-off points, recommend and test improvements", priority: "high" },
      { name: "E-Commerce Dashboard", cadence: "monthly", description: "Compile comprehensive e-commerce KPIs: GMV, conversion, AOV, return rate, customer acquisition cost", priority: "high" },
      { name: "Channel Strategy Review", cadence: "monthly", description: "Assess channel mix performance, marketplace fees, and direct-to-consumer economics", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Shopify Plus", "Magento (Adobe Commerce)", "Salesforce Commerce Cloud",
      "Amazon Seller Central", "Google Merchant Center", "Feedonomics",
      "ShipStation", "Narvar", "Google Analytics 4", "Slack"
    ],
    dataAccessPermissions: {
      productCatalog: "Full Access",
      orderData: "Full Access",
      customerData: "Authorized — order related",
      pricingData: "Full Access",
      inventoryData: "Full Access",
      marketplaceData: "Full Access",
      analyticsData: "Full Access",
      financialReports: "Authorized — e-commerce P&L"
    },
    communicationCapabilities: [
      "Warehouse and fulfillment team coordination",
      "Marketplace partner communication and account management",
      "Customer service team coordination for e-commerce issues",
      "IT coordination for platform issues and feature requests",
      "Marketing collaboration on digital promotions and campaigns",
      "Management reporting on e-commerce performance"
    ],
    exampleWorkflows: [
      {
        name: "Product Launch on Digital Channels",
        steps: [
          "Receive product information, images, and launch plan from merchandising",
          "Create product listings with optimized titles, descriptions, and keywords",
          "Upload product imagery and A+ content to all channels",
          "Configure pricing, promotions, and inventory allocation",
          "Set up marketplace listings with category-specific optimizations",
          "Coordinate with marketing on launch promotions and advertising",
          "Monitor launch performance across channels",
          "Optimize listings based on initial performance data"
        ]
      },
      {
        name: "Peak Season Operations Management",
        steps: [
          "Develop peak season operational plan with capacity projections",
          "Stress test website and checkout systems for traffic surge",
          "Coordinate with fulfillment on expanded capacity and staffing",
          "Set up promotional mechanics and flash sale configurations",
          "Monitor real-time site performance and order processing during peak",
          "Manage customer service surge with escalation protocols",
          "Track daily performance against peak season targets",
          "Conduct post-season analysis and document lessons learned"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Conversion Rate", target: "> 3.5%", weight: 20 },
      { metric: "Site Uptime", target: "> 99.9%", weight: 15 },
      { metric: "Order Accuracy", target: "> 99.5%", weight: 15 },
      { metric: "Average Order Value", target: "> target by category", weight: 10 },
      { metric: "Shipping SLA Compliance", target: "> 95% on-time", weight: 15 },
      { metric: "Customer Satisfaction (Online)", target: "> 4.3/5.0", weight: 10 },
      { metric: "Return Rate", target: "< 8%", weight: 10 },
      { metric: "Digital Revenue Growth", target: "> 15% YoY", weight: 5 }
    ],
    useCases: [
      "Automated product listing optimization with AI-driven content and SEO",
      "Real-time order fulfillment monitoring with exception management",
      "Conversion rate optimization using behavioral analytics and A/B testing",
      "Marketplace management with automated pricing and inventory sync",
      "Peak season demand planning and operational readiness"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 60, empathy: 50, directness: 80,
      creativity: 55, humor: 20, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "PCI-DSS", "ADA (Web Accessibility)", "FTC E-Commerce Regulations", "CAN-SPAM", "COPPA", "Marketplace Seller Policies"],
      dataClassification: "PII + PCI — Customer Personal & Payment Data",
      auditRequirements: "Order transactions logged; payment processing per PCI-DSS; customer consent tracked per GDPR/CCPA",
      retentionPolicy: "Order data: 7 years; customer data per consent/GDPR; payment data per PCI-DSS; analytics: 3 years",
      breachNotification: "PCI-DSS notification for payment breach; GDPR/CCPA for customer data exposure"
    },
    skillsTags: ["e-commerce operations", "marketplace management", "conversion optimization", "order fulfillment", "digital merchandising", "product catalog", "analytics", "omnichannel retail", "SEO"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Demand Planning Analyst AI",
    department: "Planning & Analytics",
    category: "Retail & Consumer Goods",
    industry: "Retail",
    reportsTo: "Director of Planning",
    seniorityLevel: "mid",
    description: "Develops and maintains demand forecasts that drive inventory, production, and supply chain decisions. Analyzes historical sales patterns, market trends, promotional impacts, and external factors to create accurate demand plans that balance product availability with inventory investment across the retail network.",
    coreResponsibilities: [
      "Develop statistical demand forecasts by SKU, category, and channel",
      "Incorporate promotional, seasonal, and event-driven demand factors",
      "Collaborate with merchandising, marketing, and sales on demand inputs",
      "Manage demand planning models and forecast accuracy improvement",
      "Analyze forecast error and bias to refine forecasting methodology",
      "Support S&OP process with demand-side planning and analysis",
      "Incorporate external data (weather, economic, competitive) into forecasts",
      "Manage new product demand estimation and lifecycle forecasting",
      "Coordinate demand signals across omnichannel (stores, online, wholesale)",
      "Generate demand planning reports and communicate to stakeholders"
    ],
    tasks: [
      { name: "Forecast Generation & Review", cadence: "daily", description: "Generate and review statistical forecasts, apply overrides for known demand drivers", priority: "high" },
      { name: "Demand Signal Monitoring", cadence: "daily", description: "Monitor real-time POS data, online trends, and market signals against forecast", priority: "high" },
      { name: "Promotional Impact Analysis", cadence: "daily", description: "Assess demand impact of active and upcoming promotions, update forecasts accordingly", priority: "medium" },
      { name: "Forecast Accuracy Tracking", cadence: "weekly", description: "Calculate forecast accuracy metrics (MAPE, bias, WMAPE) by category and channel", priority: "high" },
      { name: "Demand Collaboration Session", cadence: "weekly", description: "Conduct demand review meetings with merchandising, marketing, and sales teams", priority: "high" },
      { name: "New Product Forecast", cadence: "weekly", description: "Develop demand estimates for new product launches using analogous products and market data", priority: "medium" },
      { name: "S&OP Demand Review", cadence: "monthly", description: "Prepare consensus demand plan for S&OP, reconcile bottom-up and top-down forecasts", priority: "high" },
      { name: "Forecast Model Optimization", cadence: "monthly", description: "Evaluate forecast model performance, test alternative algorithms, and optimize parameters", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "SAP APO/IBP", "Oracle Demantra", "Blue Yonder Demand Planning",
      "Relex Solutions", "Anaplan", "SAS Forecast Studio",
      "Google Trends", "Nielsen Data", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      salesHistory: "Full Access",
      forecastData: "Full Access",
      promotionalCalendar: "Full Access",
      marketData: "Full Access",
      inventoryLevels: "Authorized",
      pricingData: "Authorized",
      supplierData: "Restricted — lead times only",
      financialPlans: "Authorized — revenue targets"
    },
    communicationCapabilities: [
      "Merchandising collaboration on demand inputs and category plans",
      "Marketing coordination on promotional demand impact",
      "Supply chain team communication for inventory and replenishment",
      "S&OP facilitation and demand plan presentation",
      "Management reporting on forecast performance and demand trends",
      "Automated forecast variance and demand alert notifications"
    ],
    exampleWorkflows: [
      {
        name: "Monthly Demand Planning Cycle",
        steps: [
          "Generate statistical baseline forecast using historical data",
          "Incorporate planned promotions, events, and price changes",
          "Adjust for seasonal factors and external market indicators",
          "Conduct collaborative review with merchandising and marketing",
          "Apply consensus overrides based on business intelligence",
          "Reconcile bottom-up forecast with top-down financial targets",
          "Publish final demand plan to inventory and supply chain teams",
          "Track forecast accuracy and document improvement actions"
        ]
      },
      {
        name: "New Product Demand Estimation",
        steps: [
          "Identify analogous products for demand benchmarking",
          "Analyze market research and competitive landscape data",
          "Estimate initial demand curve and ramp-up trajectory",
          "Factor in planned marketing support and distribution breadth",
          "Build conservative, moderate, and aggressive scenarios",
          "Coordinate with supply chain on initial order quantities",
          "Monitor actual demand against forecast post-launch",
          "Refine forecast model as actual data accumulates"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Forecast Accuracy (WMAPE)", target: "< 20%", weight: 25 },
      { metric: "Forecast Bias", target: "Within ±5%", weight: 15 },
      { metric: "New Product Forecast Accuracy", target: "Within 30% at launch", weight: 15 },
      { metric: "Promotional Lift Accuracy", target: "Within 15%", weight: 15 },
      { metric: "S&OP Demand Plan Adherence", target: "> 90%", weight: 10 },
      { metric: "Forecast Value Added", target: "Positive vs naive model", weight: 10 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "ML-powered demand forecasting with external signal integration",
      "Promotional demand impact modeling and scenario planning",
      "New product demand estimation using analogous product analysis",
      "Demand sensing with real-time POS and market data",
      "S&OP demand planning facilitation and consensus forecasting"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 40, directness: 80,
      creativity: 50, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["SOX", "GAAP", "GDPR", "CCPA", "Antitrust (demand data sharing)", "Trade Secret Protection"],
      dataClassification: "Confidential — Sales & Demand Strategy Data",
      auditRequirements: "Forecast models documented; data sources traceable; S&OP decisions recorded",
      retentionPolicy: "Forecast data: 5 years; model documentation: indefinite; S&OP records: 5 years",
      breachNotification: "Planning director notification for demand or sales data exposure"
    },
    skillsTags: ["demand planning", "forecasting", "statistical modeling", "S&OP", "retail analytics", "promotional analysis", "supply chain planning", "data science", "merchandise planning"],
    priceMonthly: 1099,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  ENERGY & UTILITIES (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Grid Operations Analyst AI",
    department: "Grid Operations",
    category: "Energy & Utilities",
    industry: "Energy",
    reportsTo: "Director of Grid Operations",
    seniorityLevel: "senior",
    description: "Monitors and analyzes electrical grid operations including load balancing, power flow, reliability metrics, and outage management. Supports real-time grid operations decisions, coordinates with system operators, and ensures grid stability while managing the integration of distributed energy resources and renewable generation.",
    coreResponsibilities: [
      "Monitor real-time grid conditions including load, frequency, and voltage",
      "Analyze power flow and identify potential reliability concerns",
      "Support outage management with root cause analysis and restoration tracking",
      "Forecast load demand for short-term and medium-term operations planning",
      "Track grid reliability metrics (SAIDI, SAIFI, CAIDI, MAIFI)",
      "Coordinate distributed energy resource (DER) integration analysis",
      "Support emergency operations and storm restoration coordination",
      "Analyze grid performance data for capacity planning",
      "Monitor regulatory compliance with NERC reliability standards",
      "Generate grid operations reports for management and regulators"
    ],
    tasks: [
      { name: "Grid Status Monitoring", cadence: "daily", description: "Monitor real-time grid topology, load levels, equipment status, and alarm conditions", priority: "critical" },
      { name: "Load Forecast Review", cadence: "daily", description: "Review day-ahead and hour-ahead load forecasts, flag potential capacity constraints", priority: "high" },
      { name: "Outage Analysis", cadence: "daily", description: "Track active outages, analyze cause codes, and monitor restoration progress", priority: "high" },
      { name: "DER Integration Monitoring", cadence: "daily", description: "Monitor distributed generation output, battery storage dispatch, and net load impact", priority: "medium" },
      { name: "Reliability Metrics Tracking", cadence: "weekly", description: "Calculate and trend SAIDI, SAIFI, CAIDI, and MAIFI across service territory", priority: "high" },
      { name: "Capacity Analysis", cadence: "weekly", description: "Analyze feeder and substation loading, identify capacity constraints and upgrade needs", priority: "medium" },
      { name: "NERC Compliance Report", cadence: "monthly", description: "Prepare NERC reliability standard compliance documentation and performance metrics", priority: "high" },
      { name: "Grid Performance Dashboard", cadence: "monthly", description: "Compile comprehensive grid operations report with reliability, capacity, and efficiency metrics", priority: "high" }
    ],
    toolsAndIntegrations: [
      "OSIsoft PI (AVEVA)", "GE Grid Solutions", "Schneider Electric ADMS",
      "Oracle Utilities OATI", "ABB Ability SCADA", "ESRI ArcGIS Utility",
      "PowerWorld Simulator", "ETAP", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      gridOperationsData: "Full Access",
      scadaData: "Full Access",
      outageRecords: "Full Access",
      loadForecast: "Full Access",
      assetData: "Full Access",
      customerOutageData: "Authorized — aggregate",
      financialData: "Restricted — operations budget",
      regulatoryFilings: "Authorized"
    },
    communicationCapabilities: [
      "System operators coordination for real-time grid operations",
      "Storm and emergency operations communication",
      "Regulatory body reporting and NERC compliance communication",
      "Field crew coordination for outage restoration",
      "Management reporting on grid performance and reliability",
      "Cross-utility coordination for interconnection operations"
    ],
    exampleWorkflows: [
      {
        name: "Major Storm Response",
        steps: [
          "Monitor weather forecasts and activate storm preparation protocols",
          "Pre-position crews and materials in projected impact areas",
          "Track real-time outage progression as storm impacts service territory",
          "Prioritize restoration based on critical facilities and customer count",
          "Coordinate mutual aid crews and contractor resources",
          "Provide regular restoration updates to management and customers",
          "Track restoration milestones and adjust resource deployment",
          "Conduct post-storm analysis and document lessons learned"
        ]
      },
      {
        name: "Grid Reliability Improvement Analysis",
        steps: [
          "Pull reliability data by circuit, feeder, and equipment type",
          "Identify worst-performing circuits using Pareto analysis",
          "Analyze failure modes and contributing factors",
          "Model improvement options (reclosers, sectionalizers, underground conversion)",
          "Calculate cost-benefit for each improvement alternative",
          "Prioritize investments based on reliability impact per dollar",
          "Prepare capital project justification for budget approval",
          "Track post-improvement reliability metrics"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "SAIDI (Outage Duration)", target: "< regulatory target", weight: 20 },
      { metric: "SAIFI (Outage Frequency)", target: "< regulatory target", weight: 20 },
      { metric: "Load Forecast Accuracy", target: "Within 3%", weight: 15 },
      { metric: "Restoration Time (Major Events)", target: "< 24 hours for 90% of customers", weight: 15 },
      { metric: "NERC Compliance", target: "100%", weight: 15 },
      { metric: "DER Integration Success", target: "Zero reliability impacts", weight: 10 },
      { metric: "Grid Loss Reduction", target: "< 6% technical losses", weight: 5 }
    ],
    useCases: [
      "Real-time grid monitoring with AI-powered anomaly detection",
      "Predictive outage management using weather and equipment data",
      "Load forecasting with ML for operations and capacity planning",
      "DER integration analysis and hosting capacity assessment",
      "Grid reliability improvement prioritization and investment optimization"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 40, directness: 85,
      creativity: 40, humor: 10, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["NERC Reliability Standards", "FERC Regulations", "State PUC Requirements", "IEEE Standards", "OSHA", "EPA", "CIP (Critical Infrastructure Protection)"],
      dataClassification: "Critical Infrastructure — Grid Operations Data",
      auditRequirements: "NERC compliance evidence maintained; operations logs archived; reliability data auditable",
      retentionPolicy: "Operations data: 7 years; NERC compliance: 5 years after standard retirement; outage records: 10 years",
      breachNotification: "NERC CIP notification for cyber incidents; management notification for operational data exposure"
    },
    skillsTags: ["grid operations", "power systems", "reliability engineering", "SCADA", "load forecasting", "outage management", "NERC compliance", "DER integration", "utility analytics"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Energy Trading Specialist AI",
    department: "Energy Markets",
    category: "Energy & Utilities",
    industry: "Energy",
    reportsTo: "VP of Energy Markets",
    seniorityLevel: "senior",
    description: "Manages energy trading and portfolio optimization across wholesale electricity and natural gas markets. Analyzes market fundamentals, executes trading strategies, manages risk positions, and optimizes the energy portfolio to maximize value while maintaining compliance with FERC and market rules.",
    coreResponsibilities: [
      "Monitor wholesale energy market conditions and price movements",
      "Execute energy trading strategies across day-ahead and real-time markets",
      "Manage energy portfolio positions and optimize supply-demand balance",
      "Analyze market fundamentals including fuel prices, weather, and demand",
      "Develop and maintain energy price forecasting models",
      "Monitor and manage trading risk within approved limits",
      "Coordinate with generation and load scheduling teams",
      "Track and report mark-to-market portfolio valuations",
      "Ensure compliance with FERC, ISO/RTO rules, and trading policies",
      "Generate trading performance reports and market analysis"
    ],
    tasks: [
      { name: "Market Monitoring", cadence: "daily", description: "Monitor real-time and day-ahead energy prices, gas prices, weather, and market news", priority: "critical" },
      { name: "Trading Position Management", cadence: "daily", description: "Review open positions, calculate exposure, and execute trades to optimize portfolio", priority: "critical" },
      { name: "Day-Ahead Market Bidding", cadence: "daily", description: "Prepare and submit day-ahead market bids and offers based on portfolio strategy", priority: "critical" },
      { name: "Risk Position Monitoring", cadence: "daily", description: "Calculate VaR, monitor risk limits, and flag any limit violations or near-breaches", priority: "high" },
      { name: "Market Fundamental Analysis", cadence: "weekly", description: "Analyze energy market fundamentals: supply/demand balance, fuel pricing, regulatory changes", priority: "high" },
      { name: "Hedging Strategy Review", cadence: "weekly", description: "Review hedge ratios, forward curve analysis, and recommend hedging adjustments", priority: "high" },
      { name: "P&L Attribution Report", cadence: "monthly", description: "Prepare detailed P&L attribution analysis by strategy, market, and time period", priority: "high" },
      { name: "Regulatory Compliance Report", cadence: "monthly", description: "Compile FERC reporting requirements, trading activity documentation, and compliance metrics", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Allegro Energy Trading", "OpenLink Endur", "Triple Point CXL",
      "ICE (Intercontinental Exchange)", "CME Globex", "Bloomberg Terminal",
      "OATI webTrader", "Ventyx (ABB)", "Python/R Analytics", "Slack"
    ],
    dataAccessPermissions: {
      marketPrices: "Full Access",
      tradingPositions: "Full Access",
      portfolioData: "Full Access",
      riskMetrics: "Full Access",
      generationSchedules: "Authorized",
      loadForecasts: "Full Access",
      financialData: "Authorized — trading P&L",
      contractData: "Full Access — energy contracts"
    },
    communicationCapabilities: [
      "Trading desk coordination for real-time market execution",
      "Generation and load scheduling team coordination",
      "Risk management reporting and limit communication",
      "Counterparty communication for bilateral transactions",
      "Management reporting on trading performance and market outlook",
      "Regulatory communication for FERC and ISO/RTO reporting"
    ],
    exampleWorkflows: [
      {
        name: "Day-Ahead Market Strategy",
        steps: [
          "Review overnight market developments and fundamental changes",
          "Analyze weather forecast and expected load shape",
          "Assess generation availability and fuel cost positions",
          "Develop day-ahead bidding strategy by hour and location",
          "Submit day-ahead bids/offers to ISO/RTO market",
          "Evaluate day-ahead market results and awards",
          "Adjust real-time strategy based on day-ahead outcomes",
          "Document trading decisions and rationale"
        ]
      },
      {
        name: "Forward Hedging Program",
        steps: [
          "Analyze forward load obligation and generation position",
          "Assess forward price curves and market expectations",
          "Calculate open position exposure by delivery period",
          "Evaluate hedging instruments (forwards, options, swaps)",
          "Recommend hedge execution plan within risk limits",
          "Execute approved hedging transactions",
          "Monitor hedge effectiveness and mark-to-market",
          "Report hedging program performance and remaining exposure"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Trading P&L vs Target", target: "Within 10% of plan", weight: 25 },
      { metric: "Risk Limit Compliance", target: "Zero violations", weight: 20 },
      { metric: "Forecast Price Accuracy", target: "Within 5% for day-ahead", weight: 10 },
      { metric: "Hedge Effectiveness", target: "> 80%", weight: 15 },
      { metric: "Regulatory Compliance", target: "100%", weight: 15 },
      { metric: "Portfolio Optimization Value", target: "> baseline strategy", weight: 10 },
      { metric: "Bid/Offer Execution Quality", target: "> 95% fill rate at target price", weight: 5 }
    ],
    useCases: [
      "AI-powered energy price forecasting with market fundamental integration",
      "Automated day-ahead bidding strategy optimization",
      "Real-time portfolio risk monitoring and position management",
      "Forward curve analysis and hedging strategy optimization",
      "Market intelligence and competitive analysis automation"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 50, empathy: 30, directness: 90,
      creativity: 40, humor: 10, assertiveness: 80
    },
    complianceMetadata: {
      frameworks: ["FERC Market Rules", "Dodd-Frank (Energy Derivatives)", "ISO/RTO Market Protocols", "CFTC Regulations", "SOX", "NERC Standards", "Anti-Market Manipulation Rules"],
      dataClassification: "Confidential — Trading & Market Sensitive Data",
      auditRequirements: "All trades documented with timestamp and rationale; position limits monitored continuously; FERC EQR filed quarterly",
      retentionPolicy: "Trading records: 5 years per FERC; market data: 5 years; risk reports: 7 years",
      breachNotification: "Immediate VP notification for trading limit breach; FERC notification for market manipulation concerns"
    },
    skillsTags: ["energy trading", "market analysis", "risk management", "portfolio optimization", "price forecasting", "hedging", "FERC compliance", "power markets", "commodity trading"],
    priceMonthly: 1499,
    isActive: 1,
  },

  {
    title: "Renewable Energy Project Coordinator AI",
    department: "Renewable Energy Development",
    category: "Energy & Utilities",
    industry: "Energy",
    reportsTo: "Director of Renewable Energy",
    seniorityLevel: "mid",
    description: "Coordinates renewable energy project development and execution including solar, wind, and battery storage projects. Manages project timelines, permitting processes, interconnection studies, contractor coordination, and construction oversight to deliver clean energy projects on time and within budget.",
    coreResponsibilities: [
      "Coordinate renewable energy project development from site selection to COD",
      "Manage permitting and regulatory approval processes across jurisdictions",
      "Track project timelines, budgets, and milestone deliverables",
      "Coordinate interconnection studies and utility approval processes",
      "Manage EPC contractor relationships and construction oversight",
      "Support power purchase agreement (PPA) and offtake negotiation processes",
      "Track renewable energy incentives, credits, and regulatory requirements",
      "Coordinate environmental impact studies and compliance",
      "Manage project documentation and stakeholder communication",
      "Support portfolio-level reporting on development pipeline progress"
    ],
    tasks: [
      { name: "Project Status Tracking", cadence: "daily", description: "Update project tracking systems with milestone progress, issues, and schedule changes", priority: "high" },
      { name: "Permit & Regulatory Tracking", cadence: "daily", description: "Monitor permit applications, agency communications, and approval timelines", priority: "high" },
      { name: "Contractor Coordination", cadence: "daily", description: "Coordinate with EPC contractors, subcontractors, and equipment suppliers on deliverables", priority: "high" },
      { name: "Interconnection Process Management", cadence: "daily", description: "Track interconnection study status, utility requirements, and grid connection timelines", priority: "medium" },
      { name: "Budget & Schedule Review", cadence: "weekly", description: "Review project budgets, cost tracking, and schedule compliance across active projects", priority: "high" },
      { name: "Stakeholder Communication", cadence: "weekly", description: "Prepare stakeholder updates on project status, issues, and upcoming milestones", priority: "medium" },
      { name: "Development Pipeline Report", cadence: "monthly", description: "Compile development pipeline status across all projects with risk assessments", priority: "high" },
      { name: "Incentive & Credit Tracking", cadence: "monthly", description: "Track ITC/PTC eligibility, REC generation, and regulatory incentive compliance", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Procore", "Microsoft Project", "Primavera P6",
      "PVsyst (Solar)", "WindPRO", "HOMER Energy",
      "ArcGIS", "Salesforce", "DocuSign", "Slack"
    ],
    dataAccessPermissions: {
      projectData: "Full Access",
      financialData: "Authorized — project budgets",
      landRecords: "Full Access",
      permitDocuments: "Full Access",
      contractorRecords: "Full Access",
      regulatoryFilings: "Full Access",
      environmentalStudies: "Full Access",
      ppaDocuments: "Authorized"
    },
    communicationCapabilities: [
      "Utility and ISO/RTO coordination for interconnection",
      "Permitting agency communication and hearing coordination",
      "EPC contractor and vendor management communication",
      "Community engagement and landowner communication",
      "Management reporting on development pipeline progress",
      "Investor and financing party project status updates"
    ],
    exampleWorkflows: [
      {
        name: "Solar Project Development Lifecycle",
        steps: [
          "Evaluate site suitability: solar resource, land, grid access, zoning",
          "Secure land rights through lease or purchase agreements",
          "Submit interconnection application to utility/ISO",
          "Initiate environmental studies and permitting applications",
          "Negotiate PPA or offtake agreement with buyer",
          "Select EPC contractor through competitive bidding",
          "Manage construction phase with milestone tracking",
          "Commission system and achieve commercial operation date (COD)"
        ]
      },
      {
        name: "Interconnection Process Management",
        steps: [
          "Prepare and submit interconnection application with project specifications",
          "Track queue position and study timeline with utility/ISO",
          "Review feasibility study results and cost estimates",
          "Evaluate system impact study findings and required upgrades",
          "Negotiate interconnection agreement terms",
          "Coordinate construction of interconnection facilities",
          "Complete testing and commissioning requirements",
          "Achieve permission to operate (PTO)"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Project On-Time Delivery", target: "> 90% milestones on schedule", weight: 20 },
      { metric: "Budget Adherence", target: "Within 5% of approved budget", weight: 20 },
      { metric: "Permit Approval Rate", target: "> 95%", weight: 15 },
      { metric: "Interconnection Timeline", target: "Within planned schedule", weight: 10 },
      { metric: "Pipeline Development Velocity", target: "Per annual target MW", weight: 15 },
      { metric: "Safety Record", target: "Zero lost-time incidents", weight: 10 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "Automated project milestone tracking and schedule management",
      "Permit and regulatory approval workflow management",
      "Interconnection queue tracking and process coordination",
      "Renewable energy site evaluation with resource assessment",
      "Development pipeline analytics and portfolio management"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 65, empathy: 50, directness: 75,
      creativity: 45, humor: 20, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["NEPA", "State Environmental Regulations", "FERC", "State PUC Requirements", "IRS ITC/PTC Requirements", "OSHA", "FAA (wind)", "Endangered Species Act"],
      dataClassification: "Confidential — Project Development & Land Data",
      auditRequirements: "Project documentation maintained per regulatory and financing requirements; environmental compliance documented",
      retentionPolicy: "Project records: asset life + 5 years; environmental studies: permanent; permits: asset life + 3 years",
      breachNotification: "Director notification for project proprietary data or PPA terms exposure"
    },
    skillsTags: ["renewable energy", "project management", "solar development", "wind energy", "permitting", "interconnection", "construction management", "PPA negotiation", "environmental compliance"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Utility Customer Service Manager AI",
    department: "Customer Operations",
    category: "Energy & Utilities",
    industry: "Energy",
    reportsTo: "VP of Customer Operations",
    seniorityLevel: "senior",
    description: "Manages utility customer service operations including billing inquiries, service requests, outage communication, and rate program enrollment. Ensures high customer satisfaction while managing regulatory service quality requirements, complaint resolution, and customer communication across all channels.",
    coreResponsibilities: [
      "Manage customer service operations across phone, web, chat, and in-person",
      "Oversee billing inquiry resolution and payment arrangement programs",
      "Coordinate outage communication and restoration status updates",
      "Manage new service connections, disconnections, and transfers",
      "Administer energy efficiency and rate program enrollment",
      "Track and resolve PUC complaints within regulatory timeframes",
      "Analyze customer satisfaction metrics and service quality KPIs",
      "Support low-income assistance and hardship program administration",
      "Manage customer communication during rate changes and system transitions",
      "Report customer service performance to regulators and management"
    ],
    tasks: [
      { name: "Service Queue Management", cadence: "daily", description: "Monitor customer service queues, call volumes, wait times, and staffing levels", priority: "high" },
      { name: "Billing Issue Resolution", cadence: "daily", description: "Process escalated billing inquiries, high-bill complaints, and meter reading disputes", priority: "high" },
      { name: "Outage Communication", cadence: "daily", description: "Coordinate customer outage notifications, ETR updates, and restoration confirmations", priority: "critical" },
      { name: "Complaint Tracking", cadence: "daily", description: "Track PUC complaints, informal complaints, and escalations; ensure timely response", priority: "high" },
      { name: "Payment Program Administration", cadence: "weekly", description: "Process payment arrangement requests, hardship applications, and LIHEAP coordination", priority: "medium" },
      { name: "Service Quality Metrics", cadence: "weekly", description: "Track regulatory service quality metrics: abandonment rate, answer speed, complaint rate", priority: "high" },
      { name: "Customer Satisfaction Report", cadence: "monthly", description: "Compile JD Power, survey, and operational customer satisfaction metrics", priority: "high" },
      { name: "Regulatory Compliance Report", cadence: "monthly", description: "Prepare PUC service quality reports and complaint resolution documentation", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Oracle Utilities CIS", "SAP IS-U", "Salesforce Utilities Cloud",
      "Genesys Contact Center", "Kubra (billing/payment)", "VertexOne",
      "IVR/Chatbot Platforms", "Outage Management System", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      customerAccounts: "Full Access",
      billingData: "Full Access",
      meterData: "Full Access",
      outageData: "Full Access",
      paymentData: "Full Access",
      complaintRecords: "Full Access",
      programEnrollment: "Full Access",
      financialData: "Restricted — collections and revenue"
    },
    communicationCapabilities: [
      "Customer communication across all service channels",
      "PUC and regulatory body complaint response correspondence",
      "Outage notification and restoration update distribution",
      "Low-income agency coordination for assistance programs",
      "Management reporting on service performance",
      "Mass customer communication for rate changes and programs"
    ],
    exampleWorkflows: [
      {
        name: "High-Bill Complaint Investigation",
        steps: [
          "Receive high-bill complaint from customer",
          "Pull usage history and compare against historical patterns",
          "Check meter reading accuracy and estimate methodology",
          "Analyze weather data correlation with usage changes",
          "Review rate schedule and applicable charges",
          "Determine if meter test or field investigation is needed",
          "Communicate findings and resolution to customer",
          "Offer energy efficiency programs or budget billing if applicable"
        ]
      },
      {
        name: "Major Outage Customer Communication",
        steps: [
          "Receive outage event notification from operations",
          "Activate outage communication protocols based on severity",
          "Send initial outage notifications to affected customers",
          "Provide estimated time of restoration (ETR) when available",
          "Update IVR, website, and mobile app with restoration progress",
          "Staff up call center based on projected call volume",
          "Send restoration confirmations as power is restored",
          "Follow up with customers experiencing extended outages"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Customer Satisfaction (JD Power)", target: "> industry average", weight: 20 },
      { metric: "First Call Resolution", target: "> 80%", weight: 15 },
      { metric: "Average Speed of Answer", target: "< 60 seconds", weight: 15 },
      { metric: "Abandonment Rate", target: "< 5%", weight: 10 },
      { metric: "PUC Complaint Resolution", target: "100% within regulatory deadline", weight: 15 },
      { metric: "Billing Accuracy", target: "> 99.5%", weight: 15 },
      { metric: "Outage Communication Timeliness", target: "< 30 minutes from event", weight: 10 }
    ],
    useCases: [
      "AI-powered customer service with intelligent routing and self-service",
      "Automated outage communication with personalized restoration updates",
      "Billing analytics with proactive high-bill explanation outreach",
      "Customer segmentation for targeted program enrollment campaigns",
      "Regulatory service quality monitoring and compliance reporting"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 55, empathy: 80, directness: 65,
      creativity: 35, humor: 20, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["State PUC Service Quality Standards", "CCPA", "GDPR", "TCPA", "PCI-DSS", "Low-Income Home Energy Assistance Act", "State Consumer Protection"],
      dataClassification: "PII — Customer Account & Usage Data",
      auditRequirements: "Customer interactions documented; complaint resolution tracked; PUC reporting requirements met",
      retentionPolicy: "Customer records: account life + 7 years; complaint records: 5 years; billing data: 7 years",
      breachNotification: "PUC notification per state requirements; CCPA/GDPR notification for customer data exposure"
    },
    skillsTags: ["utility customer service", "billing management", "outage communication", "regulatory compliance", "customer satisfaction", "contact center", "energy programs", "complaint resolution", "CIS systems"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Environmental Compliance Specialist AI",
    department: "Environmental Affairs",
    category: "Energy & Utilities",
    industry: "Energy",
    reportsTo: "VP of Environmental Affairs",
    seniorityLevel: "mid",
    description: "Manages environmental compliance programs for energy and utility operations including air emissions, water discharge, waste management, and environmental permitting. Monitors regulatory requirements, prepares environmental reports and permit applications, and ensures organizational adherence to EPA, state, and local environmental regulations.",
    coreResponsibilities: [
      "Monitor environmental regulatory changes across federal, state, and local levels",
      "Manage air emissions monitoring, reporting, and Title V permit compliance",
      "Oversee water discharge permits (NPDES) and compliance monitoring",
      "Coordinate hazardous and non-hazardous waste management programs",
      "Prepare and submit environmental regulatory reports and permit applications",
      "Conduct environmental compliance audits and inspections",
      "Manage environmental impact assessments for new projects",
      "Track greenhouse gas emissions and sustainability reporting metrics",
      "Coordinate remediation activities for contaminated sites",
      "Report environmental performance metrics to management and regulators"
    ],
    tasks: [
      { name: "Emissions Monitoring", cadence: "daily", description: "Review continuous emissions monitoring (CEMS) data, flag exceedances, and verify data quality", priority: "high" },
      { name: "Permit Compliance Tracking", cadence: "daily", description: "Monitor compliance with environmental permit conditions, track reporting deadlines", priority: "high" },
      { name: "Environmental Incident Review", cadence: "daily", description: "Review environmental incident reports, spill notifications, and compliance deviations", priority: "critical" },
      { name: "Waste Management Oversight", cadence: "daily", description: "Track waste generation, storage, and disposal compliance with RCRA requirements", priority: "medium" },
      { name: "Regulatory Report Preparation", cadence: "weekly", description: "Prepare environmental reports for EPA, state agencies, and internal stakeholders", priority: "high" },
      { name: "Water Quality Monitoring", cadence: "weekly", description: "Review water discharge monitoring results, compare against permit limits", priority: "medium" },
      { name: "GHG Inventory Update", cadence: "monthly", description: "Update greenhouse gas emissions inventory and track against reduction targets", priority: "medium" },
      { name: "Environmental Performance Dashboard", cadence: "monthly", description: "Compile environmental KPIs: emissions, water usage, waste diversion, compliance rate", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Enablon (Wolters Kluwer)", "Intelex EHS", "ERA Environmental",
      "CEMS Systems", "Locus Environmental", "Sphera",
      "EPA ECHO Database", "ArcGIS", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      environmentalData: "Full Access",
      emissionsData: "Full Access",
      permitRecords: "Full Access",
      wasteRecords: "Full Access",
      waterQualityData: "Full Access",
      operationalData: "Authorized — environmental impact",
      financialData: "Restricted — environmental compliance costs",
      regulatoryCorrespondence: "Full Access"
    },
    communicationCapabilities: [
      "EPA and state environmental agency communication and reporting",
      "Operations team coordination for environmental compliance",
      "Management reporting on environmental performance and risk",
      "Community engagement on environmental programs and impact",
      "External consultant coordination for studies and remediation",
      "Regulatory hearing and permit proceeding participation"
    ],
    exampleWorkflows: [
      {
        name: "Environmental Permit Renewal",
        steps: [
          "Identify permit renewal requirements and timeline (12-18 months before expiration)",
          "Compile operational data and compliance history for renewal application",
          "Assess any regulatory changes affecting permit conditions",
          "Prepare permit renewal application with supporting documentation",
          "Submit application to regulatory agency within required timeframe",
          "Respond to agency information requests and technical questions",
          "Negotiate permit conditions with regulatory agency",
          "Implement any new permit conditions upon approval"
        ]
      },
      {
        name: "Environmental Spill Response",
        steps: [
          "Receive spill notification and assess scope and severity",
          "Activate spill response plan and deploy containment measures",
          "Determine reportable quantity thresholds and notification requirements",
          "Notify applicable regulatory agencies within required timeframes",
          "Coordinate cleanup activities with environmental contractors",
          "Document response actions and environmental sampling results",
          "Prepare incident investigation and root cause analysis",
          "Implement corrective actions to prevent recurrence"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Environmental Compliance Rate", target: "100% — zero violations", weight: 25 },
      { metric: "Permit Renewal Timeliness", target: "100% renewed before expiration", weight: 15 },
      { metric: "Spill/Release Reporting", target: "100% within required timeframes", weight: 15 },
      { metric: "GHG Reduction Progress", target: "On track to reduction targets", weight: 10 },
      { metric: "Waste Diversion Rate", target: "> 50%", weight: 10 },
      { metric: "Regulatory Report Accuracy", target: "> 99%", weight: 15 },
      { metric: "Audit Finding Closure", target: "> 95% within 30 days", weight: 10 }
    ],
    useCases: [
      "Automated emissions monitoring and regulatory compliance tracking",
      "Environmental permit management with renewal workflow automation",
      "GHG inventory calculation and sustainability reporting",
      "Environmental incident management and response coordination",
      "Regulatory change monitoring with impact assessment automation"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 50, directness: 80,
      creativity: 35, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["EPA Clean Air Act", "EPA Clean Water Act", "RCRA", "CERCLA/Superfund", "NEPA", "State Environmental Regulations", "GHG Reporting Rule", "TSCA"],
      dataClassification: "Confidential — Environmental Compliance Data",
      auditRequirements: "Environmental records maintained per regulatory retention; CEMS data validated per 40 CFR Part 75; audit findings tracked",
      retentionPolicy: "Environmental records: per specific regulation (typically 5-30 years); CERCLA: permanent; permits: asset life + 5 years",
      breachNotification: "Immediate VP notification for environmental violations; regulatory agency notification per applicable requirements"
    },
    skillsTags: ["environmental compliance", "air quality", "water quality", "waste management", "environmental permitting", "GHG reporting", "EPA regulations", "sustainability", "environmental impact assessment"],
    priceMonthly: 1199,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  TRANSPORTATION & LOGISTICS (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Fleet Management Coordinator AI",
    department: "Fleet Operations",
    category: "Transportation & Logistics",
    industry: "Transportation",
    reportsTo: "Director of Fleet Operations",
    seniorityLevel: "mid",
    description: "Manages vehicle fleet operations including maintenance scheduling, driver management, fuel optimization, compliance tracking, and fleet utilization analysis. Ensures fleet availability, safety compliance, and cost efficiency while supporting operational requirements across the transportation network.",
    coreResponsibilities: [
      "Monitor fleet vehicle status, location, and utilization in real-time",
      "Schedule and coordinate preventive and corrective vehicle maintenance",
      "Track driver compliance including HOS, licensing, and training",
      "Manage fuel consumption and optimize fuel purchasing strategies",
      "Administer DOT and FMCSA compliance programs",
      "Track fleet costs including maintenance, fuel, insurance, and depreciation",
      "Coordinate vehicle acquisition, disposal, and lifecycle management",
      "Monitor vehicle telematics data for safety and efficiency insights",
      "Manage fleet insurance, registration, and inspection compliance",
      "Generate fleet performance reports and cost analysis"
    ],
    tasks: [
      { name: "Fleet Status Dashboard", cadence: "daily", description: "Review fleet availability, vehicle status, out-of-service units, and maintenance needs", priority: "high" },
      { name: "Maintenance Schedule Management", cadence: "daily", description: "Track upcoming PM schedules, coordinate shop appointments, manage parts availability", priority: "high" },
      { name: "Driver HOS Monitoring", cadence: "daily", description: "Monitor driver hours-of-service compliance via ELD data, flag violations", priority: "critical" },
      { name: "Fuel Management", cadence: "daily", description: "Monitor fuel purchases, consumption rates, and MPG trends; flag anomalies", priority: "medium" },
      { name: "Compliance Tracking", cadence: "weekly", description: "Track DOT inspections, CDL expirations, medical certificates, and drug testing schedules", priority: "high" },
      { name: "Telematics Analysis", cadence: "weekly", description: "Analyze telematics data for speeding, harsh braking, idling, and route adherence", priority: "medium" },
      { name: "Fleet Cost Report", cadence: "monthly", description: "Compile fleet cost per mile, maintenance costs, fuel costs, and utilization rates", priority: "high" },
      { name: "Lifecycle Planning", cadence: "monthly", description: "Analyze vehicle age, mileage, and repair history to plan replacements and disposals", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Samsara", "Geotab", "Verizon Connect",
      "Fleetio", "RTA Fleet Management", "Dossier Fleet Maintenance",
      "WEX Fleet Cards", "Omnitracs", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      vehicleData: "Full Access",
      driverRecords: "Full Access",
      telematicsData: "Full Access",
      maintenanceRecords: "Full Access",
      fuelData: "Full Access",
      complianceRecords: "Full Access",
      costData: "Full Access",
      insuranceRecords: "Full Access"
    },
    communicationCapabilities: [
      "Driver communication for scheduling and compliance notifications",
      "Maintenance shop coordination for service scheduling",
      "DOT/FMCSA regulatory communication and audit coordination",
      "Insurance carrier communication for claims and renewals",
      "Management reporting on fleet performance and costs",
      "Vendor coordination for vehicle acquisition and disposal"
    ],
    exampleWorkflows: [
      {
        name: "Preventive Maintenance Program",
        steps: [
          "Monitor vehicle mileage and engine hours against PM schedules",
          "Generate PM work orders based on interval triggers",
          "Schedule maintenance appointments with available shop capacity",
          "Coordinate driver vehicle swap for scheduled service",
          "Track parts availability and order if needed",
          "Process completed PM documentation and update vehicle records",
          "Analyze PM compliance rates and identify schedule optimization",
          "Report PM program performance and cost trends"
        ]
      },
      {
        name: "DOT Compliance Audit Preparation",
        steps: [
          "Review current DOT compliance status across all drivers and vehicles",
          "Verify driver qualification files are complete and current",
          "Confirm vehicle inspection records and maintenance documentation",
          "Review HOS compliance history and ELD data integrity",
          "Verify drug and alcohol testing program compliance",
          "Prepare compliance documentation packages for audit",
          "Brief management on compliance status and any gaps",
          "Track and remediate any identified deficiencies"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Fleet Utilization Rate", target: "> 90%", weight: 15 },
      { metric: "PM Compliance Rate", target: "> 95%", weight: 15 },
      { metric: "DOT Compliance Rate", target: "100%", weight: 20 },
      { metric: "Cost per Mile", target: "< budget target", weight: 15 },
      { metric: "Vehicle Downtime", target: "< 5%", weight: 10 },
      { metric: "Fuel Efficiency (MPG)", target: "> fleet benchmark", weight: 10 },
      { metric: "Safety Incident Rate", target: "< industry average", weight: 15 }
    ],
    useCases: [
      "Predictive maintenance scheduling using telematics and diagnostic data",
      "Real-time fleet tracking with automated compliance monitoring",
      "Fuel optimization with route and driver behavior analytics",
      "DOT compliance automation with proactive notification workflows",
      "Fleet lifecycle cost analysis and replacement planning"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 45, directness: 80,
      creativity: 35, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["DOT/FMCSA Regulations", "ELD Mandate", "OSHA", "EPA (emissions)", "IFTA", "State DOT Requirements", "CDL Regulations", "Drug & Alcohol Testing (49 CFR Part 40)"],
      dataClassification: "Confidential — Driver PII & Fleet Operations Data",
      auditRequirements: "Driver qualification files maintained per FMCSA; vehicle inspection records per DOT; ELD data retained per mandate",
      retentionPolicy: "Driver records: employment + 3 years; vehicle records: ownership + 3 years; ELD data: 6 months minimum",
      breachNotification: "Fleet director notification for driver PII or compliance data exposure"
    },
    skillsTags: ["fleet management", "DOT compliance", "vehicle maintenance", "telematics", "fuel management", "driver safety", "HOS compliance", "fleet analytics", "asset management"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Supply Chain Visibility Analyst AI",
    department: "Supply Chain Intelligence",
    category: "Transportation & Logistics",
    industry: "Transportation",
    reportsTo: "VP of Supply Chain",
    seniorityLevel: "mid",
    description: "Provides end-to-end supply chain visibility by integrating data from carriers, warehouses, ports, and trading partners. Monitors shipment status, identifies disruptions, analyzes transit performance, and delivers actionable intelligence to improve supply chain reliability and decision-making.",
    coreResponsibilities: [
      "Monitor shipment status and transit progress across all transportation modes",
      "Identify and alert on supply chain disruptions, delays, and exceptions",
      "Analyze carrier and lane performance metrics",
      "Track global supply chain events (port congestion, weather, geopolitical)",
      "Manage control tower dashboards for supply chain visibility",
      "Coordinate with carriers and logistics providers on exception resolution",
      "Analyze transit times, dwell times, and supply chain cycle times",
      "Support demand-supply synchronization with visibility data",
      "Manage EDI and API integrations with trading partners",
      "Generate supply chain performance reports and trend analysis"
    ],
    tasks: [
      { name: "Shipment Monitoring", cadence: "daily", description: "Track all in-transit shipments, identify delays, and update ETAs across transportation modes", priority: "critical" },
      { name: "Exception Management", cadence: "daily", description: "Identify shipment exceptions (delays, damages, diversions), alert stakeholders, coordinate resolution", priority: "high" },
      { name: "Global Disruption Monitoring", cadence: "daily", description: "Monitor global supply chain events: port congestion, weather disruptions, regulatory changes", priority: "high" },
      { name: "Carrier Performance Tracking", cadence: "daily", description: "Track carrier on-time performance, transit times, and service quality metrics", priority: "medium" },
      { name: "Transit Performance Analysis", cadence: "weekly", description: "Analyze transit time trends by lane, mode, and carrier; identify optimization opportunities", priority: "high" },
      { name: "Visibility Gap Assessment", cadence: "weekly", description: "Identify visibility gaps in supply chain tracking, prioritize integration improvements", priority: "medium" },
      { name: "Supply Chain Intelligence Report", cadence: "monthly", description: "Compile comprehensive supply chain performance report with risk assessment and recommendations", priority: "high" },
      { name: "Partner Integration Review", cadence: "monthly", description: "Assess trading partner data quality, integration health, and connectivity improvements", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "FourKites", "project44", "Descartes MacroPoint",
      "SAP Integrated Business Planning", "Oracle Transportation Management",
      "Flexport", "MarineTraffic", "FlightAware", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      shipmentData: "Full Access",
      carrierData: "Full Access",
      inventoryData: "Authorized — in-transit",
      customerOrders: "Authorized — delivery status",
      supplierData: "Authorized — shipment related",
      costData: "Restricted — freight costs",
      globalRiskData: "Full Access",
      partnerIntegrations: "Full Access"
    },
    communicationCapabilities: [
      "Carrier communication for shipment status and exception resolution",
      "Customer service support for delivery visibility",
      "Procurement team alerts for supply disruptions",
      "Operations coordination for inbound shipment planning",
      "Management reporting on supply chain performance",
      "Automated exception and disruption alert notifications"
    ],
    exampleWorkflows: [
      {
        name: "Supply Chain Disruption Response",
        steps: [
          "Detect disruption event through monitoring or alert system",
          "Assess impact scope: affected shipments, customers, and timeline",
          "Identify alternative routing or sourcing options",
          "Coordinate with carriers on rerouting or expediting",
          "Communicate revised ETAs to affected customers and stakeholders",
          "Monitor disruption resolution and recovery progress",
          "Document impact and response for after-action review",
          "Update risk models and contingency plans based on experience"
        ]
      },
      {
        name: "Carrier Performance Review",
        steps: [
          "Extract carrier performance data for review period",
          "Calculate KPIs: on-time delivery, transit time, claims ratio, responsiveness",
          "Compare performance against contract SLAs and benchmarks",
          "Identify top and bottom performing carriers by lane",
          "Prepare carrier scorecard with trend analysis",
          "Recommend carrier mix adjustments or improvement actions",
          "Communicate scorecards to carrier management",
          "Track improvement plan progress"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Shipment Visibility Rate", target: "> 95% of shipments tracked", weight: 20 },
      { metric: "Exception Detection Time", target: "< 30 minutes", weight: 15 },
      { metric: "ETA Accuracy", target: "Within 4 hours for 90% of shipments", weight: 15 },
      { metric: "Carrier On-Time Performance", target: "> 92%", weight: 15 },
      { metric: "Disruption Alert Timeliness", target: "< 1 hour from event", weight: 15 },
      { metric: "Data Quality Score", target: "> 95%", weight: 10 },
      { metric: "Integration Uptime", target: "> 99.5%", weight: 10 }
    ],
    useCases: [
      "Real-time multi-modal shipment tracking with predictive ETAs",
      "AI-powered supply chain disruption detection and impact assessment",
      "Carrier performance analytics with automated scorecard generation",
      "Global supply chain risk monitoring and alert management",
      "Supply chain control tower with integrated visibility dashboards"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 40, directness: 80,
      creativity: 45, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["C-TPAT", "AEO", "GDPR", "CCPA", "Customs Regulations", "IMDG/DOT (Hazmat)", "FDA FSMA (food)", "SOX"],
      dataClassification: "Confidential — Supply Chain & Logistics Data",
      auditRequirements: "Shipment data traceable; carrier performance documented; customs compliance maintained",
      retentionPolicy: "Shipment records: 5 years; carrier data: relationship + 3 years; customs records: 5 years",
      breachNotification: "VP Supply Chain notification for shipment data or customer delivery information exposure"
    },
    skillsTags: ["supply chain visibility", "shipment tracking", "carrier management", "disruption management", "logistics analytics", "control tower", "EDI/API integration", "transportation management", "risk monitoring"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Warehouse Operations Manager AI",
    department: "Warehouse Operations",
    category: "Transportation & Logistics",
    industry: "Transportation",
    reportsTo: "VP of Distribution",
    seniorityLevel: "senior",
    description: "Manages warehouse and distribution center operations including receiving, put-away, picking, packing, shipping, and inventory management. Optimizes warehouse layout, labor productivity, and throughput while ensuring accuracy, safety, and compliance with operational standards.",
    coreResponsibilities: [
      "Manage daily warehouse operations across receiving, storage, and shipping",
      "Optimize warehouse layout, slotting, and storage utilization",
      "Monitor and improve labor productivity and throughput rates",
      "Manage inventory accuracy through cycle counting and reconciliation",
      "Coordinate inbound receiving and outbound shipping schedules",
      "Implement and maintain warehouse safety programs and OSHA compliance",
      "Manage WMS system configuration and process optimization",
      "Track and reduce order accuracy errors and damage rates",
      "Coordinate peak season staffing and capacity planning",
      "Generate warehouse performance reports and operational dashboards"
    ],
    tasks: [
      { name: "Operations Dashboard Review", cadence: "daily", description: "Review warehouse KPIs: orders processed, units shipped, labor productivity, and backlog status", priority: "high" },
      { name: "Labor Planning", cadence: "daily", description: "Plan labor allocation across warehouse functions based on volume forecasts and priorities", priority: "high" },
      { name: "Receiving & Shipping Coordination", cadence: "daily", description: "Manage dock schedules, carrier appointments, and priority shipment processing", priority: "high" },
      { name: "Inventory Accuracy Monitoring", cadence: "daily", description: "Review cycle count results, investigate variances, and manage inventory adjustments", priority: "medium" },
      { name: "Safety Inspection", cadence: "weekly", description: "Conduct warehouse safety walks, review incident reports, and track corrective actions", priority: "high" },
      { name: "Slotting Optimization", cadence: "weekly", description: "Analyze pick patterns and product velocity to optimize warehouse slotting and layout", priority: "medium" },
      { name: "Warehouse Performance Report", cadence: "monthly", description: "Compile comprehensive operations report: throughput, accuracy, cost per unit, safety metrics", priority: "high" },
      { name: "Capacity Planning", cadence: "monthly", description: "Analyze storage utilization trends and forecast capacity needs for upcoming periods", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Manhattan Associates WMS", "Blue Yonder WMS", "SAP EWM",
      "AutoStore", "Locus Robotics", "6 River Systems",
      "Zebra Technologies", "Honeywell Vocollect", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      warehouseData: "Full Access",
      inventoryData: "Full Access",
      orderData: "Full Access",
      laborData: "Full Access",
      shippingData: "Full Access",
      costData: "Full Access — warehouse operations",
      safetyRecords: "Full Access",
      vendorData: "Authorized — logistics vendors"
    },
    communicationCapabilities: [
      "Warehouse team coordination for daily operations and priorities",
      "Carrier coordination for inbound and outbound scheduling",
      "Customer service support for order fulfillment issues",
      "Management reporting on warehouse performance",
      "Safety communication and training coordination",
      "IT coordination for WMS issues and system improvements"
    ],
    exampleWorkflows: [
      {
        name: "Daily Warehouse Operations Management",
        steps: [
          "Review overnight order volume and priority shipment requirements",
          "Allocate labor across receiving, picking, packing, and shipping",
          "Release pick waves based on carrier cutoff times and priorities",
          "Monitor pick and pack productivity throughout the day",
          "Manage dock door assignments for inbound and outbound trailers",
          "Track order completion rates against daily targets",
          "Address exceptions: short picks, damages, carrier delays",
          "Prepare end-of-day operations summary"
        ]
      },
      {
        name: "Peak Season Preparation",
        steps: [
          "Analyze volume forecasts and calculate capacity requirements",
          "Plan temporary staffing increases and training schedules",
          "Optimize slotting for high-velocity seasonal items",
          "Arrange additional storage capacity if needed",
          "Test system scalability and backup procedures",
          "Coordinate extended carrier pickup schedules",
          "Implement daily performance tracking during peak",
          "Conduct post-peak analysis and document improvements"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Order Accuracy", target: "> 99.5%", weight: 20 },
      { metric: "On-Time Shipping", target: "> 98%", weight: 15 },
      { metric: "Units per Labor Hour", target: "> benchmark by function", weight: 15 },
      { metric: "Inventory Accuracy", target: "> 99%", weight: 15 },
      { metric: "Cost per Unit Shipped", target: "< budget target", weight: 10 },
      { metric: "Safety (OSHA Recordable Rate)", target: "< industry average", weight: 15 },
      { metric: "Storage Utilization", target: "80-90% optimal range", weight: 10 }
    ],
    useCases: [
      "AI-optimized labor planning based on volume forecasting",
      "Automated slotting optimization for pick path efficiency",
      "Real-time warehouse performance monitoring with anomaly detection",
      "Predictive capacity planning for seasonal and growth demands",
      "Robotics and automation integration management"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 55, empathy: 45, directness: 85,
      creativity: 40, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["OSHA Warehouse Safety", "DOT (Hazmat Shipping)", "FDA (food warehousing)", "EPA", "CCPA", "C-TPAT", "ISO 9001"],
      dataClassification: "Confidential — Operations & Inventory Data",
      auditRequirements: "Inventory transactions logged; safety inspections documented; shipping records traceable",
      retentionPolicy: "Inventory records: 7 years; shipping records: 5 years; safety records: OSHA retention requirements",
      breachNotification: "VP Distribution notification for inventory or customer order data exposure"
    },
    skillsTags: ["warehouse management", "WMS", "inventory control", "labor management", "order fulfillment", "logistics", "safety management", "process optimization", "distribution"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Route Optimization Specialist AI",
    department: "Transportation Planning",
    category: "Transportation & Logistics",
    industry: "Transportation",
    reportsTo: "Director of Transportation",
    seniorityLevel: "mid",
    description: "Designs and optimizes transportation routes and delivery networks to minimize costs, improve service levels, and reduce environmental impact. Uses advanced algorithms, real-time traffic data, and delivery constraints to create efficient routes that balance operational efficiency with customer service requirements.",
    coreResponsibilities: [
      "Design and optimize daily delivery routes for fleet operations",
      "Analyze transportation network efficiency and identify improvement opportunities",
      "Incorporate real-time traffic, weather, and road condition data into routing",
      "Balance route optimization with customer delivery window requirements",
      "Manage route planning parameters including vehicle capacity and driver hours",
      "Optimize last-mile delivery efficiency and reduce failed deliveries",
      "Analyze and reduce transportation costs through network optimization",
      "Support strategic network design for distribution and service areas",
      "Track route plan vs. actual execution performance",
      "Generate transportation efficiency reports and savings analysis"
    ],
    tasks: [
      { name: "Daily Route Generation", cadence: "daily", description: "Generate optimized routes for next-day deliveries incorporating orders, constraints, and real-time conditions", priority: "critical" },
      { name: "Real-Time Route Adjustment", cadence: "daily", description: "Monitor active routes and adjust for traffic, weather, cancellations, and add-on deliveries", priority: "high" },
      { name: "Route Execution Monitoring", cadence: "daily", description: "Track driver route adherence, delivery completion, and identify deviations", priority: "high" },
      { name: "Failed Delivery Analysis", cadence: "daily", description: "Analyze failed delivery attempts, identify patterns, and recommend process improvements", priority: "medium" },
      { name: "Route Efficiency Analysis", cadence: "weekly", description: "Analyze route efficiency metrics: miles per stop, cost per delivery, route density", priority: "high" },
      { name: "Network Optimization Study", cadence: "weekly", description: "Analyze delivery network for territory balancing and hub-and-spoke optimization", priority: "medium" },
      { name: "Transportation Cost Report", cadence: "monthly", description: "Compile transportation cost analysis: cost per mile, cost per stop, fuel efficiency by route", priority: "high" },
      { name: "Service Level Analysis", cadence: "monthly", description: "Analyze delivery window compliance and customer satisfaction by route and territory", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Descartes Route Planner", "OptimoRoute", "Routific",
      "Google Maps Platform", "HERE Technologies", "Trimble",
      "Samsara", "Onfleet", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      deliveryOrders: "Full Access",
      routeData: "Full Access",
      vehicleData: "Full Access",
      driverData: "Authorized — scheduling",
      customerAddresses: "Full Access",
      trafficData: "Full Access",
      costData: "Authorized — transportation costs",
      historicalRoutes: "Full Access"
    },
    communicationCapabilities: [
      "Driver communication for route updates and delivery instructions",
      "Dispatch coordination for real-time route changes",
      "Customer service support for delivery timing inquiries",
      "Operations management reporting on transportation efficiency",
      "Carrier coordination for outsourced delivery routes",
      "Automated delivery notification and ETA communications"
    ],
    exampleWorkflows: [
      {
        name: "Daily Route Optimization",
        steps: [
          "Import next-day delivery orders with addresses and service windows",
          "Apply vehicle capacity, driver availability, and hours constraints",
          "Run optimization algorithm with real-time traffic and road data",
          "Generate optimized routes with stop sequences and ETAs",
          "Review routes for feasibility and make manual adjustments",
          "Distribute routes to drivers via mobile app",
          "Monitor route execution and handle real-time exceptions",
          "Analyze route performance vs. plan at end of day"
        ]
      },
      {
        name: "Delivery Network Redesign",
        steps: [
          "Analyze current delivery volumes, patterns, and geographic distribution",
          "Identify inefficiencies in territory boundaries and hub locations",
          "Model alternative network configurations using optimization tools",
          "Simulate service levels and costs for each scenario",
          "Present recommendations with cost-benefit analysis",
          "Plan phased implementation of approved network changes",
          "Monitor performance during transition period",
          "Fine-tune routes and territories based on initial results"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Cost per Delivery", target: "< budget target", weight: 20 },
      { metric: "On-Time Delivery Rate", target: "> 95%", weight: 20 },
      { metric: "Route Efficiency (Stops/Hour)", target: "> benchmark", weight: 15 },
      { metric: "Miles per Stop", target: "< network average", weight: 10 },
      { metric: "Failed Delivery Rate", target: "< 3%", weight: 15 },
      { metric: "Driver Route Adherence", target: "> 90%", weight: 10 },
      { metric: "Fuel Cost Reduction", target: "> 5% YoY", weight: 10 }
    ],
    useCases: [
      "AI-powered daily route optimization with real-time traffic integration",
      "Dynamic route adjustment for same-day delivery changes",
      "Last-mile delivery optimization with customer time window compliance",
      "Strategic delivery network design and territory optimization",
      "Carbon footprint reduction through route efficiency improvement"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 55, empathy: 40, directness: 80,
      creativity: 55, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["DOT/FMCSA (HOS)", "CCPA", "GDPR", "EPA (Emissions)", "State Transportation Regulations", "ADA (Accessibility)", "Local Delivery Ordinances"],
      dataClassification: "Confidential — Customer Address & Delivery Data",
      auditRequirements: "Route plans and execution data logged; driver HOS compliance verified; delivery records maintained",
      retentionPolicy: "Route data: 3 years; delivery records: 5 years; customer address data per CCPA/GDPR",
      breachNotification: "Director notification for customer address or delivery pattern data exposure"
    },
    skillsTags: ["route optimization", "last-mile delivery", "transportation planning", "network design", "GIS", "logistics analytics", "fleet routing", "delivery management", "operations research"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Freight Audit and Payment Analyst AI",
    department: "Freight Finance",
    category: "Transportation & Logistics",
    industry: "Transportation",
    reportsTo: "Director of Freight Finance",
    seniorityLevel: "mid",
    description: "Manages the freight audit and payment process, verifying carrier invoices against contracted rates, shipment documentation, and service levels. Identifies billing errors, recovers overcharges, processes approved payments, and provides freight cost analytics to support transportation procurement and cost management decisions.",
    coreResponsibilities: [
      "Audit carrier freight invoices against contracted rates and accessorial charges",
      "Verify shipment documentation matches billing (BOL, POD, weight, dimensions)",
      "Identify and recover carrier overcharges and billing errors",
      "Process approved freight payments within contracted payment terms",
      "Manage freight claims for loss, damage, and service failures",
      "Analyze freight spend by carrier, lane, mode, and service level",
      "Track carrier contract compliance and rate adherence",
      "Support transportation procurement with cost benchmarking data",
      "Manage GL coding and cost allocation for freight charges",
      "Generate freight cost reports and savings analysis"
    ],
    tasks: [
      { name: "Invoice Audit Processing", cadence: "daily", description: "Audit incoming carrier invoices against rates, verify charges, and flag discrepancies", priority: "high" },
      { name: "Payment Processing", cadence: "daily", description: "Process approved freight payments, manage payment batches, and track payment status", priority: "high" },
      { name: "Overcharge Recovery", cadence: "daily", description: "Submit overcharge claims to carriers, track dispute resolution, and record recoveries", priority: "high" },
      { name: "Documentation Matching", cadence: "daily", description: "Match invoices to BOLs, PODs, and shipment records; resolve documentation discrepancies", priority: "medium" },
      { name: "Claims Management", cadence: "weekly", description: "Process freight claims for loss, damage, and service failures; track claim resolution", priority: "medium" },
      { name: "Spend Analysis", cadence: "weekly", description: "Analyze freight spend trends by carrier, lane, and accessorial type; identify savings opportunities", priority: "high" },
      { name: "Freight Cost Dashboard", cadence: "monthly", description: "Compile freight cost analytics: total spend, cost per unit, carrier share, and trend analysis", priority: "high" },
      { name: "Contract Compliance Audit", cadence: "monthly", description: "Audit carrier rate compliance against contract terms, identify rate adherence issues", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Cass Information Systems", "CTSI-Global", "Trax Technologies",
      "nVision Global", "SAP TM", "Oracle Transportation Management",
      "MercuryGate", "AFS Logistics", "Microsoft Excel", "Slack"
    ],
    dataAccessPermissions: {
      freightInvoices: "Full Access",
      carrierContracts: "Full Access",
      shipmentRecords: "Full Access",
      paymentData: "Full Access",
      claimsData: "Full Access",
      costAllocationData: "Full Access",
      carrierPerformance: "Full Access",
      financialData: "Authorized — freight GL accounts"
    },
    communicationCapabilities: [
      "Carrier communication for billing disputes and claims",
      "Accounts payable coordination for payment processing",
      "Procurement team support with freight cost analytics",
      "Operations team coordination for shipment documentation",
      "Management reporting on freight spend and savings",
      "Automated payment notification and dispute correspondence"
    ],
    exampleWorkflows: [
      {
        name: "Freight Invoice Audit Process",
        steps: [
          "Receive carrier invoice electronically via EDI or portal",
          "Match invoice to shipment record and bill of lading",
          "Verify rates against carrier contract and rate tables",
          "Audit accessorial charges for validity and proper documentation",
          "Validate weight, dimensions, and classification accuracy",
          "Flag discrepancies and initiate dispute with carrier",
          "Approve accurate invoices for payment processing",
          "Record audit results and update carrier performance metrics"
        ]
      },
      {
        name: "Freight Claim Filing and Recovery",
        steps: [
          "Receive claim notification from consignee (loss, damage, or shortage)",
          "Verify claim validity against shipping documentation",
          "Gather supporting evidence (photos, delivery receipts, inspection reports)",
          "Calculate claim value per carrier liability and contract terms",
          "File claim with carrier within contractual filing period",
          "Track claim status and follow up for timely resolution",
          "Process claim settlement and record recovery",
          "Analyze claim trends by carrier for performance management"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Audit Accuracy", target: "> 99%", weight: 20 },
      { metric: "Overcharge Recovery Rate", target: "> 3% of total spend identified", weight: 20 },
      { metric: "Payment Timeliness", target: "> 95% within contracted terms", weight: 15 },
      { metric: "Invoice Processing Time", target: "< 48 hours", weight: 10 },
      { metric: "Claim Recovery Rate", target: "> 80% of filed claims", weight: 15 },
      { metric: "Cost Savings Identified", target: "> 5% through audit findings", weight: 10 },
      { metric: "GL Coding Accuracy", target: "> 99%", weight: 10 }
    ],
    useCases: [
      "Automated freight invoice auditing with rate verification engine",
      "Overcharge detection and recovery using pattern analysis",
      "Freight spend analytics with carrier and lane-level visibility",
      "Claims management automation with carrier performance correlation",
      "Transportation cost benchmarking and procurement decision support"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 40, empathy: 40, directness: 85,
      creativity: 30, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["SOX", "GAAP", "CCPA", "GDPR", "Carmack Amendment", "FMCSA Billing Regulations", "UCC Article 7", "International Carriage (CMR/Montreal Convention)"],
      dataClassification: "Confidential — Financial & Transportation Data",
      auditRequirements: "All freight payments auditable; invoice matching documented; overcharge recovery tracked",
      retentionPolicy: "Freight invoices: 7 years; carrier contracts: term + 5 years; claims: 5 years from resolution",
      breachNotification: "Freight finance director notification for financial or carrier data exposure"
    },
    skillsTags: ["freight audit", "freight payment", "carrier management", "cost analysis", "claims management", "transportation finance", "rate negotiation", "GL coding", "logistics analytics"],
    priceMonthly: 999,
    isActive: 1,
  },
];
