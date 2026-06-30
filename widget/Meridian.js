// Meridian — iOS home-screen widget (Scriptable)
// Pulls live data from your GitHub Pages app and renders today's session,
// target lift, recovery, streak and last PR in the Meridian brass-on-black look.
// Tap the widget to open the full app.

const DATA_URL = "https://ryanebert14glitch--1ced3f0a74d611f1947d1607ee4eb77e.web.val.run";
const APP_URL  = "https://ryanebert14-glitch.github.io/meridien/";

const BRASS = new Color("#B89B5E");
const BONE  = new Color("#F5F2EC");
const RUST  = new Color("#E5743A");
const GREEN = new Color("#9FD46A");
const MUT   = new Color("#8B857A");
const INK   = new Color("#0A0908");

const fallback = {
  date: "Fri May 30", session: "Chest & Triceps", focus: "Push", moves: 7,
  target: "Smith bench 340", recovery: 86, streak: 23, weekSessions: "4/5",
  bodyweight: 198.4, lastPR: "Row 235 × 4"
};

let d = fallback;
try {
  const req = new Request(DATA_URL);
  req.timeoutInterval = 6;           // fail fast — widgets get only a few seconds
  const live = await req.loadJSON();
  if (live && typeof live === "object") d = Object.assign({}, fallback, live);
} catch (e) { /* offline or slow — render with fallback data */ }

const family = config.widgetFamily || "medium";
const w = new ListWidget();
w.url = APP_URL;
w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
w.setPadding(15, 17, 15, 17);

const g = new LinearGradient();
g.colors = [new Color("#3A2208"), INK];
g.locations = [0, 0.7];
g.startPoint = new Point(1, 0);
g.endPoint = new Point(0, 1);
w.backgroundGradient = g;

function meter(pct, width) {
  const h = 4, ctx = new DrawContext();
  ctx.size = new Size(width, h); ctx.opaque = false; ctx.respectScreenScale = true;
  ctx.setFillColor(new Color("#FFFFFF", 0.16)); ctx.fillRect(new Rect(0, 0, width, h));
  ctx.setFillColor(BRASS); ctx.fillRect(new Rect(0, 0, width * Math.max(0, Math.min(1, pct)), h));
  return ctx.getImage();
}

if (family === "small") {
  let lab = w.addText("TODAY"); lab.font = Font.semiboldSystemFont(10); lab.textColor = BRASS;
  w.addSpacer(7);
  let s = w.addText(d.session); s.font = Font.boldSystemFont(17); s.textColor = BONE; s.minimumScaleFactor = 0.7; s.lineLimit = 2;
  w.addSpacer(3);
  let t = w.addText(d.target); t.font = Font.systemFont(11); t.textColor = RUST; t.lineLimit = 1;
  w.addSpacer();
  let recRow = w.addStack(); recRow.layoutHorizontally(); recRow.bottomAlignContent();
  let rec = recRow.addText(String(d.recovery)); rec.font = Font.boldSystemFont(26); rec.textColor = BONE;
  recRow.addSpacer(6);
  let rl = recRow.addText("RECOVERY"); rl.font = Font.semiboldSystemFont(9); rl.textColor = MUT;
  w.addSpacer(6);
  w.addImage(meter(d.recovery / 100, 128));
} else {
  const row = w.addStack(); row.layoutHorizontally(); row.topAlignContent();

  const left = row.addStack(); left.layoutVertically();
  let lab = left.addText("TODAY · " + String(d.date).toUpperCase());
  lab.font = Font.semiboldSystemFont(10); lab.textColor = BRASS;
  left.addSpacer(8);
  let s = left.addText(d.session); s.font = Font.boldSystemFont(22); s.textColor = BONE; s.minimumScaleFactor = 0.8; s.lineLimit = 1;
  left.addSpacer(3);
  let t = left.addText(d.target + " · " + d.moves + " moves");
  t.font = Font.systemFont(12); t.textColor = RUST; t.lineLimit = 1;
  left.addSpacer();
  let st = left.addText("Streak " + d.streak + "    •    Week " + d.weekSessions);
  st.font = Font.systemFont(11); st.textColor = MUT;
  left.addSpacer(2);
  let pr = left.addText("Last PR · " + d.lastPR);
  pr.font = Font.systemFont(11); pr.textColor = GREEN;

  row.addSpacer();

  const right = row.addStack(); right.layoutVertically();
  let rnum = right.addText(String(d.recovery)); rnum.font = Font.boldSystemFont(34); rnum.textColor = BONE; rnum.rightAlignText();
  let rlab = right.addText("RECOVERY"); rlab.font = Font.semiboldSystemFont(9); rlab.textColor = BRASS; rlab.rightAlignText();
  right.addSpacer(12);
  right.addImage(meter(d.recovery / 100, 92));
}

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  family === "small" ? w.presentSmall() : w.presentMedium();
}
Script.complete();
