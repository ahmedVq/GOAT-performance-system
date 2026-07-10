from django.test import TestCase
from google_sync.parser import ParsedStudentRecord, RawCriterionScore
from google_sync.validator import validate_record, validate_all


def _make_record(**kwargs):
    defaults = dict(
        tab_name='GOAT-001',
        student_name='Mark Aziz',
        coach_name='Coach Ahmed',
        sport='boxing',
        assessment_date='2024-07-01',
        sessions_completed=10,
        coach_notes='',
        action_plan='',
        criterion_scores=[
            RawCriterionScore(1, 1, 8.0, None, ''),
        ],
        parse_errors=[],
    )
    defaults.update(kwargs)
    return ParsedStudentRecord(**defaults)


class TestValidateRecord(TestCase):
    def test_valid_record_no_errors(self):
        self.assertEqual(validate_record(_make_record()), [])

    def test_missing_date(self):
        errors = validate_record(_make_record(assessment_date=''))
        self.assertTrue(any('date' in e.lower() for e in errors))

    def test_invalid_date_format(self):
        errors = validate_record(_make_record(assessment_date='not-a-date'))
        self.assertTrue(any('date' in e.lower() for e in errors))

    def test_valid_date_formats(self):
        for fmt in ['2024-07-01', '01/07/2024', '07/01/2024', '01-07-2024']:
            self.assertEqual(validate_record(_make_record(assessment_date=fmt)), [])

    def test_invalid_sport(self):
        errors = validate_record(_make_record(sport='wrestling'))
        self.assertTrue(any('sport' in e.lower() for e in errors))

    def test_valid_sport_kickboxing(self):
        self.assertEqual(validate_record(_make_record(sport='kickboxing')), [])

    def test_no_scores(self):
        errors = validate_record(_make_record(criterion_scores=[
            RawCriterionScore(1, 1, None, None, ''),
        ]))
        self.assertTrue(any('score' in e.lower() for e in errors))


class TestValidateAll(TestCase):
    def test_valid_record_passes(self):
        records = [_make_record()]
        valid, errors = validate_all(records, existing_student_ids={'GOAT-001'})
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(errors), 0)

    def test_unknown_student_id_rejected(self):
        records = [_make_record(tab_name='GOAT-999')]
        valid, errors = validate_all(records, existing_student_ids={'GOAT-001'})
        self.assertEqual(len(valid), 0)
        self.assertEqual(len(errors), 1)

    def test_duplicate_ids_flagged(self):
        records = [_make_record(), _make_record()]
        valid, errors = validate_all(records, existing_student_ids={'GOAT-001'})
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(errors), 1)

    def test_mixed_valid_and_invalid(self):
        records = [
            _make_record(tab_name='GOAT-001'),
            _make_record(tab_name='GOAT-002', sport='invalid'),
        ]
        valid, errors = validate_all(records, existing_student_ids={'GOAT-001', 'GOAT-002'})
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(errors), 1)
