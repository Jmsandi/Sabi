import type { AbstractSection, Study } from '../types';

// Mock data — the assessment ships no dataset, so these are a few realistic
// study templates fanned out into a 50-item queue. All of it is invented.
interface StudyTemplate {
  title: string;
  shortAuthors: string;
  authors: string;
  source: string;
  journal: string;
  tags: string[];
  abstract: AbstractSection[];
}

const templates: StudyTemplate[] = [
  {
    title: 'Efficacy of AI-driven diagnostics in systematic reviews',
    shortAuthors: 'Chen et al.',
    authors: 'Chen, Y., Patel, K., & Smith, J.',
    source: 'PubMed',
    journal: 'Journal of Medical Informatics, Vol 14(2)',
    tags: ['Machine Learning', 'Healthcare', 'Diagnostics'],
    abstract: [
      {
        label: 'Background',
        text: 'The rapid integration of artificial intelligence (AI) and machine learning models into clinical workflows has prompted numerous systematic reviews aiming to evaluate their diagnostic efficacy. However, the sheer volume of emerging literature presents a significant bottleneck for researchers conducting timely synthesis.',
      },
      {
        label: 'Objective',
        text: 'This study assesses the performance of a novel AI-driven natural language processing (NLP) framework designed to automate the screening phase of systematic reviews, specifically targeting literature on diagnostic AI in healthcare.',
      },
      {
        label: 'Methods',
        text: 'We deployed an ensemble transformer model (SciBERT) fine-tuned on a corpus of 50,000 annotated medical abstracts. The framework was evaluated against a human-coded gold standard dataset of 2,500 abstracts. Performance metrics included recall, precision, and F1-score, with a predefined acceptable recall threshold set at 95% to minimize the risk of missing relevant studies.',
      },
      {
        label: 'Results',
        text: 'The automated screening framework achieved a recall of 98.2% and a precision of 45.3%, yielding a workload reduction of approximately 62% for human reviewers. The system successfully identified key diagnostic metrics (sensitivity, specificity, AUROC) embedded within unstructured abstract text, extracting them with 89% accuracy.',
      },
      {
        label: 'Conclusions',
        text: 'AI-driven screening tools demonstrate substantial promise in accelerating systematic reviews in rapidly evolving fields like healthcare diagnostics. While manual oversight remains necessary due to moderate precision, the high recall ensures comprehensiveness, significantly reducing the cognitive burden on researchers.',
      },
    ],
  },
  {
    title: 'Large Language Models for Automated Data Extraction in Meta-Analyses',
    shortAuthors: 'Rodriguez et al.',
    authors: 'Rodriguez, M., Kim, S., & Johnson, L.',
    source: 'Scopus',
    journal: 'Digital Health Review, Vol 8(1)',
    tags: ['LLMs', 'Data Extraction', 'Meta-Analysis'],
    abstract: [
      {
        label: 'Background',
        text: 'Extracting structured data from unstructured academic text remains one of the most time-consuming aspects of conducting meta-analyses.',
      },
      {
        label: 'Methods',
        text: 'We evaluated GPT-4 and Claude 3 Opus on their ability to extract sample sizes, patient demographics, and primary outcomes from 500 clinical trial reports.',
      },
      {
        label: 'Results',
        text: 'GPT-4 achieved a 94% accuracy rate for sample sizes but struggled with complex multi-arm trial designs. Zero-shot prompting was found to be sufficient for 80% of extraction tasks.',
      },
      {
        label: 'Conclusions',
        text: 'LLMs can drastically accelerate the data extraction phase, but require "human-in-the-loop" verification for complex trial structures.',
      },
    ],
  },
  {
    title: 'Bias amplification in algorithm-assisted literature screening',
    shortAuthors: 'Gupta & Williams',
    authors: 'Gupta, R., & Williams, E.',
    source: 'Web of Science',
    journal: 'Research Ethics Quarterly',
    tags: ['Bias', 'Ethics', 'Algorithm'],
    abstract: [
      {
        label: 'Background',
        text: 'As algorithmic screening becomes standard practice, the potential for systematic bias in literature selection has raised concerns.',
      },
      {
        label: 'Methods',
        text: 'We simulated systematic reviews using three popular active-learning screening tools, artificially injecting bias into the initial seed papers.',
      },
      {
        label: 'Results',
        text: 'Models trained on biased seed sets showed a 40% higher rate of false-negatives for papers presenting contradictory evidence to the seed bias.',
      },
      {
        label: 'Conclusions',
        text: 'Researchers must carefully curate initial training sets for active-learning models to prevent the exclusion of valid, contrary evidence during systematic reviews.',
      },
    ],
  },
  {
    title: 'Human-in-the-loop screening for clinical evidence synthesis',
    shortAuthors: 'Okafor et al.',
    authors: 'Okafor, A., Mensah, P., & Lee, H.',
    source: 'PubMed',
    journal: 'Evidence-Based Medicine Today, Vol 11(4)',
    tags: ['Workflow', 'Clinical Trials', 'Reviewer Tooling'],
    abstract: [
      {
        label: 'Background',
        text: 'Dual-reviewer screening improves reliability but roughly doubles the human effort required to complete a systematic review.',
      },
      {
        label: 'Methods',
        text: 'A controlled workflow paired each reviewer with a model-generated recommendation and an adjudication step, logged for full auditability across 1,800 records.',
      },
      {
        label: 'Results',
        text: 'Conflict-resolution time fell by 31% without any measurable loss of recall, and reviewer agreement increased for borderline records.',
      },
      {
        label: 'Conclusions',
        text: 'Surfacing model recommendations at the point of decision preserves human accountability while removing repetitive adjudication overhead.',
      },
    ],
  },
  {
    title: 'Semantic search for rapid evidence mapping',
    shortAuthors: 'Singh et al.',
    authors: 'Singh, D., Carter, A., & Novak, M.',
    source: 'OpenAlex',
    journal: 'Information Retrieval in Practice, Vol 6(3)',
    tags: ['Embeddings', 'Retrieval', 'Evidence Mapping'],
    abstract: [
      {
        label: 'Background',
        text: 'Keyword search misses relevant records that use different terminology, forcing reviewers to over-broaden queries and screen large volumes of noise.',
      },
      {
        label: 'Methods',
        text: 'We indexed 120,000 abstracts with a domain-tuned embedding model and compared top-ranked relevance against a Boolean baseline on ten review questions.',
      },
      {
        label: 'Results',
        text: 'Semantic retrieval improved the relevance of the top 100 ranked records by 27% and surfaced eligible studies that the Boolean query failed to return.',
      },
      {
        label: 'Conclusions',
        text: 'Embedding-based retrieval is a practical front-end for evidence mapping, though transparent ranking explanations remain important for reviewer trust.',
      },
    ],
  },
];

const statuses = ['Pending', 'Pending', 'Pending', 'In review'];

// Cycle the templates into a fixed 50-study queue. Same ids, same order every
// load, so decisions saved in localStorage still line up after a refresh.
export const mockStudies: Study[] = Array.from({ length: 50 }, (_, index) => {
  const template = templates[index % templates.length];
  const studyNumber = String(index + 42);

  return {
    ...template,
    id: `study-${studyNumber}`,
    title: index < templates.length ? template.title : `${template.title} (cohort ${studyNumber})`,
    year: 2020 + (index % 5),
    status: statuses[index % statuses.length],
  };
});
