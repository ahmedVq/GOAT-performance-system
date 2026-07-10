"""
Sheet parser — converts raw 2D grid data into structured dicts.
Matches the exact layout of Mark's sheet.xlsx.

Column mapping (0-indexed):
  A=0  #
  B=1  Category / header info
  C=2  Criteria description
  D=3  Boxing score /10
  E=4  Kickboxing score /10
  F=5  Section avg (ignored — recalculated by engine)
  G=6  Coach feedback / comment

Row mapping (0-indexed):
  0   Title
  1   Student Name  → B2
  2   Coach         → B3
  3   Sport         → C4
  4   Assessment Date → B5
  5   Sessions Completed → B6
  8   Column headers
  9   Cardio section header
  10-14  Cardio criteria scores
  16  Technical section header
  17-21  Technical criteria scores
  23  Sparring section header
  24-28  Sparring criteria scores
  30  Mental section header
  31-35  Mental criteria scores
  37  Discipline section header
  38-42  Discipline criteria scores
  50  Coach overall notes
  51  Action plan
"""
from dataclasses import dataclass, field
from datetime import date
from typing import Optional


CRITERIA_ROWS = [
    # (pillar_order, row_indices)
    (1, [10, 11, 12, 13, 14]),   # Cardio
    (2, [17, 18, 19, 20, 21]),   # Technical
    (3, [24, 25, 26, 27, 28]),   # Sparring
    (4, [31, 32, 33, 34, 35]),   # Mental
    (5, [38, 39, 40, 41, 42]),   # Discipline
]

COL_BOXING = 3
COL_KICKBOXING = 4
COL_COMMENT = 6


@dataclass
class RawCriterionScore:
    pillar_order: int
    criterion_order: int
    boxing_score: Optional[float]
    kickboxing_score: Optional[float]
    coach_comment: str


@dataclass
class ParsedStudentRecord:
    tab_name: str
    student_name: str
    coach_name: str
    sport: str
    assessment_date: Optional[str]
    sessions_completed: int
    coach_notes: str
    action_plan: str
    criterion_scores: list = field(default_factory=list)
    parse_errors: list = field(default_factory=list)


def _cell(grid: list, row: int, col: int, default=None):
    try:
        val = grid[row][col]
        return val if val != '' else default
    except (IndexError, TypeError):
        return default


def _score(grid: list, row: int, col: int) -> Optional[float]:
    val = _cell(grid, row, col)
    if val is None:
        return None
    try:
        score = float(val)
        if 0 <= score <= 10:
            return score
        return None
    except (ValueError, TypeError):
        return None


def parse_tab(tab_name: str, grid: list[list]) -> ParsedStudentRecord:
    record = ParsedStudentRecord(
        tab_name=tab_name,
        student_name=str(_cell(grid, 1, 1, '')).strip(),
        coach_name=str(_cell(grid, 2, 1, '')).strip(),
        sport=str(_cell(grid, 3, 2, '')).strip().lower(),
        assessment_date=str(_cell(grid, 4, 1, '')).strip(),
        sessions_completed=int(_cell(grid, 5, 1, 0) or 0),
        coach_notes=str(_cell(grid, 50, 1, '')).strip(),
        action_plan=str(_cell(grid, 51, 1, '')).strip(),
    )

    for pillar_order, rows in CRITERIA_ROWS:
        for criterion_order, row_idx in enumerate(rows, start=1):
            record.criterion_scores.append(RawCriterionScore(
                pillar_order=pillar_order,
                criterion_order=criterion_order,
                boxing_score=_score(grid, row_idx, COL_BOXING),
                kickboxing_score=_score(grid, row_idx, COL_KICKBOXING),
                coach_comment=str(_cell(grid, row_idx, COL_COMMENT, '')).strip(),
            ))

    return record


def parse_spreadsheet(tabs: dict[str, list[list]]) -> list[ParsedStudentRecord]:
    """
    Parse all tabs. Keys are tab names (expected to be student_ids).
    Skips tabs named 'Template', 'Instructions', or starting with '_'.
    """
    records = []
    for tab_name, grid in tabs.items():
        if tab_name.startswith('_') or tab_name.lower() in ('template', 'instructions', 'readme'):
            continue
        records.append(parse_tab(tab_name, grid))
    return records
