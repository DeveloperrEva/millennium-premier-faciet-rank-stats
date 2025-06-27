/**
 * You have a limited version of the Millennium API available to you in the webkit context.
 */
type Millennium = {
    callServerMethod: (methodName: string, kwargs?: any) => Promise<any>,
    findElement: (privateDocument: Document, querySelector: string, timeOut?: number) => Promise<NodeListOf<Element>>,
};

declare const Millennium: Millennium;

export default async function WebkitMain() {
    // Determine language
    const langCode = document.documentElement.lang?.toLowerCase() || navigator.language.toLowerCase();
    const isRussian = langCode.startsWith('ru');
    const t = {
        loading: isRussian ? 'Загрузка данных FaceIt...' : 'Loading Faceit data...',
        created: isRussian ? 'Создан:' : 'Created:',
        restrictions: isRussian ? 'Ограничения:' : 'Restrictions:',
        cs2since: isRussian ? 'В CS2 с:' : 'CS2 since:',
        cstotalhours: isRussian ? 'Всего часов CS:' : 'CS total hours:',
        cs2weeks: isRussian ? 'CS2 за 2 недели:' : 'CS2 last 2 weeks hours:',
        leetify: isRussian ? 'Рейтинг Aim (Leetify):' : 'Leetify aim rating:',
        premier: isRussian ? 'Рейтинг Premier:' : 'Premier rating:',
        matches: isRussian ? 'Матчи:' : 'Matches:',
        kd: isRussian ? 'К/Д:' : 'K/D:',
        showDetailed: isRussian ? 'Показать подробную статистику FaceIt' : 'Show detailed Faceit stats',
        failedLoad: isRussian ? 'Не удалось загрузить данные FaceIt.' : 'Failed to load Faceit data.'
    };

    console.log('FaceIt Stats loaded.');
    const rightCol = await Millennium.findElement(document, '.profile_rightcol');
    if (!rightCol.length) {
        console.error('Parent container ".profile_rightcol" not found');
        return;
    }

    // Loading spinner
    const loadingHTML = document.createElement('div');
    loadingHTML.className = 'account-row';
    loadingHTML.innerHTML = `
<div class="faceit-loading-container">
  <div class="faceit-spinner"></div>
  <div class="faceit-loading-text">${t.loading}</div>
</div>`.trim();
    rightCol[0].insertBefore(loadingHTML, rightCol[0].children[1]);

    try {
        const parser = new DOMParser();

        // Steam profile XML
        const profileXml = parser.parseFromString(
            await (await fetch(`${window.location.href}/?xml=1`)).text(),
            'application/xml'
        );
        const steamID64 = profileXml.querySelector('steamID64')?.textContent || '0';
        const memberSince = profileXml.querySelector('memberSince')?.textContent || 'N/A';
        const vacBanned = parseInt(profileXml.querySelector('vacBanned')?.textContent || '0', 10);
        const tradeBanState = profileXml.querySelector('tradeBanState')?.textContent || 'Not played.';
        const isLimitedAccount = parseInt(profileXml.querySelector('isLimitedAccount')?.textContent || '0', 10);

        // Game hours
        const gameXml = parser.parseFromString(
            await (await fetch(`${window.location.href}/games?tab=all&xml=1`)).text(),
            'application/xml'
        );
        const cs2 = Array.from(gameXml.querySelectorAll('game')).find(
            g => g.querySelector('appID')?.textContent === '730'
        );
        const csHours = cs2 ? cs2.querySelector('hoursOnRecord')?.textContent || 'Private' : 'Private';
        const csRecentHours = cs2 ? cs2.querySelector('hoursLast2Weeks')?.textContent || '0' : 'Private';

        // First-play date
        const statsXml = parser.parseFromString(
            await (await fetch(`${window.location.href}/stats/CSGO?xml=1`)).text(),
            'application/xml'
        );
        const unlockTs = statsXml.querySelector('achievement > unlockTimestamp')?.textContent;
        const playsSince = unlockTs
            ? new Date(parseInt(unlockTs, 10) * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              })
            : 'None';

        // Backend calls
        const faceItUserRaw = await Millennium.callServerMethod('get_user_by_steamId', { steamId: steamID64 });
        console.log('FaceIt raw:', faceItUserRaw);
        const faceItUserJSON = JSON.parse(faceItUserRaw);

        const leetifyAimRating = await Millennium.callServerMethod('get_aim_rating', { steamId: steamID64 });
        console.log('Leetify aim:', leetifyAimRating);

        const csStatsRaw = await Millennium.callServerMethod('get_csstats', { steamId: steamID64 });
        console.log('CSStats raw:', csStatsRaw);
        const csStats = typeof csStatsRaw === 'string' ? JSON.parse(csStatsRaw) : csStatsRaw;
        console.log('CSStats parsed:', csStats);

        // Build HTML
        const statsHTML = document.createElement('div');
        statsHTML.innerHTML = `
<div class="account-row">
  <div class="account-steaminfo-container">
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick acc_created">${t.created} <span class="account-steaminfo-row-value">${memberSince}</span></li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick">${t.restrictions}
          <span class="account-steaminfo-row-value ${vacBanned===0?'account-steaminfo-row-value-confirmed':'account-steaminfo-row-value-urgent'}">VAC</span>
          <span class="account-steaminfo-row-value ${tradeBanState==='None'?'account-steaminfo-row-value-confirmed':'account-steaminfo-row-value-urgent'}">Trade</span>
          <span class="account-steaminfo-row-value ${isLimitedAccount===0?'account-steaminfo-row-value-confirmed':'account-steaminfo-row-value-urgent'}">Limited</span>
        </li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="cross">${t.cs2since} <span class="account-steaminfo-row-value">${playsSince}</span></li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick">${t.cstotalhours} <a class="nolink" target="_blank" href="https://steamcommunity.com/profiles/${steamID64}/games/?tab=all">
          <span class="account-steaminfo-row-value">${csHours}</span>
        </a></li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick">${t.cs2weeks} <a class="nolink" target="_blank" href="https://steamcommunity.com/profiles/${steamID64}/games/?tab=recent">
          <span class="account-steaminfo-row-value">${csRecentHours}</span>
        </a></li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick">${t.leetify} <a class="nolink" target="_blank" href="https://leetify.com/app/profile/${steamID64}">
          <span class="account-steaminfo-row-value">${leetifyAimRating?leetifyAimRating+'%':'N/A'}</span>
        </a></li>
      </ul>
    </div>
    <div class="account-steaminfo-row">
      <ul style="margin:0;padding:0">
        <li class="tick">${t.premier} <a class="nolink" target="_blank" href="https://csstats.gg/player/${steamID64}">
          <span class="account-steaminfo-row-value">${csStats.current_rating||'N/A'}${csStats.best_rating?` / best ${csStats.best_rating}`:''}</span>
        </a></li>
      </ul>
    </div>
  </div>
  <div class="account-faceitinfo-container">
    <div class="account-faceit-cover" style="background-image:url(${faceItUserJSON.cover_image_url||''});"></div>
    <a class="nolink" target="_blank" href="https://www.faceit.com/en/players/${faceItUserJSON.nickname}">
      <img class="account-faceitinfo-container-arrow" src="https://steamloopback.host/FaceItFinder/faceit_arrow.png" alt="FaceIt profile arrow">
    </a>
    <div class="account-faceit-title">
      <a class="nolink" target="_blank" href="https://www.faceit.com/en/players/${faceItUserJSON.nickname}">
        <img class="account-faceit-flag" src="https://faceitfinder.com/resources/flags/svg/${faceItUserJSON.country||'default'}.svg" width="26" height="20">
        <span class="account-faceit-title-username">${faceItUserJSON.nickname}</span>
      </a>
    </div>
    <div class="account-faceit-level">
      <a class="nolink" target="_blank" href="https://www.faceit.com/en/players/${faceItUserJSON.nickname}/stats/cs2">
        <img src="https://steamloopback.host/FaceItFinder/skill_level_${faceItUserJSON.skill_level}_lg.png" alt="FaceIt level ${faceItUserJSON.skill_level}" width="48" height="48">
      </a>
    </div>
    <div class="stats_pager">
      <div class="account-faceit-stats page1">
        <div class="account-faceit-stats-single">${t.matches} <strong>${faceItUserJSON.stats.matches}</strong></div>
        <div class="account-faceit-stats-single">ELO: <strong>${faceItUserJSON.faceit_elo}</strong></div>
        <div class="account-faceit-stats-single">${t.kd} <strong>${faceItUserJSON.stats.avg_kd}</strong></div>
      </div>
      <div class="account-faceit-stats page2 hidden">
        <div class="account-faceit-stats-single">H/S: <strong>${faceItUserJSON.stats.avg_hs}</strong></div>
        <div class="account-faceit-stats-single">ADR: <strong>${faceItUserJSON.stats.adr}</strong></div>
        <div class="account-faceit-stats-single">WIN: <strong>${faceItUserJSON.stats.winrate}</strong></div>
      </div>
    </div>
    <div class="account-faceit-detailed-stats">
      <a class="nolink" target="_blank" href="https://faceittracker.net/players/${faceItUserJSON.nickname}">
        ${t.showDetailed}
      </a>
    </div>
  </div>
</div>`.trim();

        // Render and pager
        rightCol[0].removeChild(loadingHTML);
        rightCol[0].insertBefore(statsHTML, rightCol[0].children[1]);
        const pager = statsHTML.querySelector('.stats_pager');
        if (pager) {
            pager.addEventListener('click', () => {
                pager.querySelector('.page1')!.classList.toggle('hidden');
                pager.querySelector('.page2')!.classList.toggle('hidden');
            });
        }
    } catch (err) {
        console.error('Error in WebkitMain:', err);
        if (loadingHTML.parentNode) rightCol[0].removeChild(loadingHTML);
        const errorHTML = document.createElement('div');
        errorHTML.className = 'account-row';
        errorHTML.innerHTML = `<div class="account-container"><div class="account-faceit-message"><strong>${t.failedLoad}</strong></div></div>`;
        rightCol[0].insertBefore(errorHTML, rightCol[0].children[1]);
    }
}
