// ==UserScript==
// @name         FIS Live Scoring - Prettier Results
// @namespace    https://fis.live-scoring.com
// @version      3.4
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
      padding: 6px 0 10px !important;
      text-align: center;
    }

    /* Strip the inline background-image logo from the title div */
    .ls-competition__title {
      background-image: none !important;
      padding-left: 0 !important;
      min-height: 0 !important;
    }

    /* Force child headings down to container size */
    .ls-competition__title-container h1,
    .ls-competition__title-container h2,
    .ls-competition__title-container h3,
    .ls-competition__title-container h4,
    .ls-competition__title h1,
    .ls-competition__title h2,
    .ls-competition__title h3,
    .ls-competition__title h4 {
      font-size: 15px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      margin: 0 !important;
    }

    /* Also hide any <img>/<svg> logos if they appear elsewhere */
    .ls-competition__title-container img,
    .ls-competition__title-container svg,
    .ls-competition__title-container picture,
    .ls-competition__title img,
    .ls-competition__title svg,
    .ls-competition__title picture,
    [class*="ls-competition__logo"] {
      display: none !important;
    }

    .ls-result-group__result-table-container {
      max-width: 1100px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Hide the original table */
    table.result-table.tm-hidden {
      display: none !important;
    }

    /* Tabs */
    .tm-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 0;
    }

    .tm-tab {
      padding: 8px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      border: none;
      background: #e0e0e0;
      color: #666;
      transition: background 0.15s, color 0.15s;
    }

    .tm-tab:first-child {
      border-radius: 6px 0 0 0;
    }

    .tm-tab:last-child {
      border-radius: 0 6px 0 0;
    }

    .tm-tab.tm-active {
      background: #1a1a2e;
      color: #e0e0e0;
    }

    .tm-tab-content {
      display: none;
    }

    .tm-tab-content.tm-active {
      display: block;
    }

    /* Table styles */
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

    /* Header row: tabs on the left, paging on the right */
    .tm-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
    }

    .tm-paging {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .tm-page-size {
      font-size: 12px;
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: #fff;
      cursor: pointer;
    }

    .tm-page-prev,
    .tm-page-next {
      background: #1a1a2e;
      color: #e0e0e0;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
    }

    .tm-page-prev:disabled,
    .tm-page-next:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .tm-page-indicator {
      font-size: 12px;
      color: #444;
      min-width: 80px;
      text-align: center;
    }

    .tm-paging-off .tm-page-prev,
    .tm-paging-off .tm-page-next,
    .tm-paging-off .tm-page-indicator {
      display: none;
    }
  `;

  function getRunData(row) {
    const cells = row.querySelectorAll('td');
    const scoreCell = cells[10];
    const text = scoreCell ? scoreCell.textContent.trim() : '';
    const j1 = cells[7]?.textContent.trim() || '';
    const j2 = cells[8]?.textContent.trim() || '';
    const j3 = cells[9]?.textContent.trim() || '';
    if (text === 'DNI' || text === 'DNS' || text === '') return { score: text, j1, j2, j3, isStatus: true };
    return { score: text, j1, j2, j3, isStatus: false };
  }

  function extractAthletes(table) {
    const entries = table.querySelectorAll('tbody.result-table-entry');
    const athletes = [];

    entries.forEach(entry => {
      const rows = entry.querySelectorAll('tr.result-table-row');
      const run1Row = rows[0];
      const run2Row = rows[1];
      if (!run1Row) return;

      const cells = run1Row.querySelectorAll('td');
      athletes.push({
        rank: cells[0]?.textContent.trim() || '',
        stNr: cells[1]?.textContent.trim() || '',
        bib: cells[2]?.textContent.trim() || '',
        name: cells[3]?.textContent.trim() || '',
        bestScore: cells[11]?.textContent.trim() || '',
        run1: getRunData(run1Row),
        run2: run2Row ? getRunData(run2Row) : { score: '', j1: '', j2: '', j3: '', isStatus: true },
        inProgress: entry.classList.contains('result-table--in-progress'),
      });
    });

    return athletes;
  }

  function runCellHtml(run) {
    if (run.isStatus) return run.score || '-';
    const judges = (run.j1 || run.j2 || run.j3)
      ? `<div class="tm-judges">${run.j1} | ${run.j2} | ${run.j3}</div>`
      : '';
    return `${run.score}${judges}`;
  }

  function rankHtml(rankText) {
    const rank = parseInt(rankText);
    if (rank === 1) return '<span class="tm-rank-badge tm-gold">1</span>';
    if (rank === 2) return '<span class="tm-rank-badge tm-silver">2</span>';
    if (rank === 3) return '<span class="tm-rank-badge tm-bronze">3</span>';
    return rankText;
  }

  function buildTable(athletes, showStNr) {
    const tbl = document.createElement('table');
    tbl.className = 'tm-table';

    const thead = document.createElement('thead');
    const stNrHeader = showStNr ? '<th>StNr</th>' : '';
    thead.innerHTML = `<tr>
      <th>Rank</th>
      ${stNrHeader}
      <th>Bib</th>
      <th class="tm-col-name">Name</th>
      <th>Run 1</th>
      <th>Run 2</th>
      <th>Best</th>
    </tr>`;
    tbl.appendChild(thead);

    const tbody = document.createElement('tbody');

    athletes.forEach(a => {
      const rank = parseInt(a.rank);
      const r1Val = parseFloat(a.run1.score);
      const r2Val = parseFloat(a.run2.score);
      const run1IsBest = !isNaN(r1Val) && (isNaN(r2Val) || r1Val >= r2Val);
      const run2IsBest = !isNaN(r2Val) && (isNaN(r1Val) || r2Val > r1Val);

      const run1Class = a.run1.isStatus ? 'tm-col-run tm-status' : (run1IsBest ? 'tm-col-run tm-best-run' : 'tm-col-run');
      const run2Class = a.run2.isStatus ? 'tm-col-run tm-status' : (run2IsBest ? 'tm-col-run tm-best-run' : 'tm-col-run');

      const tr = document.createElement('tr');
      if (rank === 1) tr.classList.add('tm-podium-1');
      if (rank === 2) tr.classList.add('tm-podium-2');
      if (rank === 3) tr.classList.add('tm-podium-3');
      if (a.inProgress) tr.classList.add('tm-in-progress');

      const stNrCol = showStNr ? `<td>${a.stNr}</td>` : '';

      tr.innerHTML = `
        <td>${rankHtml(a.rank)}</td>
        ${stNrCol}
        <td>${a.bib}</td>
        <td class="tm-col-name">${a.name}</td>
        <td class="${run1Class}">${runCellHtml(a.run1)}</td>
        <td class="${run2Class}">${runCellHtml(a.run2)}</td>
        <td class="tm-col-best">${a.bestScore}</td>
      `;

      tbody.appendChild(tr);
    });

    tbl.appendChild(tbody);
    return tbl;
  }

  const PAGE_SIZE_OPTIONS = [
    { value: 0, label: 'All' },
    { value: 10, label: '10 / page' },
    { value: 15, label: '15 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
  ];

  function renderPanes(container, athletes) {
    const pageSize = container.__tmPageSize || 0;
    const totalPages = pageSize ? Math.max(1, Math.ceil(athletes.length / pageSize)) : 1;
    const page = Math.min(Math.max(0, container.__tmPage || 0), totalPages - 1);
    container.__tmPage = page;

    const window = list => pageSize ? list.slice(page * pageSize, (page + 1) * pageSize) : list;

    const rankPane = container.querySelector('.tm-pane-rank');
    const startPane = container.querySelector('.tm-pane-start');
    rankPane.replaceChildren(buildTable(window(athletes), false));
    const startAthletes = [...athletes].sort((a, b) => parseInt(a.stNr) - parseInt(b.stNr));
    startPane.replaceChildren(buildTable(window(startAthletes), true));

    const paging = container.querySelector('.tm-paging');
    const indicator = paging.querySelector('.tm-page-indicator');
    const prev = paging.querySelector('.tm-page-prev');
    const next = paging.querySelector('.tm-page-next');
    if (pageSize) {
      paging.classList.remove('tm-paging-off');
      indicator.textContent = `Page ${page + 1} / ${totalPages}`;
      prev.disabled = page === 0;
      next.disabled = page >= totalPages - 1;
    } else {
      paging.classList.add('tm-paging-off');
    }
  }

  function buildContainer() {
    const container = document.createElement('div');
    container.className = 'tm-container';
    container.__tmPageSize = 0;
    container.__tmPage = 0;
    container.__tmAthletes = [];

    const header = document.createElement('div');
    header.className = 'tm-header';

    const tabs = document.createElement('div');
    tabs.className = 'tm-tabs';

    const tabRank = document.createElement('button');
    tabRank.className = 'tm-tab tm-active';
    tabRank.textContent = 'By Rank';

    const tabStart = document.createElement('button');
    tabStart.className = 'tm-tab';
    tabStart.textContent = 'By Start Order';

    tabs.appendChild(tabRank);
    tabs.appendChild(tabStart);
    header.appendChild(tabs);

    const paging = document.createElement('div');
    paging.className = 'tm-paging tm-paging-off';

    const sizeSelect = document.createElement('select');
    sizeSelect.className = 'tm-page-size';
    PAGE_SIZE_OPTIONS.forEach(opt => {
      const option = document.createElement('option');
      option.value = String(opt.value);
      option.textContent = opt.label;
      sizeSelect.appendChild(option);
    });

    const prev = document.createElement('button');
    prev.className = 'tm-page-prev';
    prev.textContent = '◀';

    const indicator = document.createElement('span');
    indicator.className = 'tm-page-indicator';

    const next = document.createElement('button');
    next.className = 'tm-page-next';
    next.textContent = '▶';

    paging.appendChild(sizeSelect);
    paging.appendChild(prev);
    paging.appendChild(indicator);
    paging.appendChild(next);
    header.appendChild(paging);

    container.appendChild(header);

    const rankPane = document.createElement('div');
    rankPane.className = 'tm-tab-content tm-pane-rank tm-active';
    container.appendChild(rankPane);

    const startPane = document.createElement('div');
    startPane.className = 'tm-tab-content tm-pane-start';
    container.appendChild(startPane);

    tabRank.addEventListener('click', () => {
      tabRank.classList.add('tm-active');
      tabStart.classList.remove('tm-active');
      rankPane.classList.add('tm-active');
      startPane.classList.remove('tm-active');
    });

    tabStart.addEventListener('click', () => {
      tabStart.classList.add('tm-active');
      tabRank.classList.remove('tm-active');
      startPane.classList.add('tm-active');
      rankPane.classList.remove('tm-active');
    });

    sizeSelect.addEventListener('change', () => {
      container.__tmPageSize = parseInt(sizeSelect.value, 10) || 0;
      container.__tmPage = 0;
      renderPanes(container, container.__tmAthletes);
    });

    prev.addEventListener('click', () => {
      container.__tmPage = Math.max(0, (container.__tmPage || 0) - 1);
      renderPanes(container, container.__tmAthletes);
    });

    next.addEventListener('click', () => {
      container.__tmPage = (container.__tmPage || 0) + 1;
      renderPanes(container, container.__tmAthletes);
    });

    return container;
  }

  const tableToContainer = new WeakMap();

  function applyEnhancements() {
    if (!document.getElementById('tm-fis-style')) {
      STYLE.id = 'tm-fis-style';
      document.head.appendChild(STYLE);
    }

    document.querySelectorAll('table.result-table').forEach(table => {
      const athletes = extractAthletes(table);
      if (!athletes.length) return;

      let container = tableToContainer.get(table);
      if (container && !container.isConnected) {
        tableToContainer.delete(table);
        container = null;
      }

      if (container) {
        container.__tmAthletes = athletes;
        renderPanes(container, athletes);
      } else {
        container = buildContainer();
        container.__tmAthletes = athletes;
        renderPanes(container, athletes);
        table.classList.add('tm-hidden');
        table.parentNode.insertBefore(container, table.nextSibling);
        tableToContainer.set(table, container);
      }
    });
  }

  function mutationIsOurs(mutation) {
    let node = mutation.target;
    while (node) {
      if (node.nodeType === 1 && node.classList && node.classList.contains('tm-container')) return true;
      node = node.parentNode;
    }
    return false;
  }

  let scheduled = false;
  const observer = new MutationObserver(mutations => {
    if (scheduled) return;
    if (mutations.every(mutationIsOurs)) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyEnhancements();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEnhancements);
  } else {
    applyEnhancements();
  }
})();
