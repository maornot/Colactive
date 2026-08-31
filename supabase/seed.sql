-- קולאקטייב — seed data
-- The ten sources manually verified against their own websites, August 2026
-- (see lib/data/verified-sources.ts, the single source of truth this file mirrors).
-- Only bodies with a verified, working publications page are seeded here —
-- never invent a URL for an unverified body (see README, "Verified Sources").

insert into bodies (name, initials, category, source_url, source_kind, adapter, verified, last_status)
values
  ('מינהל הרכש הממשלתי', 'רכ', 'government', 'https://mr.gov.il/ilgstorefront/he/search/?s=TENDER', 'portal', 'mr-gov-il', true, 'ok'),
  ('משרד החינוך', 'חנ', 'government', 'https://pob.education.gov.il/kolotkorim/kolkore/', 'list', null, true, 'ok'),
  ('הרשות לפיתוח ירושלים', 'יר', 'government', 'https://www.jda.gov.il/%D7%9E%D7%9B%D7%A8%D7%96%D7%99%D7%9D%D7%A4%D7%A0%D7%99%D7%9E%D7%99/', 'tenders_page', null, true, 'ok'),
  ('עיריית תל אביב-יפו', 'תא', 'municipal', 'https://www.tel-aviv.gov.il/AuctionAndCareers/Pages/Suppliers.aspx', 'tenders_page', null, true, 'ok'),
  ('מועצת הפיס לתרבות ואמנות', 'פי', 'ngo', 'https://culture.pais.co.il/', 'list', null, true, 'ok'),
  ('אות־אות־אות', 'אא', 'ngo', 'https://alefalefalef.co.il/opencal/', 'list', null, true, 'ok'),
  ('עיריית חיפה', 'חי', 'municipal', 'https://www2.haifa.muni.il/Michrazim/Default.aspx', 'tenders_page', null, true, 'ok'),
  ('עיריית גבעתיים', 'גב', 'municipal', 'https://www.givatayim.muni.il/bids/', 'tenders_page', null, true, 'ok'),
  ('רשות הטבע והגנים', 'טב', 'government', 'https://www.parks.org.il/tenders/', 'tenders_page', null, true, 'ok'),
  ('משרד הביטחון', 'בט', 'government', 'https://www.online.mod.gov.il/Online2016/Pages/General/Balam/BalamList.aspx?Reset=1', 'portal', null, true, 'ok')
on conflict (name) do nothing;
