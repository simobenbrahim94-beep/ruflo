'use strict';
// Integrations: web search, weather, finance, email (Apple Mail), Chrome control, news
// All free — no extra API keys required (except optional ones noted below)

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ── Web search (DuckDuckGo — no key) ─────────────────────────────────────────
async function searchWeb(query) {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&no_redirect=1`;
    const { stdout } = await execAsync(`curl -s --max-time 8 "${url}"`);
    const d = JSON.parse(stdout);
    const abstract = d.AbstractText || '';
    const answer = d.Answer || '';
    const topics = (d.RelatedTopics || [])
      .filter(t => t.Text)
      .slice(0, 4)
      .map(t => `• ${t.Text.slice(0, 150)}`)
      .join('\n');

    if (abstract) return abstract.slice(0, 600);
    if (answer) return answer;
    if (topics) return `Résultats pour "${query}":\n${topics}`;
    return `Aucun résultat instantané. Ouvre Chrome pour plus d'infos.`;
  } catch (err) {
    return `Erreur recherche: ${err.message}`;
  }
}

// ── Weather (wttr.in — no key) ────────────────────────────────────────────────
async function getWeather(location = 'Paris') {
  try {
    const loc = encodeURIComponent(location);
    const { stdout } = await execAsync(
      `curl -s --max-time 8 "https://wttr.in/${loc}?format=j1"`
    );
    const d = JSON.parse(stdout);
    const cur = d.current_condition[0];
    const today = d.weather[0];
    const desc = cur.weatherDesc[0].value;
    const tempC = cur.temp_C;
    const feelsLike = cur.FeelsLikeC;
    const humidity = cur.humidity;
    const windKmph = cur.windspeedKmph;
    const maxC = today.maxtempC;
    const minC = today.mintempC;
    const area = d.nearest_area?.[0]?.areaName?.[0]?.value || location;
    return `${area}: ${desc}, ${tempC}°C (ressenti ${feelsLike}°C). Humidité: ${humidity}%. Vent: ${windKmph} km/h. Min/Max aujourd'hui: ${minC}°/${maxC}°C.`;
  } catch (err) {
    return `Météo indisponible pour "${location}": ${err.message}`;
  }
}

// ── Financial data (Yahoo Finance — no key) ───────────────────────────────────
async function getFinancialData(symbol) {
  try {
    const sym = symbol.toUpperCase().replace(/[^A-Z0-9.^=]/g, '');
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`;
    const { stdout } = await execAsync(`curl -s --max-time 8 "${url}"`);
    const d = JSON.parse(stdout);
    const meta = d?.chart?.result?.[0]?.meta;
    if (!meta) return `Symbole "${symbol}" introuvable.`;
    const price = meta.regularMarketPrice?.toFixed(2);
    const prev = meta.chartPreviousClose?.toFixed(2);
    const change = prev ? ((meta.regularMarketPrice - meta.chartPreviousClose)).toFixed(2) : null;
    const changePct = prev ? (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100).toFixed(2) : null;
    const currency = meta.currency || 'USD';
    const sign = change > 0 ? '+' : '';
    return `${sym}: ${price} ${currency}${change ? ` (${sign}${change}, ${sign}${changePct}%)` : ''}. Marché: ${meta.exchangeName || '—'}.`;
  } catch (err) {
    return `Données financières indisponibles: ${err.message}`;
  }
}

// ── Apple Mail — unread emails ────────────────────────────────────────────────
async function getEmails(maxCount = 5) {
  const script = `
tell application "Mail"
  set msgs to messages of inbox whose read status is false
  set n to count of msgs
  if n = 0 then return "Aucun email non lu."
  set cap to ${Math.min(maxCount, 10)}
  if n < cap then set cap to n
  set out to n & " emails non lus. Voici les " & cap & " plus récents:" & return
  repeat with i from 1 to cap
    set m to item i of msgs
    set out to out & return & "De: " & (sender of m) & return
    set out to out & "Sujet: " & (subject of m) & return
    set out to out & "Date: " & ((date sent of m) as string) & return
    set out to out & "---"
  end repeat
  return out as string
end tell`;
  try {
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return stdout.trim() || 'Aucun email non lu.';
  } catch (err) {
    return `Impossible d'accéder à Apple Mail: ${err.message}. Assurez-vous que Mail est configuré.`;
  }
}

