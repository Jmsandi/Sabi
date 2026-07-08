/**
 * Offline extraction provider used for demos and local runs when no API key is
 * available (EXTRACTION_PROVIDER=mock). It performs no network calls and returns
 * deterministic, clearly-fabricated records so the full pipeline (PDF discovery
 * -> text extraction -> validation -> CSV) can be exercised end to end.
 *
 * The data is intentionally fake — it is NOT extracted from the PDF contents.
 */
const MOCK_RECORDS = [
  {
    studyName: 'Community Health Worker Malaria Intervention Trial',
    country: 'Kenya',
    sampleSize: '1,240 participants',
    intervention: 'Community health worker home visits',
    primaryOutcome: 'Reduction in confirmed malaria cases at 12 months',
    resultDirection: 'positive',
  },
  {
    studyName: 'Rural Telemedicine Access Study',
    country: 'India',
    sampleSize: '860 participants',
    intervention: 'Tablet-based teleconsultation clinics',
    primaryOutcome: 'Time to specialist consultation',
    resultDirection: 'mixed',
  },
  {
    // Deliberately sparse to demonstrate the "not reported" normalisation rule.
    studyName: 'Nutrition Supplementation Pilot',
    country: '',
    intervention: 'Micronutrient-fortified porridge',
    primaryOutcome: 'Change in weight-for-age z-score',
    resultDirection: 'unclear',
  },
];

export class MockExtractionProvider {
  constructor({ logger }) {
    this.logger = logger;
    this.callCount = 0;
  }

  async extractStudyData(_prompt, metadata) {
    const record = MOCK_RECORDS[this.callCount % MOCK_RECORDS.length];
    this.callCount += 1;

    this.logger.info('Using mock extraction provider (no live API call)', {
      fileName: metadata.fileName,
    });

    return { ...record };
  }
}
