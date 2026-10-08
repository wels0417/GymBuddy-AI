from datetime import time


def find_schedule_overlap(
    user_schedule,
    partner_schedule
):
    """
    Compare two schedule records and find
    overlapping workout time.
    """

    if user_schedule.day != partner_schedule.day:
        return None

    overlap_start = max(
        user_schedule.start_time,
        partner_schedule.start_time
    )

    overlap_end = min(
        user_schedule.end_time,
        partner_schedule.end_time
    )

    if overlap_start >= overlap_end:
        return None

    return {
        "day": user_schedule.day,
        "start_time": overlap_start,
        "end_time": overlap_end
    }


def calculate_schedule_score(
    user_schedules,
    partner_schedules
):
    """
    Calculate schedule compatibility percentage.
    """

    overlaps = []

    for user_schedule in user_schedules:

        for partner_schedule in partner_schedules:

            overlap = find_schedule_overlap(
                user_schedule,
                partner_schedule
            )

            if overlap:
                overlaps.append(overlap)

    if not overlaps:
        return 0, []

    # Maximum score is 100
    schedule_score = min(
        len(overlaps) * 25,
        100
    )

    return schedule_score, overlaps