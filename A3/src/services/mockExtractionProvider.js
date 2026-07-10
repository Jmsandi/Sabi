// A no-key, no-network provider for demos and tests. It hands back the same
// canned records every time so the whole pipeline can run end to end. None of
// this is read from the actual PDFs — it's all made up.
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
    // left sparse on purpose, to show the "not reported" fallback doing its job
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
