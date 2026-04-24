// ==UserScript==
// @name         FIS Live Scoring - Prettier Results
// @namespace    https://fis.live-scoring.com
// @version      2.0
// @description  Cleaner, more readable FIS live-scoring results for TV display
// @match        https://fis.live-scoring.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STYLE = document.createElement('style');
  STYLE.textContent = `
    /* Hide unwanted elements */
    .ls-competition__header,
    .ls-competition__navbar,
    noscript,
    .give-freely-root {
      display: none !important;
    }

    /* Overall page cleanup */
    body {
      background: #fff !important;
      padding: 20px !important;
    }

    .ls-competition__title-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      font-weight: 600;
      padding: 6px 0 12px !important;
      text-align: center;
    }

    .ls-result-group__result-table-container {
      max-width: 1100px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Hide the original table once we've built the new one */
    table.result-table.tm-hidden {
      display: none !important;
    }

    /* New merged table */
    table.tm-table {
      border-collapse: collapse;
      width: 100%;
      font-size: 14px;
      line-height: 1.4;
    }

    table.tm-table thead th {
      background: #1a1a2e;
      color: #e0e0e0;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border-bottom: 2px solid #16213e;
      position: sticky;
      top: 0;
      z-index: 10;
      text-align: center;
    }

    table.tm-table thead th.tm-col-name {
      text-align: left;
    }

    table.tm-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.15s;
    }

    table.tm-table tbody tr:hover {
      background: #f0f4ff;
    }

    table.tm-table tbody tr:nth-child(even) {
      background: #fafafa;
    }
    table.tm-table tbody tr:nth-child(even):hover {
      background: #f0f4ff;
    }

    table.tm-table td {
      padding: 7px 10px;
      vertical-align: middle;
      text-align: center;
    }

    table.tm-table td.tm-col-name {
      text-align: left;
      font-weight: 500;
      white-space: nowrap;
    }

    table.tm-table td.tm-col-best {
      font-weight: 700;
      font-size: 15px;
      color: #1a1a2e;
    }

    table.tm-table td.tm-col-run {
      font-size: 13px;
      line-height: 1.3;
    }

    table.tm-table .tm-judges {
      font-size: 11px;
      color: #888;
      margin-top: 2px;
    }

    table.tm-table td.tm-status {
      color: #999;
      font-style: italic;
      font-size: 12px;
    }

    /* The better run gets a subtle highlight */
    table.tm-table td.tm-best-run {
      font-weight: 600;
      color: #1a1a2e;
    }

    /* Podium rows */
    table.tm-table tr.tm-podium-1 { background: #fff9e6; }
    table.tm-table tr.tm-podium-2 { background: #f5f5f5; }
    table.tm-table tr.tm-podium-3 { background: #fdf0e6; }
    table.tm-table tr.tm-podium-1:hover,
    table.tm-table tr.tm-podium-2:hover,
    table.tm-table tr.tm-podium-3:hover { background: #f0f4ff; }

    /* Rank badges */
    .tm-rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 12px;
      color: #fff;
    }
    .tm-rank-badge.tm-gold { background: #d4a017; }
    .tm-rank-badge.tm-silver { background: #9e9e9e; }
    .tm-rank-badge.tm-bronze { background: #b87333; }

    /* In-progress row */
    table.tm-table tr.tm-in-progress td:first-child {
      border-left: 3px solid #4caf50;
    }
  `;

  function getRunData(row) {
    const cells = row.querySelectorAll('td');
    // Structure: Rank(0), StNr(1), Bib(2), Name(3), NSA(4), YB(5), Run(6), J1(7), J2(8), J3(9), Score(10), BestScore(11)
    const scoreCell = cells[10];
    const text = scoreCell ? scoreCell.textContent.trim() : '';
    const j1 = cells[7]?.textContent.trim() || '';
    const j2 = cells[8]?.textContent.trim() || '';
    const j3 = cells[9]?.textContent.trim() || '';
    if (text === 'DNI' || text === 'DNS' || text === '') return { score: text, j1, j2, j3, isStatus: true };
    return { score: text, j1, j2, j3, isStatus: false };
  }

  function buildMergedTable(table) {
    const entries = table.querySelectorAll('tbody.result-table-entry');
    if (!entries.length) return null;

    const newTable = document.createElement('table');
    newTable.className = 'tm-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
      <th>Rank</th>
      <th>Bib</th>
      <th class="tm-col-name">Name</th>
      <th>Run 1</th>
      <th>Run 2</th>
      <th>Best</th>
    </tr>`;
    newTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    entries.forEach(entry => {
      const rows = entry.querySelectorAll('tr.result-table-row');
      const run1Row = rows[0];
      const run2Row = rows[1];
      if (!run1Row) return;

      const run1Cells = run1Row.querySelectorAll('td');
      const rankText = run1Cells[0]?.textContent.trim() || '';
      const bib = run1Cells[2]?.textContent.trim() || '';
      const name = run1Cells[3]?.textContent.trim() || '';
      const nsa = run1Cells[4]?.textContent.trim() || '';
      const bestScore = run1Cells[11]?.textContent.trim() || '';

      const run1 = getRunData(run1Row);
      const run2 = run2Row ? getRunData(run2Row) : { score: '', j1: '', j2: '', j3: '', isStatus: true };

      const rank = parseInt(rankText);
      const tr = document.createElement('tr');

      // Podium classes
      if (rank === 1) tr.classList.add('tm-podium-1');
      if (rank === 2) tr.classList.add('tm-podium-2');
      if (rank === 3) tr.classList.add('tm-podium-3');

      // In-progress
      if (entry.classList.contains('result-table--in-progress')) {
        tr.classList.add('tm-in-progress');
      }

      // Determine which run is the best
      const r1Val = parseFloat(run1.score);
      const r2Val = parseFloat(run2.score);
      const run1IsBest = !isNaN(r1Val) && (isNaN(r2Val) || r1Val >= r2Val);
      const run2IsBest = !isNaN(r2Val) && (isNaN(r1Val) || r2Val > r1Val);

      // Rank cell
      let rankHtml = rankText;
      if (rank === 1) rankHtml = '<span class="tm-rank-badge tm-gold">1</span>';
      else if (rank === 2) rankHtml = '<span class="tm-rank-badge tm-silver">2</span>';
      else if (rank === 3) rankHtml = '<span class="tm-rank-badge tm-bronze">3</span>';

      const run1Class = run1.isStatus ? 'tm-col-run tm-status' : (run1IsBest ? 'tm-col-run tm-best-run' : 'tm-col-run');
      const run2Class = run2.isStatus ? 'tm-col-run tm-status' : (run2IsBest ? 'tm-col-run tm-best-run' : 'tm-col-run');

      function runCellHtml(run) {
        if (run.isStatus) return run.score || '-';
        const judges = (run.j1 || run.j2 || run.j3)
          ? `<div class="tm-judges">${run.j1} | ${run.j2} | ${run.j3}</div>`
          : '';
        return `${run.score}${judges}`;
      }

      tr.innerHTML = `
        <td>${rankHtml}</td>
        <td>${bib}</td>
        <td class="tm-col-name">${name}</td>
        <td class="${run1Class}">${runCellHtml(run1)}</td>
        <td class="${run2Class}">${runCellHtml(run2)}</td>
        <td class="tm-col-best">${bestScore}</td>
      `;

      tbody.appendChild(tr);
    });

    newTable.appendChild(tbody);
    return newTable;
  }

  function applyEnhancements() {
    const tables = document.querySelectorAll('table.result-table:not(.tm-hidden)');
    if (!tables.length) return false;

    if (!document.getElementById('tm-fis-style')) {
      STYLE.id = 'tm-fis-style';
      document.head.appendChild(STYLE);
    }

    tables.forEach(table => {
      const merged = buildMergedTable(table);
      if (!merged) return;
      table.classList.add('tm-hidden');
      table.parentNode.insertBefore(merged, table.nextSibling);
    });

    return true;
  }

  // The page is a SPA, so observe for DOM changes
  const observer = new MutationObserver(() => {
    applyEnhancements();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEnhancements);
  } else {
    applyEnhancements();
  }
})();
