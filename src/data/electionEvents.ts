export type EventType = 'election' | 'debate' | 'deadline' | 'judgement' | 'general';

export interface ElectionEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: EventType;
  country: string;
}

export const electionEvents: ElectionEvent[] = [
  // =================== INDIA ===================
  { id: "in-ls-2019-p1", date: "2019-04-11", title: "Lok Sabha 2019 – Phase 1", description: "First phase of the 17th General Election. 91 constituencies voted.", type: "election", country: "India" },
  { id: "in-ls-2019-p2", date: "2019-04-18", title: "Lok Sabha 2019 – Phase 2", description: "Second phase covering 97 constituencies across 13 states.", type: "election", country: "India" },
  { id: "in-ls-2019-p3", date: "2019-04-23", title: "Lok Sabha 2019 – Phase 3", description: "Third phase. 115 constituencies across 14 states and UTs voted.", type: "election", country: "India" },
  { id: "in-ls-2019-p7", date: "2019-05-19", title: "Lok Sabha 2019 – Final Phase", description: "Seventh and final phase of voting. All phases complete.", type: "election", country: "India" },
  { id: "in-ls-2019-result", date: "2019-05-23", title: "Lok Sabha 2019 Results", description: "NDA won a landslide majority. BJP secured 303 seats on its own.", type: "judgement", country: "India" },
  { id: "in-delhi-2020", date: "2020-02-08", title: "Delhi Assembly Election", description: "AAP retained power with 62/70 seats. BJP won 8 seats.", type: "election", country: "India" },
  { id: "in-delhi-2020-result", date: "2020-02-11", title: "Delhi Election Results", description: "AAP won a massive majority with 62 out of 70 seats.", type: "judgement", country: "India" },
  { id: "in-bihar-2020", date: "2020-10-28", title: "Bihar Assembly Elections – Phase 1", description: "First phase of Bihar State Assembly Elections 2020.", type: "election", country: "India" },
  { id: "in-kerala-2021", date: "2021-04-06", title: "Kerala Assembly Election", description: "LDF retained power in a historic second consecutive win.", type: "election", country: "India" },
  { id: "in-up-2022-p1", date: "2022-02-10", title: "Uttar Pradesh Elections – Phase 1", description: "First of seven phases in the UP Assembly Elections.", type: "election", country: "India" },
  { id: "in-up-2022-result", date: "2022-03-10", title: "UP/Goa/Punjab/Uttarakhand Results", description: "BJP retained UP. AAP swept Punjab. Congress lost Goa.", type: "judgement", country: "India" },
  { id: "in-gujarat-2022", date: "2022-12-01", title: "Gujarat Assembly Election – Phase 1", description: "BJP contested in its home state. Phase 1 of 2.", type: "election", country: "India" },
  { id: "in-gujarat-2022-result", date: "2022-12-08", title: "Gujarat Election Results", description: "BJP won a record 156/182 seats in Gujarat. Biggest victory ever.", type: "judgement", country: "India" },
  { id: "in-ls-2024-p1", date: "2024-04-19", title: "Lok Sabha 2024 – Phase 1", description: "First phase of the 18th General Election. 102 constituencies.", type: "election", country: "India" },
  { id: "in-ls-2024-p2", date: "2024-04-26", title: "Lok Sabha 2024 – Phase 2", description: "Second phase. 89 constituencies across multiple states.", type: "election", country: "India" },
  { id: "in-ls-2024-p3", date: "2024-05-07", title: "Lok Sabha 2024 – Phase 3", description: "Third phase of voting in the 2024 General Election.", type: "election", country: "India" },
  { id: "in-ls-2024-p4", date: "2024-05-13", title: "Lok Sabha 2024 – Phase 4", description: "Fourth phase of voting in the 2024 General Election.", type: "election", country: "India" },
  { id: "in-ls-2024-p5", date: "2024-05-20", title: "Lok Sabha 2024 – Phase 5", description: "Fifth phase of voting in the 2024 General Election.", type: "election", country: "India" },
  { id: "in-ls-2024-p6", date: "2024-05-25", title: "Lok Sabha 2024 – Phase 6", description: "Sixth phase of voting in the 2024 General Election.", type: "election", country: "India" },
  { id: "in-ls-2024-p7", date: "2024-06-01", title: "Lok Sabha 2024 – Phase 7 (Final)", description: "Final phase of the 2024 General Election.", type: "election", country: "India" },
  { id: "in-ls-2024-result", date: "2024-06-04", title: "Lok Sabha 2024 Results Declared", description: "NDA retained majority. BJP won 240 seats. INDIA alliance won 232.", type: "judgement", country: "India" },
  { id: "in-mh-2024", date: "2024-11-20", title: "Maharashtra Assembly Election", description: "Assembly election for the state of Maharashtra.", type: "election", country: "India" },
  { id: "in-jh-2024", date: "2024-11-13", title: "Jharkhand Assembly Election – Phase 1", description: "First phase of Jharkhand Assembly elections.", type: "election", country: "India" },
  { id: "in-delhi-2025", date: "2025-02-05", title: "Delhi Assembly Election 2025", description: "AAP vs BJP battle for Delhi. High-stakes state election.", type: "election", country: "India" },
  { id: "in-delhi-2025-result", date: "2025-02-08", title: "Delhi 2025 Election Results", description: "BJP won Delhi after 27 years, defeating AAP.", type: "judgement", country: "India" },
  { id: "in-bihar-2025", date: "2025-10-01", title: "Bihar Assembly Election 2025 (Projected)", description: "Upcoming Bihar state elections projected for late 2025.", type: "election", country: "India" },
  { id: "in-up-2027", date: "2027-02-01", title: "Uttar Pradesh Elections 2027 (Projected)", description: "Next Uttar Pradesh Assembly Elections projected for early 2027.", type: "election", country: "India" },
  { id: "in-ls-2029", date: "2029-05-01", title: "Lok Sabha General Election 2029 (Projected)", description: "Next Indian General Election projected for 2029.", type: "election", country: "India" },

  // =================== USA ===================
  { id: "us-midterm-2018", date: "2018-11-06", title: "US Midterm Elections 2018", description: "Democrats won the House of Representatives. Republicans retained the Senate.", type: "election", country: "USA" },
  { id: "us-primary-iowa-2020", date: "2020-02-03", title: "Iowa Democratic Caucus 2020", description: "First major Democratic primary event of the 2020 cycle.", type: "election", country: "USA" },
  { id: "us-super-tuesday-2020", date: "2020-03-03", title: "Super Tuesday 2020", description: "14 states voted in Democratic primary. Biden and Sanders led.", type: "election", country: "USA" },
  { id: "us-election-2020", date: "2020-11-03", title: "US Presidential Election 2020", description: "General election between Donald Trump (R) and Joe Biden (D).", type: "election", country: "USA" },
  { id: "us-election-2020-result", date: "2020-11-07", title: "Biden Declared Winner 2020", description: "Joe Biden declared President-elect after winning key states.", type: "judgement", country: "USA" },
  { id: "us-georgia-runoff-2021", date: "2021-01-05", title: "Georgia Senate Runoff Elections", description: "Democrats won both Georgia Senate seats, flipping the Senate.", type: "election", country: "USA" },
  { id: "us-inauguration-2021", date: "2021-01-20", title: "Biden Inauguration Day", description: "Joe Biden sworn in as the 46th President of the United States.", type: "judgement", country: "USA" },
  { id: "us-midterm-2022", date: "2022-11-08", title: "US Midterm Elections 2022", description: "Democrats retained Senate. Republicans narrowly won the House.", type: "election", country: "USA" },
  { id: "us-debate-1-2024", date: "2024-06-27", title: "First Presidential Debate 2024", description: "Biden vs Trump — historic debate between a sitting president and former president.", type: "debate", country: "USA" },
  { id: "us-debate-2-2024", date: "2024-09-10", title: "Second Presidential Debate 2024", description: "Harris vs Trump presidential debate after Biden withdrew from the race.", type: "debate", country: "USA" },
  { id: "us-election-2024", date: "2024-11-05", title: "US Presidential Election 2024", description: "General election between Donald Trump (R) and Kamala Harris (D).", type: "election", country: "USA" },
  { id: "us-election-2024-result", date: "2024-11-06", title: "Trump Declared Winner 2024", description: "Donald Trump won the 2024 election, becoming the 47th President.", type: "judgement", country: "USA" },
  { id: "us-inauguration-2025", date: "2025-01-20", title: "Trump Inauguration Day", description: "Donald Trump sworn in as 47th President of the United States.", type: "judgement", country: "USA" },
  { id: "us-midterm-2026", date: "2026-11-03", title: "US Midterm Elections 2026 (Projected)", description: "Congressional midterm elections. All House and 1/3 Senate seats up.", type: "election", country: "USA" },
  { id: "us-election-2028", date: "2028-11-07", title: "US Presidential Election 2028 (Projected)", description: "Next US Presidential Election projected for November 2028.", type: "election", country: "USA" },

  // =================== UK ===================
  { id: "uk-brexit-2016", date: "2016-06-23", title: "Brexit Referendum", description: "UK voted 52% to 48% to leave the European Union.", type: "election", country: "UK" },
  { id: "uk-general-2017", date: "2017-06-08", title: "UK General Election 2017", description: "Snap election called by Theresa May. Hung parliament resulted.", type: "election", country: "UK" },
  { id: "uk-general-2019", date: "2019-12-12", title: "UK General Election 2019", description: "Conservatives won an 80-seat majority. Boris Johnson remained PM.", type: "election", country: "UK" },
  { id: "uk-local-2021", date: "2021-05-06", title: "UK Local Elections 2021", description: "Conservatives gained ground in traditional Labour areas.", type: "election", country: "UK" },
  { id: "uk-local-2022", date: "2022-05-05", title: "UK Local Elections 2022", description: "Labour and Lib Dems gained seats from Conservatives.", type: "election", country: "UK" },
  { id: "uk-local-2023", date: "2023-05-04", title: "UK Local Elections 2023", description: "Labour made significant gains ahead of the General Election.", type: "election", country: "UK" },
  { id: "uk-general-2024", date: "2024-07-04", title: "UK General Election 2024", description: "Labour won a historic 412 seats landslide. Keir Starmer became PM.", type: "election", country: "UK" },
  { id: "uk-general-2024-result", date: "2024-07-05", title: "UK Election Results 2024", description: "Labour landslide. Conservatives suffered worst defeat since 1906.", type: "judgement", country: "UK" },
  { id: "uk-local-2025", date: "2025-05-01", title: "UK Local Elections 2025", description: "Local council elections across England.", type: "election", country: "UK" },
  { id: "uk-general-2029", date: "2029-05-01", title: "UK General Election 2029 (Projected)", description: "Next UK Parliamentary General Election projected for 2029.", type: "election", country: "UK" },

  // =================== AUSTRALIA ===================
  { id: "au-federal-2019", date: "2019-05-18", title: "Australian Federal Election 2019", description: "Scott Morrison's Liberal-National Coalition won unexpectedly, dubbed 'the miracle election'.", type: "election", country: "Australia" },
  { id: "au-federal-2019-result", date: "2019-05-18", title: "Coalition Wins 2019", description: "Scott Morrison became PM after surprise Coalition victory over Labor.", type: "judgement", country: "Australia" },
  { id: "au-qld-2020", date: "2020-10-31", title: "Queensland State Election 2020", description: "Labor won a majority in Queensland state parliament.", type: "election", country: "Australia" },
  { id: "au-wa-2021", date: "2021-03-13", title: "Western Australia Election 2021", description: "Labor won historic 53/59 seats landslide in WA.", type: "election", country: "Australia" },
  { id: "au-federal-2022", date: "2022-05-21", title: "Australian Federal Election 2022", description: "Anthony Albanese's Labor Party ended 9 years of Coalition government.", type: "election", country: "Australia" },
  { id: "au-federal-2022-result", date: "2022-05-22", title: "Labor Wins 2022", description: "Anthony Albanese became PM, ending the Morrison era.", type: "judgement", country: "Australia" },
  { id: "au-voice-ref-2023", date: "2023-10-14", title: "Voice to Parliament Referendum", description: "Australians voted on whether to create an Indigenous Voice to Parliament. The 'No' vote won.", type: "election", country: "Australia" },
  { id: "au-federal-2025", date: "2025-05-03", title: "Australian Federal Election 2025", description: "Federal election between Labor and the Liberal-National Coalition.", type: "election", country: "Australia" },
  { id: "au-federal-2025-result", date: "2025-05-03", title: "Australia 2025 Election Result", description: "Anthony Albanese's Labor returned to government.", type: "judgement", country: "Australia" },
  { id: "au-federal-2028", date: "2028-05-01", title: "Australian Federal Election 2028 (Projected)", description: "Next scheduled Australian federal election.", type: "election", country: "Australia" },

  // =================== CANADA ===================
  { id: "ca-federal-2019", date: "2019-10-21", title: "Canadian Federal Election 2019", description: "Trudeau's Liberals won a minority government. Conservatives won the popular vote.", type: "election", country: "Canada" },
  { id: "ca-federal-2021", date: "2021-09-20", title: "Canadian Federal Election 2021", description: "Snap election called by Trudeau. Liberals again won minority government.", type: "election", country: "Canada" },
  { id: "ca-bc-2024", date: "2024-10-19", title: "British Columbia Election 2024", description: "BC NDP won a narrow majority over BC Conservatives.", type: "election", country: "Canada" },
  { id: "ca-federal-2025", date: "2025-04-28", title: "Canadian Federal Election 2025", description: "Snap election. Mark Carney's Liberals vs Pierre Poilievre's Conservatives.", type: "election", country: "Canada" },
  { id: "ca-federal-2025-result", date: "2025-04-29", title: "Canada 2025 Result", description: "Mark Carney's Liberal Party won the federal election.", type: "judgement", country: "Canada" },
  { id: "ca-federal-2029", date: "2029-10-01", title: "Canadian Federal Election 2029 (Projected)", description: "Next scheduled Canadian federal election.", type: "election", country: "Canada" },

  // =================== FRANCE ===================
  { id: "fr-pres-2017", date: "2017-04-23", title: "French Presidential Election 2017 – Round 1", description: "Emmanuel Macron and Marine Le Pen advanced to the second round.", type: "election", country: "France" },
  { id: "fr-pres-2017-r2", date: "2017-05-07", title: "French Presidential Election 2017 – Round 2", description: "Emmanuel Macron won 66% of the vote, defeating Marine Le Pen.", type: "election", country: "France" },
  { id: "fr-pres-2022", date: "2022-04-10", title: "French Presidential Election 2022 – Round 1", description: "Macron and Le Pen qualified for Round 2 again.", type: "election", country: "France" },
  { id: "fr-pres-2022-r2", date: "2022-04-24", title: "French Presidential Election 2022 – Round 2", description: "Macron re-elected with 58.5% of votes over Marine Le Pen.", type: "election", country: "France" },
  { id: "fr-legis-2024", date: "2024-06-30", title: "French Legislative Elections 2024 – Round 1", description: "Snap legislative elections called after EU election results.", type: "election", country: "France" },
  { id: "fr-legis-2024-r2", date: "2024-07-07", title: "French Legislative Elections 2024 – Round 2", description: "Hung parliament result. Left bloc won most seats but no majority.", type: "election", country: "France" },
  { id: "fr-pres-2027", date: "2027-04-01", title: "French Presidential Election 2027 (Projected)", description: "Next French presidential election. Macron cannot run again.", type: "election", country: "France" },

  // =================== GERMANY ===================
  { id: "de-federal-2017", date: "2017-09-24", title: "German Federal Election 2017", description: "CDU/CSU won but lost seats. SPD, AfD, FDP, Greens, Linke all entered Bundestag.", type: "election", country: "Germany" },
  { id: "de-federal-2021", date: "2021-09-26", title: "German Federal Election 2021", description: "SPD narrowly won. Olaf Scholz formed a traffic light coalition (SPD+FDP+Greens).", type: "election", country: "Germany" },
  { id: "de-federal-2021-result", date: "2021-12-08", title: "Scholz Becomes Chancellor", description: "Olaf Scholz sworn in as Chancellor, ending Merkel's 16-year era.", type: "judgement", country: "Germany" },
  { id: "de-federal-2025", date: "2025-02-23", title: "German Federal Election 2025", description: "Snap election after government collapse. CDU/CSU vs SPD vs AfD.", type: "election", country: "Germany" },
  { id: "de-federal-2025-result", date: "2025-02-23", title: "Germany 2025 Election Result", description: "CDU/CSU won most seats. Friedrich Merz became Chancellor.", type: "judgement", country: "Germany" },
  { id: "de-federal-2029", date: "2029-09-01", title: "German Federal Election 2029 (Projected)", description: "Next scheduled German federal election.", type: "election", country: "Germany" },

  // =================== JAPAN ===================
  { id: "jp-lower-2021", date: "2021-10-31", title: "Japan House of Representatives 2021", description: "LDP-Komeito coalition retained majority under PM Kishida.", type: "election", country: "Japan" },
  { id: "jp-upper-2022", date: "2022-07-10", title: "Japan House of Councillors 2022", description: "LDP won decisive majority days after Shinzo Abe's assassination.", type: "election", country: "Japan" },
  { id: "jp-lower-2024", date: "2024-10-27", title: "Japan House of Representatives 2024", description: "LDP lost its majority. Historic defeat for the ruling coalition.", type: "election", country: "Japan" },
  { id: "jp-lower-2024-result", date: "2024-10-27", title: "Japan 2024 Election Result", description: "LDP-Komeito coalition lost majority for first time since 2009.", type: "judgement", country: "Japan" },
  { id: "jp-upper-2025", date: "2025-07-01", title: "Japan House of Councillors 2025 (Projected)", description: "Upper house election scheduled for mid-2025.", type: "election", country: "Japan" },
  { id: "jp-lower-2028", date: "2028-10-01", title: "Japan General Election 2028 (Projected)", description: "Next scheduled House of Representatives election.", type: "election", country: "Japan" },

  // =================== BRAZIL ===================
  { id: "br-pres-2018", date: "2018-10-07", title: "Brazilian Presidential Election 2018 – Round 1", description: "Jair Bolsonaro led Round 1 with 46% of votes.", type: "election", country: "Brazil" },
  { id: "br-pres-2018-r2", date: "2018-10-28", title: "Brazilian Presidential Election 2018 – Round 2", description: "Bolsonaro won 55% over PT's Fernando Haddad.", type: "election", country: "Brazil" },
  { id: "br-pres-2022", date: "2022-10-02", title: "Brazilian Presidential Election 2022 – Round 1", description: "Lula (PT) and Bolsonaro advanced. No candidate won outright.", type: "election", country: "Brazil" },
  { id: "br-pres-2022-r2", date: "2022-10-30", title: "Brazilian Presidential Election 2022 – Round 2", description: "Lula won with 50.9%, becoming president for a historic 3rd term.", type: "election", country: "Brazil" },
  { id: "br-pres-2022-result", date: "2022-10-30", title: "Lula Wins Brazil 2022", description: "Luiz Inácio Lula da Silva won the presidency, defeating incumbent Bolsonaro.", type: "judgement", country: "Brazil" },
  { id: "br-pres-2026", date: "2026-10-04", title: "Brazilian Presidential Election 2026 (Projected)", description: "Lula up for re-election. Major political contest expected.", type: "election", country: "Brazil" },

  // =================== SOUTH AFRICA ===================
  { id: "za-general-2019", date: "2019-05-08", title: "South Africa General Election 2019", description: "ANC won with 57.5%. Cyril Ramaphosa continued as President.", type: "election", country: "South Africa" },
  { id: "za-general-2024", date: "2024-05-29", title: "South Africa General Election 2024", description: "ANC lost its parliamentary majority for the first time since 1994.", type: "election", country: "South Africa" },
  { id: "za-general-2024-result", date: "2024-06-14", title: "South Africa 2024 Result – GNU Formed", description: "ANC formed a Government of National Unity (GNU) with DA and other parties.", type: "judgement", country: "South Africa" },
  { id: "za-general-2029", date: "2029-05-01", title: "South Africa General Election 2029 (Projected)", description: "Next South African general election.", type: "election", country: "South Africa" },

  // =================== PAKISTAN ===================
  { id: "pk-general-2018", date: "2018-07-25", title: "Pakistan General Election 2018", description: "PTI won most seats. Imran Khan became Prime Minister.", type: "election", country: "Pakistan" },
  { id: "pk-general-2018-result", date: "2018-08-18", title: "Imran Khan Becomes PM", description: "Imran Khan sworn in as Pakistan's 22nd Prime Minister.", type: "judgement", country: "Pakistan" },
  { id: "pk-pm-removal-2022", date: "2022-04-10", title: "Imran Khan Removed via No-Confidence Vote", description: "Imran Khan became the first Pakistani PM removed through a parliamentary no-confidence vote.", type: "judgement", country: "Pakistan" },
  { id: "pk-general-2024", date: "2024-02-08", title: "Pakistan General Election 2024", description: "PTI-backed independents won most seats despite Imran Khan being jailed.", type: "election", country: "Pakistan" },
  { id: "pk-general-2024-result", date: "2024-02-11", title: "Pakistan 2024 Coalition Government", description: "PML-N's Shehbaz Sharif formed a coalition government.", type: "judgement", country: "Pakistan" },
  { id: "pk-general-2029", date: "2029-02-01", title: "Pakistan General Election 2029 (Projected)", description: "Next scheduled Pakistani general election.", type: "election", country: "Pakistan" },

  // =================== BANGLADESH ===================
  { id: "bd-general-2018", date: "2018-12-30", title: "Bangladesh General Election 2018", description: "Sheikh Hasina's Awami League won landslide with 96% of seats.", type: "election", country: "Bangladesh" },
  { id: "bd-general-2024", date: "2024-01-07", title: "Bangladesh General Election 2024", description: "Awami League won again amid opposition boycott led by BNP.", type: "election", country: "Bangladesh" },
  { id: "bd-revolution-2024", date: "2024-08-05", title: "Sheikh Hasina Resigns – Student Revolution", description: "Sheikh Hasina fled Bangladesh after mass student protests. Dr Muhammad Yunus became interim leader.", type: "judgement", country: "Bangladesh" },
  { id: "bd-general-2026", date: "2026-06-01", title: "Bangladesh General Election 2026 (Projected)", description: "Scheduled election under interim government led by Muhammad Yunus.", type: "election", country: "Bangladesh" },

  // =================== SRI LANKA ===================
  { id: "lk-pres-2019", date: "2019-11-16", title: "Sri Lanka Presidential Election 2019", description: "Gotabaya Rajapaksa won with 52.25% of votes.", type: "election", country: "Sri Lanka" },
  { id: "lk-pres-resignation-2022", date: "2022-07-09", title: "Gotabaya Rajapaksa Resigns", description: "Massive public protests over economic crisis. President Rajapaksa fled to Maldives.", type: "judgement", country: "Sri Lanka" },
  { id: "lk-pres-2024", date: "2024-09-21", title: "Sri Lanka Presidential Election 2024", description: "Anura Kumara Dissanayake (AKD) of NPP won the presidency.", type: "election", country: "Sri Lanka" },
  { id: "lk-pres-2024-result", date: "2024-09-23", title: "AKD Wins Sri Lanka 2024", description: "First left-wing president in Sri Lanka's history elected.", type: "judgement", country: "Sri Lanka" },
  { id: "lk-parliament-2024", date: "2024-11-14", title: "Sri Lanka Parliamentary Election 2024", description: "NPP won a 2/3 supermajority in Parliament under President AKD.", type: "election", country: "Sri Lanka" },
  { id: "lk-pres-2029", date: "2029-09-01", title: "Sri Lanka Presidential Election 2029 (Projected)", description: "Next Sri Lankan presidential election.", type: "election", country: "Sri Lanka" },
];

// Get events for a specific month and country
export const getEventsForMonth = (year: number, month: number, country: string): ElectionEvent[] => {
  return electionEvents.filter(event => {
    if (event.country !== country) return false;
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
};

// Get all upcoming events for a country
export const getUpcomingEvents = (country: string, limit = 5): ElectionEvent[] => {
  const today = new Date();
  return electionEvents
    .filter(e => e.country === country && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
};

// Get recent past events
export const getPastEvents = (country: string, limit = 5): ElectionEvent[] => {
  const today = new Date();
  return electionEvents
    .filter(e => e.country === country && new Date(e.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
