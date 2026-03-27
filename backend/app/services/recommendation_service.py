from app.models.performance import Performance


def build_recommendations(performance: Performance, failure_probability: float) -> list[str]:
    suggestions = []

    if performance.attendance < 75:
        suggestions.append("Improve attendance to above 80%")

    if performance.study_hours < 8:
        suggestions.append("Increase weekly study time by 2-4 hours")

    if performance.quiz_score < 60:
        suggestions.append("Review quiz fundamentals and take more practice tests")

    if performance.assignment_score < 60:
        suggestions.append("Spend additional time on assignments and seek mentor feedback")

    if failure_probability > 0.65:
        suggestions.append("Schedule a counseling session with the teacher immediately")

    if not suggestions:
        suggestions.append("Maintain current performance and continue consistent learning habits")

    return suggestions