// ── Send email (Apple Mail) ───────────────────────────────────────────────────
async function sendEmail(to, subject, body) {
  const script = `
tell application "Mail"
  set newMsg to make new outgoing message with properties {subject:"${subject.replace(/"/g, '\\"')}", content:"${body.replace(/"/g, '\\"')}"}
  tell newMsg
    make new to recipient with properties {address:"${to}"}
  end tell
  send newMsg
end tell`;
  try {
    await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return `Email envoyé à ${to} : "${subject}"`;
  } catch (err) {
    return `Erreur envoi email: ${err.message}`;
  }
}

// ── Chrome control ────────────────────────────────────────────────────────────
async function getChromeTab() {
  try {
    const { stdout } = await execAsync(
      `osascript -e 'tell application "Google Chrome" to get title of active tab of front window & " | " & URL of active tab of front window'`
    );
    return stdout.trim();
  } catch {
    return 'Chrome non ouvert ou inaccessible.';
  }
}

async function openInChrome(url) {
  try {
    const safeUrl = url.replace(/['"]/g, '');
    await execAsync(`osascript -e 'tell application "Google Chrome" to open location "${safeUrl}"'`);
    return `Ouvert dans Chrome: ${url}`;
  } catch (err) {
    // Fallback to default browser
    await execAsync(`open "${url.replace(/['"]/g, '')}"`);
    return `Ouvert dans le navigateur: ${url}`;
  }
}

async function searchInChrome(query) {
  const encoded = encodeURIComponent(query);
  return openInChrome(`https://www.google.com/search?q=${encoded}`);
}

// ── News (RSS, no key) ────────────────────────────────────────────────────────
const NEWS_FEEDS = {
  monde:   'https://www.lemonde.fr/rss/une.xml',
  bbc:     'https://feeds.bbci.co.uk/news/world/rss.xml',
  finance: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  tech:    'https://feeds.bbci.co.uk/news/technology/rss.xml',
  france:  'https://www.franceinfo.fr/arc/outboundfeeds/rss/',
};

async function getNews(topic = 'monde', maxItems = 5) {
  const feedUrl = NEWS_FEEDS[topic.toLowerCase()] || NEWS_FEEDS.monde;
  try {
    const { stdout } = await execAsync(`curl -s --max-time 8 "${feedUrl}"`);
    const titles = [];
    const regex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(stdout)) !== null && count < maxItems + 1) {
      const title = (match[1] || match[2] || '').trim();
      if (title && !title.toLowerCase().includes('rss') && count > 0) {
        titles.push(`• ${title}`);
      }
      count++;
    }
    return titles.length ? `Actualités ${topic}:\n${titles.join('\n')}` : 'Aucune actualité disponible.';
  } catch (err) {
    return `Actualités indisponibles: ${err.message}`;
  }
}

// ── Reminder / Calendar (macOS Reminders) ────────────────────────────────────
async function getReminders() {
  const script = `
tell application "Reminders"
  set out to ""
  set rems to reminders whose completed is false
  set cap to min(5, count of rems)
  repeat with i from 1 to cap
    set r to item i of rems
    set out to out & "• " & name of r & return
  end repeat
  if out is "" then return "Aucun rappel en cours."
  return out
end tell`;
  try {
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    return stdout.trim();
  } catch (err) {
    return `Rappels inaccessibles: ${err.message}`;
  }
}

module.exports = { searchWeb, getWeather, getFinancialData, getEmails, sendEmail, getChromeTab, openInChrome, searchInChrome, getNews, getReminders };
