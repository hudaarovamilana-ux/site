"""Экспорт WEEKS_INFO в JSON для фронтенда (без дублирующих заголовков в секциях)."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from weeks_data import WEEKS_INFO  # noqa: E402

OUT = ROOT / "frontend" / "src" / "lib" / "weeks-data.json"

SECTION_TITLES = {
    "intro": "О неделе",
    "fruit": "Размер малыша",
    "description": "Развитие малыша",
    "mom_feeling": "Ощущения мамы",
    "nutrition": "Питание",
    "doctors": "Врачи и анализы",
    "fact": "Интересный факт",
}

STRIP_PREFIXES: dict[str, list[str]] = {
    "mom_feeling": [
        r"^🤰\s*\*?\*?Ощущения мамы:?\*?\*?\s*",
        r"^🤰\s*Самочувствие улучшается:?\s*",
        r"^🤰\s*Самочувствие:?\s*",
        r"^🤰\s*Ощущения:?\s*",
        r"^🤰\s*Внешних признаков беременности пока нет\.?\s*",
        r"^🤰\s*",
    ],
    "nutrition": [
        r"^🥗\s*\*?\*?Питание:?\*?\*?\s*",
        r"^🥗\s*Питание как подготовка[^\n]*\n?",
        r"^🥗\s*Питание лёгкое\s*",
        r"^🥗\s*Основа здоровья малыша:?\s*",
        r"^🥗\s*Сейчас закладываются[^\n]*\n?",
        r"^🥗\s*Что добавить в рацион:?\s*",
        r"^🥗\s*Важно:?\s*",
        r"^🥗\s*Если роды ещё не начались:?\s*",
        r"^🥗\s*",
    ],
    "doctors": [
        r"^👩‍⚕️\s*\*?\*?Врачи и анализы:?\*?\*?\s*",
        r"^👩‍⚕️\s*Врачи и анализы:?\s*",
        r"^👩‍⚕️\s*На этой неделе:?\s*",
        r"^👩‍⚕️\s*На \d+ неделе:?\s*",
        r"^👩‍⚕️\s*Если ты планируешь[^\n]*\n?",
        r"^👩‍⚕️\s*",
        r"^🏥\s*Что делать:?\s*",
        r"^🏥\s*Подготовка[^\n]*\n?",
        r"^🏥\s*В роддом если:?\s*",
        r"^🏥\s*",
    ],
    "description": [
        r"^👶\s*",
    ],
    "fact": [
        r"^🌟\s*",
        r"^💖\s*",
    ],
    "fruit": [
        r"^🍎\s*Размер плода:\s*",
    ],
}


def strip_markdown_bold(text: str) -> str:
    return re.sub(r"\*\*([^*]+)\*\*", r"\1", text)


DUPLICATE_FIRST_LINE: dict[str, list[re.Pattern[str]]] = {
    "mom_feeling": [
        re.compile(r"^🤰\s*.*$"),
    ],
    "nutrition": [
        re.compile(r"^🥗\s*.*$"),
    ],
    "doctors": [
        re.compile(r"^👩‍⚕️\s*.*$"),
        re.compile(r"^🏥\s*.*$"),
    ],
}


def clean_field(text: str | None, field: str) -> str:
    if not text:
        return ""
    result = strip_markdown_bold(text.strip())
    lines = result.split("\n")

    if lines and field in DUPLICATE_FIRST_LINE:
        first = lines[0].strip()
        for pattern in DUPLICATE_FIRST_LINE[field]:
            if pattern.match(first):
                if len(lines) == 1:
                    only = re.sub(r"^[🥗👩‍⚕️🏥🤰]\s*", "", first)
                    only = re.sub(r"^Питание\s+", "", only, flags=re.IGNORECASE)
                    only = re.sub(
                        r"^(Ощущения мамы|Самочувствие|Ощущения|Врачи и анализы):?\s*",
                        "",
                        only,
                        flags=re.IGNORECASE,
                    )
                    return only.strip()
                lines = lines[1:]
                while lines and not lines[0].strip():
                    lines = lines[1:]
                break

    for pattern in STRIP_PREFIXES.get(field, []):
        joined = "\n".join(lines)
        joined = re.sub(pattern, "", joined, count=1, flags=re.IGNORECASE | re.MULTILINE)
        lines = joined.split("\n")

    result = "\n".join(lines).strip()

    # Убрать оборванные фрагменты заголовков
    orphan_prefixes = (
        "как подготовка к беременности:",
        "Сейчас закладываются все органы малыша:",
    )
    for prefix in orphan_prefixes:
        if result.lower().startswith(prefix):
            result = result[len(prefix) :].strip()

    if field == "nutrition" and result.lower() in ("лёгкое", "легкое"):
        result = "Лёгкое питание"

    return result


def parse_full_text(full_text: str) -> list[dict[str, str]]:
    """Разбирает full_text (неделя 1) на секции без дублирования заголовков."""
    sections: list[dict[str, str]] = []
    parts = re.split(r"\n---\n\n", full_text.strip())

    for i, part in enumerate(parts):
        part = part.strip()
        if not part:
            continue

        lines = part.split("\n", 1)
        first_line = lines[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""

        # Заголовок секции из первой строки
        title_match = re.match(
            r"^[🌸💫🧂🧬🌿🥗👩‍⚕️💌🤰🍎👶🌟💖🍃⚖️]*\s*\*?\*?(.+?)\*?\*?\s*$",
            first_line,
        )
        if title_match and body:
            title = strip_markdown_bold(title_match.group(1).strip())
            # Нормализуем известные заголовки
            lower = title.lower()
            if "ощущения" in lower:
                key = "mom_feeling"
            elif "питание" in lower or "искусство питания" in lower:
                key = "nutrition"
            elif "чек-лист" in lower or "врач" in lower:
                key = "doctors"
            elif "от меня" in lower:
                key = "fact"
            else:
                key = "intro" if i == 0 else "intro"
            sections.append(
                {
                    "id": key if i > 0 else "intro",
                    "title": SECTION_TITLES.get(key, title) if i > 0 else title,
                    "content": clean_field(body, key if i > 0 else "intro"),
                }
            )
        else:
            # Первая часть — вводный блок целиком
            content = clean_field(part, "intro")
            if i == 0:
                sections.append({"id": "intro", "title": "О неделе", "content": content})
            else:
                sections.append({"id": "intro", "title": "О неделе", "content": content})

    return dedupe_sections(sections)


def dedupe_sections(sections: list[dict[str, str]]) -> list[dict[str, str]]:
    """Убирает секции с одинаковым id и дублирующийся контент."""
    seen_ids: set[str] = set()
    seen_content: set[str] = set()
    result: list[dict[str, str]] = []

    for sec in sections:
        content_key = re.sub(r"\s+", " ", sec["content"].lower().strip())
        if not content_key or content_key in seen_content:
            continue
        sec_id = sec["id"]
        if sec_id in seen_ids and sec_id != "intro":
            # Объединять не будем — пропускаем дубликат id
            continue
        seen_ids.add(sec_id)
        seen_content.add(content_key)
        result.append(sec)

    return result


def build_week(week: int, data: dict) -> dict:
    sections: list[dict[str, str]] = []

    if data.get("full_text"):
        sections = parse_full_text(data["full_text"])
    else:
        if data.get("fruit"):
            fruit = data["fruit"].strip()
            if not fruit.startswith("🍎"):
                fruit_line = f"Как {fruit}"
            else:
                fruit_line = fruit
            sections.append(
                {
                    "id": "fruit",
                    "title": SECTION_TITLES["fruit"],
                    "content": clean_field(fruit_line, "fruit"),
                }
            )

        for key in ("description", "mom_feeling", "nutrition", "doctors", "fact"):
            raw = data.get(key)
            if not raw:
                continue
            content = clean_field(raw, key)
            if not content:
                continue
            sections.append(
                {
                    "id": key,
                    "title": SECTION_TITLES[key],
                    "content": content,
                }
            )

        sections = dedupe_sections(sections)

    return {"week": week, "sections": sections}


def main() -> None:
    weeks = []
    for week in sorted(WEEKS_INFO.keys()):
        weeks.append(build_week(week, WEEKS_INFO[week]))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(weeks, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Exported {len(weeks)} weeks -> {OUT}")


if __name__ == "__main__":
    main()
