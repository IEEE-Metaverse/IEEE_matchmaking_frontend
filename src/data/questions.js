// data/questions.js
const questions = [
  {
    section: "Quick Profile",
    items: [
      {
        question:
          "1. Primary role (one): Student / Postdoc / Faculty / Research Scientist / Engineer / PI / Other",
        type: "single-select",
        options: [
          "Student",
          "Postdoc",
          "Faculty",
          "Research Scientist",
          "Engineer",
          "PI",
          "Other",
        ],
        required: true,
        key: "role",
        allowOther: true,
      },
      {
        question: "2. Affiliation (lab/department + institution)",
        type: "short-text",
        required: true,
        key: "affiliation",
        placeholder: "e.g., Dept. of ECE, IIT Delhi",
      },
      {
        question: "3. Seniority",
        type: "single-select",
        options: ["Early-career", "Mid-career", "Senior"],
        required: true,
        key: "seniority",
      },
      {
        question:
          "3. Enter your LinkedIn Profile",
        type: "short-text",
        required: false,
        key: "linkedin_url",
        placeholder: "e.g., https://www.linkedin.com/in/example_id/",
      },
      {
        question: "4. Orchid ID/ Google Scholar ID",
        type: "short-text",
        required: false,
        key: "researcher_ids",
        placeholder: "Orcid: 0000-0000-0000-0000; Google Scholar ID",
      },
    ],
  },

  {
    section: "Fields & Subfields",
    items: [
      {
        question: "1. Core research areas (pick 3–8)",
        type: "multi-select",
        options: [
          "Artificial Intelligence",
          "Machine Learning",
          "Deep Learning",
          "Robotics",
          "Biotechnology",
          "Quantum Computing",
          "Cybersecurity",
          "Data Science",
          "Healthcare Technology",
          "Materials Science",
          "Electronics",
          "Energy Systems",
          "Wireless Communication",
        ],
        required: true,
        key: "core_research_areas",
        allowCustomOption: true,
      },
      {
        question: "2. Subfields or application domains (pick 3–8)",
        type: "multi-select",
        options: [
          "Healthcare",
          "Aerospace",
          "Defense",
          "Education",
          "Industrial IoT",
          "Smart Cities",
          "Telecom / 5G / 6G",
          "Renewable Energy",
          "Transportation",
          "Finance",
        ],
        required: false,
        key: "subfields_domains",
        allowCustomOption: true,
      }
    ],
  },

  {
    section: "Problem & Goals",
    items: [
      {
        question:
          "1. Top 3 research questions you’re pursuing this year (one sentence each). For each: provide the question, then rate Readiness (1-5) and Priority (1-5)",
        type: "special-research-questions",
        required: true,
        key: "problems_top_questions",
      },
      {
        question: "2. What outcomes are you aiming for?",
        type: "multi-select",
        options: ["theory", "methods", "prototype", "field trial", "standard contribution"],
        required: true,
        key: "goals_outcomes",
        allowCustomOption: true,
      },
    ],
  },
  {
    section: "Matching metadata",
    items: [
      {
        question:
          "For each of your top 3 topics, rate expertise (1–5) and interest to collaborate (1–5)",
        type: "top-3-collab-topics",
        required: false,
        key: "top_3_collab_topics",
      },
      
    ],
  },

  {
    section: "Methods & Approach",
    items: [
      
      {
        question: "1. Evaluation metrics you care about",
        type: "multi-select",
        options: ["F1", "BLEU", "MAPE", "THD", "latency", "power", "safety"],
        required: true,
        key: "evaluation_metrics",
        allowCustomOption: true,
      },
      {
        question: "2. Experimental setup & scale",
        type: "single-select",
        options: ["sim only", "lab bench", "pilot", "production"],
        required: true,
        key: "experimental_scale",
      },
      {
        question: "3. Standards/protocols touched",
        type: "multi-select",
        options: ["IEEE 802.11ax", "1588", "754", "2030.5", "OPC UA"],
        required: false,
        key: "standards_protocols",
        allowCustomOption: true,
      },
    ],
  },

  {
    section: "Collaboration Fit",
    items: [
      {
        question: "1. I'm Seeking (check all)",
        type: "multi-select",
        options: [
          "co-authoring",
          "data sharing",
          "method validation",
          "grant consortium",
          "student exchange",
          "industry partner",
          "standards participation",
          "mentoring",
        ],
        required: true,
        key: "seeking",
        allowCustomOption: true,
      },
      {
        question: "2. I can offer (check all)",
        type: "multi-select",
        options: [
          "dataset access",
          "domain expertise",
          "hardware access",
          "lab time",
          "compute credits",
          "supervision",
          "codebase",
          "evaluation bench",
        ],
        required: true,
        key: "offering",
        allowCustomOption: true,
      },
      {
        question: "3. Desired collaborator background (roles, disciplines, sectors)",
        type: "short-text",
        required: false,
        key: "collaborator_background",
        placeholder: "e.g., control engineers, computational biologists, industry contacts",
      },
    ],
  },

  {
    section: "Constraints & ethics",
    items: [
      {
        question: "1. Data sharing constraints",
        type: "single-select",
        options: ["open", "de-identified only", "NDA required", "embargoed", "export-controlled"],
        required: true,
        key: "data_sharing_constraints",
      },
      {
        question: "2. IP & licensing stance",
        type: "single-select",
        options: ["open-source friendly", "mixed", "proprietary-only", "case-by-case"],
        required: true,
        key: "ip_licensing_stance",
      },
    ],
  },

  // {
  //   section: "Evidence & anchors",
  //   items: [
  //     // {
  //     //   question:
  //     //     "1. Data types and datasets used (name public datasets with DOI/URL; describe private datasets briefly)",
  //     //   type: "short-text",
  //     //   required: true,
  //     //   key: "object_datasets",
  //     //   placeholder: "list datasets with DOI/URL or short description",
  //     // },
  //     {
  //       question: "1. Code/repos (URL) and license",
  //       type: "short-text",
  //       required: false,
  //       key: "code_repos",
  //       placeholder: "e.g., https://github.com/you/project (MIT)",
  //     },
  //     {
  //       question: "2. Datasets you steward (names + DOIs/URLs)",
  //       type: "short-text",
  //       required: false,
  //       key: "datasets_stewarded",
  //       placeholder: "Dataset name - DOI/URL",
  //     },
  //     {
  //       question: "3. Live demo or poster IDs at this conference (if any)",
  //       type: "short-text",
  //       required: false,
  //       key: "demo_poster_ids",
  //       placeholder: "Poster ID / Demo link",
  //     },
  //   ],
  // },

  // {
  //   section: "Interest signals",
  //   items: [
  //     {
  //       question: "1. People I’d like to meet (names or IDs—optional)",
  //       type: "short-text",
  //       required: false,
  //       key: "people_to_meet",
  //       placeholder: "Name1; Name2; or IDs",
  //     },
  //     {
  //       question: "2. Openness to mentor or be mentored in up to 3 topics",
  //       type: "short-text",
  //       required: false,
  //       key: "mentoring_topics",
  //       placeholder: "e.g., model interpretability; control systems",
  //     },
  //   ],
  // },

  
];

export default questions;
