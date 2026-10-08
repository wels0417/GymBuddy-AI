import hashlib
import secrets

from sqlalchemy.orm import Session

from backend.models import (
    User,
    FitnessProfile,
    WorkoutPreference,
    Schedule,
    Feedback,
    Recommendation
)

from backend.schemas import (
    UserCreate,
    FitnessProfileCreate,
    WorkoutPreferenceCreate,
    FeedbackCreate
)

def get_schedule(
    db: Session,
    schedule_id: int
):

    return (
        db.query(Schedule)
        .filter(
            Schedule.schedule_id == schedule_id
        )
        .first()
    )

def update_schedule(
    db: Session,
    schedule_id: int,
    schedule_data
):

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.schedule_id == schedule_id
        )
        .first()
    )

    if not schedule:
        return None

    schedule.day = schedule_data.day
    schedule.start_time = schedule_data.start_time
    schedule.end_time = schedule_data.end_time

    db.commit()
    db.refresh(schedule)

    return schedule

# ======================================================
# PASSWORD SECURITY
# ======================================================

def hash_password(password: str):

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

    return (
        f"pbkdf2_sha256$"
        f"{salt}$"
        f"{password_hash}"
    )


def verify_password(
    password: str,
    stored_password: str
):

    # New hashed password
    if stored_password.startswith(
        "pbkdf2_sha256$"
    ):

        parts = stored_password.split("$")

        if len(parts) != 3:
            return False

        salt = parts[1]
        stored_hash = parts[2]

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        ).hex()

        return secrets.compare_digest(
            password_hash,
            stored_hash
        )

    # Support old plain-text passwords
    # so existing accounts still work.
    return secrets.compare_digest(
        password,
        stored_password
    )

# ======================================================
# USERS
# ======================================================

def create_user(
    db: Session,
    user: UserCreate
):

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        age=user.age
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def get_user_by_email(
    db: Session,
    email: str
):

    return db.query(User).filter(
        User.email == email
    ).first()


def get_user(
    db: Session,
    user_id: int
):

    return db.query(User).filter(
        User.user_id == user_id
    ).first()


def get_users(
    db: Session
):

    return db.query(User).all()


# ======================================================
# FITNESS PROFILE
# ======================================================

def create_fitness_profile(
    db: Session,
    profile: FitnessProfileCreate
):

    new_profile = FitnessProfile(
        user_id=profile.user_id,
        fitness_goal=profile.fitness_goal,
        experience_level=profile.experience_level,
        workout_type=profile.workout_type,
        intensity=profile.intensity,
        workout_frequency=profile.workout_frequency
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


def get_fitness_profile(
    db: Session,
    user_id: int
):

    return db.query(FitnessProfile).filter(
        FitnessProfile.user_id == user_id
    ).first()

# UPDATE OR CREATE FITNESS PROFILE

def update_fitness_profile(
    db: Session,
    user_id: int,
    profile: FitnessProfileCreate
):
    existing_profile = (
        db.query(FitnessProfile)
        .filter(FitnessProfile.user_id == user_id)
        .first()
    )

    if existing_profile:
        # UPDATE existing profile
        existing_profile.fitness_goal = profile.fitness_goal
        existing_profile.experience_level = profile.experience_level
        existing_profile.workout_type = profile.workout_type
        existing_profile.intensity = profile.intensity
        existing_profile.workout_frequency = profile.workout_frequency

    else:
        # CREATE new profile
        existing_profile = FitnessProfile(
            user_id=user_id,
            fitness_goal=profile.fitness_goal,
            experience_level=profile.experience_level,
            workout_type=profile.workout_type,
            intensity=profile.intensity,
            workout_frequency=profile.workout_frequency
        )

        db.add(existing_profile)

    db.commit()
    db.refresh(existing_profile)

    return existing_profile

# UPDATE OR CREATE WORKOUT PREFERENCES

def get_workout_preference(db: Session, user_id: int):
    return db.query(WorkoutPreference).filter(
        WorkoutPreference.user_id == user_id
    ).first()

def update_workout_preference(
    db: Session,
    user_id: int,
    preference: WorkoutPreferenceCreate
):
    existing_preference = (
        db.query(WorkoutPreference)
        .filter(WorkoutPreference.user_id == user_id)
        .first()
    )

    if existing_preference:
        existing_preference.preferred_workout = preference.preferred_workout
        existing_preference.preferred_intensity = preference.preferred_intensity
        existing_preference.preferred_duration = preference.preferred_duration
        existing_preference.preferred_location = preference.preferred_location
        existing_preference.partner_preference = preference.partner_preference
    else:
        existing_preference = WorkoutPreference(
            user_id=user_id,
            preferred_workout=preference.preferred_workout,
            preferred_intensity=preference.preferred_intensity,
            preferred_duration=preference.preferred_duration,
            preferred_location=preference.preferred_location,
            partner_preference=preference.partner_preference
        )
        db.add(existing_preference)

    db.commit()
    db.refresh(existing_preference)

    return existing_preference

# ======================================================
# SCHEDULE
# ======================================================

def create_schedule(
    db: Session,
    schedule
):

    new_schedule = Schedule(
        user_id=schedule.user_id,
        day=schedule.day,
        start_time=schedule.start_time,
        end_time=schedule.end_time
    )

    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)

    return new_schedule


