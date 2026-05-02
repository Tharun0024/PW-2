/**
 * @file src/constants/quickResponses.js
 * @description Defines a set of pre-defined questions and answers for instant responses,
 * bypassing the need for an API call for common queries. This acts as a simple,
 * effective intent classification layer.
 */

export const quickResponses = {
  "how do i vote?": {
    answer: "The voting process is simple: 1. Verify your name on the voter list. 2. Go to the polling booth. 3. Show your Voter ID. 4. Get your finger inked. 5. Cast your vote on the EVM. 6. Receive a VVPAT slip to confirm your vote.",
    relatedFeature: null,
  },
  "am i eligible to vote?": {
    answer: "To check your eligibility, please use our Eligibility Checker tool. You generally need to be an Indian citizen, 18 years or older, and registered on the electoral roll.",
    relatedFeature: "eligibility",
  },
  "where is my polling booth?": {
    answer: "You can find your assigned polling booth using our Booth Finder tool. Just enter your address to get started.",
    relatedFeature: "booth",
  },
  "what documents do i need?": {
    answer: "You need your Voter ID card (EPIC). If you don't have it, you can use other government-issued photo IDs like an Aadhaar card, Passport, Driving License, or PAN card.",
    relatedFeature: null,
  },
  "can i vote online?": {
    answer: "Currently, India does not have a provision for online voting for general elections. All votes must be cast in person at the designated polling booth.",
    relatedFeature: null,
  },
  "what is an evm?": {
    answer: "An Electronic Voting Machine (EVM) is a device used to cast votes electronically. It consists of a control unit and a balloting unit. It's designed to be simple, secure, and reliable.",
    relatedFeature: null,
  },
  "what is vvpat?": {
    answer: "The Voter Verifiable Paper Audit Trail (VVPAT) is a system that provides feedback to voters. It prints a slip containing the serial number, name, and symbol of the candidate you voted for, which you can see for 7 seconds before it's deposited into a sealed box.",
    relatedFeature: null,
  },
  "when are the election results?": {
    answer: "The counting of votes and declaration of results typically happens on a specific date set by the Election Commission of India after all phases of polling are complete. Please refer to the official ECI website for the exact date.",
    relatedFeature: null,
  },
  "how to register to vote?": {
    answer: "You can register to vote online through the National Voters' Services Portal (NVSP) or by submitting Form 6 physically at your local Electoral Registration Office. You'll need proof of age and residence.",
    relatedFeature: null,
  },
  "what is the model code of conduct?": {
    answer: "The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India for the conduct of political parties and candidates during elections, mainly with respect to speeches, polling day, portfolios, election manifestos, processions, and general conduct.",
    relatedFeature: null,
  },
};
