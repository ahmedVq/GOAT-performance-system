from django.test import TestCase
from google_sync.parser import parse_tab, parse_spreadsheet


def _make_grid():
    """Build a minimal valid grid matching the sheet layout."""
    grid = [[''] * 8 for _ in range(55)]
    grid[1][1] = 'Mark Aziz'
    grid[2][1] = 'Coach Ahmed'
    grid[3][2] = 'boxing'
    grid[4][1] = '2024-07-01'
    grid[5][1] = 12

    # Cardio criteria rows 10-14
    for i, row in enumerate([10, 11, 12, 13, 14]):
        grid[row][3] = 8.0 + i * 0.1   # boxing score
        grid[row][4] = None
        grid[row][6] = f'Good work on criterion {i+1}'

    # Technical rows 17-21 — kickboxing only
    for i, row in enumerate([17, 18, 19, 20, 21]):
        grid[row][3] = None
        grid[row][4] = 7.0 + i * 0.1

    # Sparring rows 24-28 — both
    for i, row in enumerate([24, 25, 26, 27, 28]):
        grid[row][3] = 6.0
        grid[row][4] = 8.0

    # Mental rows 31-35
    for i, row in enumerate([31, 32, 33, 34, 35]):
        grid[row][3] = 9.0

    # Discipline rows 38-42
    for i, row in enumerate([38, 39, 40, 41, 42]):
        grid[row][3] = 7.5

    grid[50][1] = 'Needs to work on footwork'
    grid[51][1] = 'Drill combinations 3x per week'
    return grid


class TestParseTab(TestCase):
    def setUp(self):
        self.grid = _make_grid()

    def test_student_name(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(record.student_name, 'Mark Aziz')

    def test_coach_name(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(record.coach_name, 'Coach Ahmed')

    def test_sport_parsed(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(record.sport, 'boxing')

    def test_assessment_date(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(record.assessment_date, '2024-07-01')

    def test_sessions_completed(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(record.sessions_completed, 12)

    def test_25_criteria_parsed(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertEqual(len(record.criterion_scores), 25)

    def test_boxing_score_parsed(self):
        record = parse_tab('GOAT-001', self.grid)
        cardio_scores = [s for s in record.criterion_scores if s.pillar_order == 1]
        self.assertIsNotNone(cardio_scores[0].boxing_score)
        self.assertIsNone(cardio_scores[0].kickboxing_score)

    def test_kickboxing_score_parsed(self):
        record = parse_tab('GOAT-001', self.grid)
        tech_scores = [s for s in record.criterion_scores if s.pillar_order == 2]
        self.assertIsNone(tech_scores[0].boxing_score)
        self.assertIsNotNone(tech_scores[0].kickboxing_score)

    def test_coach_notes(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertIn('footwork', record.coach_notes)

    def test_action_plan(self):
        record = parse_tab('GOAT-001', self.grid)
        self.assertIn('combinations', record.action_plan)

    def test_invalid_score_excluded(self):
        self.grid[10][3] = 15.0  # out of range
        record = parse_tab('GOAT-001', self.grid)
        cardio_c1 = next(s for s in record.criterion_scores if s.pillar_order == 1 and s.criterion_order == 1)
        self.assertIsNone(cardio_c1.boxing_score)

    def test_tab_name_set(self):
        record = parse_tab('GOAT-042', self.grid)
        self.assertEqual(record.tab_name, 'GOAT-042')


class TestParseSpreadsheet(TestCase):
    def test_skips_template_tab(self):
        tabs = {'Template': [], 'GOAT-001': _make_grid()}
        records = parse_spreadsheet(tabs)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0].tab_name, 'GOAT-001')

    def test_skips_underscore_tabs(self):
        tabs = {'_Instructions': [], 'GOAT-001': _make_grid()}
        records = parse_spreadsheet(tabs)
        self.assertEqual(len(records), 1)

    def test_multiple_students(self):
        tabs = {
            'GOAT-001': _make_grid(),
            'GOAT-002': _make_grid(),
            'GOAT-003': _make_grid(),
        }
        records = parse_spreadsheet(tabs)
        self.assertEqual(len(records), 3)
