import type { InsertAiEmployeeRole } from "@workspace/db/schema";

export const creativeRealEstateAgricultureRoles: Omit<InsertAiEmployeeRole, "id" | "createdAt" | "updatedAt">[] = [

  // ═══════════════════════════════════════════════════════════
  //  CREATIVE & ENTERTAINMENT (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Content Strategy Director AI",
    department: "Content & Media",
    category: "Creative & Entertainment",
    industry: "Media & Entertainment",
    reportsTo: "CMO",
    seniorityLevel: "senior",
    description: "Leads content strategy development across all digital and traditional channels. Defines editorial direction, manages content calendars, oversees content production workflows, and measures content performance to drive audience engagement, brand authority, and business objectives.",
    coreResponsibilities: [
      "Develop and maintain comprehensive content strategy aligned with business goals",
      "Define editorial direction, brand voice guidelines, and content standards",
      "Manage content calendars across all channels and platforms",
      "Oversee content production workflows from ideation to publication",
      "Analyze content performance metrics and optimize strategy accordingly",
      "Coordinate with marketing, product, and sales teams on content needs",
      "Manage content distribution and syndication strategies",
      "Develop audience personas and map content to buyer journey stages",
      "Lead SEO content strategy and keyword research programs",
      "Report content ROI and performance to executive leadership"
    ],
    tasks: [
      { name: "Content Performance Review", cadence: "daily", description: "Review content engagement metrics, identify top performers, and flag underperforming content", priority: "high" },
      { name: "Editorial Calendar Management", cadence: "daily", description: "Manage content pipeline, assign production tasks, and track publishing schedules", priority: "high" },
      { name: "Content Approval", cadence: "daily", description: "Review and approve content pieces for brand voice, quality, and strategic alignment", priority: "high" },
      { name: "SEO Monitoring", cadence: "daily", description: "Track keyword rankings, organic traffic trends, and search visibility changes", priority: "medium" },
      { name: "Content Planning Session", cadence: "weekly", description: "Lead editorial planning meetings, brainstorm content ideas, and prioritize production queue", priority: "high" },
      { name: "Audience Analysis", cadence: "weekly", description: "Analyze audience behavior, content consumption patterns, and engagement trends", priority: "medium" },
      { name: "Content Strategy Report", cadence: "monthly", description: "Compile content performance dashboard: traffic, engagement, conversions, and ROI metrics", priority: "high" },
      { name: "Competitive Content Audit", cadence: "monthly", description: "Analyze competitor content strategies, identify gaps and opportunities", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "WordPress / Contentful CMS", "SEMrush / Ahrefs", "Google Analytics 4",
      "HubSpot Marketing Hub", "Hootsuite / Sprout Social", "Canva / Adobe Creative Suite",
      "Grammarly Business", "Trello / Asana", "Google Search Console", "Slack"
    ],
    dataAccessPermissions: {
      contentLibrary: "Full Access",
      analyticsData: "Full Access",
      seoData: "Full Access",
      socialMediaData: "Full Access",
      crmData: "Authorized — content attribution",
      salesData: "Restricted — content-influenced revenue",
      brandAssets: "Full Access",
      competitorData: "Full Access"
    },
    communicationCapabilities: [
      "Marketing team collaboration on campaigns and content needs",
      "Sales team coordination for sales enablement content",
      "Product team alignment on product content and launches",
      "Executive reporting on content strategy and ROI",
      "External contributor and agency management",
      "Automated content publishing and distribution notifications"
    ],
    exampleWorkflows: [
      {
        name: "Content Campaign Launch",
        steps: [
          "Define campaign objectives, target audience, and key messages",
          "Develop content plan with formats, channels, and publishing timeline",
          "Create content briefs with SEO requirements and brand guidelines",
          "Produce content assets across blog, social, video, and email",
          "Review and approve all content for quality and consistency",
          "Execute multi-channel publishing and distribution plan",
          "Monitor real-time engagement and adjust promotion strategy",
          "Analyze campaign performance and document learnings"
        ]
      },
      {
        name: "SEO Content Optimization Program",
        steps: [
          "Conduct keyword research and identify content opportunities",
          "Audit existing content for SEO gaps and improvement potential",
          "Prioritize content updates based on traffic potential and effort",
          "Create optimization briefs with target keywords and structure",
          "Execute content updates with on-page SEO best practices",
          "Submit updated pages for re-indexing and monitor rankings",
          "Track organic traffic and ranking improvements over time",
          "Scale successful optimization patterns across content library"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Organic Traffic Growth", target: "> 20% YoY", weight: 20 },
      { metric: "Content Engagement Rate", target: "> 5% average", weight: 15 },
      { metric: "Content-Attributed Revenue", target: "> target by quarter", weight: 20 },
      { metric: "Publishing Cadence Adherence", target: "> 95%", weight: 10 },
      { metric: "SEO Keyword Rankings", target: "Top 10 for priority terms", weight: 15 },
      { metric: "Content Production Efficiency", target: "< budget per piece", weight: 10 },
      { metric: "Audience Growth Rate", target: "> 10% quarterly", weight: 10 }
    ],
    useCases: [
      "AI-driven content strategy with audience intent mapping",
      "Automated content performance analytics and optimization recommendations",
      "SEO content gap analysis and keyword opportunity identification",
      "Content calendar management with cross-channel coordination",
      "Competitive content intelligence and trend analysis"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 75, empathy: 60, directness: 70,
      creativity: 85, humor: 35, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["GDPR", "CCPA", "FTC Endorsement Guidelines", "DMCA", "ADA (Web Accessibility)", "CAN-SPAM", "Copyright Law", "Trademark Law"],
      dataClassification: "Confidential — Marketing Strategy & Audience Data",
      auditRequirements: "Content approvals documented; sponsored content disclosures tracked; copyright clearances maintained",
      retentionPolicy: "Published content: indefinite; drafts: 2 years; analytics: 3 years; contributor agreements: term + 3 years",
      breachNotification: "CMO notification for audience data or content strategy exposure"
    },
    skillsTags: ["content strategy", "editorial planning", "SEO", "content marketing", "brand voice", "audience analytics", "content production", "digital marketing", "storytelling"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Social Media Manager AI",
    department: "Social Media",
    category: "Creative & Entertainment",
    industry: "Media & Entertainment",
    reportsTo: "Director of Digital Marketing",
    seniorityLevel: "mid",
    description: "Manages social media presence across all major platforms, creating and scheduling content, engaging with audiences, monitoring brand mentions, and analyzing social performance metrics. Develops platform-specific strategies to grow followers, drive engagement, and support business objectives through social channels.",
    coreResponsibilities: [
      "Develop and execute social media strategies across all platforms",
      "Create and curate platform-optimized content for posting",
      "Manage social media content calendars and publishing schedules",
      "Monitor and respond to brand mentions, comments, and messages",
      "Analyze social media performance metrics and audience insights",
      "Manage influencer partnerships and collaboration campaigns",
      "Track social media trends and identify opportunities for engagement",
      "Coordinate with marketing and PR teams on social amplification",
      "Manage social media advertising campaigns and budget allocation",
      "Report social media ROI and performance to leadership"
    ],
    tasks: [
      { name: "Content Publishing", cadence: "daily", description: "Create, schedule, and publish social content across platforms per content calendar", priority: "high" },
      { name: "Community Management", cadence: "daily", description: "Monitor and respond to comments, DMs, mentions, and tags across all platforms", priority: "high" },
      { name: "Social Listening", cadence: "daily", description: "Monitor brand mentions, industry conversations, trending topics, and competitor activity", priority: "medium" },
      { name: "Engagement Analysis", cadence: "daily", description: "Track post performance, engagement rates, and audience growth across platforms", priority: "medium" },
      { name: "Influencer Coordination", cadence: "weekly", description: "Manage influencer relationships, review deliverables, and track campaign performance", priority: "medium" },
      { name: "Ad Campaign Management", cadence: "weekly", description: "Monitor social ad performance, optimize targeting, and manage budget allocation", priority: "high" },
      { name: "Social Media Performance Report", cadence: "monthly", description: "Compile comprehensive social analytics: reach, engagement, growth, conversions, and ROI", priority: "high" },
      { name: "Trend & Platform Analysis", cadence: "monthly", description: "Analyze platform algorithm changes, emerging trends, and strategy adjustments needed", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Hootsuite / Buffer", "Sprout Social", "Later / Planoly",
      "Meta Business Suite", "TikTok Business Center", "LinkedIn Campaign Manager",
      "Canva", "Brandwatch / Mention", "Google Analytics 4", "Slack"
    ],
    dataAccessPermissions: {
      socialAccounts: "Full Access",
      analyticsData: "Full Access",
      audienceData: "Full Access",
      adAccountData: "Full Access",
      brandAssets: "Full Access",
      influencerData: "Full Access",
      crmData: "Restricted — social attribution",
      competitorData: "Full Access"
    },
    communicationCapabilities: [
      "Community engagement across all social platforms",
      "Influencer outreach and relationship management",
      "Marketing team coordination for integrated campaigns",
      "PR team coordination for crisis communication",
      "Management reporting on social media performance",
      "Customer service escalation for social inquiries"
    ],
    exampleWorkflows: [
      {
        name: "Viral Content Response",
        steps: [
          "Detect trending topic or viral moment relevant to brand",
          "Assess brand alignment and risk of participation",
          "Develop rapid-response content concepts",
          "Get expedited approval through crisis/opportunity protocol",
          "Publish time-sensitive content across appropriate platforms",
          "Monitor engagement and sentiment in real-time",
          "Amplify high-performing content with paid promotion",
          "Document results and update rapid-response playbook"
        ]
      },
      {
        name: "Influencer Campaign Execution",
        steps: [
          "Define campaign goals, target audience, and budget",
          "Identify and vet potential influencer partners",
          "Negotiate terms, deliverables, and FTC disclosure requirements",
          "Provide creative brief and brand guidelines to influencers",
          "Review and approve influencer content before posting",
          "Coordinate publishing timeline for maximum impact",
          "Track engagement, reach, and conversion metrics",
          "Calculate campaign ROI and document partnership learnings"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Follower Growth Rate", target: "> 5% monthly", weight: 15 },
      { metric: "Engagement Rate", target: "> platform benchmarks", weight: 20 },
      { metric: "Social-Attributed Conversions", target: "> target by channel", weight: 20 },
      { metric: "Response Time", target: "< 2 hours for mentions", weight: 10 },
      { metric: "Content Reach", target: "> 3x follower count monthly", weight: 10 },
      { metric: "Social Ad ROAS", target: "> 3x", weight: 15 },
      { metric: "Brand Sentiment Score", target: "> 80% positive", weight: 10 }
    ],
    useCases: [
      "AI-powered social content creation and scheduling optimization",
      "Real-time social listening and sentiment monitoring",
      "Influencer discovery and campaign management automation",
      "Social media ad optimization with audience targeting AI",
      "Trend detection and viral content opportunity identification"
    ],
    personalityDefaults: {
      formality: 45, enthusiasm: 85, empathy: 70, directness: 60,
      creativity: 90, humor: 60, assertiveness: 50
    },
    complianceMetadata: {
      frameworks: ["FTC Endorsement Guidelines", "GDPR", "CCPA", "COPPA", "CAN-SPAM", "DMCA", "Platform Terms of Service", "Advertising Standards Authority"],
      dataClassification: "PII — Social Media Audience & Engagement Data",
      auditRequirements: "Sponsored content disclosures documented; influencer agreements filed; ad spend tracked",
      retentionPolicy: "Social content: indefinite; audience data per GDPR/CCPA; influencer contracts: term + 3 years",
      breachNotification: "Marketing director notification for audience data or account credential exposure"
    },
    skillsTags: ["social media management", "community management", "influencer marketing", "social advertising", "content creation", "social analytics", "brand management", "trend analysis", "engagement optimization"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "Video Production Coordinator AI",
    department: "Video & Media Production",
    category: "Creative & Entertainment",
    industry: "Media & Entertainment",
    reportsTo: "Creative Director",
    seniorityLevel: "mid",
    description: "Coordinates video production projects from concept through delivery, managing pre-production planning, production logistics, post-production workflows, and distribution. Ensures video content meets brand standards, deadlines, and budget requirements while maximizing production quality and audience impact.",
    coreResponsibilities: [
      "Coordinate video production projects from concept to final delivery",
      "Manage pre-production planning including scripts, storyboards, and shot lists",
      "Schedule and coordinate production resources, talent, and locations",
      "Oversee post-production workflows including editing, graphics, and sound",
      "Manage video production budgets and track expenses against estimates",
      "Ensure brand consistency and quality standards across all video content",
      "Coordinate video distribution across platforms with format optimization",
      "Manage relationships with freelance videographers, editors, and talent",
      "Track video performance metrics and audience engagement analytics",
      "Maintain video asset library and metadata management"
    ],
    tasks: [
      { name: "Production Pipeline Review", cadence: "daily", description: "Review active video projects, track milestone progress, and manage production queue", priority: "high" },
      { name: "Post-Production Oversight", cadence: "daily", description: "Review editing progress, provide feedback, and manage revision cycles", priority: "high" },
      { name: "Resource Scheduling", cadence: "daily", description: "Coordinate crew, equipment, location, and talent scheduling for upcoming shoots", priority: "high" },
      { name: "Delivery & Distribution", cadence: "daily", description: "Process final video deliverables and coordinate multi-platform distribution", priority: "medium" },
      { name: "Budget Tracking", cadence: "weekly", description: "Track production expenses against budgets, process invoices, and manage cost reports", priority: "medium" },
      { name: "Content Calendar Alignment", cadence: "weekly", description: "Align video production pipeline with marketing content calendar and campaign needs", priority: "medium" },
      { name: "Video Performance Report", cadence: "monthly", description: "Compile video analytics: views, watch time, engagement, and conversion metrics", priority: "high" },
      { name: "Asset Library Management", cadence: "monthly", description: "Organize, tag, and archive video assets with searchable metadata", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Adobe Premiere Pro / Final Cut Pro", "Adobe After Effects", "DaVinci Resolve",
      "Frame.io", "Wistia / Vimeo Business", "YouTube Studio",
      "Asana / Monday.com", "Google Drive / Dropbox", "Canva Video", "Slack"
    ],
    dataAccessPermissions: {
      videoAssets: "Full Access",
      productionSchedules: "Full Access",
      budgetData: "Full Access — production budgets",
      talentContracts: "Full Access",
      analyticsData: "Full Access",
      brandGuidelines: "Full Access",
      musicLicenses: "Full Access",
      distributionAccounts: "Full Access"
    },
    communicationCapabilities: [
      "Production crew coordination for shoots and post-production",
      "Talent and influencer coordination for video content",
      "Marketing team alignment on video content needs",
      "Vendor and freelancer management communication",
      "Executive review and approval workflows",
      "Platform-specific distribution coordination"
    ],
    exampleWorkflows: [
      {
        name: "Brand Video Production",
        steps: [
          "Receive creative brief with objectives, audience, and key messages",
          "Develop script and storyboard with client/stakeholder review",
          "Plan production logistics: location, crew, equipment, talent",
          "Execute production shoot with quality oversight",
          "Manage post-production: rough cut, review, revisions, final edit",
          "Add graphics, sound design, music, and color grading",
          "Process final delivery in all required formats and specs",
          "Distribute across platforms and track performance"
        ]
      },
      {
        name: "Video Content Series Production",
        steps: [
          "Define series concept, format, episode structure, and publishing cadence",
          "Create production templates for consistent branding and style",
          "Batch-plan episodes with scripts, guests, and production schedules",
          "Execute batch production for efficient use of resources",
          "Process post-production with series-consistent editing",
          "Schedule episodic publishing across platforms",
          "Monitor audience engagement and retention by episode",
          "Iterate on format based on performance data"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Production On-Time Delivery", target: "> 90%", weight: 20 },
      { metric: "Budget Adherence", target: "Within 10% of estimate", weight: 15 },
      { metric: "Video View Count", target: "> target per platform", weight: 15 },
      { metric: "Average Watch Time", target: "> 50% of video length", weight: 15 },
      { metric: "Client/Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 },
      { metric: "Revision Cycle Count", target: "< 3 rounds average", weight: 10 },
      { metric: "Content Output Volume", target: "Per quarterly plan", weight: 15 }
    ],
    useCases: [
      "AI-assisted video production planning and resource scheduling",
      "Automated video performance analytics and audience insights",
      "Video asset management with AI-powered search and tagging",
      "Production budget tracking and cost optimization",
      "Multi-platform video distribution with format optimization"
    ],
    personalityDefaults: {
      formality: 55, enthusiasm: 75, empathy: 55, directness: 70,
      creativity: 80, humor: 35, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["DMCA", "Copyright Law", "SAG-AFTRA Guidelines", "FTC Endorsement Guidelines", "GDPR", "CCPA", "Music Licensing (ASCAP/BMI/SESAC)", "Location Permit Requirements"],
      dataClassification: "Confidential — Creative Assets & Production Data",
      auditRequirements: "Talent releases documented; music licenses filed; brand approvals tracked; usage rights verified",
      retentionPolicy: "Final videos: indefinite; raw footage: 2 years; contracts: term + 5 years; licenses: term + 3 years",
      breachNotification: "Creative director notification for unreleased content or production data exposure"
    },
    skillsTags: ["video production", "post-production", "content creation", "project management", "video editing", "production coordination", "video analytics", "asset management", "creative production"],
    priceMonthly: 1099,
    isActive: 1,
  },

  {
    title: "Music & Audio Producer AI",
    department: "Audio Production",
    category: "Creative & Entertainment",
    industry: "Media & Entertainment",
    reportsTo: "Head of Creative Production",
    seniorityLevel: "mid",
    description: "Manages music and audio production for commercial, advertising, podcast, and entertainment projects. Handles composition coordination, sound design, audio mixing, licensing management, and production scheduling to deliver high-quality audio content that meets creative briefs and brand standards.",
    coreResponsibilities: [
      "Coordinate music and audio production projects from brief to delivery",
      "Manage audio production workflows including recording, editing, and mixing",
      "Source and license music tracks, sound effects, and audio assets",
      "Oversee sound design and audio branding consistency",
      "Manage relationships with composers, musicians, and audio engineers",
      "Track music licensing agreements, royalties, and usage rights",
      "Coordinate podcast production including recording, editing, and publishing",
      "Ensure audio quality standards and technical specifications compliance",
      "Manage audio asset library with metadata and rights information",
      "Analyze audio content performance and listener engagement metrics"
    ],
    tasks: [
      { name: "Production Queue Management", cadence: "daily", description: "Review active audio projects, track progress, and manage production priorities", priority: "high" },
      { name: "Audio Review & Approval", cadence: "daily", description: "Review audio mixes, provide feedback, and manage revision workflows", priority: "high" },
      { name: "Licensing & Rights Management", cadence: "daily", description: "Process music license requests, verify usage rights, and track expiring licenses", priority: "high" },
      { name: "Recording Session Coordination", cadence: "daily", description: "Schedule and coordinate recording sessions, studio time, and talent availability", priority: "medium" },
      { name: "Podcast Production", cadence: "weekly", description: "Manage podcast episode production: recording, editing, show notes, and publishing", priority: "high" },
      { name: "Asset Library Curation", cadence: "weekly", description: "Catalog new audio assets, update metadata, and organize searchable library", priority: "medium" },
      { name: "Audio Performance Report", cadence: "monthly", description: "Compile audio content metrics: downloads, streams, listener retention, and engagement", priority: "high" },
      { name: "License Renewal Review", cadence: "monthly", description: "Review upcoming license expirations, negotiate renewals, and budget for new acquisitions", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Pro Tools / Logic Pro", "Ableton Live", "Adobe Audition",
      "Epidemic Sound / Artlist", "Anchor / Spotify for Podcasters", "SoundCloud",
      "LANDR / iZotope", "Dropbox / Google Drive", "Trello", "Slack"
    ],
    dataAccessPermissions: {
      audioAssets: "Full Access",
      productionSchedules: "Full Access",
      licensingData: "Full Access",
      talentContracts: "Full Access",
      budgetData: "Full Access — audio production",
      analyticsData: "Full Access",
      brandAudioGuidelines: "Full Access",
      distributionAccounts: "Full Access"
    },
    communicationCapabilities: [
      "Composer and musician coordination for production projects",
      "Studio and engineer scheduling and coordination",
      "Marketing team alignment on audio content needs",
      "Licensing company negotiation and rights management",
      "Executive review and approval for audio branding",
      "Podcast guest coordination and scheduling"
    ],
    exampleWorkflows: [
      {
        name: "Commercial Audio Production",
        steps: [
          "Receive creative brief with mood, tone, and usage requirements",
          "Source or commission music options matching creative direction",
          "Present shortlist of tracks or compositions to creative team",
          "Coordinate recording session if custom composition selected",
          "Manage mixing and mastering to broadcast specifications",
          "Clear licensing and usage rights for all audio elements",
          "Deliver final audio in all required formats and specs",
          "Archive project assets with complete rights documentation"
        ]
      },
      {
        name: "Podcast Series Launch",
        steps: [
          "Define podcast concept, format, and target audience",
          "Develop intro/outro music, sound design, and audio branding",
          "Set up recording workflow and technical requirements",
          "Record pilot episode with production quality review",
          "Edit, mix, and master episodes to consistent standards",
          "Create show notes, transcripts, and promotional assets",
          "Publish across podcast platforms and directories",
          "Monitor listener metrics and iterate on production quality"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Production Delivery On-Time", target: "> 90%", weight: 15 },
      { metric: "Audio Quality Score", target: "> 4.5/5.0 internal review", weight: 20 },
      { metric: "License Compliance Rate", target: "100%", weight: 20 },
      { metric: "Budget Adherence", target: "Within 10%", weight: 10 },
      { metric: "Podcast Listener Growth", target: "> 10% monthly", weight: 15 },
      { metric: "Revision Cycle Count", target: "< 3 rounds", weight: 10 },
      { metric: "Asset Library Utilization", target: "> 60% reuse rate", weight: 10 }
    ],
    useCases: [
      "AI-assisted music selection and mood-matching for creative briefs",
      "Automated podcast production workflow management",
      "Music licensing tracking and rights management automation",
      "Audio asset library with AI-powered search and categorization",
      "Audio content performance analytics and listener insights"
    ],
    personalityDefaults: {
      formality: 50, enthusiasm: 75, empathy: 60, directness: 65,
      creativity: 90, humor: 40, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["Copyright Law", "DMCA", "ASCAP/BMI/SESAC Licensing", "SAG-AFTRA", "FCC Regulations", "GDPR", "CCPA", "Music Modernization Act"],
      dataClassification: "Confidential — Creative Assets & Licensing Data",
      auditRequirements: "Music licenses documented with usage terms; talent agreements filed; royalty payments tracked",
      retentionPolicy: "Final audio: indefinite; session files: 3 years; contracts: term + 5 years; licenses: term + 3 years",
      breachNotification: "Head of production notification for unreleased audio or licensing data exposure"
    },
    skillsTags: ["audio production", "music licensing", "sound design", "podcast production", "audio engineering", "music supervision", "production coordination", "audio analytics", "creative production"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Creative Campaign Designer AI",
    department: "Creative Services",
    category: "Creative & Entertainment",
    industry: "Media & Entertainment",
    reportsTo: "Creative Director",
    seniorityLevel: "mid",
    description: "Designs and executes integrated creative campaigns across digital and traditional channels. Develops visual concepts, manages design production, coordinates with copywriters and developers, and ensures campaign creative delivers consistent brand messaging that drives measurable business results.",
    coreResponsibilities: [
      "Develop creative concepts and visual direction for marketing campaigns",
      "Design campaign assets across digital, print, and experiential channels",
      "Create and maintain brand design systems and visual identity guidelines",
      "Manage design production workflows and review cycles",
      "Coordinate with copywriters on integrated creative development",
      "Produce responsive digital ad creatives with A/B test variations",
      "Design email templates, landing pages, and conversion-focused assets",
      "Manage design assets and maintain organized creative libraries",
      "Analyze creative performance data to optimize design effectiveness",
      "Present creative concepts and campaign designs to stakeholders"
    ],
    tasks: [
      { name: "Design Production", cadence: "daily", description: "Create and refine campaign design assets, manage revision cycles and approvals", priority: "high" },
      { name: "Creative Brief Review", cadence: "daily", description: "Review incoming creative briefs, clarify requirements, and plan design approach", priority: "high" },
      { name: "Asset Adaptation", cadence: "daily", description: "Adapt master designs to various formats, sizes, and platform specifications", priority: "medium" },
      { name: "Brand Consistency Review", cadence: "daily", description: "Review creative output for brand guideline adherence and visual consistency", priority: "medium" },
      { name: "Creative Performance Analysis", cadence: "weekly", description: "Analyze A/B test results, creative engagement data, and conversion metrics", priority: "high" },
      { name: "Design System Updates", cadence: "weekly", description: "Update design systems, component libraries, and template sets", priority: "medium" },
      { name: "Campaign Performance Report", cadence: "monthly", description: "Compile creative performance metrics across campaigns and channels", priority: "high" },
      { name: "Trend & Inspiration Research", cadence: "monthly", description: "Research design trends, competitive creative, and emerging visual techniques", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Adobe Creative Suite (Photoshop, Illustrator, InDesign)", "Figma", "Canva Pro",
      "Adobe XD / Sketch", "After Effects / Motion", "Google Web Designer",
      "Brandfolder / Bynder", "InVision", "Trello", "Slack"
    ],
    dataAccessPermissions: {
      designAssets: "Full Access",
      brandGuidelines: "Full Access",
      campaignData: "Full Access",
      analyticsData: "Authorized — creative performance",
      photographyLibrary: "Full Access",
      templateLibrary: "Full Access",
      competitorCreative: "Full Access",
      budgetData: "Restricted — design production costs"
    },
    communicationCapabilities: [
      "Creative team collaboration on concept development",
      "Copywriter coordination for integrated creative",
      "Marketing team alignment on campaign creative needs",
      "Stakeholder presentation of creative concepts",
      "Print vendor and production coordination",
      "Developer handoff for digital campaign implementations"
    ],
    exampleWorkflows: [
      {
        name: "Integrated Campaign Creative Development",
        steps: [
          "Review creative brief with campaign objectives and audience",
          "Research and develop initial creative concepts and mood boards",
          "Present 2-3 concept directions to stakeholders for selection",
          "Develop selected concept into master design system",
          "Produce campaign assets across all specified channels and formats",
          "Create A/B test variations for digital channels",
          "Execute design review and revision cycle",
          "Deliver final assets with specs and implementation guidelines"
        ]
      },
      {
        name: "Creative Performance Optimization",
        steps: [
          "Collect creative performance data across active campaigns",
          "Analyze engagement and conversion metrics by creative variant",
          "Identify top-performing design elements and patterns",
          "Develop hypotheses for creative improvement",
          "Design new test variants based on performance insights",
          "Coordinate A/B test deployment with media team",
          "Monitor test results and determine winners",
          "Scale winning creative across campaigns and channels"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Creative Approval Rate (First Round)", target: "> 70%", weight: 15 },
      { metric: "Campaign Creative CTR", target: "> industry benchmark", weight: 20 },
      { metric: "Brand Consistency Score", target: "> 95%", weight: 15 },
      { metric: "Production Delivery On-Time", target: "> 90%", weight: 15 },
      { metric: "Conversion Rate (Creative-Attributed)", target: "> baseline", weight: 15 },
      { metric: "Design Production Volume", target: "Per quarterly plan", weight: 10 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "AI-assisted creative concept generation and mood boarding",
      "Automated design asset adaptation across formats and sizes",
      "Creative performance analytics with A/B test optimization",
      "Brand consistency monitoring with automated guidelines checking",
      "Campaign creative production workflow automation"
    ],
    personalityDefaults: {
      formality: 50, enthusiasm: 80, empathy: 55, directness: 65,
      creativity: 95, humor: 40, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["FTC Advertising Standards", "GDPR", "CCPA", "ADA (Digital Accessibility)", "Copyright Law", "Trademark Law", "Truth in Advertising", "CAN-SPAM (Email Design)"],
      dataClassification: "Confidential — Creative Strategy & Brand Assets",
      auditRequirements: "Creative approvals documented; stock asset licenses filed; brand compliance reviews recorded",
      retentionPolicy: "Campaign creative: 3 years; brand assets: indefinite; stock licenses: term + 3 years; concepts: 2 years",
      breachNotification: "Creative director notification for unreleased campaign or brand asset exposure"
    },
    skillsTags: ["graphic design", "campaign design", "brand identity", "digital advertising", "visual design", "creative direction", "A/B testing", "design systems", "multi-channel marketing"],
    priceMonthly: 999,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  REAL ESTATE & CONSTRUCTION (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Property Valuation Analyst AI",
    department: "Valuation & Appraisal",
    category: "Real Estate & Construction",
    industry: "Real Estate",
    reportsTo: "Director of Valuation Services",
    seniorityLevel: "mid",
    description: "Performs property valuation analyses using comparable sales, income capitalization, and cost approaches. Analyzes market data, property characteristics, and economic factors to develop accurate property valuations that support investment decisions, financing, portfolio management, and regulatory requirements.",
    coreResponsibilities: [
      "Conduct property valuations using sales comparison, income, and cost approaches",
      "Analyze comparable sales data and adjust for property-specific differences",
      "Evaluate income-producing properties using cap rate and DCF analysis",
      "Research market conditions, trends, and economic factors affecting values",
      "Prepare detailed valuation reports with supporting data and methodology",
      "Review and validate third-party appraisals for accuracy and compliance",
      "Monitor property portfolio values and flag significant changes",
      "Support due diligence processes with valuation analysis",
      "Track zoning, entitlement, and regulatory impacts on property values",
      "Generate market value reports for portfolio management and reporting"
    ],
    tasks: [
      { name: "Valuation Requests Processing", cadence: "daily", description: "Process incoming valuation requests, gather property data, and initiate analysis", priority: "high" },
      { name: "Comparable Sales Research", cadence: "daily", description: "Research recent comparable transactions, verify details, and apply adjustments", priority: "high" },
      { name: "Market Data Monitoring", cadence: "daily", description: "Monitor real estate market indicators: cap rates, price trends, absorption rates", priority: "medium" },
      { name: "Appraisal Review", cadence: "daily", description: "Review third-party appraisals for methodology, data accuracy, and conclusion validity", priority: "medium" },
      { name: "Portfolio Value Tracking", cadence: "weekly", description: "Update portfolio property values based on market movements and property changes", priority: "high" },
      { name: "Market Trend Analysis", cadence: "weekly", description: "Analyze submarket trends, rental rates, vacancy rates, and development activity", priority: "medium" },
      { name: "Valuation Summary Report", cadence: "monthly", description: "Compile portfolio valuation report with changes, supporting data, and outlook", priority: "high" },
      { name: "Regulatory Compliance Review", cadence: "monthly", description: "Ensure valuations meet USPAP, FIRREA, and applicable regulatory standards", priority: "high" }
    ],
    toolsAndIntegrations: [
      "CoStar / LoopNet", "ARGUS Enterprise", "RealPage",
      "CoreLogic", "Yardi", "Reonomy",
      "Excel / Financial Models", "MLS Systems", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      propertyData: "Full Access",
      transactionData: "Full Access",
      financialStatements: "Full Access — property level",
      leaseData: "Full Access",
      marketData: "Full Access",
      appraisalReports: "Full Access",
      portfolioData: "Authorized",
      taxRecords: "Full Access"
    },
    communicationCapabilities: [
      "Investment team support with valuation analysis",
      "Lender communication for financing valuations",
      "Appraiser coordination for third-party appraisals",
      "Management reporting on portfolio values and market trends",
      "Legal and regulatory communication for valuation compliance",
      "Broker coordination for market data and comparable sales"
    ],
    exampleWorkflows: [
      {
        name: "Investment Property Valuation",
        steps: [
          "Receive valuation request with property details and purpose",
          "Inspect property data: size, condition, improvements, location",
          "Research comparable sales within market area and time period",
          "Analyze income stream: rent roll, expenses, NOI, and cap rate",
          "Apply sales comparison approach with appropriate adjustments",
          "Apply income capitalization approach (direct cap and DCF)",
          "Reconcile valuation approaches and determine final value opinion",
          "Prepare detailed valuation report with methodology and supporting data"
        ]
      },
      {
        name: "Portfolio Revaluation Process",
        steps: [
          "Identify properties due for periodic revaluation",
          "Update market data: comparable sales, rental rates, vacancy",
          "Recalculate NOI based on current income and expense data",
          "Apply updated cap rates reflecting current market conditions",
          "Compare new values against prior valuations and book values",
          "Document material value changes with supporting analysis",
          "Present revaluation results to investment committee",
          "Update portfolio records and financial reporting"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Valuation Accuracy", target: "Within 5% of transaction price", weight: 25 },
      { metric: "Report Turnaround Time", target: "< 5 business days", weight: 15 },
      { metric: "USPAP Compliance", target: "100%", weight: 20 },
      { metric: "Comparable Data Quality", target: "> 3 valid comparables per analysis", weight: 10 },
      { metric: "Portfolio Coverage", target: "100% revalued per policy", weight: 10 },
      { metric: "Appraisal Review Accuracy", target: "> 95% issues identified", weight: 10 },
      { metric: "Client/Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "AI-powered property valuation with automated comparable selection",
      "Real-time portfolio value monitoring with market-driven adjustments",
      "Automated appraisal review and quality control",
      "Market trend analysis and submarket intelligence",
      "Investment due diligence valuation support"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 40, empathy: 35, directness: 85,
      creativity: 35, humor: 10, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["USPAP", "FIRREA", "IRS Fair Market Value", "GAAP (Fair Value)", "Dodd-Frank", "State Appraisal Regulations", "IVSC (International Valuation Standards)"],
      dataClassification: "Confidential — Property Financial & Valuation Data",
      auditRequirements: "Valuations documented per USPAP; work files maintained; reviewer qualifications recorded",
      retentionPolicy: "Valuation reports: 5 years per USPAP; work files: 5 years; market data: 5 years",
      breachNotification: "Director notification for property valuation or financial data exposure"
    },
    skillsTags: ["property valuation", "real estate appraisal", "market analysis", "financial modeling", "DCF analysis", "cap rate analysis", "USPAP compliance", "commercial real estate", "portfolio valuation"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Construction Project Coordinator AI",
    department: "Project Management",
    category: "Real Estate & Construction",
    industry: "Construction",
    reportsTo: "VP of Construction",
    seniorityLevel: "mid",
    description: "Coordinates construction projects from pre-construction through completion, managing schedules, budgets, subcontractor coordination, RFIs, submittals, and change orders. Ensures projects are delivered on time, within budget, and meeting quality and safety standards.",
    coreResponsibilities: [
      "Manage construction project schedules, milestones, and critical path activities",
      "Coordinate subcontractor scheduling, mobilization, and performance",
      "Process and track RFIs, submittals, and change orders",
      "Monitor project budgets, cost tracking, and variance analysis",
      "Manage project documentation including drawings, specs, and contracts",
      "Coordinate material procurement and delivery schedules",
      "Track construction safety compliance and inspection requirements",
      "Manage punch lists and project closeout processes",
      "Coordinate design team communication for field issue resolution",
      "Generate project status reports for stakeholders and ownership"
    ],
    tasks: [
      { name: "Schedule Management", cadence: "daily", description: "Update project schedule, track critical path activities, and manage look-ahead planning", priority: "critical" },
      { name: "Subcontractor Coordination", cadence: "daily", description: "Coordinate daily subcontractor activities, resolve conflicts, and track progress", priority: "high" },
      { name: "RFI & Submittal Processing", cadence: "daily", description: "Process incoming RFIs and submittals, route for review, and track response timelines", priority: "high" },
      { name: "Daily Site Report", cadence: "daily", description: "Compile daily construction report: work performed, manpower, weather, and issues", priority: "high" },
      { name: "Budget & Cost Tracking", cadence: "weekly", description: "Update cost tracking, review invoices, process pay applications, and manage change orders", priority: "high" },
      { name: "Safety Review", cadence: "weekly", description: "Review safety inspection reports, track incidents, and ensure OSHA compliance", priority: "high" },
      { name: "Project Status Report", cadence: "monthly", description: "Compile comprehensive project report: schedule, budget, issues, and risk assessment", priority: "high" },
      { name: "Quality Inspection Review", cadence: "monthly", description: "Track quality inspections, deficiency reports, and corrective action completion", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Procore", "PlanGrid (Autodesk Build)", "Primavera P6 / MS Project",
      "Bluebeam Revu", "BIM 360 / Navisworks", "Sage 300 CRE",
      "Safety Culture (iAuditor)", "Box / SharePoint", "Smartsheet", "Slack"
    ],
    dataAccessPermissions: {
      projectSchedules: "Full Access",
      budgetData: "Full Access",
      subcontractorRecords: "Full Access",
      drawingsAndSpecs: "Full Access",
      rfiSubmittals: "Full Access",
      changeOrders: "Full Access",
      safetyRecords: "Full Access",
      contractDocuments: "Full Access"
    },
    communicationCapabilities: [
      "Subcontractor coordination for daily construction activities",
      "Design team communication for RFI resolution and design changes",
      "Owner/developer reporting on project status and progress",
      "Inspector and code official coordination for permits and inspections",
      "Material supplier coordination for procurement and delivery",
      "Safety communication and incident reporting"
    ],
    exampleWorkflows: [
      {
        name: "Change Order Management",
        steps: [
          "Receive change request from owner, design team, or field conditions",
          "Solicit pricing from affected subcontractors with detailed scope",
          "Review subcontractor pricing and prepare change order proposal",
          "Submit change order to owner with cost and schedule impact",
          "Negotiate and obtain owner approval for change order",
          "Issue change directives to subcontractors upon approval",
          "Track change order execution and updated budget",
          "Document change order in project records and final accounting"
        ]
      },
      {
        name: "Project Closeout Process",
        steps: [
          "Develop punch list from final walkthroughs with owner and design team",
          "Assign punch list items to responsible subcontractors with deadlines",
          "Track punch list completion and verify corrections",
          "Collect closeout documents: warranties, O&M manuals, as-builts",
          "Coordinate final inspections and certificate of occupancy",
          "Process final pay applications and retainage releases",
          "Compile project closeout documentation package",
          "Conduct lessons-learned session and archive project records"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Schedule Adherence", target: "Within 5% of planned duration", weight: 20 },
      { metric: "Budget Performance", target: "Within 3% of contract value", weight: 20 },
      { metric: "RFI Response Time", target: "< 5 business days average", weight: 10 },
      { metric: "Change Order Processing", target: "< 10 business days", weight: 10 },
      { metric: "Safety Record", target: "Zero lost-time incidents", weight: 15 },
      { metric: "Quality Inspection Pass Rate", target: "> 90% first inspection", weight: 15 },
      { metric: "Punch List Closure Rate", target: "> 95% within 30 days", weight: 10 }
    ],
    useCases: [
      "AI-powered construction schedule optimization and delay prediction",
      "Automated RFI and submittal tracking with deadline management",
      "Real-time budget tracking with cost variance alerting",
      "Subcontractor performance analytics and coordination",
      "Construction safety monitoring and compliance automation"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 55, empathy: 45, directness: 85,
      creativity: 35, humor: 15, assertiveness: 75
    },
    complianceMetadata: {
      frameworks: ["OSHA Construction Standards", "ADA/ABA Standards", "IBC (International Building Code)", "State Building Codes", "EPA (Storm Water/Lead/Asbestos)", "Prevailing Wage/Davis-Bacon", "LEED/Green Building"],
      dataClassification: "Confidential — Project Financial & Construction Data",
      auditRequirements: "Daily reports maintained; change orders documented; safety records per OSHA; inspection records filed",
      retentionPolicy: "Project records: 10 years; safety records: 5 years per OSHA; contracts: term + 10 years; drawings: permanent",
      breachNotification: "VP Construction notification for project financial or contract data exposure"
    },
    skillsTags: ["construction management", "project coordination", "scheduling", "cost control", "subcontractor management", "RFI/submittal management", "safety compliance", "BIM", "project documentation"],
    priceMonthly: 1199,
    isActive: 1,
  },

  {
    title: "Tenant Relations Manager AI",
    department: "Property Management",
    category: "Real Estate & Construction",
    industry: "Real Estate",
    reportsTo: "Director of Property Management",
    seniorityLevel: "mid",
    description: "Manages tenant relationships throughout the lease lifecycle including onboarding, service requests, lease administration, and retention programs. Ensures tenant satisfaction while maintaining property standards, managing common area operations, and driving lease renewals and occupancy rates.",
    coreResponsibilities: [
      "Manage tenant onboarding, move-in coordination, and orientation",
      "Process and track tenant service requests and maintenance work orders",
      "Administer lease terms including rent escalations, options, and amendments",
      "Coordinate tenant improvement construction and alterations",
      "Monitor tenant satisfaction and implement retention programs",
      "Manage tenant communication for building operations and events",
      "Track lease expirations and coordinate renewal negotiations",
      "Resolve tenant complaints and disputes with fair and timely response",
      "Manage building rules enforcement and common area usage",
      "Report occupancy, tenant satisfaction, and retention metrics"
    ],
    tasks: [
      { name: "Service Request Management", cadence: "daily", description: "Process tenant service requests, dispatch maintenance, and track resolution times", priority: "high" },
      { name: "Tenant Communication", cadence: "daily", description: "Manage tenant notifications for building events, maintenance, and operational updates", priority: "high" },
      { name: "Move-In/Move-Out Coordination", cadence: "daily", description: "Coordinate tenant move-ins, move-outs, and suite inspections", priority: "medium" },
      { name: "Complaint Resolution", cadence: "daily", description: "Address tenant complaints, investigate issues, and facilitate timely resolution", priority: "high" },
      { name: "Lease Administration", cadence: "weekly", description: "Process rent escalations, CAM reconciliations, and lease amendment requests", priority: "high" },
      { name: "Retention Monitoring", cadence: "weekly", description: "Track lease expirations, assess renewal likelihood, and initiate retention outreach", priority: "high" },
      { name: "Tenant Satisfaction Report", cadence: "monthly", description: "Compile tenant satisfaction metrics, service quality scores, and retention rates", priority: "high" },
      { name: "Lease Renewal Pipeline", cadence: "monthly", description: "Review upcoming expirations, track renewal negotiations, and forecast occupancy", priority: "high" }
    ],
    toolsAndIntegrations: [
      "Yardi Voyager", "MRI Software", "AppFolio",
      "Building Engines", "Angus Systems", "HappyCo",
      "DocuSign", "Mailchimp", "Microsoft Power BI", "Slack"
    ],
    dataAccessPermissions: {
      tenantRecords: "Full Access",
      leaseData: "Full Access",
      serviceRequests: "Full Access",
      buildingOperations: "Full Access",
      financialData: "Authorized — tenant billing",
      vendorRecords: "Authorized — tenant services",
      insuranceData: "Authorized — tenant certificates",
      marketData: "Authorized — comparable rents"
    },
    communicationCapabilities: [
      "Tenant communication for service, operations, and community events",
      "Maintenance team coordination for work order dispatch",
      "Leasing team collaboration on renewal negotiations",
      "Management reporting on tenant satisfaction and retention",
      "Vendor coordination for tenant-requested services",
      "Emergency communication to tenants during building incidents"
    ],
    exampleWorkflows: [
      {
        name: "Tenant Onboarding",
        steps: [
          "Receive signed lease and initiate onboarding workflow",
          "Coordinate tenant improvement construction and suite preparation",
          "Set up tenant accounts: billing, access cards, directory listings",
          "Schedule move-in with loading dock, elevators, and security",
          "Conduct building orientation: amenities, procedures, contacts",
          "Distribute tenant handbook and emergency procedures",
          "Follow up at 30 and 90 days to address any concerns",
          "Update tenant satisfaction records and identify engagement opportunities"
        ]
      },
      {
        name: "Lease Renewal Process",
        steps: [
          "Identify lease expiration 12-18 months before term end",
          "Assess tenant relationship health and renewal likelihood",
          "Research market rents and prepare renewal offer economics",
          "Initiate renewal discussion with tenant decision-maker",
          "Negotiate terms: rent, length, TI allowance, concessions",
          "Prepare lease renewal or amendment documentation",
          "Execute renewal agreement and update lease records",
          "Plan any agreed-upon tenant improvements or upgrades"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Tenant Retention Rate", target: "> 85%", weight: 25 },
      { metric: "Tenant Satisfaction Score", target: "> 4.0/5.0", weight: 20 },
      { metric: "Service Request Response Time", target: "< 4 hours", weight: 15 },
      { metric: "Work Order Resolution Time", target: "< 24 hours (routine)", weight: 10 },
      { metric: "Occupancy Rate", target: "> 93%", weight: 15 },
      { metric: "Renewal Rate", target: "> 75%", weight: 10 },
      { metric: "Complaint Resolution Time", target: "< 48 hours", weight: 5 }
    ],
    useCases: [
      "AI-powered tenant satisfaction monitoring and proactive engagement",
      "Automated service request processing and maintenance dispatch",
      "Lease administration automation with renewal pipeline tracking",
      "Tenant communication platform with personalized outreach",
      "Retention analytics with churn prediction and intervention"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 65, empathy: 80, directness: 60,
      creativity: 40, humor: 25, assertiveness: 55
    },
    complianceMetadata: {
      frameworks: ["Fair Housing Act", "ADA", "State Landlord-Tenant Law", "CCPA", "GDPR", "OSHA", "Local Building Codes", "Environmental Regulations (Mold/Asbestos)"],
      dataClassification: "PII — Tenant Personal & Lease Data",
      auditRequirements: "Tenant communications logged; service requests tracked; lease modifications documented",
      retentionPolicy: "Tenant records: tenancy + 7 years; leases: term + 10 years; service requests: 3 years",
      breachNotification: "Property management director notification for tenant PII or lease data exposure"
    },
    skillsTags: ["tenant relations", "property management", "lease administration", "customer service", "retention management", "work order management", "building operations", "community management", "real estate"],
    priceMonthly: 899,
    isActive: 1,
  },

  {
    title: "Building Permit Specialist AI",
    department: "Permitting & Regulatory",
    category: "Real Estate & Construction",
    industry: "Construction",
    reportsTo: "Director of Development",
    seniorityLevel: "mid",
    description: "Manages building permit applications, entitlement processes, and regulatory approvals for development and construction projects. Navigates municipal code requirements, coordinates with plan review agencies, tracks permit status, and ensures regulatory compliance throughout the development process.",
    coreResponsibilities: [
      "Prepare and submit building permit applications with required documentation",
      "Navigate municipal zoning codes, building codes, and entitlement requirements",
      "Coordinate with plan review agencies across building, fire, health, and planning",
      "Track permit application status and manage response to plan check comments",
      "Manage variance, conditional use permit, and zoning change applications",
      "Coordinate environmental review and CEQA/NEPA compliance processes",
      "Track permit fees, impact fees, and development exaction requirements",
      "Manage inspection scheduling and certificate of occupancy processes",
      "Monitor building code changes and assess impact on active projects",
      "Report permitting status, timelines, and risk factors to project teams"
    ],
    tasks: [
      { name: "Permit Application Processing", cadence: "daily", description: "Prepare permit packages, submit applications, and track filing status", priority: "high" },
      { name: "Plan Check Response", cadence: "daily", description: "Review plan check comments, coordinate corrections with design team, resubmit", priority: "high" },
      { name: "Agency Coordination", cadence: "daily", description: "Communicate with building departments, fire marshal, health dept on permit issues", priority: "high" },
      { name: "Inspection Scheduling", cadence: "daily", description: "Schedule required inspections, coordinate with field teams, and track results", priority: "medium" },
      { name: "Permit Status Tracking", cadence: "weekly", description: "Update permit tracking log with status changes, timelines, and outstanding items", priority: "high" },
      { name: "Code Research", cadence: "weekly", description: "Research building code requirements for new projects and code change impacts", priority: "medium" },
      { name: "Permitting Pipeline Report", cadence: "monthly", description: "Compile permitting status across all projects with timeline forecasts", priority: "high" },
      { name: "Fee Tracking & Budget", cadence: "monthly", description: "Track permit fees, impact fees, and development costs against project budgets", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Accela (Civic Platform)", "Tyler Technologies (EnerGov)", "ProjectDox",
      "Bluebeam Revu", "AutoCAD / Revit", "ICC Digital Codes",
      "ESRI ArcGIS", "Smartsheet", "DocuSign", "Slack"
    ],
    dataAccessPermissions: {
      permitApplications: "Full Access",
      projectDocuments: "Full Access",
      zoningData: "Full Access",
      buildingCodes: "Full Access",
      feeSchedules: "Full Access",
      inspectionRecords: "Full Access",
      environmentalStudies: "Full Access",
      projectBudgets: "Authorized — permitting costs"
    },
    communicationCapabilities: [
      "Municipal agency communication for permit applications and reviews",
      "Design team coordination for plan check response and corrections",
      "Project team updates on permitting status and timelines",
      "Legal team coordination for entitlement and variance hearings",
      "Public hearing preparation and community meeting support",
      "Management reporting on permitting pipeline and risks"
    ],
    exampleWorkflows: [
      {
        name: "Building Permit Application Process",
        steps: [
          "Review project documents for code compliance completeness",
          "Prepare permit application with all required forms and exhibits",
          "Calculate and prepare permit fee payments",
          "Submit application to building department with supporting documents",
          "Track plan check assignment and estimated review timeline",
          "Receive and distribute plan check comments to design team",
          "Coordinate corrections and prepare resubmittal package",
          "Obtain permit issuance and distribute to construction team"
        ]
      },
      {
        name: "Entitlement Process Management",
        steps: [
          "Research zoning requirements and identify entitlement needs",
          "Prepare entitlement application (CUP, variance, zone change)",
          "Coordinate environmental review (CEQA/NEPA) if required",
          "Submit application to planning department",
          "Prepare for public hearing: presentation, community outreach",
          "Attend planning commission or board hearing",
          "Track conditions of approval and ensure compliance",
          "Document entitlement approvals in project records"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Permit Approval Rate", target: "> 95%", weight: 20 },
      { metric: "Average Permit Timeline", target: "Within projected schedule", weight: 20 },
      { metric: "Plan Check Resubmittal Count", target: "< 2 average", weight: 15 },
      { metric: "Inspection Pass Rate", target: "> 90% first inspection", weight: 10 },
      { metric: "Code Compliance Accuracy", target: "> 98%", weight: 15 },
      { metric: "Fee Budget Accuracy", target: "Within 10%", weight: 10 },
      { metric: "Project Team Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "Automated permit application preparation and tracking",
      "Building code research and compliance checking",
      "Plan check comment response coordination and management",
      "Municipal process timeline prediction and milestone tracking",
      "Entitlement process management with hearing preparation"
    ],
    personalityDefaults: {
      formality: 80, enthusiasm: 45, empathy: 40, directness: 80,
      creativity: 30, humor: 10, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["IBC (International Building Code)", "State Building Codes", "ADA/ABA Accessibility", "CEQA/NEPA", "Zoning Ordinances", "Fire Code", "Energy Code (Title 24/IECC)"],
      dataClassification: "Confidential — Development & Regulatory Data",
      auditRequirements: "Permit applications documented; agency correspondence filed; inspection records maintained",
      retentionPolicy: "Permits: permanent; applications: 10 years; inspection records: building life; entitlements: permanent",
      breachNotification: "Director notification for project development or entitlement strategy exposure"
    },
    skillsTags: ["building permits", "code compliance", "entitlements", "plan review", "zoning", "construction permitting", "regulatory approvals", "building codes", "municipal process"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Real Estate Market Analyst AI",
    department: "Market Research",
    category: "Real Estate & Construction",
    industry: "Real Estate",
    reportsTo: "VP of Investments",
    seniorityLevel: "mid",
    description: "Analyzes real estate market conditions, trends, and opportunities across property types and geographies. Provides market intelligence that supports investment decisions, development strategies, and portfolio management through comprehensive research on supply, demand, pricing, demographics, and economic factors.",
    coreResponsibilities: [
      "Analyze real estate market conditions by property type, submarket, and geography",
      "Track supply and demand fundamentals: absorption, construction, vacancy",
      "Monitor rental rate trends, concession levels, and effective rents",
      "Analyze demographic and economic data driving real estate demand",
      "Evaluate investment and development opportunities with market support",
      "Prepare market studies and feasibility analyses for proposed projects",
      "Monitor competitive properties and new development pipeline",
      "Track capital markets conditions: cap rates, financing, investor sentiment",
      "Identify emerging market trends and investment theme opportunities",
      "Generate market intelligence reports for investment committee"
    ],
    tasks: [
      { name: "Market Data Monitoring", cadence: "daily", description: "Track real estate market news, transaction activity, and market indicator changes", priority: "medium" },
      { name: "Competitive Intelligence", cadence: "daily", description: "Monitor competitive property activity: leasing, pricing, new listings, construction starts", priority: "medium" },
      { name: "Deal Screening Support", cadence: "daily", description: "Provide market data and analysis for investment opportunity screening", priority: "high" },
      { name: "Submarket Analysis", cadence: "weekly", description: "Analyze submarket fundamentals: vacancy, absorption, new supply, rent growth", priority: "high" },
      { name: "Demographic Research", cadence: "weekly", description: "Research population, employment, income, and migration trends for target markets", priority: "medium" },
      { name: "Capital Markets Tracking", cadence: "weekly", description: "Monitor cap rate trends, debt markets, investor activity, and transaction volume", priority: "high" },
      { name: "Market Intelligence Report", cadence: "monthly", description: "Compile comprehensive market report with trends, forecasts, and investment implications", priority: "high" },
      { name: "Pipeline & Supply Analysis", cadence: "monthly", description: "Track development pipeline, planned projects, and future supply impact on markets", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "CoStar Suite", "Real Capital Analytics (MSCI)", "Green Street",
      "REIS (Moody's Analytics)", "Census Bureau / BLS", "Esri ArcGIS",
      "Yardi Matrix", "PitchBook", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      marketData: "Full Access",
      transactionData: "Full Access",
      portfolioData: "Authorized — market comparison",
      demographicData: "Full Access",
      economicData: "Full Access",
      competitiveData: "Full Access",
      investmentPipeline: "Authorized",
      financialModels: "Restricted — market assumptions"
    },
    communicationCapabilities: [
      "Investment team support with market research and analysis",
      "Development team market feasibility support",
      "Asset management support with competitive market intelligence",
      "Executive reporting on market trends and investment themes",
      "Broker and industry contact relationship management",
      "Investment committee presentation support"
    ],
    exampleWorkflows: [
      {
        name: "Market Feasibility Study",
        steps: [
          "Define study parameters: property type, location, and development concept",
          "Analyze submarket supply and demand fundamentals",
          "Research competitive properties: features, pricing, occupancy",
          "Evaluate demographic and economic demand drivers",
          "Estimate achievable rents, absorption timeline, and stabilized occupancy",
          "Assess development pipeline and future competitive supply",
          "Prepare market feasibility report with data-supported conclusions",
          "Present findings to development and investment teams"
        ]
      },
      {
        name: "Investment Market Screening",
        steps: [
          "Define investment criteria: property type, geography, return targets",
          "Screen target markets using economic and demographic indicators",
          "Rank markets by supply/demand fundamentals and growth trajectory",
          "Deep-dive top markets with detailed submarket analysis",
          "Identify specific investment opportunities within target markets",
          "Prepare market profiles with investment thesis for each target",
          "Present market screening results to investment committee",
          "Monitor selected markets for deal flow and market changes"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Forecast Accuracy", target: "Within 10% for key metrics", weight: 20 },
      { metric: "Report Delivery Timeliness", target: "> 95% on schedule", weight: 15 },
      { metric: "Data Source Coverage", target: "> 5 primary sources per analysis", weight: 10 },
      { metric: "Investment Support Responsiveness", target: "< 24 hours for requests", weight: 15 },
      { metric: "Market Coverage", target: "All active and target markets tracked", weight: 15 },
      { metric: "Stakeholder Satisfaction", target: "> 4.0/5.0", weight: 10 },
      { metric: "Trend Identification Timeliness", target: "Ahead of consensus", weight: 15 }
    ],
    useCases: [
      "AI-powered real estate market analysis with predictive analytics",
      "Automated market data aggregation and trend identification",
      "Investment opportunity screening with market scoring models",
      "Competitive property monitoring and intelligence gathering",
      "Demographic and economic research for market feasibility"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 50, empathy: 35, directness: 80,
      creativity: 45, humor: 15, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["SEC (Investment Adviser)", "CCPA", "GDPR", "Fair Housing Act", "State Real Estate Regulations", "Antitrust (Market Data Sharing)", "SOX"],
      dataClassification: "Confidential — Market Intelligence & Investment Strategy Data",
      auditRequirements: "Data sources documented; analysis methodology traceable; investment recommendations recorded",
      retentionPolicy: "Market reports: 5 years; analysis work files: 5 years; investment screening: 7 years",
      breachNotification: "VP Investments notification for investment strategy or market intelligence exposure"
    },
    skillsTags: ["market analysis", "real estate research", "investment analysis", "demographics", "economic analysis", "competitive intelligence", "feasibility studies", "commercial real estate", "data analytics"],
    priceMonthly: 1199,
    isActive: 1,
  },

  // ═══════════════════════════════════════════════════════════
  //  AGRICULTURE & AGRITECH (5 roles)
  // ═══════════════════════════════════════════════════════════

  {
    title: "Crop Monitoring Specialist AI",
    department: "Crop Management",
    category: "Agriculture & Agritech",
    industry: "Agriculture",
    reportsTo: "Director of Agronomy",
    seniorityLevel: "mid",
    description: "Monitors crop health, growth stages, and field conditions using remote sensing, IoT sensors, and field data. Analyzes vegetation indices, soil moisture, pest/disease indicators, and weather patterns to provide actionable crop management recommendations that optimize yield and reduce input costs.",
    coreResponsibilities: [
      "Monitor crop health using satellite imagery, drone data, and field sensors",
      "Analyze vegetation indices (NDVI, EVI) and detect crop stress patterns",
      "Track crop growth stages and compare against expected development timelines",
      "Monitor soil moisture levels and recommend irrigation adjustments",
      "Identify pest and disease outbreaks through visual and sensor-based detection",
      "Analyze weather data and forecast impacts on crop development",
      "Generate field-level crop health maps and management zone recommendations",
      "Track nutrient status and recommend fertilizer application adjustments",
      "Support harvest timing decisions based on crop maturity indicators",
      "Report crop performance metrics and yield estimates"
    ],
    tasks: [
      { name: "Field Condition Monitoring", cadence: "daily", description: "Review sensor data, weather conditions, and alert systems for field anomalies", priority: "high" },
      { name: "Satellite Imagery Analysis", cadence: "daily", description: "Process and analyze satellite and drone imagery for crop health assessment", priority: "high" },
      { name: "Irrigation Monitoring", cadence: "daily", description: "Review soil moisture data and weather forecasts, recommend irrigation schedules", priority: "high" },
      { name: "Pest & Disease Alert Review", cadence: "daily", description: "Monitor pest/disease detection systems and regional advisory bulletins", priority: "critical" },
      { name: "Growth Stage Assessment", cadence: "weekly", description: "Assess crop development stage, compare against calendar, and update yield estimates", priority: "high" },
      { name: "Nutrient Status Review", cadence: "weekly", description: "Analyze tissue sample results, soil tests, and sensor data for nutrient management", priority: "medium" },
      { name: "Crop Performance Report", cadence: "monthly", description: "Compile crop health dashboard: growth metrics, stress events, yield forecasts", priority: "high" },
      { name: "Seasonal Crop Plan Review", cadence: "monthly", description: "Review seasonal crop plans against actuals, adjust recommendations for remaining season", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Planet Labs (Satellite Imagery)", "DJI / senseFly Drones", "John Deere Operations Center",
      "Climate FieldView", "CropX / Sentek Sensors", "Arable Mark",
      "ENVI / QGIS", "Davis WeatherLink", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      fieldData: "Full Access",
      sensorData: "Full Access",
      satelliteImagery: "Full Access",
      weatherData: "Full Access",
      soilData: "Full Access",
      cropRecords: "Full Access",
      inputApplications: "Authorized",
      yieldData: "Full Access"
    },
    communicationCapabilities: [
      "Farm management team coordination for crop decisions",
      "Agronomist collaboration on crop management recommendations",
      "Equipment operators guidance for field applications",
      "Management reporting on crop performance and yields",
      "Automated pest/disease and weather alert notifications",
      "Input supplier coordination for product recommendations"
    ],
    exampleWorkflows: [
      {
        name: "Pest Outbreak Response",
        steps: [
          "Detect pest or disease indicators through monitoring systems",
          "Verify detection with field scouting data and imagery analysis",
          "Identify pest/disease type and assess severity and spread risk",
          "Research treatment options considering IPM principles and regulations",
          "Recommend treatment plan with product, rate, timing, and application method",
          "Coordinate application with equipment operators",
          "Monitor treatment effectiveness through follow-up imagery and scouting",
          "Document outbreak, response, and outcomes for future reference"
        ]
      },
      {
        name: "Yield Estimation Process",
        steps: [
          "Collect current crop condition data from sensors and imagery",
          "Assess crop stage development and remaining growing season",
          "Analyze historical yield data for similar conditions and varieties",
          "Factor in weather forecast and remaining stress risk",
          "Build yield estimate model using vegetation indices and field data",
          "Generate field-level and farm-level yield projections",
          "Compare estimates against crop plan targets",
          "Update yield estimates as new data becomes available"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Yield Forecast Accuracy", target: "Within 10% of actual", weight: 20 },
      { metric: "Pest/Disease Detection Timeliness", target: "< 48 hours from onset", weight: 20 },
      { metric: "Irrigation Recommendation Accuracy", target: "> 90% optimal", weight: 15 },
      { metric: "Crop Stress Detection Rate", target: "> 95%", weight: 15 },
      { metric: "Input Cost Reduction", target: "> 5% vs conventional", weight: 10 },
      { metric: "Field Coverage", target: "100% of managed acres monitored", weight: 10 },
      { metric: "Data Delivery Timeliness", target: "< 24 hours from collection", weight: 10 }
    ],
    useCases: [
      "AI-powered crop health monitoring with satellite and drone imagery",
      "Predictive pest and disease detection using ML models",
      "Precision irrigation management with soil moisture analytics",
      "Yield estimation and harvest planning optimization",
      "Variable rate application recommendations for inputs"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 55, empathy: 50, directness: 75,
      creativity: 45, humor: 20, assertiveness: 60
    },
    complianceMetadata: {
      frameworks: ["USDA Regulations", "EPA (Pesticide/Fertilizer)", "State Agricultural Regulations", "FDA (Food Safety)", "FIFRA", "Organic Certification (NOP)", "Water Quality Regulations"],
      dataClassification: "Confidential — Farm Operations & Crop Data",
      auditRequirements: "Application records maintained per EPA; crop monitoring data traceable; input recommendations documented",
      retentionPolicy: "Crop records: 7 years; application records: 3 years per EPA; sensor data: 5 years; imagery: 3 years",
      breachNotification: "Director notification for proprietary crop management or yield data exposure"
    },
    skillsTags: ["crop monitoring", "remote sensing", "precision agriculture", "agronomy", "pest management", "irrigation management", "GIS", "yield estimation", "sensor analytics"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Precision Agriculture Advisor AI",
    department: "Precision Ag Technology",
    category: "Agriculture & Agritech",
    industry: "Agriculture",
    reportsTo: "VP of Farm Operations",
    seniorityLevel: "senior",
    description: "Provides strategic precision agriculture advisory services, helping farms adopt and optimize technology-driven farming practices. Analyzes field variability, develops variable-rate application prescriptions, optimizes equipment utilization, and delivers data-driven recommendations that maximize profitability per acre.",
    coreResponsibilities: [
      "Develop precision agriculture strategies tailored to farm operations",
      "Create variable-rate application prescriptions for seeding, fertilizer, and chemicals",
      "Analyze field variability using soil sampling, yield maps, and remote sensing",
      "Optimize equipment guidance, auto-steer, and section control configurations",
      "Evaluate and recommend precision ag technology investments",
      "Analyze agronomic trial data and develop best management practices",
      "Calculate ROI on precision agriculture technology and practices",
      "Support data management and integration across farm technology platforms",
      "Train farm teams on precision ag equipment and data interpretation",
      "Report precision agriculture performance and economic impact"
    ],
    tasks: [
      { name: "Prescription Development", cadence: "daily", description: "Create and refine VRA prescriptions for upcoming field applications", priority: "high" },
      { name: "Data Integration Review", cadence: "daily", description: "Process and integrate incoming field data from equipment, sensors, and sampling", priority: "high" },
      { name: "Equipment Optimization", cadence: "daily", description: "Review equipment performance data, optimize settings and configurations", priority: "medium" },
      { name: "Field Variability Analysis", cadence: "weekly", description: "Analyze field variability data to refine management zones and recommendations", priority: "high" },
      { name: "Trial Design & Analysis", cadence: "weekly", description: "Design on-farm trials, analyze results, and develop practice recommendations", priority: "medium" },
      { name: "Technology Assessment", cadence: "weekly", description: "Evaluate new precision ag technologies and assess adoption potential", priority: "medium" },
      { name: "ROI Analysis Report", cadence: "monthly", description: "Calculate and report ROI on precision ag practices by field and technology", priority: "high" },
      { name: "Strategic Advisory Report", cadence: "monthly", description: "Compile advisory report with recommendations, performance data, and technology roadmap", priority: "high" }
    ],
    toolsAndIntegrations: [
      "John Deere Operations Center", "Climate FieldView", "Ag Leader Technology",
      "Trimble Ag Software", "Granular (Corteva)", "SST Software",
      "SWAT Maps", "R/Python Analytics", "QGIS", "Slack"
    ],
    dataAccessPermissions: {
      fieldData: "Full Access",
      yieldData: "Full Access",
      soilData: "Full Access",
      applicationRecords: "Full Access",
      equipmentData: "Full Access",
      financialData: "Authorized — per-acre economics",
      trialData: "Full Access",
      technologyInventory: "Full Access"
    },
    communicationCapabilities: [
      "Farm management strategic advisory communication",
      "Equipment operator guidance for precision applications",
      "Agronomist collaboration on management recommendations",
      "Technology vendor coordination for equipment and software",
      "Management reporting on precision ag ROI and performance",
      "Training and education delivery for farm teams"
    ],
    exampleWorkflows: [
      {
        name: "Variable Rate Seeding Prescription",
        steps: [
          "Compile field data layers: yield history, soil types, elevation, imagery",
          "Delineate management zones based on productivity potential",
          "Analyze zone-specific yield response to seeding rates",
          "Develop optimal seeding rate for each management zone",
          "Create VRA prescription file compatible with planting equipment",
          "Review prescription with farm manager and agronomist",
          "Load prescription to equipment and verify during planting",
          "Analyze yield results against prescription for future refinement"
        ]
      },
      {
        name: "Precision Ag Technology Adoption",
        steps: [
          "Assess current technology stack and farm data management",
          "Identify technology gaps and improvement opportunities",
          "Research and evaluate technology solutions and vendors",
          "Calculate expected ROI and payback period for recommendations",
          "Present technology adoption plan with phased implementation",
          "Coordinate technology procurement and installation",
          "Train farm teams on new technology operation and data use",
          "Monitor adoption success and measure actual ROI"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Yield Improvement (Precision vs Uniform)", target: "> 5%", weight: 20 },
      { metric: "Input Cost Reduction", target: "> 8% through VRA", weight: 20 },
      { metric: "ROI on Precision Ag Investment", target: "> 200%", weight: 15 },
      { metric: "Prescription Accuracy", target: "> 90% agronomically optimal", weight: 15 },
      { metric: "Technology Adoption Rate", target: "> 80% of recommended practices", weight: 10 },
      { metric: "Data Coverage", target: "100% of managed acres", weight: 10 },
      { metric: "Farm Team Satisfaction", target: "> 4.0/5.0", weight: 10 }
    ],
    useCases: [
      "AI-optimized variable rate application prescriptions",
      "Field variability analysis with multi-layer data integration",
      "On-farm trial design and statistical analysis",
      "Precision ag technology evaluation and ROI calculation",
      "Farm data management and analytics platform advisory"
    ],
    personalityDefaults: {
      formality: 65, enthusiasm: 65, empathy: 50, directness: 75,
      creativity: 55, humor: 20, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["USDA Conservation Compliance", "EPA (Pesticide/Nutrient)", "State Agricultural Regulations", "Data Privacy (Farm Data)", "Organic Certification (NOP)", "4R Nutrient Stewardship", "FIFRA"],
      dataClassification: "Confidential — Proprietary Farm Operations & Technology Data",
      auditRequirements: "VRA prescriptions documented; trial protocols recorded; technology recommendations traceable",
      retentionPolicy: "Prescriptions: 5 years; trial data: 10 years; field data: indefinite; technology assessments: 5 years",
      breachNotification: "VP notification for proprietary farm data or precision ag strategy exposure"
    },
    skillsTags: ["precision agriculture", "variable rate application", "agronomy", "farm data analytics", "GIS", "yield optimization", "ag technology", "field variability", "on-farm trials"],
    priceMonthly: 1399,
    isActive: 1,
  },

  {
    title: "Agricultural Supply Chain Manager AI",
    department: "Agricultural Supply Chain",
    category: "Agriculture & Agritech",
    industry: "Agriculture",
    reportsTo: "VP of Operations",
    seniorityLevel: "senior",
    description: "Manages the agricultural supply chain from farm to market, coordinating input procurement, harvest logistics, grain marketing, storage management, and transportation. Optimizes supply chain efficiency while managing quality, traceability, and compliance with food safety and agricultural regulations.",
    coreResponsibilities: [
      "Manage agricultural input procurement: seed, fertilizer, chemicals, fuel",
      "Coordinate harvest logistics including equipment, labor, and storage allocation",
      "Manage grain marketing and commodity sales strategies",
      "Oversee storage facility operations and inventory management",
      "Coordinate transportation and logistics for crop movement to market",
      "Track crop quality parameters and manage grading processes",
      "Implement traceability systems from field to end customer",
      "Manage supplier relationships and negotiate procurement contracts",
      "Monitor commodity markets and advise on marketing timing",
      "Report supply chain performance, costs, and profitability"
    ],
    tasks: [
      { name: "Commodity Market Monitoring", cadence: "daily", description: "Monitor commodity futures, basis levels, and market factors affecting crop pricing", priority: "high" },
      { name: "Logistics Coordination", cadence: "daily", description: "Coordinate truck scheduling, rail loading, and barge/vessel logistics for grain movement", priority: "high" },
      { name: "Storage Condition Monitoring", cadence: "daily", description: "Monitor grain storage conditions: temperature, moisture, aeration status", priority: "high" },
      { name: "Quality Management", cadence: "daily", description: "Track quality testing results, manage grading, and coordinate quality issues", priority: "medium" },
      { name: "Input Procurement Management", cadence: "weekly", description: "Manage input orders, track deliveries, and coordinate with suppliers", priority: "high" },
      { name: "Marketing Strategy Review", cadence: "weekly", description: "Review market conditions, hedge positions, and marketing strategy execution", priority: "high" },
      { name: "Supply Chain Performance Report", cadence: "monthly", description: "Compile supply chain KPIs: costs, quality, throughput, and profitability", priority: "high" },
      { name: "Traceability Audit", cadence: "monthly", description: "Verify traceability system accuracy and completeness from field to customer", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Bushel (Grain Management)", "Agris / Agvance", "DTN (Market Data)",
      "FarmLogs / Granular", "EFC Systems", "SAP Agriculture",
      "CME Group (Futures)", "TMW Systems (Transportation)", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      commodityData: "Full Access",
      inventoryData: "Full Access",
      contractData: "Full Access",
      logisticsData: "Full Access",
      qualityData: "Full Access",
      supplierData: "Full Access",
      financialData: "Full Access — ag operations",
      traceabilityData: "Full Access"
    },
    communicationCapabilities: [
      "Commodity buyer and trader communication",
      "Supplier negotiation and relationship management",
      "Transportation provider coordination",
      "Farm operations team coordination for harvest logistics",
      "Management reporting on marketing and supply chain performance",
      "Regulatory communication for food safety and traceability"
    ],
    exampleWorkflows: [
      {
        name: "Harvest Logistics Management",
        steps: [
          "Develop harvest plan based on crop maturity and equipment availability",
          "Allocate storage capacity across facilities based on expected volumes",
          "Coordinate combine, cart, and truck logistics for efficient harvest flow",
          "Monitor incoming grain quality and direct to appropriate storage",
          "Manage storage filling, aeration, and quality preservation",
          "Track harvest progress by field and compare against yield estimates",
          "Coordinate early grain movement to create storage capacity as needed",
          "Compile harvest summary with yields, quality, and storage inventory"
        ]
      },
      {
        name: "Grain Marketing Execution",
        steps: [
          "Analyze commodity market conditions and price outlook",
          "Review farm's marketing plan and remaining unsold inventory",
          "Evaluate basis levels and delivery opportunities",
          "Recommend marketing actions: cash sales, forward contracts, or storage",
          "Execute approved sales and coordinate delivery logistics",
          "Track contract obligations and delivery schedules",
          "Monitor hedge positions and margin accounts",
          "Report marketing performance against target prices"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Marketing Price vs Benchmark", target: "> seasonal average price", weight: 20 },
      { metric: "Storage Loss Rate", target: "< 0.5%", weight: 15 },
      { metric: "Input Procurement Savings", target: "> 3% vs market average", weight: 15 },
      { metric: "Logistics Cost per Bushel", target: "< budget target", weight: 15 },
      { metric: "Quality Premium Capture", target: "> 90% of eligible premiums", weight: 10 },
      { metric: "Traceability Completeness", target: "100%", weight: 10 },
      { metric: "Delivery Timeliness", target: "> 95% on contract", weight: 15 }
    ],
    useCases: [
      "AI-optimized grain marketing with commodity price forecasting",
      "Harvest logistics optimization with real-time coordination",
      "Storage management with quality preservation monitoring",
      "Agricultural input procurement optimization and cost management",
      "Supply chain traceability from field to market"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 50, empathy: 45, directness: 80,
      creativity: 40, humor: 15, assertiveness: 70
    },
    complianceMetadata: {
      frameworks: ["USDA Grading Standards", "FDA FSMA", "EPA (Pesticide Records)", "CFTC (Commodity Trading)", "State Grain Warehouse Laws", "DOT (Transportation)", "FIFRA", "Country of Origin Labeling"],
      dataClassification: "Confidential — Agricultural Operations & Market Strategy Data",
      auditRequirements: "Grain transactions documented; quality records maintained; traceability verified; CFTC positions reported",
      retentionPolicy: "Transaction records: 7 years; quality records: 5 years; traceability: 3 years; contracts: term + 5 years",
      breachNotification: "VP Operations notification for marketing strategy or commodity position exposure"
    },
    skillsTags: ["agricultural supply chain", "grain marketing", "commodity trading", "logistics", "storage management", "procurement", "food safety", "traceability", "farm operations"],
    priceMonthly: 1299,
    isActive: 1,
  },

  {
    title: "Livestock Health Monitor AI",
    department: "Animal Health",
    category: "Agriculture & Agritech",
    industry: "Agriculture",
    reportsTo: "Director of Livestock Operations",
    seniorityLevel: "mid",
    description: "Monitors livestock health and welfare using sensor technology, behavioral analytics, and production data. Detects early signs of disease, tracks vaccination and treatment protocols, monitors animal welfare indicators, and provides health management recommendations that optimize animal performance and well-being.",
    coreResponsibilities: [
      "Monitor individual and herd-level health indicators using sensor data",
      "Detect early signs of disease through behavioral and physiological changes",
      "Track vaccination schedules, treatments, and health protocols",
      "Analyze production data (milk yield, weight gain, feed conversion) for health indicators",
      "Monitor animal welfare parameters: housing, comfort, behavior patterns",
      "Coordinate with veterinarians on diagnosis, treatment, and prevention",
      "Manage medication inventory and withdrawal period compliance",
      "Track disease prevalence, mortality rates, and herd health trends",
      "Support biosecurity protocols and disease prevention programs",
      "Report animal health metrics and welfare compliance status"
    ],
    tasks: [
      { name: "Health Alert Monitoring", cadence: "daily", description: "Review sensor alerts, behavioral anomalies, and health indicator deviations", priority: "critical" },
      { name: "Treatment Protocol Tracking", cadence: "daily", description: "Track active treatments, medication schedules, and withdrawal periods", priority: "high" },
      { name: "Production Data Analysis", cadence: "daily", description: "Analyze production metrics for health-related deviations (milk drop, feed refusal, weight loss)", priority: "high" },
      { name: "Welfare Assessment", cadence: "daily", description: "Monitor welfare indicators: lameness scoring, body condition, environmental conditions", priority: "medium" },
      { name: "Vaccination Schedule Management", cadence: "weekly", description: "Track upcoming vaccinations, coordinate with vet, and update records", priority: "high" },
      { name: "Disease Surveillance", cadence: "weekly", description: "Monitor disease prevalence trends, regional alerts, and biosecurity status", priority: "high" },
      { name: "Herd Health Report", cadence: "monthly", description: "Compile herd health dashboard: disease rates, treatments, mortality, welfare scores", priority: "high" },
      { name: "Biosecurity Review", cadence: "monthly", description: "Audit biosecurity protocols, visitor logs, and quarantine compliance", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "Allflex Livestock Intelligence", "SCR (Merck Animal Health)", "CowManager",
      "DairyComp / PCDART", "VAS (Valley Ag Software)", "Feedlot Management Systems",
      "USDA APHIS Reporting", "BovControl", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      animalRecords: "Full Access",
      healthData: "Full Access",
      sensorData: "Full Access",
      treatmentRecords: "Full Access",
      productionData: "Full Access",
      feedData: "Authorized",
      veterinaryRecords: "Full Access",
      biosecurityLogs: "Full Access"
    },
    communicationCapabilities: [
      "Veterinarian coordination for diagnosis and treatment plans",
      "Farm crew guidance on animal handling and treatment protocols",
      "Management reporting on herd health and welfare metrics",
      "Regulatory reporting for disease notification requirements",
      "Feed team coordination for nutrition-related health issues",
      "Automated health alert and treatment reminder notifications"
    ],
    exampleWorkflows: [
      {
        name: "Disease Outbreak Response",
        steps: [
          "Detect health anomaly through sensor alerts or production data deviation",
          "Isolate affected animals per biosecurity protocol",
          "Collect diagnostic samples and coordinate with veterinarian",
          "Implement treatment protocol based on diagnosis",
          "Monitor affected and at-risk animals for disease spread",
          "Track treatment response and adjust protocols as needed",
          "Document outbreak timeline, affected animals, and treatments",
          "Review biosecurity and prevention measures to prevent recurrence"
        ]
      },
      {
        name: "Preventive Health Program Management",
        steps: [
          "Develop annual herd health calendar with veterinary team",
          "Schedule vaccinations, deworming, and preventive treatments",
          "Coordinate with farm crew on animal handling and scheduling",
          "Execute preventive protocols per scheduled timeline",
          "Document all treatments with product, dose, route, and withdrawal",
          "Monitor herd for adverse reactions post-treatment",
          "Track health program effectiveness against disease targets",
          "Review and update protocols annually based on outcomes"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Early Disease Detection Rate", target: "> 90%", weight: 25 },
      { metric: "Mortality Rate", target: "< species/production standard", weight: 20 },
      { metric: "Treatment Success Rate", target: "> 85%", weight: 15 },
      { metric: "Withdrawal Period Compliance", target: "100%", weight: 15 },
      { metric: "Vaccination Coverage", target: "> 98%", weight: 10 },
      { metric: "Animal Welfare Score", target: "> industry benchmark", weight: 10 },
      { metric: "Disease Incidence Trend", target: "Declining year over year", weight: 5 }
    ],
    useCases: [
      "AI-powered early disease detection using behavioral and sensor analytics",
      "Automated vaccination and treatment schedule management",
      "Livestock welfare monitoring with environmental and behavioral scoring",
      "Herd health analytics with predictive disease modeling",
      "Biosecurity management and disease surveillance automation"
    ],
    personalityDefaults: {
      formality: 70, enthusiasm: 55, empathy: 70, directness: 75,
      creativity: 35, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["USDA APHIS", "FDA (Veterinary Feed Directive)", "State Veterinary Regulations", "Animal Welfare Act", "FIFRA", "National Organic Program", "Beef/Dairy Quality Assurance Programs", "HACCP (Processing)"],
      dataClassification: "Confidential — Livestock Operations & Health Data",
      auditRequirements: "Treatment records maintained per FDA; vaccination records per USDA; welfare assessments documented",
      retentionPolicy: "Health records: animal life + 2 years; treatment records: 2 years per FDA; vaccination: 5 years; mortality: 5 years",
      breachNotification: "Director notification for proprietary livestock health or production data exposure"
    },
    skillsTags: ["livestock health", "animal welfare", "veterinary coordination", "sensor analytics", "disease detection", "herd management", "biosecurity", "precision livestock", "production monitoring"],
    priceMonthly: 999,
    isActive: 1,
  },

  {
    title: "Farm Financial Planner AI",
    department: "Farm Finance",
    category: "Agriculture & Agritech",
    industry: "Agriculture",
    reportsTo: "Farm Owner / CFO",
    seniorityLevel: "senior",
    description: "Manages farm financial planning, budgeting, and analysis to optimize profitability and long-term financial sustainability. Handles enterprise budgets, cash flow forecasting, crop insurance management, government program enrollment, capital planning, and financial reporting for agricultural operations.",
    coreResponsibilities: [
      "Develop annual farm operating budgets by enterprise and field",
      "Manage cash flow forecasting and working capital planning",
      "Analyze enterprise profitability and cost of production by crop/livestock",
      "Administer crop insurance programs and coverage selection",
      "Manage enrollment in government farm programs (ARC/PLC, CRP, EQIP)",
      "Support capital expenditure planning and equipment purchase decisions",
      "Track input costs and analyze cost trends for budget planning",
      "Manage farm financial record-keeping and chart of accounts",
      "Coordinate with lenders on operating loans and term financing",
      "Generate financial reports for management, lenders, and tax preparation"
    ],
    tasks: [
      { name: "Cash Flow Monitoring", cadence: "daily", description: "Track cash receipts and disbursements, update cash flow projection", priority: "high" },
      { name: "Expense Tracking", cadence: "daily", description: "Record and categorize expenses by enterprise, field, and cost category", priority: "high" },
      { name: "Market Impact Analysis", cadence: "daily", description: "Assess impact of commodity price changes on revenue projections and marketing decisions", priority: "medium" },
      { name: "Invoice & Payment Processing", cadence: "daily", description: "Process vendor invoices, manage payment schedules, and track outstanding payables", priority: "medium" },
      { name: "Budget Variance Analysis", cadence: "weekly", description: "Compare actual expenses against budget, identify variances, and explain causes", priority: "high" },
      { name: "Loan Covenant Tracking", cadence: "weekly", description: "Monitor loan covenant compliance, track balance sheets, and update lender reporting", priority: "medium" },
      { name: "Farm Financial Report", cadence: "monthly", description: "Prepare financial statements: income statement, balance sheet, cash flow by enterprise", priority: "high" },
      { name: "Insurance & Program Review", cadence: "monthly", description: "Track crop insurance coverage, government program enrollment, and payment eligibility", priority: "medium" }
    ],
    toolsAndIntegrations: [
      "QuickBooks / FarmBooks", "PCMars / CenterPoint Accounting", "Granular Business",
      "Farm Plan / AgriProfit", "RMA (Crop Insurance Data)", "FSA Programs",
      "DTN (Market Data)", "Microsoft Excel", "Tableau", "Slack"
    ],
    dataAccessPermissions: {
      financialRecords: "Full Access",
      bankingData: "Full Access",
      taxRecords: "Full Access",
      insuranceData: "Full Access",
      governmentPrograms: "Full Access",
      productionData: "Authorized — for enterprise analysis",
      landRecords: "Full Access",
      loanDocuments: "Full Access"
    },
    communicationCapabilities: [
      "Farm owner/management financial advisory and reporting",
      "Lender communication for loan applications and covenant reporting",
      "Insurance agent coordination for coverage selection and claims",
      "FSA/NRCS communication for government program enrollment",
      "Tax preparer coordination with financial records and documentation",
      "Input supplier negotiation support with cost analysis"
    ],
    exampleWorkflows: [
      {
        name: "Annual Budget Development",
        steps: [
          "Review prior year financial performance by enterprise",
          "Gather input cost estimates from suppliers and historical data",
          "Project revenue based on production estimates and price forecasts",
          "Build enterprise budgets for each crop and livestock operation",
          "Calculate break-even prices and production levels by enterprise",
          "Develop cash flow projection with monthly detail",
          "Stress test budget with price and yield scenarios",
          "Present budget to management and finalize for the year"
        ]
      },
      {
        name: "Crop Insurance Selection",
        steps: [
          "Review current year crop plans and production history",
          "Analyze available insurance products: RP, YP, ARP, ECO, SCO",
          "Calculate premium costs and coverage levels for each option",
          "Model expected indemnity scenarios based on historical variability",
          "Compare net cost of coverage across insurance product combinations",
          "Recommend optimal insurance portfolio based on risk tolerance",
          "Coordinate enrollment with insurance agent before deadline",
          "Document coverage selections and premium obligations"
        ]
      }
    ],
    performanceMetrics: [
      { metric: "Budget Accuracy", target: "Within 10% of actual", weight: 20 },
      { metric: "Cash Flow Forecast Accuracy", target: "Within 15%", weight: 15 },
      { metric: "Government Payment Capture", target: "100% of eligible payments", weight: 15 },
      { metric: "Insurance Coverage Optimization", target: "Optimal risk/cost ratio", weight: 10 },
      { metric: "Cost of Production Accuracy", target: "Within 5%", weight: 15 },
      { metric: "Financial Report Timeliness", target: "< 15 days after month-end", weight: 10 },
      { metric: "Working Capital Management", target: "Sufficient for operating needs", weight: 15 }
    ],
    useCases: [
      "AI-powered farm financial forecasting and scenario analysis",
      "Automated cash flow management with payment optimization",
      "Crop insurance optimization with risk/reward modeling",
      "Government program enrollment and compliance tracking",
      "Enterprise profitability analysis with field-level cost allocation"
    ],
    personalityDefaults: {
      formality: 75, enthusiasm: 45, empathy: 50, directness: 80,
      creativity: 35, humor: 15, assertiveness: 65
    },
    complianceMetadata: {
      frameworks: ["GAAP (Farm Accounting)", "IRS (Farm Tax)", "FSA Program Rules", "RMA (Crop Insurance)", "State Agricultural Tax", "USDA Regulations", "Lender Reporting Requirements"],
      dataClassification: "Confidential — Farm Financial & Tax Data",
      auditRequirements: "Financial records per GAAP; tax documentation per IRS; insurance records per RMA; program compliance documented",
      retentionPolicy: "Financial records: 7 years; tax records: 7 years; insurance: 7 years; government programs: program + 5 years",
      breachNotification: "Farm owner notification for financial, tax, or insurance data exposure"
    },
    skillsTags: ["farm finance", "agricultural accounting", "crop insurance", "government programs", "budgeting", "cash flow management", "enterprise analysis", "farm tax", "capital planning"],
    priceMonthly: 1199,
    isActive: 1,
  },
];
