import { AlertCircle, Info } from "lucide-react";

interface RightSidebarProps {
  selectedCategory?: string;
}

const CATEGORY_EXPLANATIONS: Record<
  string,
  { title: string; description: string; details: string[] }
> = {
  // Ethics category
  Fairness: {
    title: "Fairness Analysis",
    description:
      "Analyze and ensure ethical fairness in AI responses and decision-making processes.",
    details: [
      "Detect bias in algorithms and outputs",
      "Ensure equal treatment across all user groups",
      "Identify discriminatory patterns",
      "Evaluate representation and inclusion",
    ],
  },
  Transparency: {
    title: "Transparency & Explainability",
    description:
      "Ensure AI decisions and responses are clear, understandable, and explainable.",
    details: [
      "Explain AI reasoning and logic",
      "Document decision-making processes",
      "Provide clear output justifications",
      "Enable user understanding of AI behavior",
    ],
  },
  Accountability: {
    title: "Accountability",
    description:
      "Establish clear responsibility and oversight mechanisms for AI systems.",
    details: [
      "Track AI system performance",
      "Monitor compliance with standards",
      "Document all AI decisions and actions",
      "Enable audit trails and reviews",
    ],
  },
  Privacy: {
    title: "Privacy Protection",
    description:
      "Safeguard user data and ensure privacy compliance in all AI operations.",
    details: [
      "Implement data encryption",
      "Control access to sensitive information",
      "Comply with privacy regulations",
      "Manage user consent and preferences",
    ],
  },
  "Bias Detection": {
    title: "Bias Detection",
    description: "Identify and mitigate biases in AI models and training data.",
    details: [
      "Analyze training data for bias",
      "Test outputs for discriminatory patterns",
      "Monitor model performance across groups",
      "Implement bias correction mechanisms",
    ],
  },

  // Cyber category
  "Threat Detection": {
    title: "Threat Detection",
    description:
      "Identify and analyze potential security threats and vulnerabilities.",
    details: [
      "Monitor for suspicious activities",
      "Detect unauthorized access attempts",
      "Identify malware and intrusions",
      "Analyze attack patterns and trends",
    ],
  },
  "Vulnerability Assessment": {
    title: "Vulnerability Assessment",
    description:
      "Evaluate system weaknesses and security gaps comprehensively.",
    details: [
      "Scan for known vulnerabilities",
      "Test security configurations",
      "Identify weak authentication methods",
      "Evaluate infrastructure security",
    ],
  },
  "Incident Response": {
    title: "Incident Response",
    description: "Manage and mitigate active security incidents and breaches.",
    details: [
      "Develop incident response plans",
      "Coordinate emergency response",
      "Contain and isolate threats",
      "Document and analyze incidents",
    ],
  },
  "Security Hardening": {
    title: "Security Hardening",
    description: "Strengthen systems and defenses against potential attacks.",
    details: [
      "Apply security patches and updates",
      "Implement advanced security controls",
      "Configure secure defaults",
      "Reduce attack surface area",
    ],
  },
  "Penetration Testing": {
    title: "Penetration Testing",
    description:
      "Simulate attacks to identify security weaknesses before attackers do.",
    details: [
      "Conduct authorized security tests",
      "Identify exploitable vulnerabilities",
      "Test security controls effectiveness",
      "Generate detailed security reports",
    ],
  },

  // Toxic category
  "Content Moderation": {
    title: "Content Moderation",
    description:
      "Review and filter inappropriate or harmful content automatically.",
    details: [
      "Detect offensive language",
      "Flag inappropriate content",
      "Apply content policies consistently",
      "Protect user experience quality",
    ],
  },
  "Toxicity Detection": {
    title: "Toxicity Detection",
    description: "Identify toxic, harmful, or abusive language and behavior.",
    details: [
      "Analyze text for toxic patterns",
      "Identify harassment and hate speech",
      "Detect abusive language",
      "Score toxicity levels",
    ],
  },
  "Harmful Content Filter": {
    title: "Harmful Content Filter",
    description:
      "Prevent distribution of content that could cause harm or offense.",
    details: [
      "Filter violent content",
      "Block sexually explicit material",
      "Prevent dangerous instructions",
      "Protect vulnerable users",
    ],
  },
  "Safe Mode": {
    title: "Safe Mode",
    description:
      "Enable restricted mode for safer interactions with sensitive content.",
    details: [
      "Reduce adult content exposure",
      "Enable family-friendly filtering",
      "Restrict access to sensitive topics",
      "Create safer browsing experience",
    ],
  },
  "Sensitivity Analysis": {
    title: "Sensitivity Analysis",
    description:
      "Evaluate content sensitivity and adjust responses appropriately.",
    details: [
      "Assess content sensitivity levels",
      "Adapt responses for audiences",
      "Handle controversial topics carefully",
      "Balance openness with safety",
    ],
  },
};

const DEFAULT_EXPLANATION = {
  title: "Welcome to AI Chat Hub",
  description:
    "Select a category from the left sidebar to explore different AI capabilities and features.",
  details: [
    "Ethics: Ensure fair, transparent, and accountable AI",
    "Cyber: Protect systems from threats and vulnerabilities",
    "Toxic: Filter and moderate harmful content",
  ],
};

export function RightSidebar({ selectedCategory }: RightSidebarProps) {
  const explanation =
    selectedCategory && CATEGORY_EXPLANATIONS[selectedCategory]
      ? CATEGORY_EXPLANATIONS[selectedCategory]
      : DEFAULT_EXPLANATION;

  return (
    <div className="hidden lg:block w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-start gap-2">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <h2 className="text-lg font-bold text-gray-900">
            {explanation.title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {explanation.description}
          </p>
        </div>

        {/* Details List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Key Points
          </h3>
          <ul className="space-y-2">
            {explanation.details.map((detail, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-gray-700">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Box */}
        <div className="mt-auto pt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-xs text-blue-900 flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Select different category items to see their specific
              explanations.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
