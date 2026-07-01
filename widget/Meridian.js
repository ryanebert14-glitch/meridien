// Meridian — iOS home-screen widget (Scriptable). Workout-only.
// Reads live data from the Val Town endpoint; taps open the app.

const DATA_URL = "https://ryanebert14glitch--1ced3f0a74d611f1947d1607ee4eb77e.web.val.run";
const APP_URL  = "https://ryanebert14glitch--1ced3f0a74d611f1947d1607ee4eb77e.web.val.run";

const BRASS = new Color("#B89B5E");
const BONE  = new Color("#F5F2EC");
const RUST  = new Color("#E5743A");
const GREEN = new Color("#9FD46A");
const MUT   = new Color("#8B857A");
const INK   = new Color("#0A0908");

const fallback = {
  date: "Today", session: "Ready to train", target: "Pick your workout",
  streak: 0, weekSessions: "0/5", lastSession: "—"
};

let d = fallback;
try {
  const req = new Request(DATA_URL);
  req.timeoutInterval = 6;
  const live = await req.loadJSON();
  if (live && typeof live === "object") d = Object.assign({}, fallback, live);
} catch (e) { /* offline — render fallback */ }

function weekFrac(ws) {
  const p = String(ws).split("/"); const n = parseFloat(p[0]) || 0, den = parseFloat(p[1]) || 5;
  return Math.max(0, Math.min(1, n / den));
}

const family = config.widgetFamily || "medium";
const w = new ListWidget();
w.url = "https://ryanebert14-glitch.github.io/meridien/";
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
  let row = w.addStack(); row.layoutHorizontally(); row.bottomAlignContent();
  let num = row.addText(String(d.streak)); num.font = Font.boldSystemFont(26); num.textColor = BONE;
  row.addSpacer(6);
  let dl = row.addText("DAY STREAK"); dl.font = Font.semiboldSystemFont(9); dl.textColor = MUT;
  w.addSpacer(6);
  w.addImage(meter(weekFrac(d.weekSessions), 128));
} else {
  const row = w.addStack(); row.layoutHorizontally(); row.topAlignContent();

  const left = row.addStack(); left.layoutVertically();
  let lab = left.addText("TODAY · " + String(d.date).toUpperCase());
  lab.font = Font.semiboldSystemFont(10); lab.textColor = BRASS;
  left.addSpacer(8);
  let s = left.addText(d.session); s.font = Font.boldSystemFont(22); s.textColor = BONE; s.minimumScaleFactor = 0.8; s.lineLimit = 1;
  left.addSpacer(3);
  let t = left.addText(d.target); t.font = Font.systemFont(12); t.textColor = RUST; t.lineLimit = 1;
  left.addSpacer();
  let ws = left.addText("Week " + d.weekSessions + " sessions"); ws.font = Font.systemFont(11); ws.textColor = MUT;
  left.addSpacer(2);
  let ls = left.addText("Last · " + d.lastSession); ls.font = Font.systemFont(11); ls.textColor = GREEN; ls.lineLimit = 1;

  row.addSpacer();

  const right = row.addStack(); right.layoutVertically();
  let num = right.addText(String(d.streak)); num.font = Font.boldSystemFont(34); num.textColor = BONE; num.rightAlignText();
  let dl = right.addText("DAY STREAK"); dl.font = Font.semiboldSystemFont(9); dl.textColor = BRASS; dl.rightAlignText();
  right.addSpacer(12);
  right.addImage(meter(weekFrac(d.weekSessions), 92));
}

if (config.runsInWidget) { Script.setWidget(w); }
else { family === "small" ? w.presentSmall() : w.presentMedium(); }
Script.complete();
