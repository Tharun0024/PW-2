/**
 * @file Contains the detailed steps of the Indian election process.
 */

export const electionSteps = [
  {
    id: 'check-eligibility',
    title: 'Check Eligibility',
    description: 'Verify that you meet the requirements to vote in India. You must be an Indian citizen, 18 years or older, and a resident of the polling area.',
    icon: 'UserCheck',
    estimatedDays: 0,
    requiredDocuments: ['Proof of Age (Birth Certificate, Passport, etc.)', 'Proof of Residence (Aadhaar Card, Ration Card, etc.)'],
    tips: ['You can check your eligibility on the National Voters\' Services Portal (NVSP).', 'Ensure your name is on the electoral roll.'],
  },
  {
    id: 'register-to-vote',
    title: 'Register to Vote',
    description: 'If you are eligible but not registered, you need to register to get your name on the electoral roll. This can be done online or offline.',
    icon: 'FilePen',
    estimatedDays: 15 - 30,
    requiredDocuments: ['Form 6 (for general voters)', 'Passport-sized photograph', 'Proof of Age', 'Proof of Residence'],
    tips: ['Register online through the NVSP for a faster process.', 'Keep track of your application status.'],
  },
  {
    id: 'get-voter-id',
    title: 'Get Voter ID Card (EPIC)',
    description: 'Once registered, you will receive your Elector\'s Photo Identity Card (EPIC). This is a crucial document for voting.',
    icon: 'IdCard',
    estimatedDays: 30 - 60,
    requiredDocuments: [],
    tips: ['You can download a digital version of your EPIC (e-EPIC) from the NVSP.', 'Ensure all details on your card are correct.'],
  },
  {
    id: 'find-polling-booth',
    title: 'Find Your Polling Booth',
    description: 'Before voting day, you need to know where your assigned polling booth is located. This information is available on your voter slip and online.',
    icon: 'MapPin',
    estimatedDays: 1,
    requiredDocuments: ['Voter ID Card Number or Name/DoB'],
    tips: ['Use the "Search in Electoral Roll" feature on the NVSP website.', 'You can also find your polling booth by sending an SMS to 1950.'],
  },
  {
    id: 'voting-day',
    title: 'Voting Day',
    description: 'On the day of the election, go to your polling booth with your Voter ID card and cast your vote.',
    icon: 'Vote',
    estimatedDays: 1,
    requiredDocuments: ['Voter ID Card (EPIC) or other approved photo ID'],
    tips: ['Follow the instructions of the polling officers.', 'Your finger will be marked with indelible ink after you vote.'],
  },
  {
    id: 'check-results',
    title: 'Check Results',
    description: 'The election results are announced by the Election Commission of India (ECI) after the counting of votes is complete.',
    icon: 'Trophy',
    estimatedDays: 1 - 3,
    requiredDocuments: [],
    tips: ['Results are declared on the official ECI website.', 'Follow reputable news sources for updates.'],
  },
];
