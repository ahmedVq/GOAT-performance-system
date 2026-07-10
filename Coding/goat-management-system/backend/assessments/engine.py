"""
Assessment Engine — all scoring calculations live here.
No database access. No Django imports. Pure functions only.
Swap the formula by changing this file alone.
"""
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass
from typing import Optional


TWO_DP = Decimal('0.01')

# Tier thresholds (grade %)
LEVEL_THRESHOLDS = [
    (Decimal('80'), 'advanced'),
    (Decimal('50'), 'intermediate'),
    (Decimal('0'),  'beginner'),
]


@dataclass(frozen=True)
class CriterionResult:
    criterion_id: str
    boxing_score: Optional[Decimal]
    kickboxing_score: Optional[Decimal]
    effective_score: Optional[Decimal]


@dataclass(frozen=True)
class PillarResult:
    pillar_id: str
    pillar_name: str
    score: Optional[Decimal]
    criterion_results: list


@dataclass(frozen=True)
class AssessmentResult:
    pillar_results: list
    overall_score: Optional[Decimal]
    grade_percentage: Optional[Decimal]
    level: str


def _round(value: Decimal) -> Decimal:
    return value.quantize(TWO_DP, rounding=ROUND_HALF_UP)


def effective_criterion_score(
    boxing: Optional[Decimal],
    kickboxing: Optional[Decimal],
) -> Optional[Decimal]:
    """Average of whichever scores are provided. Returns None if both empty."""
    filled = [s for s in (boxing, kickboxing) if s is not None]
    if not filled:
        return None
    return _round(sum(filled) / len(filled))


def pillar_score(effective_scores: list[Optional[Decimal]]) -> Optional[Decimal]:
    """Average of non-null effective criterion scores within a pillar."""
    filled = [s for s in effective_scores if s is not None]
    if not filled:
        return None
    return _round(sum(filled) / len(filled))


def overall_score(pillar_scores: list[Optional[Decimal]]) -> Optional[Decimal]:
    """
    Equal-weight average of all pillar scores.
    Formula is intentionally isolated here so weights can be injected later.
    """
    filled = [s for s in pillar_scores if s is not None]
    if not filled:
        return None
    return _round(sum(filled) / len(filled))


def grade_percentage(score: Optional[Decimal]) -> Optional[Decimal]:
    """Convert /10 score to percentage."""
    if score is None:
        return None
    return _round((score / Decimal('10')) * Decimal('100'))


def assign_level(percentage: Optional[Decimal]) -> str:
    """Map grade % to Beginner / Intermediate / Advanced."""
    if percentage is None:
        return 'beginner'
    for threshold, level in LEVEL_THRESHOLDS:
        if percentage >= threshold:
            return level
    return 'beginner'


def improvement(
    current: Optional[Decimal],
    previous: Optional[Decimal],
) -> Optional[Decimal]:
    """Signed difference: current - previous. None if either is missing."""
    if current is None or previous is None:
        return None
    return _round(current - previous)


def process_session(raw_criterion_scores: list[dict], pillars: list[dict]) -> AssessmentResult:
    """
    Entry point for the engine.

    raw_criterion_scores: list of dicts with keys:
        criterion_id, pillar_id, pillar_name, boxing_score, kickboxing_score

    pillars: list of dicts with keys:
        id, name

    Returns a fully computed AssessmentResult.
    """
    scores_by_pillar: dict[str, list] = {p['id']: [] for p in pillars}
    pillar_names: dict[str, str] = {p['id']: p['name'] for p in pillars}

    criterion_results: list[CriterionResult] = []
    for raw in raw_criterion_scores:
        boxing = Decimal(str(raw['boxing_score'])) if raw['boxing_score'] is not None else None
        kickboxing = Decimal(str(raw['kickboxing_score'])) if raw['kickboxing_score'] is not None else None
        eff = effective_criterion_score(boxing, kickboxing)
        result = CriterionResult(
            criterion_id=raw['criterion_id'],
            boxing_score=boxing,
            kickboxing_score=kickboxing,
            effective_score=eff,
        )
        criterion_results.append(result)
        scores_by_pillar[raw['pillar_id']].append(result)

    pillar_results: list[PillarResult] = []
    for p in pillars:
        pid = p['id']
        crit_results = scores_by_pillar[pid]
        p_score = pillar_score([c.effective_score for c in crit_results])
        pillar_results.append(PillarResult(
            pillar_id=pid,
            pillar_name=pillar_names[pid],
            score=p_score,
            criterion_results=crit_results,
        ))

    o_score = overall_score([pr.score for pr in pillar_results])
    g_pct = grade_percentage(o_score)
    level = assign_level(g_pct)

    return AssessmentResult(
        pillar_results=pillar_results,
        overall_score=o_score,
        grade_percentage=g_pct,
        level=level,
    )