def get_schedules(
    db: Session,
    user_id: int
):

    return db.query(Schedule).filter(
        Schedule.user_id == user_id
    ).all()


# ======================================================
# FEEDBACK
# ======================================================

def create_feedback(
    db: Session,
    feedback: FeedbackCreate
):

    new_feedback = Feedback(
        user_id=feedback.user_id,
        partner_id=feedback.partner_id,
        rating=feedback.rating,
        comment=feedback.comment
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback


def get_feedback_for_partner(
    db: Session,
    partner_id: int
):

    return db.query(Feedback).filter(
        Feedback.partner_id == partner_id
    ).all()

# ======================================================
# LOGIN
# ======================================================

def login_user(
    db: Session,
    email: str,
    password: str
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    # Upgrade old plain-text password
    # after successful login.
    if not user.password.startswith(
        "pbkdf2_sha256$"
    ):

        user.password = hash_password(
            password
        )

        db.commit()
        db.refresh(user)

    return user

# ======================================================
# RECOMMENDATIONS
# ======================================================

def save_recommendation(
    db: Session,
    user_id: int,
    partner_id: int,
    similarity_score: float,
    schedule_score: float,
    compatibility_score: float,
    explanation: str
):

    new_recommendation = Recommendation(
        user_id=user_id,
        partner_id=partner_id,
        similarity_score=similarity_score,
        schedule_score=schedule_score,
        compatibility_score=compatibility_score,
        explanation=explanation
    )

    db.add(new_recommendation)
    db.commit()
    db.refresh(new_recommendation)

    return new_recommendation


def get_recommendations_for_user(
    db: Session,
    user_id: int
):

    return db.query(
        Recommendation
    ).filter(
        Recommendation.user_id == user_id
    ).order_by(
        Recommendation.compatibility_score.desc()
    ).all()

def delete_recommendations_for_user(
    db: Session,
    user_id: int
):

    db.query(
        Recommendation
    ).filter(
        Recommendation.user_id == user_id
    ).delete()

    db.commit()

def delete_user_account(db: Session, user_id: int):

    # Delete feedback given by the user
    db.query(Feedback).filter(
        Feedback.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete recommendations where the user is the owner
    db.query(Recommendation).filter(
        Recommendation.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete recommendations where the user is the recommended partner
    db.query(Recommendation).filter(
        Recommendation.partner_id == user_id
    ).delete(synchronize_session=False)

    # Delete workout schedules
    db.query(Schedule).filter(
        Schedule.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete fitness profile
    db.query(FitnessProfile).filter(
        FitnessProfile.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete workout preferences
    db.query(WorkoutPreference).filter(
        WorkoutPreference.user_id == user_id
    ).delete(synchronize_session=False)

    # Delete the user account
    db.query(User).filter(
        User.user_id == user_id
    ).delete(synchronize_session=False)

    db.commit()

    return True