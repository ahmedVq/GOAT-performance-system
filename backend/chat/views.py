import requests as http_requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.responses import success_response, error_response
from leaderboard.models import LeaderboardSnapshot
from assessments.models import AssessmentSession
from students.models import Student

SYSTEM_PROMPT = """You are the GOAT Academy AI assistant — a knowledgeable, motivating martial arts coach built into the GOAT performance management system.

ABOUT GOAT ACADEMY:
- GOAT = "Greatest Of All Time" — a martial arts academy specialising in Boxing and Kickboxing
- The system tracks athlete progress through structured assessments
- Students are assessed across 25 criteria grouped into 5 pillars
- Grades are calculated automatically and athletes are assigned levels

THE 5 ASSESSMENT PILLARS (know these deeply):
1. Cardio, Strength & Conditioning — Cardio, Strength & Power, Endurance, Flexibility, Recovery Between Rounds
2. Technical Skills — Stance & Guard, Footwork, Jab, Cross, Hook, Uppercut, Defence & Head Movement, Combinations, Ring Craft, Head Movement
3. Tactical & Strategic Thinking — Fight IQ, Distance Control, Adapting to Opponent, Pressure/Counter Fighting, Ring Generalship
4. Mental & Psychological Attributes — Confidence, Composure Under Pressure, Heart & Determination, Coachability
5. Discipline & Professionalism — Punctuality & Attendance, Attitude & Respect, Effort & Work Rate

GRADE CALCULATION:
- Each of the 25 criteria is scored 0–10 by a coach
- Each pillar score = average of its criteria
- Overall grade % = average of all 25 scores × 10
- Levels: Beginner (below 50%) | Intermediate (50–79%) | Advanced (80%+)

YOUR BEHAVIOUR:
- Answer martial arts and GOAT system questions fully and confidently
- Use the LIVE ACADEMY DATA provided to answer questions about rankings, scores, leaderboard, and students accurately
- Give practical, actionable training advice with bullet points
- Be motivating, direct, and concise
- NEVER fabricate any data not present in the live context provided
- Respond only in English"""


def build_live_context() -> str:
    lines = ["\nLIVE ACADEMY DATA (as of right now — use this to answer questions about rankings, scores, students):"]

    # Leaderboard
    snapshots = (
        LeaderboardSnapshot.objects
        .select_related('student__user')
        .order_by('-improvement', '-current_score')[:15]
    )
    if snapshots:
        lines.append("\nCURRENT LEADERBOARD (ranked by improvement):")
        for i, s in enumerate(snapshots, 1):
            name = s.student.user.full_name
            sport = s.student.sport.capitalize()
            level = s.student.level.capitalize()
            score = f"{float(s.current_score):.1f}%" if s.current_score else "N/A"
            imp = f"+{float(s.improvement):.1f}%" if s.improvement and s.improvement > 0 else (f"{float(s.improvement):.1f}%" if s.improvement else "N/A")
            lines.append(f"  #{i} {name} ({sport}, {level}) — Score: {score}, Improvement: {imp}")

    # Recent assessments
    recent = (
        AssessmentSession.objects
        .select_related('student__user')
        .filter(grade_percentage__isnull=False)
        .order_by('-assessment_date')[:5]
    )
    if recent:
        lines.append("\nMOST RECENT ASSESSMENTS:")
        for s in recent:
            name = s.student.user.full_name
            lines.append(f"  {s.assessment_date} — {name}: {float(s.grade_percentage):.1f}% ({s.level_at_assessment})")

    # Total counts
    total_students = Student.objects.filter(is_active=True).count()
    total_assessments = AssessmentSession.objects.count()
    lines.append(f"\nACTIVE STUDENTS: {total_students} | TOTAL ASSESSMENTS ON RECORD: {total_assessments}")

    return "\n".join(lines)


def call_groq(messages: list, live_context: str = "") -> str:
    api_key = getattr(settings, 'GROQ_API_KEY', '')
    if not api_key:
        return "Groq API key not configured. Please contact the administrator."

    full_system = SYSTEM_PROMPT + (live_context if live_context else "")

    try:
        resp = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GOAT-Academy/1.0)",
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "system", "content": full_system}] + messages,
                "max_tokens": 512,
                "temperature": 0.7,
            },
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except http_requests.HTTPError as e:
        return f"API error: {e.response.status_code} — {e.response.text[:200]}"
    except Exception as e:
        return f"Could not reach AI service: {str(e)}"


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages', [])
        if not messages or not isinstance(messages, list):
            return error_response('messages array is required.')

        # validate each message has role + content
        for m in messages[-20:]:  # only last 20 for context window
            if not isinstance(m, dict) or 'role' not in m or 'content' not in m:
                return error_response('Each message must have role and content.')

        try:
            live_context = build_live_context()
        except Exception:
            live_context = ""

        reply = call_groq(messages[-20:], live_context)
        return success_response(data={'reply': reply})
