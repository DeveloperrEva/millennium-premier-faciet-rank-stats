import cloudscraper
from bs4 import BeautifulSoup

# Создаём scraper, который обходит Cloudflare JS-challenge
SCRAPER = cloudscraper.create_scraper(
    browser={'custom': 'MillenniumPlugin/1.0'}
)

class CsStats:
    @staticmethod
    def get_csstats(steam_id64: str) -> dict:
        """
        Fetches Premier season current and best ratings from csstats.gg for given SteamID64.
        Returns a dict: { 'current_rating': str, 'best_rating': str } or None values if not found.
        """
        url = f"https://csstats.gg/player/{steam_id64}"
        try:
            resp = SCRAPER.get(url, timeout=15)
            resp.raise_for_status()
            html = resp.text
        except Exception:
            return {'current_rating': None, 'best_rating': None}

        soup = BeautifulSoup(html, 'html.parser')

        # Ищем все блоки .ranks, выбираем тот, где иконка <img alt="Premier ...">
        premier_block = None
        for block in soup.select('#player-ranks .ranks'):
            img = block.select_one('.over .icon img[alt^="Premier"]')
            if img:
                premier_block = block
                break

        if not premier_block:
            return {'current_rating': None, 'best_rating': None}

        # Внутри .over найдём первый и второй .cs2rating и достанем текст без HTML
        current_div = premier_block.select_one('.over .cs2rating')
        best_div    = premier_block.select_one('.over .best .cs2rating')

        def clean(div):
            if not div: return None
            # Извлекаем все числа и запятые из текста (включая внутри <small>)
            text = ''.join(div.stripped_strings)
            # Заменим маленькие запятые (в <small>) на обычные
            return text.replace('\u2019', ',')

        return {
            'current_rating': clean(current_div),
            'best_rating': clean(best_div)
        }
